import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { zodResolver } from "@hookform/resolvers/zod"
import { act, waitFor } from "@testing-library/react"
import { useForm } from "react-hook-form"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"

import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(200, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const schema = z.object({
  email: z.string().email("Enter an address."),
  role: z.string().min(1, "Pick a role."),
  terms: z.boolean().refine((v) => v, "Accept the terms."),
})
type Values = z.infer<typeof schema>

function Demo({ onValid = () => {}, defaults }: { onValid?: (v: Values) => void; defaults?: Partial<Values> }) {
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", role: "", terms: false, ...defaults } })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValid)} noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>We never share it.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="author">Author</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} aria-label="Terms" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Save</button>
      </form>
    </Form>
  )
}

describe("Form wiring", () => {
  it("keeps upstream's slots and wires label, control, description and message by id", () => {
    const { container, getByLabelText } = renderUI(<Demo />)
    const q = (s: string) => container.querySelector(`[data-slot="${s}"]`) as HTMLElement
    expect(q("form-item")).toHaveClass("grid", "gap-2")
    const input = getByLabelText("Email")
    expect(input).toHaveAttribute("id")
    expect(input).toHaveAttribute("aria-invalid", "false")
    expect(q("form-label")).toHaveAttribute("for", input.id)
    expect(q("form-label")).toHaveAttribute("data-error", "false")
    expect(input.getAttribute("aria-describedby")).toBe(q("form-description").id)
    expect(q("form-control")).toBe(input)
    expect(container.querySelector("[data-slot=form-message]")).toBeNull()
  })

  it("an invalid submit turns the label, the control and the message on, with the message described", async () => {
    const { container, getByRole, getByLabelText, user } = renderUI(<Demo />)
    await user.click(getByRole("button", { name: "Save" }))
    await waitFor(() => expect(container.querySelector("[data-slot=form-message]")).toBeTruthy())
    const input = getByLabelText("Email")
    expect(input).toHaveAttribute("aria-invalid", "true")
    const msgs = Array.from(container.querySelectorAll("[data-slot=form-message]")) as HTMLElement[]
    expect(msgs.map((m) => m.textContent)).toEqual(["Enter an address.", "Pick a role.", "Accept the terms."])
    expect(input.getAttribute("aria-describedby")).toContain(msgs[0].id)
    expect(container.querySelector("[data-slot=form-label]")).toHaveAttribute("data-error", "true")
    expect(input.closest("[data-slot=input-frame]")!.querySelector(":scope > svg [data-layer=invalid]")).toBeTruthy()
    expect(getByRole("combobox")).toHaveAttribute("aria-invalid", "true")
    expect(getByRole("checkbox")).toHaveAttribute("aria-invalid", "true")
  })

  it("the message wears a wavy underline drawn by a host of its own", async () => {
    const { container, getByRole, user } = renderUI(<Demo />)
    await user.click(getByRole("button", { name: "Save" }))
    await waitFor(() => expect(container.querySelector("[data-slot=form-message]")).toBeTruthy())
    const m = container.querySelector("[data-slot=form-message]") as HTMLElement
    expect(m).toHaveAttribute("data-ink-host")
    expect(m).toHaveAttribute("data-ink-ready")
    expect(m).toHaveClass("w-fit", "text-destructive")
    expect(m.querySelector(":scope > svg[data-ink=underline] [data-layer=rest]")).toBeTruthy()
  })

  it("fixing the field clears its error; a valid form calls onValid", async () => {
    const onValid = vi.fn()
    const { container, getByRole, getByLabelText, user } = renderUI(<Demo onValid={onValid} defaults={{ role: "author", terms: true }} />)
    await user.click(getByRole("button", { name: "Save" }))
    await waitFor(() => expect(container.querySelectorAll("[data-slot=form-message]")).toHaveLength(1))
    await user.type(getByLabelText("Email"), "ada@notes.dev")
    await user.click(getByRole("button", { name: "Save" }))
    await waitFor(() => expect(onValid).toHaveBeenCalledTimes(1))
    expect(onValid.mock.calls[0][0]).toMatchObject({ email: "ada@notes.dev", role: "author", terms: true })
    expect(container.querySelector("[data-slot=form-message]")).toBeNull()
  })

  it("FormMessage shows its own children when there is no error", () => {
    function Own() {
      const form = useForm<{ a: string }>({ defaultValues: { a: "" } })
      return (
        <Form {...form}>
          <FormField control={form.control} name="a" render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} aria-label="a" />
              </FormControl>
              <FormMessage>Looks fine.</FormMessage>
            </FormItem>
          )} />
        </Form>
      )
    }
    const { container } = renderUI(<Own />)
    expect(container.querySelector("[data-slot=form-message]")).toHaveTextContent("Looks fine.")
  })

  it("useFormField reports the ids and state, and throws outside a FormProvider", () => {
    function Probe() {
      const f = useFormField()
      return <output>{f.formItemId}|{f.name}|{String(f.invalid)}</output>
    }
    function Wrap() {
      const form = useForm<{ a: string }>({ defaultValues: { a: "" } })
      return (
        <Form {...form}>
          <FormField control={form.control} name="a" render={() => (
            <FormItem>
              <Probe />
            </FormItem>
          )} />
        </Form>
      )
    }
    const { container } = renderUI(<Wrap />)
    expect(container.querySelector("output")!.textContent).toMatch(/-form-item\|a\|false$/)
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderUI(<Probe />)).toThrow()
    spy.mockRestore()
  })
})

describe("Form accessibility, server and hydration", () => {
  it("has no axe violations, valid and invalid", async () => {
    const { container, getByRole, user } = renderUI(<Demo />)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Save" }))
    await waitFor(() => expect(container.querySelector("[data-slot=form-message]")).toBeTruthy())
    await axeCheck(container)
  })

  it("renders deterministically on the server and hydrates without warnings, bare and inside the provider", () => {
    const tree = () => <Demo />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="form-item"')
    expect(renderToString(tree())).toBe(html)
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(tree()) as React.ReactElement
      const container = document.createElement("div")
      document.body.appendChild(container)
      container.innerHTML = renderToString(ui)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      let root: ReturnType<typeof hydrateRoot> | undefined
      act(() => {
        root = hydrateRoot(container, ui)
      })
      expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
      errors.mockRestore()
      act(() => root?.unmount())
      container.remove()
    }
  })
})
