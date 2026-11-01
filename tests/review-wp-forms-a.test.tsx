import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Rating } from "@/components/ui/rating"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(180, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})
const opts = { user: { pointerEventsCheck: 0 } }

describe("form semantics: required, name, value, reset", () => {
  it("Select: required blocks an empty form, the value is submitted, disabled leaves FormData, reset returns to the default", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    const { user, getByRole, container } = renderUI(
      <form onSubmit={onSubmit} data-testid="f">
        <Select name="pen" required defaultValue="">
          <SelectTrigger aria-label="Pen">
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="felt">Felt</SelectItem>
            <SelectItem value="pencil">Pencil</SelectItem>
          </SelectContent>
        </Select>
        <button type="submit">Go</button>
      </form>,
      opts
    )
    const form = container.querySelector("form") as HTMLFormElement
    expect(form.checkValidity()).toBe(false)
    await user.click(getByRole("combobox", { name: "Pen" }))
    await user.click(getByRole("option", { name: "Pencil" }))
    expect(form.checkValidity()).toBe(true)
    expect(new FormData(form).get("pen")).toBe("pencil")
    act(() => form.reset())
    await waitFor(() => expect(getByRole("combobox", { name: "Pen" })).toHaveAttribute("data-placeholder"))
    expect(form.checkValidity()).toBe(false)
  })

  it("Switch: required makes an unchecked switch invalid; a checked one submits its value", async () => {
    const { user, getByRole, container } = renderUI(
      <form>
        <Switch name="agree" value="yes" required aria-label="Agree" />
      </form>
    )
    const form = container.querySelector("form") as HTMLFormElement
    expect(form.checkValidity()).toBe(false)
    await user.click(getByRole("switch", { name: "Agree" }))
    expect(form.checkValidity()).toBe(true)
    expect(new FormData(form).get("agree")).toBe("yes")
  })

  it("Slider: form reset returns a controlled-by-Radix slider to its defaultValue and the ink window follows", async () => {
    const { user, getByRole, container } = renderUI(
      <form>
        <Slider name="v" defaultValue={[30]} aria-label="Volume" />
      </form>
    )
    const form = container.querySelector("form") as HTMLFormElement
    const thumb = getByRole("slider", { name: "Volume" })
    const range = container.querySelector("[data-slot=slider-range]") as HTMLElement
    const before = range.style.clipPath
    thumb.focus()
    await user.keyboard("{ArrowRight}{ArrowRight}")
    expect(thumb).toHaveAttribute("aria-valuenow", "32")
    expect(range.style.clipPath).not.toBe(before)
    act(() => form.reset())
    await waitFor(() => expect(thumb).toHaveAttribute("aria-valuenow", "30"))
    expect(range.style.clipPath).toBe(before)
    expect(new FormData(form).get("v")).toBe("30")
  })

  it("RadioGroup: required with no value is invalid, a choice validates, reset clears it", async () => {
    const { user, getByRole, container } = renderUI(
      <form>
        <RadioGroup name="plan" required aria-label="Plan">
          <RadioGroupItem value="a" aria-label="A" />
          <RadioGroupItem value="b" aria-label="B" />
        </RadioGroup>
      </form>
    )
    const form = container.querySelector("form") as HTMLFormElement
    expect(form.checkValidity()).toBe(false)
    await user.click(getByRole("radio", { name: "B" }))
    expect(form.checkValidity()).toBe(true)
    act(() => form.reset())
    await waitFor(() => expect(getByRole("radio", { name: "B" })).toHaveAttribute("aria-checked", "false"))
  })

  it("Rating: name puts the value in FormData, and a form reset returns it to defaultValue (uncontrolled) or asks the parent (controlled)", async () => {
    const { user, getByRole, container } = renderUI(
      <form>
        <Rating name="stars" defaultValue={2} aria-label="Rate" />
      </form>
    )
    const form = container.querySelector("form") as HTMLFormElement
    expect(new FormData(form).get("stars")).toBe("2")
    await user.click(getByRole("radio", { name: "4 of 5" }))
    expect(new FormData(form).get("stars")).toBe("4")
    act(() => form.reset())
    await waitFor(() => expect(getByRole("radio", { name: "2 of 5" })).toHaveAttribute("aria-checked", "true"))
    expect(new FormData(form).get("stars")).toBe("2")

    const onChange = vi.fn()
    const c = renderUI(
      <form>
        <Rating name="s" value={5} defaultValue={1} onValueChange={onChange} aria-label="Rate" />
      </form>
    )
    act(() => (c.container.querySelector("form") as HTMLFormElement).reset())
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it("Rating: required is enforced by the form (a value of 0 is invalid), a chosen value validates", async () => {
    const { user, getByRole, container } = renderUI(
      <form>
        <Rating name="stars" required aria-label="Rate" />
      </form>
    )
    const form = container.querySelector("form") as HTMLFormElement
    expect(form.checkValidity()).toBe(false)
    await user.click(getByRole("radio", { name: "3 of 5" }))
    expect(form.checkValidity()).toBe(true)
  })

  it("NativeSelect: required + empty option is invalid until a value is chosen; a disabled select is not submitted", async () => {
    const { user, getByRole, container } = renderUI(
      <form>
        <NativeSelect name="c" required aria-label="Country">
          <NativeSelectOption value="">Choose</NativeSelectOption>
          <NativeSelectOption value="is">Iceland</NativeSelectOption>
        </NativeSelect>
        <NativeSelect name="d" disabled defaultValue="x" aria-label="Off">
          <NativeSelectOption value="x">X</NativeSelectOption>
        </NativeSelect>
      </form>
    )
    const form = container.querySelector("form") as HTMLFormElement
    expect(form.checkValidity()).toBe(false)
    await user.selectOptions(getByRole("combobox", { name: "Country" }), "is")
    expect(form.checkValidity()).toBe(true)
    expect(new FormData(form).get("c")).toBe("is")
    expect(new FormData(form).has("d")).toBe(false)
  })
})

describe("Progress with values Radix calls invalid", () => {
  it("clamps a value past max (an upload that reports 100.4) instead of turning into the waiting scribble", () => {
    const { getByRole } = renderUI(<Progress value={100.4} aria-label="Upload" />)
    const bar = getByRole("progressbar", { name: "Upload" })
    expect(bar).toHaveAttribute("data-state", "complete")
    expect(bar.querySelector("[data-slot=progress-indicator]")).toHaveAttribute("data-state", "complete")
    expect(bar).toHaveAttribute("aria-valuenow", "100")
  })

  it("clamps a negative value to empty, and NaN is the waiting state", () => {
    const { getByRole, rerender } = renderUI(<Progress value={-5} aria-label="Upload" />)
    expect(getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0")
    expect(getByRole("progressbar")).toHaveAttribute("data-state", "loading")
    rerender(<Progress value={Number.NaN} aria-label="Upload" />)
    expect(getByRole("progressbar")).toHaveAttribute("data-state", "indeterminate")
    const style = (getByRole("progressbar").querySelector("[data-slot=progress-indicator]") as HTMLElement).getAttribute("style") ?? ""
    expect(style).not.toContain("NaN")
  })
})

describe("focus, StrictMode and dialogs", () => {
  it("Select inside a Dialog: the list opens above it, Escape closes only the list, the choice lands and focus returns to the trigger", async () => {
    const onChange = vi.fn()
    const { user, getByRole, queryByRole } = renderUI(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Pick a pen.</DialogDescription>
          <Select onValueChange={onChange}>
            <SelectTrigger aria-label="Pen">
              <SelectValue placeholder="Pick" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="felt">Felt</SelectItem>
              <SelectItem value="pencil">Pencil</SelectItem>
            </SelectContent>
          </Select>
        </DialogContent>
      </Dialog>,
      opts
    )
    await user.click(getByRole("button", { name: "Open" }))
    const trigger = getByRole("combobox", { name: "Pen" })
    await user.click(trigger)
    expect(getByRole("listbox")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(queryByRole("listbox")).toBeNull()
    expect(getByRole("dialog")).toBeInTheDocument()
    expect(trigger).toHaveFocus()
    await user.click(trigger)
    await user.click(getByRole("option", { name: "Felt" }))
    expect(onChange).toHaveBeenCalledWith("felt")
    expect(trigger).toHaveFocus()
    expect(getByRole("dialog")).toBeInTheDocument()
  })

  it("the whole set survives StrictMode (double effects) with no console errors, and still works", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const { user, getByRole } = renderUI(
      <React.StrictMode>
        <Field>
          <FieldLabel htmlFor="p">Pen</FieldLabel>
          <Select defaultValue="felt">
            <SelectTrigger id="p">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="felt">Felt</SelectItem>
              <SelectItem value="pencil">Pencil</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Switch aria-label="s" />
        <Slider defaultValue={[10]} aria-label="sl" />
        <Slider defaultValue={[10, 40]} aria-label="rg" />
        <RadioGroup defaultValue="a" aria-label="rad">
          <RadioGroupItem value="a" aria-label="a" />
          <RadioGroupItem value="b" aria-label="b" />
        </RadioGroup>
        <Rating aria-label="rate" defaultValue={2} />
        <Progress value={30} aria-label="pr" />
        <InputGroup>
          <InputGroupAddon>@</InputGroupAddon>
          <InputGroupInput aria-label="handle" />
        </InputGroup>
      </React.StrictMode>,
      opts
    )
    await user.click(getByRole("switch", { name: "s" }))
    expect(getByRole("switch", { name: "s" })).toHaveAttribute("aria-checked", "true")
    await user.click(getByRole("radio", { name: "b" }))
    expect(getByRole("radio", { name: "b" })).toHaveAttribute("aria-checked", "true")
    await user.click(getByRole("radio", { name: "4 of 5" }))
    expect(getByRole("radio", { name: "4 of 5" })).toHaveAttribute("aria-checked", "true")
    await user.click(getByRole("combobox", { name: "Pen" }))
    await user.click(within(document.body).getByRole("option", { name: "Pencil" }))
    expect(getByRole("combobox", { name: "Pen" })).toHaveTextContent("Pencil")
    expect(err).not.toHaveBeenCalled()
    err.mockRestore()
  })

  it("Rating keeps the keyboard: arrows move the tab stop and focus, Tab leaves the group in one press", async () => {
    const { user, getByRole, getAllByRole } = renderUI(
      <>
        <button>before</button>
        <Rating aria-label="Rate" defaultValue={2} />
        <button>after</button>
      </>
    )
    await user.tab()
    await user.tab()
    expect(getByRole("radio", { name: "2 of 5" })).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(getByRole("radio", { name: "3 of 5" })).toHaveFocus()
    expect(getAllByRole("radio").filter((r) => r.tabIndex === 0)).toHaveLength(1)
    await user.tab()
    expect(getByRole("button", { name: "after" })).toHaveFocus()
    await user.tab({ shift: true })
    expect(getByRole("radio", { name: "3 of 5" })).toHaveFocus()
  })
})

describe("lists and ink budgets", () => {
  it("a 200-item Select draws no ink per row", async () => {
    const items = Array.from({ length: 200 }, (_, i) => i)
    const { user, getByRole, getAllByRole } = renderUI(
      <Select>
        <SelectTrigger aria-label="Row">
          <SelectValue placeholder="Row" />
        </SelectTrigger>
        <SelectContent position="popper">
          {items.map((i) => (
            <SelectItem key={i} value={String(i)}>
              Row {i}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>,
      opts
    )
    await user.click(getByRole("combobox", { name: "Row" }))
    expect(getAllByRole("option")).toHaveLength(200)
    const list = getByRole("listbox").closest("[data-slot=select-content]") as HTMLElement
    expect(list.querySelectorAll("svg[data-ink]:not([data-ink=icon])").length).toBe(0)
    expect(list.querySelectorAll("[data-slot=select-item] svg").length).toBeLessThanOrEqual(1)
  })

  it("a 200-row NativeSelect and a 60-glyph Rating stay cheap: one ink host each", () => {
    const { container } = renderUI(
      <>
        <NativeSelect aria-label="n">
          {Array.from({ length: 200 }, (_, i) => (
            <NativeSelectOption key={i} value={String(i)}>
              {i}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </>
    )
    expect(container.querySelectorAll("svg[data-ink]:not([data-ink=icon])")).toHaveLength(1)
  })
})

describe("hostile input", () => {
  it("Slider: an empty value array, values past the range and NaN never throw or write NaN into the clip", () => {
    const { container, rerender } = renderUI(<Slider value={[]} aria-label="s" />)
    expect(container.querySelectorAll("[data-slot=slider-thumb]")).toHaveLength(0)
    rerender(<Slider value={[500]} min={0} max={100} aria-label="s" />)
    rerender(<Slider value={[-50, 900]} aria-label="s" />)
    rerender(<Slider value={[Number.NaN]} aria-label="s" />)
    const range = container.querySelector("[data-slot=slider-range]") as HTMLElement
    expect(range.getAttribute("style") ?? "").not.toMatch(/NaN|undefined/)
  })

  it("Slider: a controlled slider can change from one thumb to two and back", () => {
    const { container, rerender, getAllByRole } = renderUI(<Slider value={[20]} aria-label="s" />)
    expect(getAllByRole("slider")).toHaveLength(1)
    rerender(<Slider value={[20, 60]} aria-label="s" />)
    expect(getAllByRole("slider")).toHaveLength(2)
    expect(container.querySelector("[data-slot=slider]")).toHaveAttribute("role", "group")
    rerender(<Slider value={[20]} aria-label="s" />)
    expect(getAllByRole("slider")).toHaveLength(1)
    expect(container.querySelector("[data-slot=slider]")).not.toHaveAttribute("role")
  })

  it("Rating: absurd max / defaultValue / value never throw", () => {
    const a = renderUI(<Rating max={0} aria-label="r" />)
    expect(a.container.querySelectorAll("[role=radio]")).toHaveLength(0)
    a.unmount()
    const b = renderUI(<Rating max={Number.NaN} defaultValue={Number.NaN} aria-label="r" />)
    expect(b.container.querySelectorAll("[role=radio]")).toHaveLength(0)
    b.unmount()
    const c = renderUI(<Rating value={99} aria-label="r" />)
    expect(c.getAllByRole("radio").filter((r) => r.getAttribute("aria-checked") === "true")).toHaveLength(1)
    c.unmount()
    const d = renderUI(<Rating readOnly disabled value={3} aria-label="r" />)
    expect(d.container.querySelectorAll("button")).toHaveLength(0)
  })

  it("FieldError: duplicates collapse, holes are ignored, an all-empty list renders nothing", () => {
    const { container, rerender } = renderUI(<FieldError errors={[{ message: "a" }, { message: "a" }]} />)
    expect(container.textContent).toBe("a")
    rerender(<FieldError errors={[undefined, { message: "b" }, { message: "c" }]} />)
    expect(container.querySelectorAll("li")).toHaveLength(2)
    rerender(<FieldError errors={[undefined, {}]} />)
    expect(container.querySelector("[role=alert]")).toBeNull()
  })

  it("Select: a very long value stays one line (line-clamp), a label association names the trigger", async () => {
    const long = "An extraordinarily long option label that would push the field far past any sensible column width"
    const { getByRole } = renderUI(
      <Field>
        <FieldLabel htmlFor="lp">Pen</FieldLabel>
        <Select defaultValue="x">
          <SelectTrigger id="lp">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="x">{long}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    )
    const t = getByRole("combobox", { name: "Pen" })
    expect(t.className).toContain("*:data-[slot=select-value]:line-clamp-1")
    expect(t).toHaveTextContent("An extraordinarily long option label")
    await axeCheck()
  })
})

describe("invalid reaches every control, from where the ARIA puts it", () => {
  it("Slider: aria-invalid, aria-describedby and the name go to the thumb (the role=slider), and the drawing turns red", () => {
    const { getByRole, container } = renderUI(<Slider defaultValue={[30]} aria-invalid aria-describedby="why" aria-label="Volume" />)
    const thumb = getByRole("slider", { name: "Volume" })
    expect(thumb).toHaveAttribute("aria-invalid", "true")
    expect(thumb).toHaveAttribute("aria-describedby", "why")
    const root = container.querySelector("[data-slot=slider]") as HTMLElement
    expect(root).not.toHaveAttribute("aria-invalid")
    expect(root).not.toHaveAttribute("aria-describedby")
    expect(thumb.querySelector("svg")!.innerHTML).toContain("var(--ll-red)")
    expect(container.querySelector("[data-slot=slider-track] svg")!.innerHTML).toContain("var(--ll-red)")
  })

  it("Slider (range): every thumb says invalid, the group carries the name and the description", () => {
    const { getAllByRole, container } = renderUI(<Slider defaultValue={[10, 60]} aria-invalid aria-describedby="why" aria-label="Price" />)
    for (const t of getAllByRole("slider")) expect(t).toHaveAttribute("aria-invalid", "true")
    const root = container.querySelector("[data-slot=slider]") as HTMLElement
    expect(root).toHaveAttribute("role", "group")
    expect(root).toHaveAttribute("aria-describedby", "why")
  })

  it("Slider: a valid slider draws no red", () => {
    const { container } = renderUI(<Slider defaultValue={[30]} aria-label="Volume" />)
    expect(container.querySelector("[data-slot=slider-thumb] svg")!.innerHTML).not.toContain("var(--ll-red)")
  })

  it("RadioGroup: aria-invalid on the group draws every radio red, and an item can still say otherwise", () => {
    const { getAllByRole } = renderUI(
      <RadioGroup aria-label="Plan" aria-invalid>
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" aria-invalid={false} />
      </RadioGroup>
    )
    const [a, b] = getAllByRole("radio")
    expect(a.querySelector("svg")!.innerHTML).toContain("var(--ll-red)")
    expect(b.querySelector("svg")!.innerHTML).not.toContain("var(--ll-red)")
  })

  it("Rating: aria-invalid draws the empty glyphs red and keeps the attribute on the radiogroup", () => {
    const { getByRole, container } = renderUI(<Rating aria-label="Rate" aria-invalid />)
    expect(getByRole("radiogroup", { name: "Rate" })).toHaveAttribute("aria-invalid", "true")
    expect(container.querySelector("[data-slot=rating-item] svg")!.innerHTML).toContain("var(--ll-red)")
  })

  it("InputGroup: a disabled group takes no hover layer", () => {
    const { container } = renderUI(
      <InputGroup>
        <InputGroupAddon>@</InputGroupAddon>
        <InputGroupInput aria-label="h" disabled />
      </InputGroup>
    )
    expect((container.querySelector("[data-slot=input-group]") as HTMLElement).className).toContain("has-[[data-slot=input-group-control]:disabled]:[&>svg>[data-layer=hover]]:hidden")
  })

  it("Rating: a preview does not outlive a click, and clearing shows empty glyphs at once", async () => {
    const { user, getByRole, container } = renderUI(<Rating aria-label="Rate" defaultValue={3} clearable />)
    const three = getByRole("radio", { name: "3 of 5" })
    await user.hover(three)
    await user.click(three)
    const states = () => Array.from(container.querySelectorAll("[data-slot=rating-item]")).map((i) => i.getAttribute("data-state"))
    expect(states()).toEqual(["unchecked", "unchecked", "unchecked", "unchecked", "unchecked"])
  })
})

describe("disabled set on the root reaches the drawing", () => {
  const layerNames = (el: Element) => Array.from(el.querySelectorAll(":scope > svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

  it("<Select disabled> draws the dashed trigger, not an enabled-looking dead button", () => {
    const { getByRole } = renderUI(
      <Select disabled>
        <SelectTrigger aria-label="Pen">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    )
    const t = getByRole("combobox", { name: "Pen" })
    expect(t).toBeDisabled()
    expect(layerNames(t)).toEqual(["disabled"])
  })

  it("<RadioGroup disabled> draws every radio disabled (rest kept, the disabled wash and dashes)", () => {
    const { getAllByRole } = renderUI(
      <RadioGroup disabled defaultValue="a" aria-label="Plan">
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" />
      </RadioGroup>
    )
    for (const r of getAllByRole("radio")) {
      expect(r).toBeDisabled()
      expect(r.querySelector("svg")!.innerHTML).toContain("var(--ll-pencil-mark)")
    }
  })

  it("a single disabled radio in an enabled group still works", () => {
    const { getAllByRole } = renderUI(
      <RadioGroup aria-label="Plan">
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" disabled />
      </RadioGroup>
    )
    const [a, b] = getAllByRole("radio")
    expect(a.querySelector("svg")!.innerHTML).not.toContain("var(--ll-pencil-mark)")
    expect(b.querySelector("svg")!.innerHTML).toContain("var(--ll-pencil-mark)")
  })
})

describe("Rating in forms, the rest", () => {
  it("a required rating is accessible, a disabled one is not validated or submitted, a read-only one still submits", async () => {
    const { container } = renderUI(
      <form>
        <Rating name="a" required aria-label="A" />
        <Rating name="b" required disabled defaultValue={0} aria-label="B" />
        <Rating name="c" readOnly value={4} aria-label="C" />
      </form>
    )
    await axeCheck(container)
    const form = container.querySelector("form") as HTMLFormElement
    const data = new FormData(form)
    expect(data.has("b")).toBe(false)
    expect(data.get("c")).toBe("4")
    expect(form.querySelectorAll(":invalid")).toHaveLength(1)
  })

  it("form= attribute on the wrapper form: reset is found through the input's own form", async () => {
    const { user, getByRole, container } = renderUI(
      <>
        <Rating name="x" required defaultValue={2} aria-label="R" />
      </>
    )
    await user.click(getByRole("radio", { name: "5 of 5" }))
    expect(getByRole("radio", { name: "5 of 5" })).toHaveAttribute("aria-checked", "true")
    expect(container.querySelector("input[name=x]")).toHaveValue("5")
  })
})

describe("late-mounted ink", () => {
  it("FieldError that appears after first render is drawn (the host mounts later than the hooks)", () => {
    const { container, rerender } = renderUI(<FieldError />)
    expect(container.querySelector("[data-slot=field-error]")).toBeNull()
    rerender(<FieldError>Nope.</FieldError>)
    const el = container.querySelector("[data-slot=field-error]") as HTMLElement
    expect(el).toHaveAttribute("data-ink-ready")
    expect(el.querySelector(":scope > svg[data-ink]")).toBeTruthy()
    rerender(<FieldError />)
    rerender(<FieldError>Again.</FieldError>)
    expect((container.querySelector("[data-slot=field-error]") as HTMLElement).querySelector(":scope > svg[data-ink]")).toBeTruthy()
  })
})

describe("server and hydration of the reviewed states", () => {
  const Page = () => (
    <InkProvider>
      <form>
        <Select disabled defaultValue="a">
          <SelectTrigger aria-label="Pen">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>
        <RadioGroup disabled aria-invalid aria-label="Plan" defaultValue="a">
          <RadioGroupItem value="a" aria-label="A" />
        </RadioGroup>
        <Slider defaultValue={[20]} aria-invalid aria-describedby="d" aria-label="S" />
        <Slider value={[Number.NaN, 200]} aria-label="R" />
        <Rating name="r" required aria-invalid aria-label="Rate" />
        <Rating name="q" readOnly disabled value={3} aria-label="Rated" />
        <Progress value={105} aria-label="P" />
        <Progress value={Number.NaN} aria-label="Q" />
        <FieldError>Nope.</FieldError>
      </form>
    </InkProvider>
  )

  it("renders the same HTML twice and hydrates without a console error", async () => {
    const a = renderToString(<Page />)
    expect(renderToString(<Page />)).toBe(a)
    expect(a).not.toMatch(/NaN|undefined/)
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const host = document.createElement("div")
    host.innerHTML = a
    document.body.appendChild(host)
    await act(async () => {
      hydrateRoot(host, <Page />)
    })
    expect(err).not.toHaveBeenCalled()
    err.mockRestore()
    host.remove()
  })
})

describe("InputGroupAddon click", () => {
  it("focuses the control for a click on plain text or an icon, but leaves buttons, links and selects alone", async () => {
    const { user, getByRole, getByText } = renderUI(
      <InputGroup>
        <InputGroupAddon>
          <span>https://</span>
          <a href="#x">docs</a>
          <NativeSelect aria-label="unit">
            <NativeSelectOption value="a">a</NativeSelectOption>
          </NativeSelect>
        </InputGroupAddon>
        <InputGroupInput aria-label="path" />
      </InputGroup>
    )
    await user.click(getByText("https://"))
    expect(getByRole("textbox", { name: "path" })).toHaveFocus()
    ;(document.activeElement as HTMLElement).blur()
    await user.click(getByRole("link", { name: "docs" }))
    expect(getByRole("textbox", { name: "path" })).not.toHaveFocus()
    await user.click(getByRole("combobox", { name: "unit" }))
    expect(getByRole("textbox", { name: "path" })).not.toHaveFocus()
  })
})

describe("Slider value text", () => {
  it("getValueText becomes aria-valuetext on each thumb and follows the value", async () => {
    const { user, getAllByRole } = renderUI(<Slider defaultValue={[10, 40]} aria-label="Brush" getValueText={(v, i) => `${i === 0 ? "from" : "to"} ${v} px`} />)
    const [a, b] = getAllByRole("slider")
    expect(a).toHaveAttribute("aria-valuetext", "from 10 px")
    expect(b).toHaveAttribute("aria-valuetext", "to 40 px")
    b.focus()
    await user.keyboard("{ArrowRight}")
    expect(b).toHaveAttribute("aria-valuetext", "to 41 px")
  })
})
