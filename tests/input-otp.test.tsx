import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, cleanup, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, REGEXP_ONLY_DIGITS } from "@/components/ui/input-otp"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { otpCss, otpSlotRecipe } from "@/lib/ink/recipes/input-otp-ink"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(40, 48)
  if (!document.elementFromPoint) document.elementFromPoint = () => null
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

type CodeProps = Partial<Omit<React.ComponentProps<typeof InputOTP>, "children" | "render">>
function Code(props: CodeProps) {
  return (
    <InputOTP maxLength={6} aria-label="One-time code" {...(props as object)}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}

const slots = () => Array.from(document.querySelectorAll<HTMLElement>('[data-slot="input-otp-slot"]'))
const field = () => screen.getByRole("textbox", { name: "One-time code" }) as HTMLInputElement
const layers = (el: Element) => Array.from(el.querySelectorAll(":scope > svg > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

describe("InputOTP structure", () => {
  it("is one real text input behind a row of six separate boxes, with upstream's slots", () => {
    const { container } = renderUI(<Code />)
    const input = field()
    expect(input).toHaveAttribute("data-slot", "input-otp")
    expect(input).toHaveAttribute("autocomplete", "one-time-code")
    expect(input).toHaveAttribute("inputmode", "numeric")
    expect(input).toHaveAttribute("maxlength", "6")
    expect(slots()).toHaveLength(6)
    expect(container.querySelectorAll('[data-slot="input-otp-group"]')).toHaveLength(2)
    expect(container.querySelector('[data-slot="input-otp-separator"]')).toHaveAttribute("role", "separator")
    expect(container.querySelector("[data-input-otp-container]")).toHaveClass("flex")
  })

  it("every slot is its own ink host: a hand-drawn field box, aria-hidden, seeded (no two alike)", () => {
    renderUI(<Code />)
    const s = slots()
    for (const slot of s) {
      expect(slot).toHaveAttribute("data-ink-host")
      const svg = slot.querySelector(":scope > svg[data-ink='field']")
      expect(svg).toHaveAttribute("aria-hidden", "true")
      expect(svg).toHaveAttribute("focusable", "false")
      expect(layers(slot)).toEqual(["rest"])
    }
    const paths = new Set(s.map((x) => x.querySelector("svg")!.innerHTML))
    expect(paths.size).toBe(6)
  })

  it("the separator is a drawn dash (a minus icon)", () => {
    const { container } = renderUI(<Code />)
    expect(container.querySelector('[data-slot="input-otp-separator"] svg[data-icon="minus"]')).not.toBeNull()
  })

  it("hoists one stylesheet with the caret tile and its blink (stopped under reduced motion)", () => {
    renderUI(
      <>
        <Code />
        <Code />
      </>,
    )
    const styles = document.querySelectorAll('style[data-href="ll-input-otp"]')
    expect(styles).toHaveLength(1)
    const css = styles[0].textContent ?? ""
    expect(css).toContain("ll-otp-blink")
    expect(css).toContain("prefers-reduced-motion")
    expect(css).toContain("forced-colors")
    expect(otpCss()).toBe(otpCss())
    expect(css).not.toMatch(/#[0-9a-f]{6}\b|NaN|undefined/i)
  })

  it("the caret is an I-beam (a stem with a tick at each end, 9 x 28), not a bare stroke that reads as the digit 1", () => {
    const tile = decodeURIComponent(otpCss().match(/--ll-otp-caret:url\("data:image\/svg\+xml,([^"]+)"\)/)?.[1] ?? "")
    expect(tile).toContain('viewBox="0 0 9 28"')
    const d = (tile.match(/ d="([^"]+)"/g) ?? []).join(" ")
    expect((d.match(/M/g) ?? []).length).toBeGreaterThanOrEqual(3)
    expect(otpCss()).toContain("width:9px")
  })
})

describe("InputOTP typing", () => {
  it("shows what is typed in the slots, moves the ring and the caret along, and calls onChange / onComplete", async () => {
    const onChange = vi.fn()
    const onComplete = vi.fn()
    const { user } = renderUI(<Code onChange={onChange} onComplete={onComplete} />)
    await user.click(field())
    expect(slots()[0]).toHaveAttribute("data-active", "true")
    expect(slots()[0].querySelector("[data-part=caret]")).not.toBeNull()
    await user.keyboard("482")
    expect(onChange).toHaveBeenLastCalledWith("482")
    expect(slots().map((s) => s.textContent)).toEqual(["4", "8", "2", "", "", ""])
    expect(slots()[3]).toHaveAttribute("data-active", "true")
    expect(slots()[3]).toHaveAttribute("data-focus-visible", "")
    expect(slots()[3].querySelector("[data-part=caret]")).not.toBeNull()
    expect(slots()[2]).not.toHaveAttribute("data-focus-visible")
    expect(slots()[0]).toHaveAttribute("data-filled", "true")
    expect(onComplete).not.toHaveBeenCalled()
    await user.keyboard("915")
    expect(onComplete).toHaveBeenCalledWith("482915")
  })

  it("only the active slot draws the focus ring (a row of six pays for one)", async () => {
    const { user } = renderUI(<Code />)
    expect(slots().map((s) => layers(s).join())).toEqual(Array(6).fill("rest"))
    await user.click(field())
    await user.keyboard("12")
    expect(slots().map((s) => layers(s).join())).toEqual(["rest", "rest", "rest,focus", "rest", "rest", "rest"])
    await user.keyboard("{Backspace}")
    expect(slots().map((s) => layers(s).join())[1]).toBe("rest,focus")
    expect(slots().map((s) => layers(s).join())[2]).toBe("rest")
  })

  it("Backspace takes a character back; a pattern refuses the wrong keys; maxLength stops", async () => {
    const { user } = renderUI(<Code pattern={REGEXP_ONLY_DIGITS} />)
    await user.click(field())
    await user.keyboard("12ab3")
    expect(field()).toHaveValue("123")
    await user.keyboard("{Backspace}")
    expect(field()).toHaveValue("12")
    await user.keyboard("3456789")
    expect(field()).toHaveValue("123456")
  })

  it("a pasted code fills the row at once and completes it", async () => {
    const onComplete = vi.fn()
    const { user } = renderUI(<Code onComplete={onComplete} />)
    await user.click(field())
    await user.paste("246810")
    expect(slots().map((s) => s.textContent).join("")).toBe("246810")
    expect(onComplete).toHaveBeenCalledWith("246810")
  })

  it("pasteTransformer cleans what is pasted (\"12-34-56\")", async () => {
    const { user } = renderUI(<Code pasteTransformer={(t) => t.replaceAll("-", "")} />)
    await user.click(field())
    await user.paste("12-34-56")
    expect(field()).toHaveValue("123456")
  })

  it("by default a pasted \"123 456\" or \"123-456\" (from an email or an SMS) fills the row; letters are still refused by a digits pattern; you can turn the cleaning off", async () => {
    const { user, unmount } = renderUI(<Code pattern={REGEXP_ONLY_DIGITS} />)
    await user.click(field())
    await user.paste("123 456")
    expect(field()).toHaveValue("123456")
    await user.clear(field())
    await user.paste("123\u2013456")
    expect(field()).toHaveValue("123456")
    await user.clear(field())
    await user.paste("12ab56")
    expect(field()).toHaveValue("")
    unmount()
    const raw = renderUI(<Code pattern={REGEXP_ONLY_DIGITS} pasteTransformer={(t) => t} />)
    await raw.user.click(field())
    await raw.user.paste("123 456")
    expect(field()).toHaveValue("")
  })

  it("uncontrolled with defaultValue-less start; controlled through value + onChange", async () => {
    function Controlled() {
      const [v, setV] = React.useState("12")
      return (
        <>
          <Code value={v} onChange={setV} />
          <button onClick={() => setV("")}>reset</button>
          <output>{v}</output>
        </>
      )
    }
    const { user } = renderUI(<Controlled />)
    expect(slots().map((s) => s.textContent).join("")).toBe("12")
    await user.click(field())
    await user.keyboard("3")
    expect(slots().map((s) => s.textContent).join("")).toBe("123")
    await user.click(screen.getByRole("button", { name: "reset" }))
    expect(slots().map((s) => s.textContent).join("")).toBe("")
  })

  it("a typed character writes itself in (pop) only after the first keystroke, never at load", async () => {
    const { user } = renderUI(<Code value="12" onChange={() => {}} />)
    expect(slots()[0].querySelector("span.animate-pop")).toBeNull()
    await user.click(field())
    await user.keyboard("3")
    expect(document.querySelector('[data-slot="input-otp"]')).toHaveAttribute("data-touched")
    expect(slots()[0].querySelector("span.animate-pop")).not.toBeNull()
  })

  it("form: the input carries name / value / required", async () => {
    const { container, user } = renderUI(
      <form>
        <Code name="code" required />
      </form>,
    )
    await user.click(field())
    await user.keyboard("1234")
    const fd = new FormData(container.querySelector("form") as HTMLFormElement)
    expect(fd.get("code")).toBe("1234")
    expect(field()).toBeRequired()
  })
})

describe("InputOTP states", () => {
  it("invalid (or aria-invalid) draws the red boxes as a static alternative and marks the input", () => {
    renderUI(<Code invalid />)
    expect(field()).toHaveAttribute("aria-invalid", "true")
    for (const s of slots()) {
      expect(layers(s)).toEqual(["invalid"])
      expect(s).toHaveAttribute("data-invalid")
    }
  })

  it("aria-invalid alone does the same", () => {
    renderUI(<Code aria-invalid />)
    expect(layers(slots()[0])).toEqual(["invalid"])
  })

  it("invalid and active keeps the ring", async () => {
    const { user } = renderUI(<Code invalid />)
    await user.click(field())
    await user.keyboard("12")
    expect(layers(slots()[2])).toEqual(["invalid", "focus"])
  })

  it("disabled: the input is disabled, the boxes are dashed, no caret or ring", async () => {
    const { user } = renderUI(<Code disabled />)
    expect(field()).toBeDisabled()
    for (const s of slots()) expect(layers(s)).toEqual(["disabled"])
    expect(slots().some((s) => s.querySelector("[data-part=caret]"))).toBe(false)
    expect(slots().some((s) => s.hasAttribute("data-focus-visible"))).toBe(false)
  })

  it("a placeholder character shows in empty boxes", () => {
    renderUI(
      <InputOTP maxLength={3} aria-label="One-time code" placeholder="···">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
      </InputOTP>,
    )
    expect(slots().map((s) => s.textContent)).toEqual(["·", "·", "·"])
  })
})

describe("InputOTP recipe, accessibility, rendering", () => {
  const req = { seed: "s", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length

  it("a slot is cheap in every state and density (<= 12 nodes and 8 KB per visible layer)", () => {
    for (const params of [{}, { filled: true }, { invalid: true }, { disabled: true }, { active: true }, { active: true, invalid: true }]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const box of [{ w: 40, h: 48 }, { w: 32, h: 36 }, { w: 120, h: 120 }]) {
          const f = runRecipe(otpSlotRecipe, { ...req, density, params, box })
          for (const [layer, markup] of Object.entries(f.parts)) {
            expect(nodes(markup ?? ""), `${JSON.stringify(params)} ${layer}`).toBeLessThanOrEqual(12)
            expect((markup ?? "").length).toBeLessThanOrEqual(8000)
          }
          expect(Object.values(f.parts).join("")).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
        }
      }
    }
    expect(runRecipe(otpSlotRecipe, { ...req, params: { active: true }, box: { w: 40, h: 48 } }).layers).toEqual(["rest", "focus"])
    expect(runRecipe(otpSlotRecipe, { ...req, params: { active: true, disabled: true }, box: { w: 40, h: 48 } }).layers).toEqual(["disabled"])
  })

  it("has no axe violations (empty, typing, invalid, disabled)", async () => {
    const { container, user, rerender } = renderUI(<Code />)
    await axeCheck(container)
    await user.click(field())
    await user.keyboard("12")
    await axeCheck(container)
    rerender(<Code invalid />)
    await axeCheck(container)
    rerender(<Code disabled />)
    await axeCheck(container)
  })

  it("renders on the server twice the same and hydrates cleanly, bare and in a provider", async () => {
    const el = <Code value="482" onChange={() => {}} />
    const a = renderToString(el)
    expect(renderToString(el)).toBe(a)
    expect(a).not.toMatch(/NaN|undefined|\[object/)
    for (const wrap of [(x: React.ReactElement) => x, (x: React.ReactElement) => <InkProvider>{x}</InkProvider>]) {
      cleanup()
      const host = document.createElement("div")
      document.body.appendChild(host)
      host.innerHTML = renderToString(wrap(el))
      const err = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(el))
      })
      expect(err.mock.calls.map((c) => String(c[0])).filter((m) => !/act\(/.test(m))).toEqual([])
      err.mockRestore()
      host.remove()
    }
  })
})

describe("InputOTP on a narrow screen", () => {
  it("never wraps by default and may shrink: the row stops at its parent, the groups and boxes give way", () => {
    const { container } = renderUI(<Code />)
    const row = container.querySelector("[data-input-otp-container]") as HTMLElement
    expect(row).toHaveClass("flex", "flex-nowrap", "max-w-full")
    expect(row).not.toHaveClass("flex-wrap")
    for (const g of container.querySelectorAll('[data-slot="input-otp-group"]')) expect(g).toHaveClass("min-w-0")
    for (const s of slots()) expect(s).toHaveClass("min-w-6")
    expect(container.querySelector('[data-slot="input-otp-separator"]')).toHaveClass("shrink-0")
  })

  it("flex-wrap in containerClassName still wins for whoever wants rows", () => {
    const { container } = renderUI(<Code containerClassName="flex-wrap justify-center" />)
    const row = container.querySelector("[data-input-otp-container]") as HTMLElement
    expect(row).toHaveClass("flex-wrap", "justify-center")
    expect(row).not.toHaveClass("flex-nowrap")
  })

  it("a group's own classes still override the shrink rule", () => {
    const { container } = renderUI(
      <InputOTP maxLength={2} aria-label="pair">
        <InputOTPGroup className="min-w-40">
          <InputOTPSlot index={0} className="min-w-10" />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    )
    const g = container.querySelector('[data-slot="input-otp-group"]') as HTMLElement
    expect(g).toHaveClass("min-w-40")
    expect(g).not.toHaveClass("min-w-0")
    expect(slots()[0]).toHaveClass("min-w-10")
    expect(slots()[0]).not.toHaveClass("min-w-6")
  })
})
