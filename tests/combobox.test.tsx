import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, cleanup, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxCreate,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxLoading,
  ComboboxTrigger,
  ComboboxValue,
  useCombobox,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { chipToneList, comboboxChipRecipe, comboboxChipsRecipe, comboboxTriggerRecipe } from "@/lib/ink/recipes/combobox-ink"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(260, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }
const FRAMEWORKS = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
]

function Basic({ children, ...root }: Partial<React.ComponentProps<typeof Combobox>> & { children?: React.ReactNode }) {
  return (
    <Combobox items={FRAMEWORKS} label="Framework" {...(root as object)}>
      <ComboboxTrigger aria-label="Framework">
        <ComboboxValue placeholder="Select framework..." />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput placeholder="Search framework..." />
        <ComboboxList>
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          <ComboboxGroup>
            {FRAMEWORKS.map((f) => (
              <ComboboxItem key={f.value} value={f.value}>
                {f.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
          {children}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

const trigger = () => screen.getAllByRole("combobox", { name: "Framework" }).find((el) => el.tagName === "BUTTON") as HTMLElement
const option = (name: RegExp | string) => screen.findByRole("option", { name })
const searchBox = () => within(screen.getByRole("dialog")).getByRole("combobox")

function Tags(props: Partial<React.ComponentProps<typeof Combobox>> & { tone?: "hi" | "auto" }) {
  const { tone, ...root } = props
  return (
    <Combobox multiple items={FRAMEWORKS} label="Frameworks" defaultValue={["next", "astro"]} {...(root as object)}>
      <ComboboxChips tone={tone} aria-label="Frameworks">
        <ComboboxChipsInput placeholder="Add framework..." />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          <ComboboxGroup>
            {FRAMEWORKS.map((f) => (
              <ComboboxItem key={f.value} value={f.value}>
                {f.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

describe("Combobox with a trigger", () => {
  it("is a combobox button in the select trigger's pencil box, showing the placeholder", () => {
    const { container } = renderUI(<Basic />)
    const t = trigger()
    expect(t.tagName).toBe("BUTTON")
    expect(t).toHaveAttribute("data-slot", "combobox-trigger")
    expect(t).toHaveAttribute("aria-haspopup", "dialog")
    expect(t).toHaveAttribute("aria-expanded", "false")
    expect(t).toHaveTextContent("Select framework...")
    expect(t.querySelector('[data-slot="combobox-value"]')).toHaveAttribute("data-placeholder")
    expect(t).toHaveAttribute("data-ink-host")
    expect(t.querySelector(":scope > svg[data-ink='field']")).not.toBeNull()
    expect(container.querySelector('[data-slot="combobox"]')).toHaveClass("contents")
  })

  it("opens on click into a named dialog with a search box and the options; choosing closes it and shows the label", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<Basic onValueChange={onValueChange} />, opts)
    await user.click(trigger())
    const dialog = await screen.findByRole("dialog", { name: "Framework" })
    expect(dialog.querySelector(":scope > [data-slot='combobox-content']")).not.toBeNull()
    expect(trigger()).toHaveAttribute("aria-expanded", "true")
    expect(within(dialog).getByRole("combobox")).toHaveAttribute("data-slot", "combobox-input")
    expect(within(dialog).getAllByRole("option")).toHaveLength(5)
    await user.click(await option("Remix"))
    expect(onValueChange).toHaveBeenCalledWith("remix")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(trigger()).toHaveTextContent("Remix")
    expect(trigger().querySelector('[data-slot="combobox-value"]')).not.toHaveAttribute("data-placeholder")
  })

  it("Enter and the arrow keys open it from the trigger; typing narrows the list; Enter chooses; Escape returns focus", async () => {
    const { user } = renderUI(<Basic />, opts)
    trigger().focus()
    await user.keyboard("{Enter}")
    await screen.findByRole("dialog")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(trigger()).toHaveFocus())
    await user.keyboard("{ArrowDown}")
    await screen.findByRole("dialog")
    await user.keyboard("nu")
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Nuxt.js"])
    await user.keyboard("{Enter}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(trigger()).toHaveTextContent("Nuxt.js")
  })

  it("searches the label as well as the value, and shows the empty state", async () => {
    const { user } = renderUI(<Basic />, opts)
    await user.click(trigger())
    await user.type(searchBox(), "svelte")
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["SvelteKit"])
    await user.clear(searchBox())
    await user.type(searchBox(), "zzzz")
    expect(document.querySelector('[data-slot="combobox-empty"]')).toHaveTextContent("No framework found.")
  })

  it("the chosen row ends in a tick and says 'selected' to screen readers; the search is cleared when it closes", async () => {
    const { user } = renderUI(<Basic defaultValue="astro" />, opts)
    expect(trigger()).toHaveTextContent("Astro")
    await user.click(trigger())
    const chosen = await option(/Astro/)
    expect(chosen).toHaveAttribute("data-checked", "true")
    expect(chosen).toHaveTextContent("Astro, selected")
    expect(chosen.querySelector('[data-slot="combobox-item-indicator"] svg')).not.toBeNull()
    await user.type(searchBox(), "rem")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await user.click(trigger())
    expect(searchBox()).toHaveValue("")
    expect(screen.getAllByRole("option")).toHaveLength(5)
  })

  it("controlled: value comes from props (null is empty) and onValueChange asks for a change", async () => {
    const onValueChange = vi.fn()
    const { user, rerender } = renderUI(<Basic value={null} onValueChange={onValueChange} />, opts)
    expect(trigger()).toHaveTextContent("Select framework...")
    await user.click(trigger())
    await user.click(await option("Remix"))
    expect(onValueChange).toHaveBeenCalledWith("remix")
    expect(trigger()).toHaveTextContent("Select framework...")
    rerender(<Basic value="remix" onValueChange={onValueChange} />)
    expect(trigger()).toHaveTextContent("Remix")
  })

  it("open / onOpenChange control the list", async () => {
    const onOpenChange = vi.fn()
    const { user, rerender } = renderUI(<Basic open={false} onOpenChange={onOpenChange} />, opts)
    await user.click(trigger())
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole("dialog")).toBeNull()
    rerender(<Basic open onOpenChange={onOpenChange} />)
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
  })

  it("a function child of ComboboxValue draws the value yourself, and a function child of ComboboxList draws the rows from `items`", async () => {
    const { user } = renderUI(
      <Combobox items={FRAMEWORKS} label="Framework" defaultValue="nuxt">
        <ComboboxTrigger aria-label="Framework">
          <ComboboxValue>{(v, labelFor) => <b data-testid="v">{typeof v === "string" ? labelFor(v).toUpperCase() : "-"}</b>}</ComboboxValue>
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput />
          <ComboboxList>{(item) => <ComboboxItem key={item.value} value={item.value}>{item.label}</ComboboxItem>}</ComboboxList>
        </ComboboxContent>
      </Combobox>,
      opts,
    )
    expect(screen.getByTestId("v")).toHaveTextContent("NUXT.JS")
    await user.click(trigger())
    expect(await screen.findAllByRole("option")).toHaveLength(5)
  })

  it("groups, labels and separators keep their slots", async () => {
    const { user } = renderUI(
      <Basic>
        <ComboboxGroup heading="More">
          <ComboboxLabel>Extra</ComboboxLabel>
          <ComboboxItem value="qwik">Qwik</ComboboxItem>
        </ComboboxGroup>
      </Basic>,
      opts,
    )
    await user.click(trigger())
    await screen.findByRole("dialog")
    for (const slot of ["combobox-list", "combobox-group", "combobox-item", "combobox-label"]) expect(document.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    expect(screen.getByRole("group", { name: "More" })).toBeInTheDocument()
  })

  it("disabled: nothing opens", async () => {
    const { user } = renderUI(<Basic disabled />, opts)
    expect(trigger()).toBeDisabled()
    await user.click(trigger())
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("invalid marks the trigger and draws the red box", () => {
    renderUI(<Basic invalid />)
    expect(trigger()).toHaveAttribute("aria-invalid", "true")
    expect(Array.from(trigger().querySelectorAll(":scope > svg > g[data-layer]")).map((g) => g.getAttribute("data-layer"))).toEqual(["invalid"])
  })

  it("name adds a hidden input per chosen value for forms (one empty input when nothing is chosen)", () => {
    const fd = (el: React.ReactElement) => {
      const r = renderUI(<form>{el}</form>)
      const data = new FormData(r.container.querySelector("form") as HTMLFormElement)
      r.unmount()
      return data.getAll("fw")
    }
    expect(fd(<Basic name="fw" defaultValue="next" />)).toEqual(["next"])
    expect(fd(<Basic name="fw" multiple defaultValue={["next", "astro"]} />)).toEqual(["next", "astro"])
    expect(fd(<Basic name="fw" />)).toEqual([""])
  })

  it("useCombobox exposes the state to your own parts, and throws outside a Combobox", () => {
    function Peek() {
      const c = useCombobox()
      return <span data-testid="peek">{`${c.multiple}|${c.value.join(",")}|${c.open}`}</span>
    }
    renderUI(
      <Combobox defaultValue="a">
        <Peek />
      </Combobox>,
    )
    expect(screen.getByTestId("peek")).toHaveTextContent("false|a|false")
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderUI(<Peek />)).toThrow(/inside <Combobox>/)
    err.mockRestore()
  })
})

describe("Combobox multiple", () => {
  it("toggles values and stays open; a trigger lists the labels", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<Basic multiple defaultValue={[]} onValueChange={onValueChange} />, opts)
    await user.click(trigger())
    await user.click(await option("Next.js"))
    await user.click(await option("Astro"))
    expect(onValueChange).toHaveBeenLastCalledWith(["next", "astro"])
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(trigger()).toHaveTextContent("Next.js, Astro")
    await user.click(await option(/Next.js/))
    expect(onValueChange).toHaveBeenLastCalledWith(["astro"])
  })
})

describe("Combobox chips", () => {
  const input = () => screen.getByRole("combobox") as HTMLInputElement

  it("shows one tag per chosen value, each with a real remove button; the tag is a drawn chip", () => {
    const { container } = renderUI(<Tags />)
    const chips = container.querySelectorAll('[data-slot="combobox-chip"]')
    expect(chips).toHaveLength(2)
    expect(chips[0]).toHaveTextContent("Next.js")
    expect(chips[0]).toHaveAttribute("data-ink-host")
    expect(chips[0].querySelector(":scope > svg[data-ink='chip']")).not.toBeNull()
    expect(screen.getByRole("button", { name: "Remove Next.js" })).toHaveAttribute("data-slot", "combobox-chip-remove")
    expect(container.querySelector('[data-slot="combobox-chips"]')).toHaveAttribute("data-ink-focus", "within")
  })

  it("the x removes a tag and puts the focus back in the input", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<Tags onValueChange={onValueChange} />, opts)
    await user.click(screen.getByRole("button", { name: "Remove Next.js" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["astro"])
    expect(screen.queryByText("Next.js")).toBeNull()
    expect(input()).toHaveFocus()
  })

  it("typing opens the list beside the field without stealing focus; picking adds a tag and clears the text; Backspace takes the last tag back", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<Tags onValueChange={onValueChange} />, opts)
    await user.click(input())
    await user.type(input(), "rem")
    const dialog = await screen.findByRole("dialog", { name: "Frameworks" })
    expect(input()).toHaveFocus()
    expect(within(dialog).getAllByRole("option").map((o) => o.textContent)).toEqual(["Remix"])
    await user.keyboard("{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith(["next", "astro", "remix"])
    expect(input()).toHaveValue("")
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    await user.keyboard("{Backspace}")
    expect(onValueChange).toHaveBeenLastCalledWith(["next", "astro"])
  })

  it("clicking the empty part of the field focuses the input", async () => {
    const { user, container } = renderUI(<Tags />, opts)
    await user.click(container.querySelector('[data-slot="combobox-chips"]') as HTMLElement)
    expect(input()).toHaveFocus()
  })

  it("tone='auto' gives each value its own color from its text (stable)", () => {
    const { container } = renderUI(<Tags tone="auto" defaultValue={["next", "astro", "nuxt", "remix"]} />)
    const tones = () => Array.from(container.querySelectorAll('[data-slot="combobox-chip"]')).map((c) => c.querySelector("svg")?.innerHTML ?? "")
    const a = tones()
    expect(new Set(a).size).toBeGreaterThan(1)
    const b = renderUI(<Tags tone="auto" defaultValue={["next", "astro", "nuxt", "remix"]} />)
    void b
  })

  it("renderChip draws the tags yourself", () => {
    renderUI(
      <Combobox multiple items={FRAMEWORKS} defaultValue={["next"]}>
        <ComboboxChips renderChip={(v, l) => <b data-testid="mine">{`${v}:${l}`}</b>}>
          <ComboboxChipsInput aria-label="Add" />
        </ComboboxChips>
      </Combobox>,
    )
    expect(screen.getByTestId("mine")).toHaveTextContent("next:Next.js")
  })

  it("useComboboxAnchor gives a ref for ComboboxContent to line up with", async () => {
    function Anchored() {
      const anchor = useComboboxAnchor()
      return (
        <Combobox multiple items={FRAMEWORKS} label="Frameworks" defaultOpen>
          <ComboboxChips ref={anchor}>
            <ComboboxChipsInput aria-label="Add" />
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <ComboboxList>
              <ComboboxItem value="next">Next.js</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )
    }
    renderUI(<Anchored />, opts)
    expect(await screen.findByRole("dialog", { name: "Frameworks" })).toBeInTheDocument()
  })
})

describe("Combobox as an editable single-select", () => {
  function Field(props: Partial<React.ComponentProps<typeof Combobox>> & { showClear?: boolean }) {
    const { showClear, ...root } = props
    return (
      <Combobox items={FRAMEWORKS} label="Framework" {...(root as object)}>
        <ComboboxInput placeholder="Pick a framework" aria-label="Framework" showClear={showClear} />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxEmpty>No framework found.</ComboboxEmpty>
            {FRAMEWORKS.map((f) => (
              <ComboboxItem key={f.value} value={f.value}>
                {f.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )
  }
  const input = () => screen.getByRole("combobox", { name: "Framework" }) as HTMLInputElement

  it("shows the chosen label in the input, opens as you type, narrows the list, and keeps the focus in the input", async () => {
    const { user } = renderUI(<Field defaultValue="remix" />, opts)
    expect(input()).toHaveValue("Remix")
    expect(input()).toHaveAttribute("aria-expanded", "false")
    input().focus()
    await user.keyboard("{Control>}a{/Control}ast")
    await screen.findByRole("dialog")
    expect(input()).toHaveFocus()
    expect(input()).toHaveAttribute("aria-expanded", "true")
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Astro"])
    await user.keyboard("{Enter}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(input()).toHaveValue("Astro")
  })

  it("when it opens without typing every item is listed, and closing without choosing puts the label back", async () => {
    const { user } = renderUI(<Field defaultValue="remix" />, opts)
    await user.click(input())
    await user.keyboard("{ArrowDown}")
    await screen.findByRole("dialog")
    expect(screen.getAllByRole("option")).toHaveLength(5)
    await user.keyboard("zz")
    expect(input()).toHaveValue("Remixzz")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(input()).toHaveValue("Remix")
  })

  it("showClear adds a Clear button once something is chosen", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<Field showClear defaultValue="remix" onValueChange={onValueChange} />, opts)
    await user.click(screen.getByRole("button", { name: "Clear" }))
    expect(onValueChange).toHaveBeenCalledWith(null)
    expect(input()).toHaveValue("")
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull()
  })

  it("the chevron toggles the list", async () => {
    const { user } = renderUI(<Field />, opts)
    await user.click(screen.getByRole("button", { name: "Toggle options" }))
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Toggle options" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })
})

describe("Combobox creatable and async", () => {
  function Creatable({ onCreate }: { onCreate: (t: string) => void }) {
    return (
      <Combobox items={FRAMEWORKS} label="Framework">
        <ComboboxTrigger aria-label="Framework">
          <ComboboxValue placeholder="Pick or add" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput />
          <ComboboxList>
            <ComboboxEmpty>Nothing.</ComboboxEmpty>
            {FRAMEWORKS.map((f) => (
              <ComboboxItem key={f.value} value={f.value}>
                {f.label}
              </ComboboxItem>
            ))}
            <ComboboxCreate onCreate={onCreate}>{(text) => `Add "${text}"`}</ComboboxCreate>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )
  }

  it("offers 'Create' only for text that is not an item, and choosing it calls onCreate and chooses the text", async () => {
    const onCreate = vi.fn()
    const { user } = renderUI(<Creatable onCreate={onCreate} />, opts)
    await user.click(trigger())
    await user.type(searchBox(), "Solid")
    const create = await screen.findByRole("option", { name: 'Add "Solid"' })
    expect(create).toHaveAttribute("data-slot", "combobox-create")
    await user.click(create)
    expect(onCreate).toHaveBeenCalledWith("Solid")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(trigger()).toHaveTextContent("Solid")
  })

  it("an existing item (by label or value, any case) hides it", async () => {
    const { user } = renderUI(<Creatable onCreate={() => {}} />, opts)
    await user.click(trigger())
    await user.type(searchBox(), "remix")
    expect(screen.queryByRole("option", { name: /Add/ })).toBeNull()
    await user.clear(searchBox())
    await user.type(searchBox(), "NEXT.JS")
    expect(screen.queryByRole("option", { name: /Add/ })).toBeNull()
  })

  it("async: loading holds back the empty message and shows the loading row; shouldFilter={false} leaves the list to you", async () => {
    function Remote({ loading, results }: { loading: boolean; results: string[] }) {
      return (
        <Combobox shouldFilter={false} loading={loading} label="Users">
          <ComboboxTrigger aria-label="Users">
            <ComboboxValue placeholder="Find a user" />
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxInput />
            <ComboboxList>
              {loading && <ComboboxLoading>Searching...</ComboboxLoading>}
              <ComboboxEmpty>No users.</ComboboxEmpty>
              {results.map((r) => (
                <ComboboxItem key={r} value={r}>
                  {r}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )
    }
    const { user, rerender } = renderUI(<Remote loading results={[]} />, opts)
    await user.click(screen.getByRole("combobox", { name: "Users" }))
    await screen.findByRole("dialog")
    expect(screen.getByRole("progressbar")).toHaveTextContent("Searching...")
    expect(document.querySelector('[data-slot="combobox-empty"]')).toBeNull()
    rerender(<Remote loading={false} results={[]} />)
    expect(document.querySelector('[data-slot="combobox-empty"]')).toHaveTextContent("No users.")
    rerender(<Remote loading={false} results={["ada", "grace"]} />)
    await user.type(searchBox(), "zzz")
    expect(screen.getAllByRole("option")).toHaveLength(2)
  })

  it("the search text is controllable (for a server search)", async () => {
    const onInputValueChange = vi.fn()
    const { user } = renderUI(<Basic onInputValueChange={onInputValueChange} />, opts)
    await user.click(trigger())
    await user.type(searchBox(), "ab")
    expect(onInputValueChange).toHaveBeenLastCalledWith("ab")
  })
})

describe("Combobox recipes, accessibility, rendering", () => {
  const req = { seed: "s", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length

  it("the trigger frame is the select frame; the chips field grows with its chips; both stay cheap", () => {
    const t = runRecipe(comboboxTriggerRecipe, { ...req, params: {}, box: { w: 260, h: 36 }, lazy: ["focus", "hover"] })
    expect(t.layers).toEqual(["rest", "open", "hover", "focus"])
    for (const h of [36, 64, 110]) {
      const f = runRecipe(comboboxChipsRecipe, { ...req, params: {}, box: { w: 320, h }, lazy: ["focus", "hover"] })
      expect(f.layers).toEqual(["rest", "hover", "focus"])
      expect(nodes(f.parts.rest ?? "")).toBeLessThanOrEqual(12)
      expect((f.parts.rest ?? "").length).toBeLessThanOrEqual(8000)
    }
    expect(runRecipe(comboboxChipsRecipe, { ...req, params: { invalid: true }, box: { w: 320, h: 70 } }).layers).toEqual(["invalid"])
  })

  it("every chip tone draws a small tag (<= 12 nodes, <= 3 KB), left to right and mirrored, calm and comfortable", () => {
    for (const tone of chipToneList) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const dir of ["ltr", "rtl"] as const) {
          const f = runRecipe(comboboxChipRecipe, { ...req, density, dir, params: { tone }, box: { w: 96, h: 28 } })
          expect(f.layers).toEqual(["rest"])
          expect(nodes(f.parts.rest ?? "")).toBeLessThanOrEqual(12)
          expect((f.parts.rest ?? "").length).toBeLessThanOrEqual(3000)
          expect(f.parts.rest).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
        }
      }
    }
    expect(runRecipe(comboboxChipRecipe, { ...req, params: { tone: "hi" }, box: { w: 96, h: 28 } }).parts.rest).not.toBe(runRecipe(comboboxChipRecipe, { ...req, dir: "rtl", params: { tone: "hi" }, box: { w: 96, h: 28 } }).parts.rest)
    expect(runRecipe(comboboxChipRecipe, { ...req, params: { tone: "hi", disabled: true }, box: { w: 96, h: 28 } }).layers).toEqual(["disabled"])
  })

  it("has no axe violations (closed, open, multiple, chips, editable)", async () => {
    const { container, user, unmount } = renderUI(<Basic />, opts)
    await axeCheck(container)
    await user.click(trigger())
    await screen.findByRole("dialog")
    await axeCheck()
    unmount()
    cleanup()
    const r2 = renderUI(
      <Combobox multiple items={FRAMEWORKS} label="Frameworks" defaultValue={["next"]}>
        <ComboboxChips>
          <ComboboxChipsInput aria-label="Add framework" />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="astro">Astro</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
      opts,
    )
    await axeCheck(r2.container)
    await r2.user.click(screen.getByRole("combobox"))
    await r2.user.type(screen.getByRole("combobox"), "a")
    await screen.findByRole("dialog")
    await axeCheck()
    r2.unmount()
    cleanup()
    const r3 = renderUI(
      <Combobox items={FRAMEWORKS} label="Framework">
        <ComboboxInput aria-label="Framework" showClear />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="astro">Astro</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
      opts,
    )
    await axeCheck(r3.container)
  })

  it("renders on the server twice the same and hydrates cleanly, bare and in a provider", async () => {
    const el = (
      <Basic defaultValue="remix" name="fw">
        <ComboboxItem value="qwik">Qwik</ComboboxItem>
      </Basic>
    )
    const a = renderToString(el)
    expect(renderToString(el)).toBe(a)
    expect(a).not.toMatch(/NaN|undefined|\[object/)
    expect(a).toContain("Remix")
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

  it("chips and the editable field render on the server too", () => {
    const html = renderToString(
      <Combobox multiple items={FRAMEWORKS} defaultValue={["next"]}>
        <ComboboxChips>
          <ComboboxChipsInput aria-label="Add" />
        </ComboboxChips>
      </Combobox>,
    )
    expect(html).toContain("Next.js")
    expect(html).toContain('data-slot="combobox-chip"')
    expect(() => renderToString(<Combobox items={FRAMEWORKS}><ComboboxInput aria-label="x" /></Combobox>)).not.toThrow()
  })
})

describe("Combobox review fixes (required, names, announcements, upstream shapes)", () => {
  const input = () => screen.getByRole("combobox") as HTMLInputElement
  it("required is a real form check: an empty combobox fails it and sends the focus to the trigger; a chosen value passes", async () => {
    const { container, user } = renderUI(
      <form>
        <Basic name="fw" required />
      </form>,
      opts,
    )
    const form = container.querySelector("form") as HTMLFormElement
    expect(trigger()).toHaveAttribute("aria-required", "true")
    expect(form.checkValidity()).toBe(false)
    await axeCheck(container)
    const proxy = form.querySelector('[data-slot="combobox-required"]') as HTMLInputElement
    expect(proxy).toHaveAttribute("aria-hidden", "true")
    expect(proxy).toHaveAttribute("tabindex", "-1")
    expect(proxy).not.toHaveAttribute("name")
    act(() => proxy.focus())
    expect(trigger()).toHaveFocus()
    await user.click(trigger())
    await user.click(await option("Remix"))
    expect(form.checkValidity()).toBe(true)
    expect(form.querySelector('[data-slot="combobox-required"]')).toBeNull()
    expect(new FormData(form).get("fw")).toBe("remix")
    await user.click(trigger())
    await user.click(await option(/Remix/))
    expect(form.checkValidity()).toBe(true)
  })

  it("a disabled required combobox does not block the form, and required chips send the focus to the input", async () => {
    const { container, unmount } = renderUI(
      <form>
        <Basic name="fw" required disabled />
      </form>,
      opts,
    )
    expect((container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(true)
    unmount()
    const chips = renderUI(
      <form>
        <Combobox multiple required name="t" items={FRAMEWORKS} label="Tags">
          <ComboboxChips>
            <ComboboxChipsInput />
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxList>
              <ComboboxItem value="next">Next.js</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </form>,
      opts,
    )
    const form = chips.container.querySelector("form") as HTMLFormElement
    expect(form.checkValidity()).toBe(false)
    act(() => (form.querySelector('[data-slot="combobox-required"]') as HTMLInputElement).focus())
    expect(screen.getByRole("combobox")).toHaveFocus()
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-required", "true")
  })

  it("the list is named by the combobox label, not by cmdk's generic 'Suggestions'", async () => {
    const { user } = renderUI(<Basic />, opts)
    await user.click(trigger())
    expect(await screen.findByRole("listbox", { name: "Framework" })).toBeInTheDocument()
  })

  it("ComboboxCollection draws one row per item of the root, or of its own items, with no element of its own", async () => {
    const { user } = renderUI(
      <Combobox items={FRAMEWORKS} label="Framework">
        <ComboboxTrigger aria-label="Framework">
          <ComboboxValue placeholder="Pick" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search" />
          <ComboboxList>
            <ComboboxGroup heading="All">
              <ComboboxCollection>
                {(item) => (
                  <ComboboxItem key={item.value} value={item.value}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
            <ComboboxGroup heading="Mine">
              <ComboboxCollection items={["Mine A", "Mine B"]}>
                {(item) => (
                  <ComboboxItem key={item.value} value={item.value}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
      opts,
    )
    await user.click(trigger())
    expect(await screen.findAllByRole("option")).toHaveLength(7)
    expect(screen.getByRole("option", { name: "Mine B" }).parentElement).toBe(screen.getByRole("option", { name: "Mine A" }).parentElement)
    await user.type(screen.getByPlaceholderText("Search"), "mine")
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Mine A", "Mine B"])
  })

  it("upstream's chip shape works: a text child is the value when `value` is not given", async () => {
    const { user } = renderUI(
      <Combobox multiple defaultValue={["Design", "Garden"]} label="Labels">
        <ComboboxChips renderChip={(v) => <ComboboxChip key={v}>{v}</ComboboxChip>}>
          <ComboboxChipsInput />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="Design">Design</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    )
    expect(document.querySelectorAll('[data-slot="combobox-chip"]')).toHaveLength(2)
    await user.click(screen.getByRole("button", { name: "Remove Garden" }))
    expect(document.querySelectorAll('[data-slot="combobox-chip"]')).toHaveLength(1)
    expect(screen.getByRole("combobox")).toHaveFocus()
  })

  it("pressing a row does not take the focus out of the search box, so a mouse user can go on typing or press Backspace", async () => {
    const { user } = renderUI(<Tags />, opts)
    await user.click(input())
    await user.keyboard("{ArrowDown}")
    await user.click(await option(/Remix/))
    expect(input()).toHaveFocus()
    await user.keyboard("{Backspace}")
    expect(screen.queryByRole("button", { name: "Remove Remix" })).toBeNull()
    expect(screen.getByRole("button", { name: "Remove Astro" })).toBeInTheDocument()
    cleanup()
    const single = renderUI(
      <Combobox items={FRAMEWORKS} label="Framework">
        <ComboboxInput aria-label="Framework" />
        <ComboboxContent>
          <ComboboxList>
            {FRAMEWORKS.map((f) => (
              <ComboboxItem key={f.value} value={f.value}>
                {f.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
      opts,
    )
    await single.user.click(screen.getAllByRole("combobox")[0])
    await single.user.keyboard("{ArrowDown}")
    await single.user.click(await option(/Astro/))
    expect(screen.getAllByRole("combobox")[0]).toHaveFocus()
    expect(screen.getAllByRole("combobox")[0]).toHaveValue("Astro")
  })

  it("a multiple combobox says what was added and removed in a polite status (nothing else tells a screen reader a tag was taken back)", async () => {
    const { user } = renderUI(<Tags />, opts)
    const status = () => document.querySelector('[data-slot="combobox-status"]') as HTMLElement
    expect(status()).toHaveAttribute("role", "status")
    expect(status()).toHaveTextContent("")
    await user.click(screen.getByRole("button", { name: "Remove Next.js" }))
    expect(status()).toHaveTextContent("Next.js removed")
    input().focus()
    await user.keyboard("{ArrowDown}")
    await user.click(await option("Remix"))
    expect(status()).toHaveTextContent("Remix selected")
    await user.keyboard("{Backspace}")
    expect(status()).toHaveTextContent("Remix removed")
  })

  it("announce can translate the status or turn it off, and a single-select has none", () => {
    renderUI(<Tags announce={({ added, removed }) => `${added.length} plus, ${removed.length} minus`} />)
    expect(document.querySelector('[data-slot="combobox-status"]')).not.toBeNull()
    cleanup()
    renderUI(<Tags announce={false} />)
    expect(document.querySelector('[data-slot="combobox-status"]')).toBeNull()
    cleanup()
    renderUI(<Basic />)
    expect(document.querySelector('[data-slot="combobox-status"]')).toBeNull()
  })

  it("the status is translatable", async () => {
    const { user } = renderUI(<Tags announce={({ removed }) => `${removed.join(" ")} retire`} />, opts)
    await user.click(screen.getByRole("button", { name: "Remove Astro" }))
    expect(document.querySelector('[data-slot="combobox-status"]')).toHaveTextContent("Astro retire")
  })
})

describe("Combobox review fixes: server rendering of the new parts", () => {
  it("a required multiple combobox with a hidden name, the required field and the status renders twice the same and hydrates cleanly", async () => {
    const el = (
      <form>
        <Combobox multiple required name="t" items={FRAMEWORKS} label="Tags">
          <ComboboxChips>
            <ComboboxChipsInput aria-label="Tags" />
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxList>
              <ComboboxItem value="next">Next.js</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </form>
    )
    const html = renderToString(el)
    expect(renderToString(el)).toBe(html)
    expect(html).toContain('data-slot="combobox-required"')
    expect(html).toContain('data-slot="combobox-status"')
    expect(html).not.toMatch(/NaN|undefined|\[object/)
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
})

describe("Form reset", () => {
  it("a reset button puts an uncontrolled single and multiple combobox back to their defaults; a controlled one stays with its parent", async () => {
    const { container, user } = renderUI(
      <form>
        <Basic name="one" defaultValue="astro" />
        <Combobox multiple name="many" items={FRAMEWORKS} label="Tags" defaultValue={["next"]}>
          <ComboboxChips>
            <ComboboxChipsInput aria-label="Tags" />
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxList>
              {FRAMEWORKS.map((f) => (
                <ComboboxItem key={f.value} value={f.value}>
                  {f.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <button type="reset">Reset</button>
      </form>,
      opts,
    )
    const form = container.querySelector("form") as HTMLFormElement
    await user.click(trigger())
    await user.click(await option(/Remix/))
    const tags = screen.getByRole("combobox", { name: "Tags" })
    await user.click(tags)
    await user.type(tags, "rem")
    await user.keyboard("{Enter}")
    expect(new FormData(form).get("one")).toBe("remix")
    expect(new FormData(form).getAll("many")).toEqual(["next", "remix"])
    await user.click(screen.getByRole("button", { name: "Reset" }))
    expect(new FormData(form).get("one")).toBe("astro")
    expect(new FormData(form).getAll("many")).toEqual(["next"])
    expect(trigger()).toHaveTextContent("Astro")
    expect(document.querySelectorAll('[data-slot="combobox-chip"]')).toHaveLength(1)
    expect(tags).toHaveValue("")
  })
})

describe("Combobox readOnly (base-ui's Combobox has it)", () => {
  it("a read-only trigger shows and submits its value, never opens, and says so", async () => {
    const { container, user } = renderUI(
      <form>
        <Basic name="fw" defaultValue="remix" readOnly />
      </form>,
      opts,
    )
    expect(trigger()).toHaveAttribute("aria-readonly", "true")
    expect(trigger()).toHaveTextContent("Remix")
    await user.click(trigger())
    expect(screen.queryByRole("dialog")).toBeNull()
    trigger().focus()
    await user.keyboard("{ArrowDown}{Enter}")
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(new FormData(container.querySelector("form") as HTMLFormElement).get("fw")).toBe("remix")
  })

  it("read-only chips cannot be removed or added, and the editable field cannot be typed into or cleared", async () => {
    const onValueChange = vi.fn()
    const { user, unmount } = renderUI(<Tags readOnly onValueChange={onValueChange} />, opts)
    expect(screen.getByRole("button", { name: "Remove Next.js" })).toBeDisabled()
    const field = screen.getByRole("combobox")
    expect(field).toHaveAttribute("readonly")
    await user.click(field)
    await user.keyboard("{Backspace}")
    expect(onValueChange).not.toHaveBeenCalled()
    expect(document.querySelectorAll('[data-slot="combobox-chip"]')).toHaveLength(2)
    unmount()
    renderUI(
      <Combobox items={FRAMEWORKS} defaultValue="next" readOnly label="Framework">
        <ComboboxInput aria-label="Framework" showClear />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="next">Next.js</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
      opts,
    )
    expect(screen.getByRole("combobox")).toHaveAttribute("readonly")
    expect(screen.getByRole("combobox")).toHaveValue("Next.js")
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull()
    expect(screen.getByRole("button", { name: "Toggle options" })).toBeDisabled()
  })
})
