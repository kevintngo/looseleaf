import * as React from "react"
import { act } from "react"
import { hydrateRoot, type Root } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { vi } from "vitest"

import { loadInkProvider } from "./_glob"
import { short, withServerGlobals, type Problem } from "./_ssr-lib"

type Load = () => Promise<Record<string, unknown>>
type Wrapper = React.ComponentType<{ children?: React.ReactNode }> | null

const HYDRATION_LOG = /hydrat|server rendered HTML|did not match|didn't match|Expected server HTML/i
const IGNORED_LOG = /Not implemented: |not configured to support act|not wrapped in act|ReactDOMTestUtils\.act is deprecated/i

const element = (Example: React.ComponentType, Wrapper: Wrapper) => (Wrapper ? React.createElement(Wrapper, null, React.createElement(Example)) : React.createElement(Example))

async function capturing<T>(fn: () => Promise<T>): Promise<{ result: T | undefined; error: unknown; logged: string[] }> {
  const logged: string[] = []
  const spies = [
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => void logged.push(args.map((a) => (a instanceof Error ? a.message : String(a))).join(" "))),
    vi.spyOn(console, "warn").mockImplementation(() => {}),
  ]
  try {
    return { result: await fn(), error: undefined, logged }
  } catch (error) {
    return { result: undefined, error, logged }
  } finally {
    for (const spy of spies) spy.mockRestore()
  }
}

async function onePass(load: Load, provider: boolean): Promise<Problem[]> {
  const tag = provider ? "with <InkProvider> " : ""
  const problems: Problem[] = []
  const add = (check: string, message: string) => problems.push({ check, message: `${tag}${message}` })
  const report = (logged: string[], phase: string) => {
    for (const m of logged) {
      const first = m.split("\n")[0].slice(0, 220)
      if (HYDRATION_LOG.test(m)) add("hydration-mismatch", first)
      else if (!IGNORED_LOG.test(m)) add("console-error", `${phase}: ${first}`)
    }
  }

  vi.resetModules()
  const server = await capturing(() =>
    withServerGlobals(async () => {
      const Wrapper = provider ? await loadInkProvider() : null
      return renderToString(element((await load()).default as React.ComponentType, Wrapper))
    })
  )
  report(server.logged, "server render")
  if (server.error !== undefined || server.result === undefined) {
    add("hydrate-server", short(server.error))
    return problems
  }
  const markup = server.result

  vi.resetModules()
  const Wrapper = provider ? await loadInkProvider() : null
  const Client = (await load()).default as React.ComponentType
  const container = document.createElement("div")
  container.innerHTML = markup
  document.body.appendChild(container)

  const recoverable: string[] = []
  const actEnv = (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  let root: Root | null = null
  const client = await capturing(async () => {
    await act(async () => {
      root = hydrateRoot(container, element(Client, Wrapper), {
        onRecoverableError: (error: unknown) => void recoverable.push(error instanceof Error ? error.message : String(error)),
      })
    })
    await act(async () => {
      await Promise.resolve()
    })
  })
  if (client.error !== undefined) add("hydrate-client", short(client.error))
  await capturing(async () => {
    await act(async () => {
      ;(root as Root | null)?.unmount()
    })
  })
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = actEnv
  container.remove()

  for (const m of recoverable) add("hydration-mismatch", m.split("\n")[0].slice(0, 220))
  report(client.logged, "hydration")
  return problems
}

export async function hydrationProblems(load: Load): Promise<Problem[]> {
  const problems = await onePass(load, false)
  if (problems.length || process.env.HYDRATE_PROVIDER === "0") return problems
  vi.resetModules()
  const hasProvider = (await loadInkProvider()) !== null
  return hasProvider ? onePass(load, true) : []
}
