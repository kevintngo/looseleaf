import * as React from "react"
import fs from "node:fs"
import path from "node:path"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render, screen, waitFor, type RenderResult } from "@testing-library/react"
import userEvent, { type UserEvent } from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, mockBox } from "./helpers"

export type AuthPage = React.ComponentType<{ as?: "main" | "div" } & Record<string, unknown>>

export interface AuthSuite {
  slug: string
  Page: AuthPage
  heading: string | RegExp
  props?: Record<string, unknown>
}

export function mountPage(Page: AuthPage, props: Record<string, unknown> = {}): RenderResult & { user: UserEvent } {
  const user = userEvent.setup()
  return { user, ...render(<InkProvider><Page as="div" {...props} /></InkProvider>) }
}

export function blockFiles(slug: string): Array<{ file: string; source: string }> {
  const dir = path.join(process.cwd(), "src/blocks", slug)
  return (fs.readdirSync(dir, { recursive: true }) as string[])
    .filter((f) => /\.tsx?$/.test(f))
    .map((f) => ({ file: `${slug}/${f}`, source: fs.readFileSync(path.join(dir, f), "utf8") }))
}

const PHYSICAL = /(?<![\w-])(?:-?(?:ml|mr|pl|pr)-(?:\d|\[|px)|-?(?:left|right)-(?:\d|\[|px|full|1\/2)|text-(?:left|right)\b|border-[lr]\b|border-[lr]-(?:\d|\[)|rounded-[lr]\b|float-(?:left|right)|origin-(?:left|right)\b|space-x-\d)/g

export function describeAuthPage(spec: AuthSuite): void {
  let restore = () => {}
  beforeEach(() => {
    restore = mockBox(240, 36)
  })
  afterEach(() => {
    restore()
    document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
  })

  describe(`${spec.slug}: a page`, () => {
    it("has one h1 with the sample copy and no other h1", () => {
      const { getAllByRole, getByRole } = mountPage(spec.Page, spec.props)
      expect(getAllByRole("heading", { level: 1 })).toHaveLength(1)
      expect(getByRole("heading", { level: 1, name: spec.heading })).toBeInTheDocument()
    })

    it("is the main landmark by default and a plain div inside another page", () => {
      const inMain = render(<InkProvider><spec.Page {...spec.props} /></InkProvider>)
      expect(inMain.container.querySelectorAll("main")).toHaveLength(1)
      inMain.unmount()
      const inPage = mountPage(spec.Page, spec.props)
      expect(inPage.container.querySelectorAll("main")).toHaveLength(0)
    })

    it("draws its hand-made parts as aria-hidden ink (or named art), never as content", () => {
      const { container } = mountPage(spec.Page, spec.props)
      expectInkLayers(container, { min: 1 })
    })

    it("has no axe violations", async () => {
      const { container } = mountPage(spec.Page, spec.props)
      await axeCheck(container)
    })

    it("mounts and takes the keyboard without a console error or warning", async () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {})
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      const { user } = mountPage(spec.Page, spec.props)
      await user.tab()
      await user.tab()
      expect([...error.mock.calls, ...warn.mock.calls].map((c) => String(c[0]).slice(0, 200))).toEqual([])
      error.mockRestore()
      warn.mockRestore()
    })

    const providers: Array<[string, { density?: "calm" | "compact"; dir?: "rtl"; motion?: "reduced" }]> = [
      ["calm density", { density: "calm" }],
      ["a right-to-left page", { dir: "rtl" }],
      ["compact density and reduced motion", { density: "compact", motion: "reduced" }],
    ]
    it.each(providers)("draws in %s without a console error, and is still accessible", async (_name, provider) => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {})
      const { container } = render(
        <div dir={provider.dir}>
          <InkProvider {...provider}>
            <spec.Page as="div" {...spec.props} />
          </InkProvider>
        </div>
      )
      await axeCheck(container)
      expect(error.mock.calls.map((c) => String(c[0]).slice(0, 200)).filter((m) => !/wrapped in act/.test(m))).toEqual([])
      error.mockRestore()
    })

    it("renders the same markup twice on the server and hydrates without a warning", () => {
      const tree = () => <InkProvider><spec.Page {...spec.props} /></InkProvider>
      const html = renderToString(tree())
      expect(renderToString(tree())).toBe(html)
      expect(html.replace(/<style[\s\S]*?<\/style>/g, "")).not.toMatch(/NaN|undefined|\[object Object\]/)
      const container = document.createElement("div")
      document.body.appendChild(container)
      container.innerHTML = html
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      let root: ReturnType<typeof hydrateRoot> | undefined
      act(() => {
        root = hydrateRoot(container, tree())
      })
      expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 300))).toEqual([])
      errors.mockRestore()
      act(() => root?.unmount())
      container.remove()
    })
  })

  describe(`${spec.slug}: its source`, () => {
    const files = blockFiles(spec.slug)

    it("never asks a container about itself (a container query matches an ANCESTOR container, never the element that is one)", () => {
      for (const { file, source } of files) {
        for (const [, literal, name] of source.matchAll(/"([^"\n]*@container\/([\w-]+)[^"\n]*)"/g)) {
          expect(literal, `${file}: "${literal}" queries its own @container/${name}`).not.toMatch(new RegExp(`@[\\w\\[\\]\\.-]+/${name}:`))
        }
      }
    })

    it("has a page and a component file whose names carry the block name", () => {
      const names = files.map((f) => f.file)
      expect(names).toContain(`${spec.slug}/page.tsx`)
      for (const f of names.filter((n) => n.includes("/components/"))) expect(path.basename(f)).toMatch(new RegExp(`^${spec.slug}-`))
    })

    it("uses logical properties, no lucide, no hard-coded color and no dead href", () => {
      for (const { file, source } of files) {
        expect(source, `${file} imports lucide`).not.toMatch(/lucide/)
        expect(source, `${file} has a hex color`).not.toMatch(/#[0-9a-fA-F]{3,8}\b(?![\w-])/)
        expect(source, `${file} has href="#"`).not.toMatch(/href="#"/)
        const hits = [...source.matchAll(PHYSICAL)].map((m) => m[0])
        expect(hits, `${file} uses physical direction classes`).toEqual([])
      }
    })
  })
}

type SubmitForm = React.ComponentType<{ onSubmit?: (values: never) => void | Promise<void> }>

const mountForm = (Form: SubmitForm, props: Record<string, unknown> = {}) => {
  const user = userEvent.setup()
  return { user, ...render(<InkProvider><Form {...(props as object)} /></InkProvider>) }
}

export interface LoginFormSuite {
  slug: string
  Form: SubmitForm
  socials: string[]
  remember?: boolean
}

export function describeLoginForm(spec: LoginFormSuite): void {
  let restore = () => {}
  beforeEach(() => {
    restore = mockBox(240, 36)
  })
  afterEach(() => restore())
  const signIn = { name: "Sign in" }

  describe(`${spec.slug}: the sign-in form`, () => {
    it("has labeled fields with the right autocomplete hints, providers and links", () => {
      const { getByLabelText, getByRole } = mountForm(spec.Form)
      expect(getByLabelText("Email")).toHaveAttribute("autocomplete", "email")
      expect(getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password")
      expect(getByLabelText("Password")).toHaveAttribute("type", "password")
      expect(getByRole("button", signIn)).toBeEnabled()
      for (const name of spec.socials) expect(getByRole("button", { name })).toHaveAttribute("type", "button")
      expect(getByRole("link", { name: "Forgot your password?" })).toHaveAttribute("href", "#forgot-password")
      expect(getByRole("link", { name: "Make an account" })).toHaveAttribute("href", "#signup")
      if (spec.remember) expect(getByRole("checkbox", { name: "Remember me on this desk" })).toBeChecked()
    })

    it("tells you what is wrong, in the field, and puts the cursor on the first mistake", async () => {
      const onSubmit = vi.fn()
      const { user, getByRole, getByLabelText, getAllByRole } = mountForm(spec.Form, { onSubmit })
      await user.click(getByRole("button", signIn))
      expect(getAllByRole("alert").map((a) => a.textContent)).toEqual(["Enter a full address, like ada@notes.dev.", "Enter your password."])
      expect(getByLabelText("Email")).toHaveAttribute("aria-invalid", "true")
      expect(getByLabelText("Email").getAttribute("aria-describedby")).toBe(getAllByRole("alert")[0].id)
      expect(getByLabelText("Email")).toHaveFocus()
      expect(onSubmit).not.toHaveBeenCalled()
      await axeCheck(document.body)
    })

    it("checks an email when you leave the field and clears the message once it is right", async () => {
      const { user, getByLabelText, queryByRole } = mountForm(spec.Form)
      await user.type(getByLabelText("Email"), "ada@")
      expect(queryByRole("alert")).toBeNull()
      await user.tab()
      expect(queryByRole("alert")).toHaveTextContent("Enter a full address")
      await user.type(getByLabelText("Email"), "notes.dev")
      await waitFor(() => expect(queryByRole("alert")).toBeNull())
      expect(getByLabelText("Email")).toHaveAttribute("aria-invalid", "false")
    })

    it("hands the checked values to onSubmit and shows the work in the button", async () => {
      let finish = () => {}
      const onSubmit = vi.fn((_values: unknown) => new Promise<void>((resolve) => (finish = resolve)))
      const { user, getByRole, getByLabelText } = mountForm(spec.Form, { onSubmit })
      await user.type(getByLabelText("Email"), "ada@notes.dev")
      await user.type(getByLabelText("Password"), "pencil-stub")
      if (spec.remember) await user.click(getByRole("checkbox", { name: "Remember me on this desk" }))
      await user.click(getByRole("button", signIn))
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      expect(onSubmit.mock.calls[0]?.[0]).toEqual({ email: "ada@notes.dev", password: "pencil-stub", ...(spec.remember ? { remember: false } : {}) })
      const busy = getByRole("button", { name: /Signing in/ })
      expect(busy).toBeDisabled()
      expect(busy).toHaveAttribute("aria-busy", "true")
      await act(async () => finish())
      expect(getByRole("button", signIn)).toBeEnabled()
    })

    it("sends the form when you press Enter in the password field", async () => {
      const onSubmit = vi.fn()
      const { user, getByLabelText } = mountForm(spec.Form, { onSubmit })
      await user.type(getByLabelText("Email"), "ada@notes.dev")
      await user.type(getByLabelText("Password"), "pencil-stub{Enter}")
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    })

    it("shows the message of a failed sign-in above the fields", async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error("That email and password do not match."))
      const { user, getByRole, getByLabelText, findByRole } = mountForm(spec.Form, { onSubmit })
      await user.type(getByLabelText("Email"), "ada@notes.dev")
      await user.type(getByLabelText("Password"), "wrong")
      await user.click(getByRole("button", signIn))
      const alert = await findByRole("alert")
      expect(alert).toHaveTextContent("We could not sign you in")
      expect(alert).toHaveTextContent("That email and password do not match.")
      await axeCheck(document.body)
    })

    it("shows and hides the password with a toggle that keeps its name", async () => {
      const { user, getByRole, getByLabelText } = mountForm(spec.Form)
      const toggle = getByRole("button", { name: "Show password" })
      expect(toggle).toHaveAttribute("aria-pressed", "false")
      await user.click(toggle)
      expect(getByLabelText("Password")).toHaveAttribute("type", "text")
      expect(getByRole("button", { name: "Show password" })).toHaveAttribute("aria-pressed", "true")
      await user.click(toggle)
      expect(getByLabelText("Password")).toHaveAttribute("type", "password")
    })

    describe("without an onSubmit", () => {
      beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
      afterEach(() => vi.useRealTimers())

      it("pretends it worked and says so", async () => {
        const { user, getByRole, getByLabelText } = mountForm(spec.Form)
        await user.type(getByLabelText("Email"), "ada@notes.dev")
        await user.type(getByLabelText("Password"), "pencil-stub")
        await user.click(getByRole("button", signIn))
        await act(async () => {
          await vi.advanceTimersByTimeAsync(800)
        })
        await waitFor(() => expect(document.querySelector('[data-slot="alert"][role="status"]')).toHaveTextContent("You are in (this is a demo)"))
      })
    })
  })
}

export interface SignupFormSuite {
  slug: string
  Form: SubmitForm
  socials: string[]
}

export function describeSignupForm(spec: SignupFormSuite): void {
  let restore = () => {}
  beforeEach(() => {
    restore = mockBox(240, 36)
  })
  afterEach(() => restore())
  const create = { name: "Create account" }

  const fill = async (user: UserEvent, opts: { name?: string; email?: string; password?: string; confirm?: string } = {}) => {
    const { name = "Ada Lovelace", email = "ada@notes.dev", password = "pencil-stub-9" } = opts
    const confirm = opts.confirm ?? password
    if (name) await user.type(screen.getByLabelText("Full name"), name)
    if (email) await user.type(screen.getByLabelText("Email"), email)
    if (password) await user.type(screen.getByLabelText("Password", { selector: "input" }), password)
    if (confirm) await user.type(screen.getByLabelText("Confirm password", { selector: "input" }), confirm)
  }

  describe(`${spec.slug}: the sign-up form`, () => {
    it("has labeled fields with the right autocomplete hints, providers and a way back to sign in", () => {
      const { getByLabelText, getByRole } = mountForm(spec.Form)
      expect(getByLabelText("Full name")).toHaveAttribute("autocomplete", "name")
      expect(getByLabelText("Email")).toHaveAttribute("autocomplete", "email")
      expect(getByLabelText("Password", { selector: "input" })).toHaveAttribute("autocomplete", "new-password")
      expect(getByLabelText("Confirm password", { selector: "input" })).toHaveAttribute("autocomplete", "new-password")
      expect(getByRole("button", create)).toBeEnabled()
      for (const name of spec.socials) expect(getByRole("button", { name })).toHaveAttribute("type", "button")
      expect(getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "#login")
    })

    it("names every empty line and puts the cursor on the first", async () => {
      const onSubmit = vi.fn()
      const { user, getByRole, getByLabelText, getAllByRole } = mountForm(spec.Form, { onSubmit })
      await user.click(getByRole("button", create))
      expect(getAllByRole("alert").map((a) => a.textContent)).toEqual([
        "Tell us what to call you (at least 2 letters).",
        "Enter a full address, like ada@notes.dev.",
        "Use at least 8 characters.",
        "Type the password once more.",
      ])
      expect(getByLabelText("Full name")).toHaveFocus()
      expect(onSubmit).not.toHaveBeenCalled()
      await axeCheck(document.body)
    })

    it("says which rule a weak password breaks, one at a time", async () => {
      const { user, getByLabelText, getByRole, queryAllByRole } = mountForm(spec.Form)
      const pw = getByLabelText("Password", { selector: "input" })
      await user.type(pw, "abc")
      await user.tab()
      expect(getByRole("alert")).toHaveTextContent("Use at least 8 characters.")
      await user.type(pw, "defgh")
      await waitFor(() => expect(getByRole("alert")).toHaveTextContent("Add at least one number."))
      await user.type(pw, "9")
      await waitFor(() => expect(queryAllByRole("alert")).toHaveLength(0))
    })

    it("compares the two passwords, also when the first one changes afterwards", async () => {
      const { user, getByLabelText, getByRole, queryAllByRole } = mountForm(spec.Form)
      await user.type(getByLabelText("Password", { selector: "input" }), "pencil-stub-9")
      await user.type(getByLabelText("Confirm password", { selector: "input" }), "pencil-stub-8")
      await user.tab()
      await waitFor(() => expect(getByRole("alert")).toHaveTextContent("Those two do not match yet."))
      await user.type(getByLabelText("Confirm password", { selector: "input" }), "{Backspace}9")
      await waitFor(() => expect(queryAllByRole("alert")).toHaveLength(0))
      await user.type(getByLabelText("Password", { selector: "input" }), "x")
      await waitFor(() => expect(getByRole("alert")).toHaveTextContent("Those two do not match yet."))
    })

    it("hands the checked name, email and password (not the confirmation) to onSubmit", async () => {
      let finish = () => {}
      const onSubmit = vi.fn((_values: unknown) => new Promise<void>((resolve) => (finish = resolve)))
      const { user, getByRole } = mountForm(spec.Form, { onSubmit })
      await fill(user)
      await user.click(getByRole("button", create))
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      expect(onSubmit.mock.calls[0]?.[0]).toEqual({ name: "Ada Lovelace", email: "ada@notes.dev", password: "pencil-stub-9" })
      const busy = getByRole("button", { name: /Creating account/ })
      expect(busy).toBeDisabled()
      expect(busy).toHaveAttribute("aria-busy", "true")
      await act(async () => finish())
      expect(getByRole("button", create)).toBeEnabled()
    })

    it("sends the form when you press Enter in the last field", async () => {
      const onSubmit = vi.fn()
      const { user } = mountForm(spec.Form, { onSubmit })
      await fill(user, { confirm: "" })
      await user.type(screen.getByLabelText("Confirm password", { selector: "input" }), "pencil-stub-9{Enter}")
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    })

    it("shows the message of a failed sign-up above the fields", async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error("That email already has an account."))
      const { user, getByRole, findByRole } = mountForm(spec.Form, { onSubmit })
      await fill(user)
      await user.click(getByRole("button", create))
      const alert = await findByRole("alert")
      expect(alert).toHaveTextContent("We could not create your account")
      expect(alert).toHaveTextContent("That email already has an account.")
      await axeCheck(document.body)
    })

    it("has a separate show / hide toggle for each password", async () => {
      const { user, getByRole, getByLabelText } = mountForm(spec.Form)
      const first = getByRole("button", { name: "Show password" })
      const second = getByRole("button", { name: "Show password confirmation" })
      await user.click(second)
      expect(getByLabelText("Confirm password", { selector: "input" })).toHaveAttribute("type", "text")
      expect(getByLabelText("Password", { selector: "input" })).toHaveAttribute("type", "password")
      expect(second).toHaveAttribute("aria-pressed", "true")
      expect(first).toHaveAttribute("aria-pressed", "false")
    })

    describe("without an onSubmit", () => {
      beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
      afterEach(() => vi.useRealTimers())

      it("pretends it worked and says so", async () => {
        const { user, getByRole } = mountForm(spec.Form)
        await fill(user)
        await user.click(getByRole("button", create))
        await act(async () => {
          await vi.advanceTimersByTimeAsync(800)
        })
        await waitFor(() => expect(document.querySelector('[data-slot="alert"][role="status"]')).toHaveTextContent("Account created (this is a demo)"))
      })
    })
  })
}
