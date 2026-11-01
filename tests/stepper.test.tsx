import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, cleanup, fireEvent, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Stepper, StepperDecrement, StepperIncrement, StepperInput, StepperTally, useStepper } from "@/components/ui/stepper"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { stepperRecipe, stepperTallyRecipe, tallyWidth } from "@/lib/ink/recipes/stepper-ink"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(136, 36)
})
afterEach(() => {
  restore()
  vi.useRealTimers()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const num = () => screen.getByRole("spinbutton", { name: "Quantity" }) as HTMLInputElement
const plus = () => screen.getByRole("button", { name: "Increase" })
const minus = () => screen.getByRole("button", { name: "Decrease" })
const S = (props: Partial<React.ComponentProps<typeof Stepper>> = {}) => <Stepper aria-label="Quantity" {...props} />

describe("Stepper structure", () => {
  it("is a group with a spinbutton input between a minus and a plus, and the upstream-style slots", () => {
    const { container } = renderUI(<S defaultValue={3} min={0} max={10} />)
    const group = container.querySelector('[data-slot="stepper"]') as HTMLElement
    expect(group).toHaveAttribute("role", "group")
    expect(group).toHaveAttribute("data-ink-host")
    expect(group).toHaveAttribute("data-ink-focus", "within")
    const input = num()
    expect(input).toHaveValue("3")
    expect(input).toHaveAttribute("data-slot", "stepper-input")
    expect(input).toHaveAttribute("inputmode", "decimal")
    expect(input).toHaveAttribute("aria-valuenow", "3")
    expect(input).toHaveAttribute("aria-valuemin", "0")
    expect(input).toHaveAttribute("aria-valuemax", "10")
    expect(minus()).toHaveAttribute("data-slot", "stepper-decrement")
    expect(plus()).toHaveAttribute("data-slot", "stepper-increment")
    expect(minus()).toHaveAttribute("tabindex", "-1")
    expect(input.parentElement).toBe(group)
  })

  it("the frame is one hand-drawn field box (aria-hidden), the buttons carry icons and no ink of their own", () => {
    const { container } = renderUI(<S defaultValue={3} />)
    const group = container.querySelector('[data-slot="stepper"]') as HTMLElement
    const svg = group.querySelector(":scope > svg[data-ink='field']")
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(Array.from(svg!.querySelectorAll(":scope > g[data-layer]")).map((g) => g.getAttribute("data-layer"))).toEqual(["rest"])
    expect(minus().querySelector("svg[data-icon='minus']")).not.toBeNull()
    expect(plus().querySelector("svg[data-icon='plus']")).not.toBeNull()
    expect(minus().querySelector("svg[data-ink='field']")).toBeNull()
  })

  it("custom parts: children replace the default trio; names come from you", () => {
    renderUI(
      <Stepper aria-label="Guests" defaultValue={2}>
        <StepperDecrement aria-label="Fewer guests" />
        <StepperInput />
        <StepperIncrement aria-label="More guests" />
      </Stepper>,
    )
    expect(screen.getByRole("button", { name: "Fewer guests" })).toBeInTheDocument()
    expect(screen.getByRole("spinbutton", { name: "Guests" })).toHaveValue("2")
  })

  it("useStepper reads the state, and throws outside a Stepper", () => {
    function Peek() {
      const c = useStepper()
      return <span data-testid="peek">{`${c.value}|${c.atMin}|${c.atMax}`}</span>
    }
    renderUI(
      <Stepper aria-label="Q" defaultValue={10} max={10}>
        <Peek />
        <StepperInput />
      </Stepper>,
    )
    expect(screen.getByTestId("peek")).toHaveTextContent("10|false|true")
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderUI(<Peek />)).toThrow(/inside <Stepper>/)
    err.mockRestore()
  })
})

describe("Stepper value", () => {
  it("uncontrolled: the buttons step; controlled: onValueChange asks, the value comes from props", async () => {
    const { user, unmount } = renderUI(<S defaultValue={3} />)
    await user.click(plus())
    await user.click(plus())
    await user.click(minus())
    expect(num()).toHaveValue("4")
    unmount()
    const onValueChange = vi.fn()
    const { user: u2, rerender } = renderUI(<S value={5} onValueChange={onValueChange} />)
    await u2.click(plus())
    expect(onValueChange).toHaveBeenCalledWith(6)
    expect(num()).toHaveValue("5")
    rerender(<S value={6} onValueChange={onValueChange} />)
    expect(num()).toHaveValue("6")
  })

  it("an undefined controlled value is an empty field; a step from empty starts at zero", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<S value={undefined} onValueChange={onValueChange} />)
    expect(num()).toHaveValue("")
    expect(num()).not.toHaveAttribute("aria-valuenow")
    await user.click(plus())
    expect(onValueChange).toHaveBeenLastCalledWith(1)
  })

  it("min and max clamp, and the button with nothing left says so (aria-disabled, not disabled, so focus is not lost)", async () => {
    const { user } = renderUI(<S defaultValue={1} min={0} max={2} />)
    await user.click(plus())
    expect(num()).toHaveValue("2")
    expect(plus()).toHaveAttribute("aria-disabled", "true")
    expect(plus()).not.toBeDisabled()
    expect(minus()).not.toHaveAttribute("aria-disabled")
    await user.click(plus())
    expect(num()).toHaveValue("2")
    await user.click(minus())
    await user.click(minus())
    await user.click(minus())
    expect(num()).toHaveValue("0")
    expect(minus()).toHaveAttribute("aria-disabled", "true")
  })

  it("decimals do not drift (0.1 steps), and precision fixes the places shown", async () => {
    const { user, unmount } = renderUI(<S defaultValue={0} step={0.1} />)
    for (let i = 0; i < 3; i++) await user.click(plus())
    expect(num()).toHaveValue("0.3")
    unmount()
    renderUI(<S defaultValue={2} step={0.5} precision={2} />)
    expect(num()).toHaveValue("2.00")
  })

  it("format and parse show and read the value your way (a price)", async () => {
    const { user } = renderUI(<S defaultValue={5} step={0.5} format={(n) => `$${n.toFixed(2)}`} parse={(t) => Number.parseFloat(t.replace("$", ""))} />)
    expect(num()).toHaveValue("$5.00")
    expect(num()).toHaveAttribute("aria-valuetext", "$5.00")
    await user.click(plus())
    expect(num()).toHaveValue("$5.50")
    await user.clear(num())
    await user.type(num(), "$12.25{Enter}")
    expect(num()).toHaveValue("$12.25")
  })

  it("snap rounds to multiples of the step from the minimum", async () => {
    const { user } = renderUI(<S defaultValue={0} min={0} step={5} snap />)
    await user.clear(num())
    await user.type(num(), "13{Enter}")
    expect(num()).toHaveValue("15")
  })
})

describe("Stepper typing and keys", () => {
  it("reads what is typed on Enter or blur, clamps it, and puts a non-number back", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<S defaultValue={3} min={0} max={10} onValueChange={onValueChange} />)
    await user.clear(num())
    await user.type(num(), "7")
    expect(onValueChange).not.toHaveBeenCalled()
    await user.keyboard("{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith(7)
    await user.clear(num())
    await user.type(num(), "99")
    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(10)
    expect(num()).toHaveValue("10")
    await user.clear(num())
    await user.type(num(), "abc")
    await user.tab()
    expect(num()).toHaveValue("10")
  })

  it("a comma is a decimal point; a minus sign is allowed without a min", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<S defaultValue={0} step={0.5} onValueChange={onValueChange} />)
    await user.clear(num())
    await user.type(num(), "1,5{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith(1.5)
    await user.clear(num())
    await user.type(num(), "-2{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith(-2)
  })

  it("emptying the field clears the value (unless required)", async () => {
    const onValueChange = vi.fn()
    const { user, unmount } = renderUI(<S defaultValue={3} onValueChange={onValueChange} />)
    await user.clear(num())
    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(undefined)
    unmount()
    const { user: u2 } = renderUI(<S defaultValue={3} required onValueChange={onValueChange} />)
    await u2.clear(num())
    await u2.tab()
    expect(num()).toHaveValue("3")
  })

  it("arrow keys step, Shift + arrows and PageUp / PageDown take the large step, Home / End go to the ends", async () => {
    const { user } = renderUI(<S defaultValue={50} min={0} max={100} />)
    num().focus()
    await user.keyboard("{ArrowUp}")
    expect(num()).toHaveValue("51")
    await user.keyboard("{ArrowDown}{ArrowDown}")
    expect(num()).toHaveValue("49")
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}")
    expect(num()).toHaveValue("59")
    await user.keyboard("{PageDown}")
    expect(num()).toHaveValue("49")
    await user.keyboard("{PageUp}{PageUp}")
    expect(num()).toHaveValue("69")
    await user.keyboard("{End}")
    expect(num()).toHaveValue("100")
    await user.keyboard("{Home}")
    expect(num()).toHaveValue("0")
  })

  it("largeStep sets the big step; Escape puts back what was there", async () => {
    const { user } = renderUI(<S defaultValue={5} step={1} largeStep={25} />)
    num().focus()
    await user.keyboard("{PageUp}")
    expect(num()).toHaveValue("30")
    await user.keyboard("99{Escape}")
    expect(num()).toHaveValue("30")
  })

  it("the wheel steps only when asked to and only while the number has focus", () => {
    const { unmount } = renderUI(<S defaultValue={5} />)
    fireEvent.wheel(num(), { deltaY: -100 })
    expect(num()).toHaveValue("5")
    unmount()
    renderUI(<S defaultValue={5} wheel />)
    fireEvent.wheel(num(), { deltaY: -100 })
    expect(num()).toHaveValue("5")
    num().focus()
    fireEvent.wheel(num(), { deltaY: -100 })
    expect(num()).toHaveValue("6")
    fireEvent.wheel(num(), { deltaY: 100 })
    fireEvent.wheel(num(), { deltaY: 100 })
    expect(num()).toHaveValue("4")
  })
})

describe("Stepper hold to repeat and clicks", () => {
  it("holding a button steps at once, then after a pause keeps stepping until it is let go", () => {
    vi.useFakeTimers()
    renderUI(<S defaultValue={0} />)
    fireEvent.pointerDown(plus(), { button: 0, pointerType: "mouse" })
    expect(num()).toHaveValue("1")
    expect(plus()).toHaveAttribute("data-holding", "true")
    act(() => void vi.advanceTimersByTime(300))
    expect(num()).toHaveValue("1")
    act(() => void vi.advanceTimersByTime(300))
    const started = Number(num().value)
    expect(started).toBeGreaterThan(1)
    act(() => void vi.advanceTimersByTime(900))
    expect(Number(num().value)).toBeGreaterThan(started + 5)
    fireEvent.pointerUp(window)
    const stopped = num().value
    act(() => void vi.advanceTimersByTime(1000))
    expect(num()).toHaveValue(stopped)
    expect(plus()).not.toHaveAttribute("data-holding")
  })

  it("a hold stops by itself at the maximum", () => {
    vi.useFakeTimers()
    renderUI(<S defaultValue={8} max={10} />)
    fireEvent.pointerDown(plus(), { button: 0, pointerType: "mouse" })
    act(() => void vi.advanceTimersByTime(3000))
    expect(num()).toHaveValue("10")
    expect(plus()).not.toHaveAttribute("data-holding")
  })

  it("a mouse click steps once (the press did it), a keyboard or screen reader click steps once too", async () => {
    const { user } = renderUI(<S defaultValue={0} />)
    await user.click(plus())
    expect(num()).toHaveValue("1")
    fireEvent.click(plus())
    expect(num()).toHaveValue("2")
  })

  it("the secondary mouse button does nothing; pressing a button does not take focus from the number", async () => {
    const { user } = renderUI(<S defaultValue={0} />)
    num().focus()
    fireEvent.pointerDown(plus(), { button: 2, pointerType: "mouse" })
    expect(num()).toHaveValue("0")
    await user.click(plus())
    expect(num()).toHaveFocus()
  })

  it("a press with nowhere to go rattles the box (data-limit alternates so it can repeat)", async () => {
    const { user, container } = renderUI(<S defaultValue={10} max={10} />)
    const group = container.querySelector('[data-slot="stepper"]') as HTMLElement
    expect(group).not.toHaveAttribute("data-limit")
    await user.click(plus())
    const a = group.getAttribute("data-limit")
    expect(a).toBeTruthy()
    await user.click(plus())
    expect(group.getAttribute("data-limit")).not.toBe(a)
  })

  it("the number ticks in the direction of the change", async () => {
    const { user } = renderUI(<S defaultValue={3} />)
    expect(num()).not.toHaveAttribute("data-tick")
    await user.click(plus())
    expect(num().getAttribute("data-tick")).toMatch(/^up-[ab]$/)
    await user.click(minus())
    expect(num().getAttribute("data-tick")).toMatch(/^down-[ab]$/)
  })
})

describe("Stepper form and states", () => {
  it("name, form and required go to the input; FormData sees the number; a reset puts it back", async () => {
    const { container, user } = renderUI(
      <form>
        <S name="qty" defaultValue={2} required />
      </form>,
    )
    const form = container.querySelector("form") as HTMLFormElement
    expect(new FormData(form).get("qty")).toBe("2")
    expect(num()).toBeRequired()
    await user.click(plus())
    await user.click(plus())
    expect(new FormData(form).get("qty")).toBe("4")
    act(() => form.reset())
    expect(num()).toHaveValue("2")
  })

  it("a Label can point at the input by id", () => {
    renderUI(
      <>
        <label htmlFor="q">Quantity</label>
        <Stepper id="q" defaultValue={1} />
      </>,
    )
    expect(screen.getByRole("spinbutton", { name: "Quantity" })).toHaveAttribute("id", "q")
  })

  it("disabled: nothing moves, the box is dashed; readOnly: the number is shown but the buttons do nothing", async () => {
    const { user, container, rerender } = renderUI(<S defaultValue={3} disabled />)
    expect(num()).toBeDisabled()
    expect(plus()).toBeDisabled()
    expect(Array.from(container.querySelectorAll('[data-slot="stepper"] > svg > g[data-layer]')).map((g) => g.getAttribute("data-layer"))).toEqual(["disabled"])
    rerender(<S defaultValue={3} readOnly />)
    await user.click(plus())
    expect(num()).toHaveValue("3")
    expect(num()).toHaveAttribute("readonly")
    num().focus()
    await user.keyboard("{ArrowUp}")
    expect(num()).toHaveValue("3")
  })

  it("invalid marks the input and draws the red box", () => {
    const { container } = renderUI(<S defaultValue={3} invalid />)
    expect(num()).toHaveAttribute("aria-invalid", "true")
    expect(Array.from(container.querySelectorAll('[data-slot="stepper"] > svg > g[data-layer]')).map((g) => g.getAttribute("data-layer"))).toEqual(["invalid"])
  })

  it("the tally works outside a Stepper too, given a value", () => {
    const { container } = renderUI(<StepperTally value={4} />)
    expect(container.querySelector('[data-slot="stepper-tally"] svg')).not.toBeNull()
  })

  it("the tally draws the value as marks (aria-hidden), and follows it", async () => {
    const { user, container } = renderUI(
      <Stepper aria-label="Quantity" defaultValue={6}>
        <StepperDecrement />
        <StepperInput />
        <StepperIncrement />
        <StepperTally />
      </Stepper>,
    )
    const tally = () => container.querySelector('[data-slot="stepper-tally"]') as HTMLElement
    expect(tally()).toHaveAttribute("aria-hidden", "true")
    const before = tally().querySelector("svg")?.innerHTML
    expect(before).toBeTruthy()
    await user.click(plus())
    expect(tally().querySelector("svg")?.innerHTML).not.toBe(before)
    await user.clear(num())
    await user.tab()
    expect(tally().querySelector("svg")).toBeNull()
  })
})

describe("Stepper recipes, accessibility, rendering", () => {
  const req = { seed: "s", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length

  it("the frame is cheap in every state, density and width", () => {
    for (const params of [{}, { invalid: true }, { disabled: true }]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const box of [{ w: 136, h: 36 }, { w: 90, h: 28 }, { w: 300, h: 44 }, { w: 60, h: 36 }]) {
          const f = runRecipe(stepperRecipe, { ...req, density, params, box, lazy: ["focus", "hover"] })
          for (const [layer, markup] of Object.entries(f.parts)) {
            expect(nodes(markup ?? "")).toBeLessThanOrEqual(12)
            expect((markup ?? "").length, `${layer} ${JSON.stringify(box)}`).toBeLessThanOrEqual(layer === "focus" ? 10_000 : 8000)
          }
          expect(Object.values(f.parts).join("")).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
        }
      }
    }
    expect(runRecipe(stepperRecipe, { ...req, params: {}, box: { w: 136, h: 36 }, lazy: ["focus", "hover"] }).layers).toEqual(["rest", "hover", "focus"])
  })

  it("the tally is one small layer for the counts the component draws (20 by default), and wider for more groups", () => {
    for (const count of [0, 1, 4, 5, 13, 20]) {
      const f = runRecipe(stepperTallyRecipe, { ...req, params: { count }, box: { w: tallyWidth(count), h: 20 } })
      expect(nodes(f.parts.rest ?? "")).toBeLessThanOrEqual(12)
      expect((f.parts.rest ?? "").length).toBeLessThanOrEqual(8000)
    }
    expect(tallyWidth(13)).toBeGreaterThan(tallyWidth(5))
  })

  it("has no axe violations (default, at a bound, invalid, disabled, with a tally)", async () => {
    const { container, rerender } = renderUI(<S defaultValue={3} min={0} max={10} />)
    await axeCheck(container)
    rerender(<S defaultValue={3} min={0} max={3} invalid />)
    await axeCheck(container)
    rerender(<S defaultValue={3} disabled />)
    await axeCheck(container)
    rerender(
      <Stepper aria-label="Quantity" defaultValue={3}>
        <StepperDecrement />
        <StepperInput />
        <StepperIncrement />
        <StepperTally />
      </Stepper>,
    )
    await axeCheck(container)
  })

  it("renders on the server twice the same and hydrates cleanly, bare and in a provider", async () => {
    const el = <S defaultValue={7} min={0} max={10} name="q" />
    const a = renderToString(el)
    expect(renderToString(el)).toBe(a)
    expect(a).not.toMatch(/NaN|undefined|\[object/)
    expect(a).toContain('value="7"')
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

describe("Stepper review fixes (numbers that are not numbers, locales, steps, forms)", () => {
  it("a NaN value is an empty field, never the text NaN", () => {
    renderUI(<S value={Number.NaN} />)
    expect(num()).toHaveValue("")
    expect(num()).not.toHaveAttribute("aria-valuenow")
    expect(plus()).not.toHaveAttribute("aria-disabled")
  })

  it("a custom parse that answers NaN puts the last good value back and reports nothing", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(
      <S defaultValue={4.5} step={0.5} precision={2} format={(n) => `$${n.toFixed(2)}`} parse={(t) => Number.parseFloat(t.replace("$", ""))} onValueChange={onValueChange} />,
    )
    await user.clear(num())
    await user.type(num(), "abc")
    await user.tab()
    expect(num()).toHaveValue("$4.50")
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("reads thousands and decimal separators the way people write them, in Latin, Eastern Arabic and Persian digits", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<S defaultValue={0} onValueChange={onValueChange} />)
    const type = async (text: string) => {
      await user.clear(num())
      await user.type(num(), `${text}{Enter}`)
      return onValueChange.mock.lastCall?.[0]
    }
    expect(await type("1,234.5")).toBe(1234.5)
    expect(await type("1.234,5")).toBe(1234.5)
    expect(await type("1,234,567")).toBe(1234567)
    expect(await type("2,5")).toBe(2.5)
    expect(await type("\u2212 7")).toBe(-7)
    expect(await type("\u0663\u066b\u0665")).toBe(3.5)
    expect(await type("\u06f1\u06f2")).toBe(12)
    onValueChange.mockClear()
    for (const bad of ["1,,2", "1.2.3,4", "--3", ".", "1e3", "12abc"]) {
      await user.clear(num())
      await user.type(num(), `${bad}{Enter}`)
    }
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("a step that is zero, negative or not a number falls back to 1 (no NaN when snapping, no stuck buttons)", async () => {
    for (const step of [0, -2, Number.NaN]) {
      const { user, unmount } = renderUI(<S defaultValue={3} step={step} snap />)
      await user.click(plus())
      expect(num()).toHaveValue("4")
      await user.click(minus())
      await user.click(minus())
      expect(num()).toHaveValue("2")
      unmount()
    }
  })

  it("a value outside the bounds does not throw; a button brings it in range", async () => {
    const { user } = renderUI(<S defaultValue={50} min={0} max={10} />)
    expect(plus()).toHaveAttribute("aria-disabled", "true")
    await user.click(minus())
    expect(num()).toHaveValue("10")
  })

  it("with a format the form gets the NUMBER (a hidden input); the visible text is only the display", async () => {
    const { container, user } = renderUI(
      <form>
        <S name="price" defaultValue={4.5} step={0.5} format={(n) => `$${n.toFixed(2)}`} parse={(t) => Number.parseFloat(t.replace("$", ""))} />
      </form>,
    )
    const form = container.querySelector("form") as HTMLFormElement
    expect(num()).not.toHaveAttribute("name")
    expect(new FormData(form).get("price")).toBe("4.5")
    await user.click(plus())
    expect(num()).toHaveValue("$5.00")
    expect(new FormData(form).get("price")).toBe("5")
    await user.clear(num())
    await user.tab()
    expect(new FormData(form).get("price")).toBe("")
  })

  it("the buttons of a calm stepper stay 24 px (28 px box, 2 px margin) and the tally keeps its width beside a custom style", () => {
    renderUI(<S defaultValue={3} />)
    expect(minus().className).toContain("calm:m-0.5")
    cleanup()
    const { container } = renderUI(<StepperTally value={6} style={{ marginInlineStart: 4 }} />)
    const tally = container.querySelector('[data-slot="stepper-tally"]') as HTMLElement
    expect(tally.style.marginInlineStart).toBe("4px")
    expect(tally.style.width).toBe(`${tallyWidth(6)}px`)
  })
})

describe("Stepper review fixes: a formatted stepper on the server", () => {
  it("the hidden number renders and hydrates with the text field beside it", async () => {
    const el = <S name="p" defaultValue={12.5} step={0.5} format={(n) => `$${n.toFixed(2)}`} />
    const html = renderToString(el)
    expect(html).toContain('type="hidden"')
    expect(html).toContain('name="p"')
    expect(html).toContain('value="12.5"')
    expect(html).toContain('value="$12.50"')
    cleanup()
    const host = document.createElement("div")
    document.body.appendChild(host)
    host.innerHTML = html
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    await act(async () => {
      hydrateRoot(host, el)
    })
    expect(err.mock.calls.map((c) => String(c[0])).filter((m) => !/act\(/.test(m))).toEqual([])
    err.mockRestore()
    host.remove()
  })

  it("a long number widens the cell (minWidth in ch) and keeps a style you pass", () => {
    renderUI(<Stepper aria-label="Quantity" defaultValue={1234567} step={1}><StepperInput style={{ color: "red" }} /></Stepper>)
    expect(num().style.minWidth).toBe("8ch")
    expect(num().style.color).toBe("red")
  })
})
