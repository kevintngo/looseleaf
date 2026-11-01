import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SignaturePad } from "@/components/ui/signature-pad"
import { InkProvider } from "@/lib/ink/react"
import { runRecipe } from "@/lib/ink/recipes"
import { BASELINE_AT, signatureBaselineRecipe, typedSignature } from "@/lib/ink/recipes/signature-pad-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 120)
})
afterEach(() => restore())

const LINE: Array<[number, number]> = [[20, 60], [60, 40], [100, 80], [140, 50]]
function sign(container: HTMLElement) {
  const el = container.querySelector('[data-slot="signature-canvas"]') as HTMLElement
  const base = { pointerId: 1, pointerType: "mouse", button: 0 }
  fireEvent.pointerDown(el, { ...base, clientX: LINE[0][0], clientY: LINE[0][1] })
  for (const [x, y] of LINE.slice(1)) fireEvent.pointerMove(el, { ...base, clientX: x, clientY: y })
  fireEvent.pointerUp(el, { ...base, clientX: LINE[3][0], clientY: LINE[3][1] })
}
const decode = (url: string) => decodeURIComponent(url.slice(url.indexOf(",") + 1))

describe("SignaturePad", () => {
  it("is a named canvas with a baseline, a clear button and a typed fallback", () => {
    const { getByRole, container } = renderUI(<SignaturePad />)
    expect(getByRole("application", { name: "Signature" })).toBeInTheDocument()
    expect(getByRole("button", { name: "Clear" })).toBeDisabled()
    expect(getByRole("button", { name: "Type instead" })).toHaveAttribute("aria-pressed", "false")
    expect(container.textContent).toContain("Sign here")
    expectInkLayers(container, { min: 2, absolute: true, kinds: ["signature-baseline", "sketchpad-canvas", "button"] })
  })

  it("is accessible in every state", async () => {
    const { container, user, getByRole } = renderUI(<SignaturePad name="sig" required />)
    await axeCheck(container)
    sign(container)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Type instead" }))
    await user.type(getByRole("textbox", { name: "Type your full name" }), "Ada")
    await axeCheck(container)
  })

  it("signing produces an svg data URL and a detail with the strokes", () => {
    const onValueChange = vi.fn()
    const { container, getByRole } = renderUI(<SignaturePad onValueChange={onValueChange} />)
    sign(container)
    expect(onValueChange).toHaveBeenCalledTimes(1)
    const [value, detail] = onValueChange.mock.calls[0]
    expect(value.startsWith("data:image/svg+xml;charset=utf-8,")).toBe(true)
    const svg = decode(value)
    expect(svg).toContain("<title>Signature</title>")
    expect(svg).toContain("data-stroke=")
    expect(svg).not.toMatch(/NaN|undefined/)
    expect(detail).toMatchObject({ mode: "draw", text: "" })
    expect(detail.strokes).toHaveLength(1)
    expect(detail.strokes[0]).toMatchObject({ tool: "brush", color: "ink-you" })
    expect(getByRole("button", { name: "Clear" })).toBeEnabled()
    expect(container.textContent).not.toContain("Sign here")
  })

  it("clear empties the value", async () => {
    const onValueChange = vi.fn()
    const { container, user, getByRole } = renderUI(<SignaturePad onValueChange={onValueChange} />)
    sign(container)
    await user.click(getByRole("button", { name: "Clear" }))
    expect(onValueChange).toHaveBeenLastCalledWith("", expect.objectContaining({ strokes: [] }))
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(0)
    expect(container.textContent).toContain("Sign here")
  })

  it("posts the signature in a form and blocks an empty required one", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    const { container, getByRole } = renderUI(
      <form onSubmit={onSubmit}>
        <SignaturePad name="signature" required />
        <button type="submit">Send</button>
      </form>,
    )
    const form = container.querySelector("form") as HTMLFormElement
    expect(form.checkValidity()).toBe(false)
    fireEvent.click(getByRole("button", { name: "Send" }))
    expect(onSubmit).not.toHaveBeenCalled()
    await waitFor(() => expect(getByRole("alert")).toHaveTextContent("Please sign in the box."))
    sign(container)
    expect(form.checkValidity()).toBe(true)
    expect(String(new FormData(form).get("signature")).startsWith("data:image/svg+xml")).toBe(true)
    expect(container.querySelector('[role="alert"]')).toBeNull()
    fireEvent.click(getByRole("button", { name: "Send" }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it("has no field when it has no name and is not required", () => {
    const { container } = renderUI(<SignaturePad />)
    expect(container.querySelector("input")).toBeNull()
  })

  it("type instead: a name becomes hand lettering, and the image follows the mode", async () => {
    const onValueChange = vi.fn()
    const { container, user, getByRole, queryByRole } = renderUI(<SignaturePad name="s" onValueChange={onValueChange} />)
    sign(container)
    await user.click(getByRole("button", { name: "Type instead" }))
    expect(getByRole("button", { name: "Draw instead" })).toHaveAttribute("aria-pressed", "true")
    expect(getByRole("img", { name: "Signature, typed" })).toBeInTheDocument()
    expect(onValueChange).toHaveBeenLastCalledWith("", expect.objectContaining({ mode: "type" }))
    await user.type(getByRole("textbox", { name: "Type your full name" }), "Ada Lovelace")
    const [value, detail] = onValueChange.mock.calls[onValueChange.mock.calls.length - 1]
    expect(detail).toMatchObject({ mode: "type", text: "Ada Lovelace" })
    expect(decode(value)).toContain("var(--ll-ink-you)")
    expect((container.querySelector('input[name="s"]') as HTMLInputElement).value).toBe(value)
    expect(getByRole("img", { name: "Signature, typed: Ada Lovelace" })).toBeInTheDocument()
    await user.click(getByRole("button", { name: "Draw instead" }))
    expect(queryByRole("textbox")).toBeNull()
    expect(decode(onValueChange.mock.calls[onValueChange.mock.calls.length - 1][0])).toContain("data-stroke=")
  })

  it("typedFallback={false} leaves the toggle out", () => {
    const { queryByRole } = renderUI(<SignaturePad typedFallback={false} />)
    expect(queryByRole("button", { name: "Type instead" })).toBeNull()
  })

  it("controlled mode", async () => {
    const onModeChange = vi.fn()
    const { user, getByRole, queryByRole } = renderUI(<SignaturePad mode="draw" onModeChange={onModeChange} />)
    await user.click(getByRole("button", { name: "Type instead" }))
    expect(onModeChange).toHaveBeenCalledWith("type")
    expect(queryByRole("textbox")).toBeNull()
  })

  it("a value that arrives without strokes is shown as the image, then replaced by a new signature", () => {
    const stored = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>')
    const { container } = renderUI(<SignaturePad defaultValue={stored} />)
    const img = container.querySelector("img[data-slot=signature-image]") as HTMLImageElement
    expect(img).toHaveAttribute("src", stored)
    expect(img).toHaveAttribute("alt", "Signature")
    sign(container)
    expect(container.querySelector("img[data-slot=signature-image]")).toBeNull()
  })

  it("controlled value follows the parent", async () => {
    function Parent() {
      const [v, setV] = React.useState("")
      return (
        <>
          <SignaturePad value={v} onValueChange={setV} />
          <output>{v ? "signed" : "empty"}</output>
          <button onClick={() => setV("")}>wipe</button>
        </>
      )
    }
    const { container, getByText } = renderUI(<Parent />)
    expect(getByText("empty")).toBeInTheDocument()
    sign(container)
    expect(getByText("signed")).toBeInTheDocument()
    fireEvent.click(getByText("wipe"))
    expect(getByText("empty")).toBeInTheDocument()
  })

  it("png format falls back to the svg where nothing can rasterise it", async () => {
    vi.useFakeTimers()
    try {
      const onValueChange = vi.fn()
      const { container } = renderUI(<SignaturePad format="png" onValueChange={onValueChange} />)
      sign(container)
      expect(onValueChange).not.toHaveBeenCalled()
      await act(async () => {
        await vi.advanceTimersByTimeAsync(4100)
      })
      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0][0].startsWith("data:image/svg+xml")).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it("disabled and readOnly cannot be drawn on", () => {
    const onValueChange = vi.fn()
    const { container, rerender, queryByRole } = renderUI(<SignaturePad disabled onValueChange={onValueChange} />)
    sign(container)
    rerender(<SignaturePad readOnly onValueChange={onValueChange} />)
    sign(container)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(queryByRole("button", { name: "Clear" })).toBeNull()
  })

  it("invalid shows the message and a red baseline", () => {
    const { getByRole, container } = renderUI(<SignaturePad invalid message="Sign to accept." />)
    expect(getByRole("alert")).toHaveTextContent("Sign to accept.")
    expect(container.querySelector('[data-slot="signature-pad"]')).toHaveAttribute("data-invalid")
    expect(container.querySelector('[data-slot="signature-baseline"]')?.innerHTML).toContain("var(--ll-red)")
  })

  it("renders identically on the server and hydrates cleanly", async () => {
    const tree = (
      <InkProvider>
        <SignaturePad name="sig" required />
      </InkProvider>
    )
    const a = renderToString(tree)
    expect(renderToString(tree)).toBe(a)
    const host = document.createElement("div")
    host.innerHTML = a
    document.body.appendChild(host)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    await act(async () => {
      hydrateRoot(host, tree)
    })
    expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([])
    errors.mockRestore()
    host.remove()
  })
})

describe("signature drawing", () => {
  it("the baseline recipe draws a rule and an x, red when invalid", () => {
    const run = (invalid: boolean) =>
      runRecipe(signatureBaselineRecipe as never, { box: { w: 480, h: 180 }, params: { invalid }, seed: "b", tier: "lo", density: "comfortable", dir: "ltr", knobs: { wobble: 1, misreg: 1, bleed: 1, width: 1 } })
    expect(run(false).parts.rest).toContain("var(--ll-pencil)")
    expect(run(true).parts.rest).toContain("var(--ll-red)")
    expect((run(false).parts.rest ?? "").length).toBeLessThan(6000)
    expect(BASELINE_AT).toBeGreaterThan(0.5)
  })

  it("a typed name is deterministic, shrinks to fit and survives odd input", () => {
    const a = typedSignature("Ada Lovelace", 480, 180, "s")
    expect(typedSignature("Ada Lovelace", 480, 180, "s").svg).toBe(a.svg)
    expect(typedSignature("Ada Lovelace", 480, 180, "t").svg).not.toBe(a.svg)
    expect(a.svg).toContain("var(--ll-ink-you)")
    const long = typedSignature("Wolfeschlegelsteinhausenbergerdorff Senior The Third", 480, 180, "s")
    expect(long.size).toBeLessThan(a.size)
    expect(typedSignature("   ", 480, 180, "s")).toEqual({ svg: "", size: 0 })
    for (const t of ["é ñ ü ☃", "<script>", "12345 !?", "a".repeat(200)]) expect(typedSignature(t, 480, 180, "s").svg).not.toMatch(/NaN|undefined|<script/)
  })
})
