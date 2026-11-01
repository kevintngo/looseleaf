import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Direction } from "radix-ui"

import { DirectionProvider, useDirection } from "@/components/ui/direction"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tally } from "@/components/ui/tally"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { InkProvider, useInkContext, useInkScope } from "@/lib/ink/react"
import Reading from "@/docs/examples/direction/01-reading-direction"
import Arabic from "@/docs/examples/direction/02-arabic-notebook"
import Hebrew from "@/docs/examples/direction/03-hebrew-pages"
import ArabicSidebar from "@/docs/examples/direction/04-arabic-sidebar"
import UseDirection from "@/docs/examples/direction/05-use-direction"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

const modal = { user: { pointerEventsCheck: 0 } }

let restore = () => {}
beforeEach(() => {
  restore = mockBox(120, 36)
})
afterEach(() => {
  restore()
  document.documentElement.removeAttribute("dir")
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

function Probe() {
  const dir = useDirection()
  const ink = useInkContext()
  const scope = useInkScope()
  return <output data-testid="probe">{JSON.stringify({ dir, ink: ink.dir, hasProvider: ink.hasProvider, scope })}</output>
}
const probe = () => JSON.parse(screen.getByTestId("probe").textContent ?? "{}") as { dir: string; ink: string; hasProvider: boolean; scope: Record<string, string> }

describe("DirectionProvider: the wrapper", () => {
  it("exports upstream's two names and puts dir on a layout-neutral, slotted wrapper", () => {
    const { container } = render(
      <DirectionProvider direction="rtl">
        <span>مرحبا</span>
      </DirectionProvider>
    )
    const wrapper = container.querySelector("[data-slot=direction]")
    expect(wrapper).toHaveAttribute("dir", "rtl")
    expect(wrapper).toHaveClass("contents")
    expect(wrapper).toHaveTextContent("مرحبا")
    expect(typeof useDirection).toBe("function")
  })

  it("takes upstream's `dir` too, and `direction` wins when both are given", () => {
    const a = render(<DirectionProvider dir="rtl">x</DirectionProvider>)
    expect(a.container.querySelector("[data-slot=direction]")).toHaveAttribute("dir", "rtl")
    a.unmount()
    const b = render(
      <DirectionProvider dir="ltr" direction="rtl">
        x
      </DirectionProvider>
    )
    expect(b.container.querySelector("[data-slot=direction]")).toHaveAttribute("dir", "rtl")
  })

  it("asChild puts dir on the child and adds no element", () => {
    const { container } = render(
      <DirectionProvider direction="rtl" asChild>
        <main className="page">x</main>
      </DirectionProvider>
    )
    expect(container.children).toHaveLength(1)
    const main = container.firstElementChild!
    expect(main.tagName).toBe("MAIN")
    expect(main).toHaveAttribute("dir", "rtl")
    expect(main).toHaveAttribute("data-slot", "direction")
    expect(main.className).toContain("page")
  })

  it("a className replaces `contents`, so the wrapper can be a real box; props and ref reach it", () => {
    const ref = React.createRef<HTMLDivElement>()
    const { container } = render(
      <DirectionProvider direction="rtl" className="grid gap-2" lang="ar" id="pad" ref={ref}>
        x
      </DirectionProvider>
    )
    const wrapper = container.querySelector("[data-slot=direction]")!
    expect(wrapper).toHaveClass("grid", "gap-2")
    expect(wrapper).not.toHaveClass("contents")
    expect(wrapper).toHaveAttribute("lang", "ar")
    expect(ref.current).toBe(wrapper)
  })

  it("changing the direction at runtime changes dir on the same element (nothing remounts)", () => {
    const { container, rerender } = render(<DirectionProvider direction="ltr">x</DirectionProvider>)
    const wrapper = container.querySelector("[data-slot=direction]")!
    rerender(<DirectionProvider direction="rtl">x</DirectionProvider>)
    expect(container.querySelector("[data-slot=direction]")).toBe(wrapper)
    expect(wrapper).toHaveAttribute("dir", "rtl")
  })
})

describe("DirectionProvider: following the page", () => {
  it("without a direction it reads <html dir> after mount, and follows it when it changes", async () => {
    document.documentElement.setAttribute("dir", "rtl")
    const { container } = render(
      <DirectionProvider>
        <Probe />
      </DirectionProvider>
    )
    expect(container.querySelector("[data-slot=direction]")).not.toHaveAttribute("dir")
    expect(probe()).toMatchObject({ dir: "rtl", ink: "rtl" })
    await act(async () => document.documentElement.setAttribute("dir", "ltr"))
    await waitFor(() => expect(probe()).toMatchObject({ dir: "ltr", ink: "ltr" }))
    await act(async () => document.documentElement.setAttribute("dir", "rtl"))
    await waitFor(() => expect(probe()).toMatchObject({ dir: "rtl", ink: "rtl" }))
  })

  it("prefers the nearest dir above it (an island) over <html dir>", () => {
    document.documentElement.setAttribute("dir", "ltr")
    render(
      <div dir="rtl">
        <DirectionProvider>
          <Probe />
        </DirectionProvider>
      </div>
    )
    expect(probe().dir).toBe("rtl")
  })

  it("is ltr when the page never says", () => {
    render(
      <DirectionProvider>
        <Probe />
      </DirectionProvider>
    )
    expect(probe().dir).toBe("ltr")
  })

  it("an explicit direction ignores the page", () => {
    document.documentElement.setAttribute("dir", "rtl")
    render(
      <DirectionProvider direction="ltr">
        <Probe />
      </DirectionProvider>
    )
    expect(probe().dir).toBe("ltr")
  })
})

describe("useDirection", () => {
  it("is ltr without a provider, the nearest provider's direction inside one, and a local direction wins", () => {
    function Three() {
      return (
        <>
          <output data-testid="plain">{useDirection()}</output>
          <output data-testid="local">{useDirection("rtl")}</output>
        </>
      )
    }
    const a = render(<Three />)
    expect(a.getByTestId("plain")).toHaveTextContent("ltr")
    expect(a.getByTestId("local")).toHaveTextContent("rtl")
    a.unmount()
    const b = render(
      <DirectionProvider direction="rtl">
        <Three />
      </DirectionProvider>
    )
    expect(b.getByTestId("plain")).toHaveTextContent("rtl")
  })

  it("is Radix's own hook: it agrees with what a Radix part sees, and an island inside overrides it", () => {
    function Both() {
      return (
        <output data-testid="both">
          {useDirection()}|{Direction.useDirection()}
        </output>
      )
    }
    render(
      <DirectionProvider direction="rtl">
        <Both />
        <DirectionProvider direction="ltr">
          <output data-testid="island">
            <Both />
          </output>
        </DirectionProvider>
      </DirectionProvider>
    )
    expect(screen.getAllByTestId("both").map((n) => n.textContent)).toEqual(["rtl|rtl", "ltr|ltr"])
  })
})

describe("DirectionProvider: the ink engine", () => {
  it("overrides the ink provider's dir and keeps its density, motion and theme in the portal scope", () => {
    render(
      <InkProvider dir="ltr" density="compact" motion="reduced" theme="notebook">
        <DirectionProvider direction="rtl">
          <Probe />
        </DirectionProvider>
      </InkProvider>
    )
    expect(probe()).toMatchObject({
      dir: "rtl",
      ink: "rtl",
      hasProvider: true,
      scope: { "data-density": "compact", "data-motion": "reduced", "data-theme": "notebook", dir: "rtl" },
    })
  })

  it("works with no ink provider at all, and does not pretend to be one", () => {
    render(
      <DirectionProvider direction="rtl">
        <Probe />
      </DirectionProvider>
    )
    expect(probe()).toMatchObject({ ink: "rtl", hasProvider: false, scope: { dir: "rtl" } })
  })

  it("an ink provider inside it inherits the direction from the DOM and passes the scope on", () => {
    render(
      <DirectionProvider direction="rtl">
        <InkProvider density="calm">
          <Probe />
        </InkProvider>
      </DirectionProvider>
    )
    expect(probe()).toMatchObject({ ink: "rtl", hasProvider: true, scope: { "data-density": "calm", dir: "rtl" } })
  })

  it("mirrors direction-dependent drawing: a tally is drawn differently in each direction, and redrawn when the direction flips", () => {
    const strokes = () => screen.getByRole("img", { name: "7" }).querySelector("svg")!.innerHTML
    const { rerender } = render(
      <DirectionProvider direction="ltr">
        <Tally count={7} seed="t" />
      </DirectionProvider>
    )
    const ltr = strokes()
    expect(ltr.length).toBeGreaterThan(100)
    rerender(
      <DirectionProvider direction="rtl">
        <Tally count={7} seed="t" />
      </DirectionProvider>
    )
    expect(strokes()).not.toBe(ltr)
    rerender(
      <DirectionProvider direction="ltr">
        <Tally count={7} seed="t" />
      </DirectionProvider>
    )
    expect(strokes()).toBe(ltr)
  })

  it("redraws hosts that measure themselves (tab shoulders) when the direction flips, and keeps the ink conventions", async () => {
    const Sample = ({ direction }: { direction: "ltr" | "rtl" }) => (
      <DirectionProvider direction={direction}>
        <Tabs defaultValue="a">
          <TabsList aria-label="Pages">
            <TabsTrigger value="a" seed="a">
              One
            </TabsTrigger>
            <TabsTrigger value="b" seed="b">
              Two
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </DirectionProvider>
    )
    const { rerender, container } = render(<Sample direction="ltr" />)
    const drawing = () => container.querySelector("[role=tab] > svg[data-ink]")!.innerHTML
    const ltr = drawing()
    expectInkLayers(container, { min: 2, kinds: ["tab"], absolute: true, ready: true })
    rerender(<Sample direction="rtl" />)
    await act(async () => {})
    expect(drawing()).not.toBe(ltr)
    expectInkLayers(container, { min: 2, kinds: ["tab"], absolute: true, ready: true })
  })
})

describe("DirectionProvider: Radix parts", () => {
  it("tabs: ArrowLeft goes on to the next tab", async () => {
    const { user, getAllByRole } = renderUI(
      <DirectionProvider direction="rtl">
        <Tabs defaultValue="a">
          <TabsList aria-label="Pages">
            <TabsTrigger value="a">أ</TabsTrigger>
            <TabsTrigger value="b">ب</TabsTrigger>
            <TabsTrigger value="c">ج</TabsTrigger>
          </TabsList>
          <TabsContent value="a">الأول</TabsContent>
          <TabsContent value="b">الثاني</TabsContent>
        </Tabs>
      </DirectionProvider>
    )
    const tabs = getAllByRole("tab")
    await user.click(tabs[0])
    await user.keyboard("{ArrowLeft}")
    expect(tabs[1]).toHaveFocus()
    expect(screen.getByRole("tabpanel")).toHaveTextContent("الثاني")
    await user.keyboard("{ArrowRight}")
    expect(tabs[0]).toHaveFocus()
  })

  it("the dir attribute alone does not reach Radix: this is what the provider is for", async () => {
    const { user, getAllByRole } = renderUI(
      <div dir="rtl">
        <Tabs defaultValue="a">
          <TabsList aria-label="Pages">
            <TabsTrigger value="a">A</TabsTrigger>
            <TabsTrigger value="b">B</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    )
    const tabs = getAllByRole("tab")
    await user.click(tabs[0])
    await user.keyboard("{ArrowRight}")
    expect(tabs[1]).toHaveFocus()
  })

  it("slider: the value starts at the right edge", () => {
    const { container } = render(
      <DirectionProvider direction="rtl">
        <Slider defaultValue={[35]} aria-label="حجم الخط" />
      </DirectionProvider>
    )
    expect(container.querySelector("[data-slot=slider]")).toHaveAttribute("dir", "rtl")
    const thumbBox = screen.getByRole("slider").parentElement!
    expect(thumbBox.style.right).toContain("35%")
    expect(thumbBox.style.left).toBe("")
    const range = container.querySelector<HTMLElement>("[data-slot=slider-range]")!
    expect(range.style.right).toBe("0%")
    expect(range.style.left).toBe("65%")
  })

  it("slider: ArrowLeft lowers the value in left-to-right and raises it in right-to-left", async () => {
    const { user } = renderUI(
      <>
        <DirectionProvider direction="ltr">
          <Slider defaultValue={[50]} aria-label="ltr" />
        </DirectionProvider>
        <DirectionProvider direction="rtl">
          <Slider defaultValue={[50]} aria-label="rtl" />
        </DirectionProvider>
      </>
    )
    screen.getByRole("slider", { name: "ltr" }).focus()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("slider", { name: "ltr" })).toHaveAttribute("aria-valuenow", "49")
    screen.getByRole("slider", { name: "rtl" }).focus()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("slider", { name: "rtl" })).toHaveAttribute("aria-valuenow", "51")
  })

  it("radio group and toggle group: the arrows follow the reading direction", async () => {
    const { user } = renderUI(
      <DirectionProvider direction="rtl">
        <RadioGroup defaultValue="a" aria-label="خيار" orientation="horizontal">
          <RadioGroupItem value="a" aria-label="أ" />
          <RadioGroupItem value="b" aria-label="ب" />
        </RadioGroup>
        <ToggleGroup type="single" defaultValue="x" aria-label="محاذاة">
          <ToggleGroupItem value="x">س</ToggleGroupItem>
          <ToggleGroupItem value="y">ص</ToggleGroupItem>
        </ToggleGroup>
      </DirectionProvider>
    )
    screen.getByRole("radio", { name: "أ" }).focus()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("radio", { name: "ب" })).toHaveFocus()
    screen.getByRole("radio", { name: "أ" }).focus()
    const [x, y] = screen.getAllByRole("radio").slice(-2)
    x.focus()
    await user.keyboard("{ArrowLeft}")
    expect(y).toHaveFocus()
  })

  it("menu: the sub-menu opens with ArrowLeft, not ArrowRight, and the content carries dir", async () => {
    const { user } = renderUI(
      <DirectionProvider direction="rtl">
        <DropdownMenu>
          <DropdownMenuTrigger>الخيارات</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>نقل إلى</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>المسودات</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </DirectionProvider>,
      modal
    )
    await user.click(screen.getByText("الخيارات"))
    const menu = await screen.findByRole("menu")
    expect(menu).toHaveAttribute("dir", "rtl")
    const sub = screen.getByRole("menuitem", { name: "نقل إلى" })
    sub.focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.queryByText("المسودات")).toBeNull()
    await user.keyboard("{ArrowLeft}")
    expect(await screen.findByText("المسودات")).toBeInTheDocument()
  })
})

describe("DirectionProvider: portalled content", () => {
  it("popover, dialog and sheet open outside the wrapper and carry dir themselves", async () => {
    const { user } = renderUI(
      <DirectionProvider direction="rtl">
        <TooltipProvider>
          <Popover>
            <PopoverTrigger>pop</PopoverTrigger>
            <PopoverContent aria-label="بطاقة">مرحبا</PopoverContent>
          </Popover>
          <Dialog>
            <DialogTrigger>dlg</DialogTrigger>
            <DialogContent>
              <DialogTitle>عنوان</DialogTitle>
              <DialogDescription>وصف</DialogDescription>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger>sht</SheetTrigger>
            <SheetContent side="right">
              <SheetTitle>ورقة</SheetTitle>
              <SheetDescription>وصف</SheetDescription>
            </SheetContent>
          </Sheet>
        </TooltipProvider>
      </DirectionProvider>,
      modal
    )
    const inPortal = (el: Element) => !el.closest("[data-slot=direction]")

    await user.click(screen.getByText("pop"))
    const pop = (await screen.findByText("مرحبا")).closest("[data-slot=popover-content]")!
    expect(inPortal(pop)).toBe(true)
    expect(pop).toHaveAttribute("dir", "rtl")
    await user.keyboard("{Escape}")

    await user.click(screen.getByText("dlg"))
    const dialog = await screen.findByRole("dialog")
    expect(dialog).toHaveAttribute("dir", "rtl")
    await user.keyboard("{Escape}")

    await user.click(screen.getByText("sht"))
    const sheet = await screen.findByRole("dialog")
    expect(sheet).toHaveAttribute("dir", "rtl")
  })

  it("a tooltip too", async () => {
    renderUI(
      <DirectionProvider direction="rtl">
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>tip</TooltipTrigger>
            <TooltipContent>تلميح</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DirectionProvider>
    )
    await waitFor(() => expect(document.querySelector("[data-slot=tooltip-content]")).not.toBeNull())
    expect(document.querySelector("[data-slot=tooltip-content]")).toHaveAttribute("dir", "rtl")
  })

  it("an island inside a right-to-left page tells its own portals: a popover in a ltr island is ltr", async () => {
    const { user } = renderUI(
      <DirectionProvider direction="rtl">
        <DirectionProvider direction="ltr">
          <Popover>
            <PopoverTrigger>open</PopoverTrigger>
            <PopoverContent aria-label="Card">Hello</PopoverContent>
          </Popover>
        </DirectionProvider>
      </DirectionProvider>,
      modal
    )
    await user.click(screen.getByText("open"))
    expect((await screen.findByText("Hello")).closest("[data-slot=popover-content]")).toHaveAttribute("dir", "ltr")
  })

  it("without a provider nothing is added to a popover", async () => {
    const { user } = renderUI(
      <Popover>
        <PopoverTrigger>open</PopoverTrigger>
        <PopoverContent aria-label="Card">Hello</PopoverContent>
      </Popover>,
      modal
    )
    await user.click(screen.getByText("open"))
    expect((await screen.findByText("Hello")).closest("[data-slot=popover-content]")).not.toHaveAttribute("dir")
  })
})

describe("DirectionProvider: server, hydration, accessibility", () => {
  const tree = (
    <InkProvider>
      <DirectionProvider direction="rtl">
        <Tabs defaultValue="a">
          <TabsList aria-label="صفحات">
            <TabsTrigger value="a">أ</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tally count={3} seed="s" />
      </DirectionProvider>
    </InkProvider>
  )

  it("renders the same markup twice on the server, with dir on the wrapper", () => {
    const html = renderToString(tree)
    expect(renderToString(tree)).toBe(html)
    expect(html).toContain('dir="rtl"')
    expect(html).toContain('data-slot="direction"')
    expect(html).not.toMatch(/NaN|undefined/)
  })

  it("following the page renders ltr on the server and hydrates without a mismatch, then follows", async () => {
    document.documentElement.setAttribute("dir", "rtl")
    const follow = (
      <DirectionProvider>
        <Probe />
      </DirectionProvider>
    )
    const html = renderToString(follow)
    expect(html).toContain('&quot;dir&quot;:&quot;ltr&quot;')
    const host = document.createElement("div")
    host.innerHTML = html
    document.body.append(host)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    await act(async () => {
      hydrateRoot(host, follow)
    })
    expect(errors).not.toHaveBeenCalled()
    errors.mockRestore()
    await waitFor(() => expect(JSON.parse(host.querySelector("output")!.textContent!).dir).toBe("rtl"))
    host.remove()
  })

  it("hydrates the explicit tree with no console.error", async () => {
    const html = renderToString(tree)
    const host = document.createElement("div")
    host.innerHTML = html
    document.body.append(host)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    await act(async () => {
      hydrateRoot(host, tree)
    })
    expect(errors).not.toHaveBeenCalled()
    errors.mockRestore()
    host.remove()
  })

  it("survives StrictMode", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    render(<React.StrictMode>{tree}</React.StrictMode>)
    expect(errors).not.toHaveBeenCalled()
    errors.mockRestore()
  })

  it("adds nothing an audit would flag", async () => {
    const { container } = render(
      <DirectionProvider direction="rtl">
        <main lang="ar">
          <h1>دفتر</h1>
        </main>
      </DirectionProvider>
    )
    await axeCheck(container)
  })
})

describe("Direction: the docs examples", () => {
  it("reading direction: the toggle flips the copy, the readout and the keys", async () => {
    const { user, container } = renderUI(<Reading />)
    const wrapper = () => container.querySelector("[data-slot=direction]")!
    expect(wrapper()).toHaveAttribute("dir", "rtl")
    expect(screen.getByText("دفتر الملاحظات")).toBeInTheDocument()
    expect(screen.getByText("rtl", { selector: "strong" })).toBeInTheDocument()
    const tabs = screen.getAllByRole("tab")
    await user.click(tabs[0])
    await user.keyboard("{ArrowLeft}")
    expect(tabs[1]).toHaveFocus()
    await user.click(screen.getByRole("radio", { name: "Left to right" }))
    expect(wrapper()).toHaveAttribute("dir", "ltr")
    expect(screen.getByText("Notebook")).toBeInTheDocument()
    expect(screen.getByText("ltr", { selector: "strong" })).toBeInTheDocument()
    await user.click(screen.getAllByRole("tab")[0])
    await user.keyboard("{ArrowRight}")
    expect(screen.getAllByRole("tab")[1]).toHaveFocus()
    await axeCheck(container)
  })

  it("arabic notebook: tabs, menu with sub-menu, slider and table read from the right", async () => {
    const { user, container } = renderUI(<Arabic />, modal)
    expect(container.querySelector("[data-slot=direction]")).toHaveAttribute("dir", "rtl")
    expect(screen.getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["الاسم", "الحالة", "المبلغ"])
    expect(screen.getByRole("slider", { name: "حجم الخط" })).toHaveAttribute("aria-valuetext", "40%")
    const tabs = screen.getAllByRole("tab")
    await user.click(tabs[0])
    await user.keyboard("{ArrowLeft}")
    expect(tabs[1]).toHaveFocus()
    await user.click(screen.getByRole("button", { name: /الخيارات/ }))
    await screen.findByRole("menu")
    const sub = screen.getByRole("menuitem", { name: /نقل إلى/ })
    sub.focus()
    await user.keyboard("{ArrowLeft}")
    expect(await screen.findByText("الأرشيف")).toBeInTheDocument()
    await axeCheck()
  })

  it("hebrew pages: breadcrumb, carousel and pager; the chevrons flip themselves", async () => {
    const { container } = renderUI(<Hebrew />)
    expect(container.querySelector("[data-slot=direction]")).toHaveAttribute("dir", "rtl")
    expect(screen.getByRole("region", { name: "דפי המחברת" })).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "עימוד" })).toBeInTheDocument()
    const chevrons = container.querySelectorAll('[data-slot=breadcrumb-separator] svg[data-icon="chevron-right"], [data-slot=pagination-link] svg[data-icon^="chevron"]')
    expect(chevrons.length).toBe(4)
    for (const c of chevrons) expect(c.getAttribute("class")).toContain("rtl:-scale-x-100")
    await axeCheck(container)
  })

  it("arabic sidebar: pinned to the right, first in the row so its gap is on the right too", async () => {
    const { container } = renderUI(<ArabicSidebar />, modal)
    const sidebar = container.querySelector("[data-slot=sidebar]")!
    expect(sidebar).toHaveAttribute("data-side", "right")
    expect(sidebar.nextElementSibling?.getAttribute("data-slot")).toBe("sidebar-inset")
    expect(screen.getByRole("button", { name: "الرئيسية" })).toBeInTheDocument()
    await axeCheck(container)
  })

  it("useDirection and islands: the pager's forward key follows each island, and the island's popover is ltr", async () => {
    const { user, container } = renderUI(<UseDirection />, modal)
    const groups = screen.getAllByRole("group")
    const hebrew = groups.find((g) => g.getAttribute("aria-label") === "דפי המחברת")!
    const english = groups.find((g) => g.getAttribute("aria-label") === "Quote pages")!
    expect(hebrew).toHaveTextContent("1 / 5")
    screen.getByRole("button", { name: "הבא" }).focus()
    await user.keyboard("{ArrowLeft}")
    expect(hebrew).toHaveTextContent("2 / 5")
    await user.keyboard("{ArrowRight}")
    expect(hebrew).toHaveTextContent("1 / 5")
    screen.getByRole("button", { name: "Next" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(english).toHaveTextContent("2 / 3")
    await user.click(screen.getByRole("button", { name: "About this quote" }))
    expect((await screen.findByText("Left to right")).closest("[data-slot=popover-content]")).toHaveAttribute("dir", "ltr")
    await user.keyboard("{Escape}")
    await axeCheck(container)
  })
})
