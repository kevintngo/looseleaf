import { useEffect, useState } from "react"
import type { ExampleEntry, Loader } from "../core/catalog"
import type { ExampleModule } from "../types"

export type Loaded<T> = { status: "loading" } | { status: "ready"; value: T } | { status: "error"; error: Error }

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)))

const results = new WeakMap<object, Loaded<unknown>>()
const pending = new WeakMap<object, Promise<void>>()

function peek<T>(loader: Loader<T>): Loaded<T> {
  return (results.get(loader) as Loaded<T> | undefined) ?? { status: "loading" }
}

function start<T>(loader: Loader<T>): Promise<void> {
  let promise = pending.get(loader)
  if (!promise) {
    promise = loader().then(
      (raw) => {
        results.set(loader, { status: "ready", value: raw })
      },
      (error: unknown) => {
        results.set(loader, { status: "error", error: toError(error) })
      },
    )
    pending.set(loader, promise)
  }
  return promise
}

export function useLoaded<T>(loader: Loader<T> | null): Loaded<T> {
  const [, force] = useState(0)
  const current = loader ? peek(loader) : ({ status: "loading" } as Loaded<T>)

  useEffect(() => {
    if (!loader || peek(loader).status !== "loading") return
    let alive = true
    start(loader).then(() => alive && force((n) => n + 1))
    return () => {
      alive = false
    }
  }, [loader])

  return current
}

function assertExample(raw: unknown, path: string): ExampleModule {
  const mod = raw as Partial<ExampleModule> | undefined
  const component = mod?.default as unknown
  if (!component || (typeof component !== "function" && typeof component !== "object")) {
    throw new Error(`${path} has no default export. An example file must \`export default function Example() {…}\`.`)
  }
  return { default: mod!.default!, meta: mod!.meta ?? { title: "" } }
}

const validated = new WeakMap<object, Loader<ExampleModule>>()

export function exampleLoader(entry: ExampleEntry): Loader<ExampleModule> {
  let wrapped = validated.get(entry.load)
  if (!wrapped) {
    const inner = entry.load
    wrapped = () => inner().then((raw) => assertExample(raw, entry.path))
    validated.set(entry.load, wrapped)
  }
  return wrapped
}

export function useExample(entry: ExampleEntry): Loaded<ExampleModule> {
  return useLoaded(exampleLoader(entry))
}
