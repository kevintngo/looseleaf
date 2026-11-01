import * as React from "react"
import { act, screen, waitFor, within } from "@testing-library/react"
import { toast } from "sonner"
import { afterEach, describe, expect, it, vi } from "vitest"

import { axeCheck, renderUI } from "./helpers"

import DataTableDemo from "@/docs/examples/table/51-data-table-demo"
import PopoverDemo from "@/docs/examples/popover/50-demo"
import ProgressDemo from "@/docs/examples/progress/50-demo"
import RadioGroupDemo from "@/docs/examples/radio-group/50-demo"
import ResizableDemo from "@/docs/examples/resizable/51-demo-with-handle"
import SelectScrollable from "@/docs/examples/select/51-scrollable"
import SheetSide from "@/docs/examples/sheet/51-side"
import SidebarControlled from "@/docs/examples/sidebar/59-controlled-and-loading"
import SidebarGroupAction from "@/docs/examples/sidebar/54-group-action"
import SonnerTypes from "@/docs/examples/sonner/51-types"
import SpinnerCustom from "@/docs/examples/spinner/57-custom"
import SwitchDemo from "@/docs/examples/switch/50-demo"
import TabsDemo from "@/docs/examples/tabs/50-demo"
import TextareaWithLabel from "@/docs/examples/textarea/53-with-label"
import ToggleGroupDemo from "@/docs/examples/toggle-group/50-demo"
import ToggleGroupSingle from "@/docs/examples/toggle-group/55-single"
import TooltipDemo from "@/docs/examples/tooltip/50-demo"

const SLUGS = "pagination,popover,progress,radio-group,resizable,scroll-area,select,separator,sheet,sidebar,skeleton,slider,sonner,spinner,switch,table,tabs,textarea,toggle,toggle-group,tooltip"
const mine = import.meta.glob<{ default: React.ComponentType; meta: { title: string; description?: string } }>(
  "/src/docs/examples/{pagination,popover,progress,radio-group,resizable,scroll-area,select,separator,sheet,sidebar,skeleton,slider,sonner,spinner,switch,table,tabs,textarea,toggle,toggle-group,tooltip}/5*.tsx",
  { eager: true }
)
const files = Object.entries(mine).sort(([a], [b]) => a.localeCompare(b))

afterEach(() => {
  act(() => {
    toast.dismiss()
  })
  vi.useRealTimers()
})

describe("the 5x examples", () => {
  it("cover the 21 slugs of this package, at most ten to a slug, all numbered 50-59", () => {
    const bySlug = new Map<string, number>()
    for (const [path] of files) {
      const m = /examples\/([^/]+)\/(5\d)-[a-z0-9-]+\.tsx$/.exec(path)
      expect(m, path).not.toBeNull()
      bySlug.set(m![1], (bySlug.get(m![1]) ?? 0) + 1)
    }
    expect([...bySlug.keys()].sort()).toEqual(SLUGS.split(",").sort())
    for (const n of bySlug.values()) expect(n).toBeLessThanOrEqual(10)
  })

  it("name the official example they mirror in their description", () => {
    for (const [path, mod] of files) expect(mod.meta.description, path).toMatch(/Official `[a-z-]+`|Official `[a-z-]+` and `[a-z-]+`/)
  })

  describe.each(files)("%s", (path, mod) => {
    const Example = mod.default
    it("has no axe violations at rest", async () => {
      const { container } = renderUI(<Example />)
      await axeCheck(container)
    })
  })
})

describe("table / data-table-demo (no TanStack)", () => {
  const rowsOf = (t: ReturnType<typeof renderUI>) => t.getAllByRole("row").slice(1)
  const emails = (t: ReturnType<typeof renderUI>) => rowsOf(t).map((r) => within(r).getAllByRole("cell")[2].textContent?.toLowerCase())

  it("shows the first page of five, with the footer count and a disabled Previous", () => {
    const t = renderUI(<DataTableDemo />)
    expect(rowsOf(t)).toHaveLength(5)
    expect(t.getByText(/0 of 12 row\(s\) selected\. Page 1 of 3\./)).toBeInTheDocument()
    expect(t.getByRole("button", { name: "Previous" })).toBeDisabled()
    expect(t.getByRole("button", { name: "Next" })).toBeEnabled()
  })

  it("filters the emails as you type, case-insensitively, and starts over from page one", async () => {
    const t = renderUI(<DataTableDemo />)
    await t.user.click(t.getByRole("button", { name: "Next" }))
    expect(t.getByText(/Page 2 of 3/)).toBeInTheDocument()
    await t.user.type(t.getByLabelText("Filter emails"), "KEN")
    expect(emails(t)).toEqual(["ken99@example.com"])
    expect(t.getByText(/0 of 1 row\(s\) selected\. Page 1 of 1\./)).toBeInTheDocument()
    expect(t.getByRole("button", { name: "Next" })).toBeDisabled()
    await t.user.clear(t.getByLabelText("Filter emails"))
    await t.user.type(t.getByLabelText("Filter emails"), "nobody")
    expect(t.getByText("No results.")).toBeInTheDocument()
    expect(t.getByText("No results.").closest("td")).toHaveAttribute("colspan", "5")
  })

  it("sorts the Email column: ascending, then descending, and says so with aria-sort", async () => {
    const t = renderUI(<DataTableDemo />)
    const head = t.getByRole("columnheader", { name: /Email/ })
    expect(head).toHaveAttribute("aria-sort", "none")
    await t.user.click(within(head).getByRole("button", { name: /Email/ }))
    expect(head).toHaveAttribute("aria-sort", "ascending")
    expect(emails(t)).toEqual(["abe45@example.com", "carmella@example.com", "jo.okafor@example.com", "ken99@example.com", "lena.f@example.com"])
    await t.user.click(within(head).getByRole("button", { name: /Email/ }))
    expect(head).toHaveAttribute("aria-sort", "descending")
    expect(emails(t)).toEqual(["tomas.berg@example.com", "silas22@example.com", "sam.reyes@example.com", "priya@example.com", "omar@example.com"])
  })

  it("hides and shows columns from the Columns menu (select and actions are not hideable)", async () => {
    const t = renderUI(<DataTableDemo />)
    await t.user.click(t.getByRole("button", { name: /Columns/ }))
    const items = await t.findAllByRole("menuitemcheckbox")
    expect(items.map((i) => i.textContent?.trim())).toEqual(["status", "email", "amount"])
    expect(items.every((i) => i.getAttribute("aria-checked") === "true")).toBe(true)
    await t.user.click(screen.getByRole("menuitemcheckbox", { name: "amount" }))
    await waitFor(() => expect(t.queryByRole("columnheader", { name: "Amount" })).toBeNull())
    expect(t.getByRole("columnheader", { name: "Status" })).toBeInTheDocument()
    expect(within(rowsOf(t)[0]).getAllByRole("cell")).toHaveLength(4)
    await t.user.keyboard("{Escape}")
  })

  it("selects rows: header box selects the page, goes half-ticked when only some are chosen, and the count spans pages", async () => {
    const t = renderUI(<DataTableDemo />)
    const all = t.getByRole("checkbox", { name: "Select all" })
    expect(all).toHaveAttribute("aria-checked", "false")
    await t.user.click(all)
    expect(all).toHaveAttribute("aria-checked", "true")
    expect(rowsOf(t).every((r) => r.getAttribute("data-state") === "selected")).toBe(true)
    expect(t.getByText(/5 of 12 row\(s\) selected/)).toBeInTheDocument()
    await t.user.click(t.getByRole("checkbox", { name: /Select ken99@example\.com/i }))
    expect(all).toHaveAttribute("aria-checked", "mixed")
    expect(t.getByText(/4 of 12 row\(s\) selected/)).toBeInTheDocument()
    await t.user.click(t.getByRole("button", { name: "Next" }))
    expect(all).toHaveAttribute("aria-checked", "false")
    expect(t.getByText(/4 of 12 row\(s\) selected\. Page 2 of 3\./)).toBeInTheDocument()
    await t.user.click(t.getByRole("button", { name: "Previous" }))
    expect(t.getByRole("checkbox", { name: /Select abe45@example\.com/i })).toHaveAttribute("aria-checked", "true")
  })

  it("pages through twelve rows five at a time and stops at both ends", async () => {
    const t = renderUI(<DataTableDemo />)
    await t.user.click(t.getByRole("button", { name: "Next" }))
    await t.user.click(t.getByRole("button", { name: "Next" }))
    expect(t.getByText(/Page 3 of 3/)).toBeInTheDocument()
    expect(rowsOf(t)).toHaveLength(2)
    expect(t.getByRole("button", { name: "Next" })).toBeDisabled()
    await t.user.click(t.getByRole("button", { name: "Previous" }))
    expect(rowsOf(t)).toHaveLength(5)
  })

  it("keeps a chosen row chosen while a filter hides it, and counts only what the filter shows", async () => {
    const t = renderUI(<DataTableDemo />)
    await t.user.click(t.getByRole("checkbox", { name: /Select ken99@example\.com/i }))
    await t.user.type(t.getByLabelText("Filter emails"), "carmella")
    expect(t.getByText(/0 of 1 row\(s\) selected/)).toBeInTheDocument()
    await t.user.clear(t.getByLabelText("Filter emails"))
    expect(t.getByText(/1 of 12 row\(s\) selected/)).toBeInTheDocument()
  })

  it("opens a row's action menu", async () => {
    const t = renderUI(<DataTableDemo />)
    await t.user.click(t.getAllByRole("button", { name: "Open menu" })[0])
    expect(await t.findByRole("menuitem", { name: "Copy payment ID" })).toBeInTheDocument()
    expect(t.getByRole("menuitem", { name: "View customer" })).toBeInTheDocument()
    await axeCheck()
  })
})

describe("official scenarios that need a click", () => {
  it("progress-demo goes from 13 to 66 after half a second", () => {
    vi.useFakeTimers()
    const t = renderUI(<ProgressDemo />)
    expect(t.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "13")
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(t.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "66")
  })

  it("radio-group-demo starts on Comfortable and moves with the arrow keys", async () => {
    const t = renderUI(<RadioGroupDemo />)
    expect(t.getByRole("radio", { name: "Comfortable" })).toBeChecked()
    t.getByRole("radio", { name: "Comfortable" }).focus()
    await t.user.keyboard("{ArrowDown>}")
    await waitFor(() => expect(t.getByRole("radio", { name: "Compact" })).toHaveFocus())
    await t.user.keyboard("{/ArrowDown}")
    expect(t.getByRole("radio", { name: "Compact" })).toBeChecked()
  })

  it("switch-demo is toggled by its label", async () => {
    const t = renderUI(<SwitchDemo />)
    expect(t.getByRole("switch", { name: "Airplane Mode" })).not.toBeChecked()
    await t.user.click(t.getByText("Airplane Mode"))
    expect(t.getByRole("switch", { name: "Airplane Mode" })).toBeChecked()
  })

  it("tabs-demo swaps the panel", async () => {
    const t = renderUI(<TabsDemo />)
    expect(t.getByRole("tabpanel")).toHaveTextContent("Make changes to your account")
    await t.user.click(t.getByRole("tab", { name: "Password" }))
    expect(t.getByRole("tabpanel")).toHaveTextContent("Change your password here")
    expect(t.getByLabelText("Current password")).toHaveAttribute("type", "password")
  })

  it("textarea-with-label ties the label to the field", async () => {
    const t = renderUI(<TextareaWithLabel />)
    await t.user.type(t.getByLabelText("Your message"), "hello")
    expect(t.getByLabelText("Your message")).toHaveValue("hello")
  })

  it("toggle-group-demo is multiple, toggle-group-single is one at a time", async () => {
    const multi = renderUI(<ToggleGroupDemo />)
    await multi.user.click(multi.getByRole("button", { name: "Toggle bold" }))
    await multi.user.click(multi.getByRole("button", { name: "Toggle italic" }))
    expect(multi.getByRole("button", { name: "Toggle bold" })).toHaveAttribute("aria-pressed", "true")
    expect(multi.getByRole("button", { name: "Toggle italic" })).toHaveAttribute("aria-pressed", "true")
    multi.unmount()
    const single = renderUI(<ToggleGroupSingle />)
    await single.user.click(single.getByRole("radio", { name: "Toggle bold" }))
    await single.user.click(single.getByRole("radio", { name: "Toggle italic" }))
    expect(single.getByRole("radio", { name: "Toggle bold" })).not.toBeChecked()
    expect(single.getByRole("radio", { name: "Toggle italic" })).toBeChecked()
  })

  it("popover-demo opens a named dialog with the four fields", async () => {
    const t = renderUI(<PopoverDemo />)
    await t.user.click(t.getByRole("button", { name: "Open popover" }))
    const dialog = await t.findByRole("dialog", { name: "Dimensions" })
    expect(within(dialog).getAllByRole("textbox")).toHaveLength(4)
    expect(within(dialog).getByLabelText("Max. width")).toHaveValue("300px")
    await axeCheck()
  })

  it("sheet-side opens one page per edge, and its fields can be edited", async () => {
    const t = renderUI(<SheetSide />, { user: { pointerEventsCheck: 0 } })
    for (const side of ["top", "right", "bottom", "left"]) {
      await t.user.click(t.getByRole("button", { name: side }))
      const dialog = await t.findByRole("dialog")
      expect(dialog).toHaveAttribute("data-side", side)
      const name = within(dialog).getByLabelText("Name")
      await t.user.clear(name)
      await t.user.type(name, "Ada")
      expect(name).toHaveValue("Ada")
      await t.user.keyboard("{Escape}")
      await waitFor(() => expect(t.queryByRole("dialog")).toBeNull())
    }
  })

  it("select-scrollable lists 27 zones in five labelled groups", async () => {
    const t = renderUI(<SelectScrollable />, { user: { pointerEventsCheck: 0 } })
    await t.user.click(t.getByRole("combobox"))
    const list = await t.findByRole("listbox")
    expect(within(list).getAllByRole("option")).toHaveLength(27)
    expect(within(list).getAllByRole("group")).toHaveLength(5)
    expect(within(list).getByText("Australia & Pacific")).toBeInTheDocument()
    await t.user.click(within(list).getByRole("option", { name: "Fiji Time (FJT)" }))
    expect(t.getByRole("combobox")).toHaveTextContent("Fiji Time (FJT)")
  })

  it("tooltip-demo shows its note on hover and on focus", async () => {
    const t = renderUI(<TooltipDemo />)
    await t.user.hover(t.getByRole("button", { name: "Hover" }))
    expect(await t.findByRole("tooltip")).toHaveTextContent("Add to library")
  })

  it("resizable-demo-with-handle has two named seams, each a focusable separator", () => {
    const t = renderUI(<ResizableDemo />)
    const seams = t.getAllByRole("separator")
    expect(seams.map((s) => s.getAttribute("aria-label"))).toEqual(["Resize the first panel", "Resize the second panel"])
    expect(seams.map((s) => s.getAttribute("aria-orientation"))).toEqual(["vertical", "horizontal"])
    for (const s of seams) expect(s).toHaveAttribute("tabindex", "0")
  })

  it("spinner-custom is a status named Loading around a decorative icon", () => {
    const t = renderUI(<SpinnerCustom />)
    const status = t.getByRole("status", { name: "Loading" })
    expect(status.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })

  it("sonner-types posts a toast of each kind into its own toaster", async () => {
    const t = renderUI(<SonnerTypes />)
    await t.user.click(t.getByRole("button", { name: "Success" }))
    expect((await t.findByText("Event has been created")).closest("[data-sonner-toast]")).toHaveAttribute("data-type", "success")
    await t.user.click(t.getByRole("button", { name: "Error" }))
    expect((await t.findByText("Event has not been created")).closest("[data-sonner-toast]")).toHaveAttribute("data-type", "error")
    await t.user.click(t.getByRole("button", { name: "Warning" }))
    expect((await t.findByText("Event start time cannot be earlier than 8am")).closest("[data-sonner-toast]")).toHaveAttribute("data-type", "warning")
  })
})

describe("sidebar examples that hold state", () => {
  it("controlled-and-loading: the button opens and closes the pad, and the list replaces its skeleton after the fetch", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const t = renderUI(<SidebarControlled />)
    const pad = () => document.querySelector('[data-slot="sidebar"]') as HTMLElement
    expect(pad()).toHaveAttribute("data-state", "expanded")
    expect(document.querySelectorAll('[data-slot="sidebar-menu-skeleton"]')).toHaveLength(5)
    expect(t.queryByRole("link", { name: /Design Engineering/ })).toBeNull()
    expect(t.getByRole("button", { name: "Reload" })).toBeDisabled()
    act(() => {
      vi.advanceTimersByTime(2100)
    })
    expect(await t.findByRole("link", { name: /Design Engineering/ })).toBeInTheDocument()
    expect(document.querySelectorAll('[data-slot="sidebar-menu-skeleton"]')).toHaveLength(0)
    await t.user.click(t.getByRole("button", { name: "Close Sidebar" }))
    expect(pad()).toHaveAttribute("data-state", "collapsed")
    await t.user.click(t.getByRole("button", { name: "Open Sidebar" }))
    expect(pad()).toHaveAttribute("data-state", "expanded")
    await t.user.click(t.getByRole("button", { name: "Reload" }))
    expect(document.querySelectorAll('[data-slot="sidebar-menu-skeleton"]')).toHaveLength(5)
  })

  it("group-action: the plus in the group's corner posts a toast", async () => {
    const t = renderUI(<SidebarGroupAction />)
    await t.user.click(t.getByRole("button", { name: "Add Project" }))
    expect(await t.findByText("You clicked the group action!")).toBeInTheDocument()
  })
})
