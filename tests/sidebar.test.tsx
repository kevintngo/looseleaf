import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Icon } from "@/components/ui/icon"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { sidebarMarkRecipe, sidebarRuleRecipe } from "@/lib/ink/recipes/sidebar-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(240, 32)
})
afterEach(() => {
  restore()
  document.cookie = "sidebar_state=; max-age=0; path=/"
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }

function setWidth(px: number) {
  Object.defineProperty(window, "innerWidth", { value: px, configurable: true, writable: true })
}

type DemoProps = {
  provider?: Partial<React.ComponentProps<typeof SidebarProvider>>
  sidebar?: Partial<React.ComponentProps<typeof Sidebar>>
  onDocs?: () => void
}

function Demo({ provider, sidebar, onDocs }: DemoProps) {
  return (
    <SidebarProvider {...provider}>
      <Sidebar aria-label="Main" {...sidebar}>
        <SidebarHeader>
          <SidebarInput aria-label="Search" placeholder="Search" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupAction aria-label="Add">
              <Icon name="plus" />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Home">
                    <Icon name="house" />
                    <span>Home</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction showOnHover aria-label="More">
                    <Icon name="ellipsis" />
                  </SidebarMenuAction>
                  <SidebarMenuBadge>12</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive tooltip="Docs">
                    <a href="#docs" onClick={onDocs}>
                      <Icon name="book-open" />
                      <span>Docs</span>
                    </a>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <a href="#intro">Introduction</a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive size="sm">
                        <a href="#start">Get started</a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton variant="outline" size="lg">
                    <Icon name="settings" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon seed="one" />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
        </SidebarContent>
        <SidebarFooter>Footer</SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        <p>Page</p>
      </SidebarInset>
    </SidebarProvider>
  )
}

const root = () => document.querySelector<HTMLElement>('[data-slot="sidebar"]')!
const trigger = () => document.querySelector<HTMLElement>('[data-slot="sidebar-trigger"]')!

describe("SidebarSeparator", () => {
  it("is as wide as its pad less the margins: w-auto really replaces the separator's w-full (it used to overflow by 16 px)", () => {
    const { container } = renderUI(<SidebarSeparator />)
    const rule = container.querySelector<HTMLElement>('[data-slot="sidebar-separator"]')!
    expect(rule).toHaveClass("mx-2", "data-[orientation=horizontal]:w-auto")
    expect(rule).not.toHaveClass("data-[orientation=horizontal]:w-full")
  })
})

describe("SidebarProvider", () => {
  it("is a flex wrapper with the width variables, and useSidebar throws outside it", () => {
    const { container } = renderUI(<Demo />)
    const wrapper = container.querySelector<HTMLElement>('[data-slot="sidebar-wrapper"]')!
    expect(wrapper).toHaveClass("group/sidebar-wrapper", "flex", "min-h-svh", "w-full")
    expect(wrapper.style.getPropertyValue("--sidebar-width")).toBe("16rem")
    expect(wrapper.style.getPropertyValue("--sidebar-width-icon")).toBe("3rem")
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    function Lonely() {
      useSidebar()
      return null
    }
    expect(() => renderUI(<Lonely />)).toThrow("useSidebar must be used within a SidebarProvider.")
    spy.mockRestore()
  })

  it("style and className reach the wrapper and can replace the widths", () => {
    const { container } = renderUI(<Demo provider={{ className: "h-80 min-h-0", style: { "--sidebar-width": "20rem" } as React.CSSProperties }} />)
    const wrapper = container.querySelector<HTMLElement>('[data-slot="sidebar-wrapper"]')!
    expect(wrapper).toHaveClass("h-80")
    expect(wrapper.style.getPropertyValue("--sidebar-width")).toBe("20rem")
  })

  it("starts expanded, or collapsed with defaultOpen={false}", () => {
    const a = renderUI(<Demo />)
    expect(root()).toHaveAttribute("data-state", "expanded")
    expect(root()).toHaveAttribute("data-collapsible", "")
    a.unmount()
    renderUI(<Demo provider={{ defaultOpen: false }} />)
    expect(root()).toHaveAttribute("data-state", "collapsed")
    expect(root()).toHaveAttribute("data-collapsible", "offcanvas")
  })

  it("the trigger toggles it, remembers the choice in a cookie, and Ctrl+B / Cmd+B do the same", async () => {
    const { user } = renderUI(<Demo />, opts)
    await user.click(trigger())
    expect(root()).toHaveAttribute("data-state", "collapsed")
    expect(document.cookie).toContain("sidebar_state=false")
    fireEvent.keyDown(window, { key: "b", ctrlKey: true })
    expect(root()).toHaveAttribute("data-state", "expanded")
    expect(document.cookie).toContain("sidebar_state=true")
    fireEvent.keyDown(window, { key: "b", metaKey: true })
    expect(root()).toHaveAttribute("data-state", "collapsed")
    fireEvent.keyDown(window, { key: "b" })
    fireEvent.keyDown(window, { key: "k", ctrlKey: true })
    expect(root()).toHaveAttribute("data-state", "collapsed")
  })

  it("the shortcut's default is prevented, and it is removed on unmount", () => {
    const a = renderUI(<Demo />)
    const ev = new KeyboardEvent("keydown", { key: "b", ctrlKey: true, cancelable: true })
    window.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(true)
    a.unmount()
    const again = new KeyboardEvent("keydown", { key: "b", ctrlKey: true, cancelable: true })
    window.dispatchEvent(again)
    expect(again.defaultPrevented).toBe(false)
  })

  it("is controlled with open + onOpenChange", async () => {
    const onOpenChange = vi.fn()
    const { user } = renderUI(<Demo provider={{ open: true, onOpenChange }} />, opts)
    await user.click(trigger())
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(root()).toHaveAttribute("data-state", "expanded")
  })

  it("the rail toggles it too", async () => {
    const { user } = renderUI(<Demo />, opts)
    await user.click(document.querySelector('[data-slot="sidebar-rail"]')!)
    expect(root()).toHaveAttribute("data-state", "collapsed")
  })
})

describe("Sidebar (desktop)", () => {
  it("is a group / peer div carrying the state for CSS, a gap, and a fixed container", () => {
    const { container } = renderUI(<Demo sidebar={{ variant: "floating", side: "right", collapsible: "icon" }} />)
    const r = root()
    expect(r).toHaveClass("group", "peer", "hidden", "md:block")
    expect(r).toHaveAttribute("data-variant", "floating")
    expect(r).toHaveAttribute("data-side", "right")
    expect(r).toHaveAttribute("data-collapsible", "")
    expect(container.querySelector('[data-slot="sidebar-gap"]')).not.toBeNull()
    const box = container.querySelector('[data-slot="sidebar-container"]')!
    expect(box).toHaveClass("fixed", "inset-y-0", "z-10", "md:flex")
    expect(box.className).toContain("right-0")
    expect(box.className).toContain("p-2")
  })

  it("collapsing to icons sets data-collapsible=icon", async () => {
    const { user } = renderUI(<Demo sidebar={{ collapsible: "icon" }} />, opts)
    await user.click(trigger())
    expect(root()).toHaveAttribute("data-collapsible", "icon")
  })

  it("the pad is a Paper: order-pad stock with a torn top edge drawn, a binder clip, and upstream's inner attributes", () => {
    const { container } = renderUI(<Demo />)
    const inner = container.querySelector<HTMLElement>('[data-slot="sidebar-inner"]')!
    expect(inner).toHaveAttribute("data-sidebar", "sidebar")
    expect(inner).toHaveClass("ll-paper", "ll-stock-pad", "flex", "h-full", "w-full", "flex-col")
    expect(inner).toHaveAttribute("data-stock", "pad")
    expect(inner).toHaveAttribute("data-edge", "torn")
    expect(inner.querySelector(':scope > svg[data-ink="sheet"]')).toBeTruthy()
    const clip = inner.querySelector('[data-slot="sidebar-clip"]')!
    expect(clip).toBeTruthy()
    expect(clip).toHaveAttribute("data-kind", "binder-clip")
    expect(clip).toHaveAttribute("aria-hidden", "true")
    expect(clip.getAttribute("class")).toContain("calm:hidden")
    expect(clip.getAttribute("class")).toContain("group-data-[collapsible=icon]:hidden")
  })

  it("the docked pad casts its shadow toward the page, a floating one is turned a little, clip={false} leaves the clip off", () => {
    const a = renderUI(<Demo />)
    expect(a.container.querySelector('[data-slot="sidebar-inner"]')!.className).toContain("group-data-[variant=sidebar]:group-data-[side=left]:[--ll-sheet-shadow:7px_0_18px")
    expect(a.container.querySelector('[data-slot="sidebar-inner"]')!.getAttribute("style") ?? "").not.toContain("--ll-tilt")
    a.unmount()
    const b = renderUI(<Demo sidebar={{ variant: "floating", clip: false, seed: "f" }} />)
    expect(b.container.querySelector('[data-slot="sidebar-inner"]')!.getAttribute("style")).toContain("--ll-tilt")
    expect(b.container.querySelector('[data-slot="sidebar-clip"]')).toBeNull()
  })

  it("stock is a prop: a paper sidebar is a CSS sheet with no drawn edge", () => {
    const { container } = renderUI(<Demo sidebar={{ stock: "paper" }} />)
    const inner = container.querySelector<HTMLElement>('[data-slot="sidebar-inner"]')!
    expect(inner).toHaveAttribute("data-stock", "paper")
    expect(inner.querySelector(':scope > svg[data-ink="sheet"]')).toBeNull()
  })

  it("className and props go to the fixed container, as upstream", () => {
    const { container } = renderUI(<Demo sidebar={{ className: "h-full", id: "nav" }} />)
    const box = container.querySelector<HTMLElement>('[data-slot="sidebar-container"]')!
    expect(box).toHaveClass("h-full")
    expect(box).toHaveAttribute("id", "nav")
    expect(box.className).not.toContain("h-svh")
  })

  it("collapsible=none is a plain static pad with no gap and no container", () => {
    const { container } = renderUI(<Demo sidebar={{ collapsible: "none" }} />)
    const r = root()
    expect(r).toHaveClass("ll-paper", "flex", "h-full", "w-(--sidebar-width)", "flex-col")
    expect(container.querySelector('[data-slot="sidebar-gap"]')).toBeNull()
    expect(container.querySelector('[data-slot="sidebar-container"]')).toBeNull()
  })

  it("a docked pad hangs its clip in the gutter above the torn edge (the handles are above the paper)", () => {
    const { container } = renderUI(<Demo />)
    const clip = container.querySelector('[data-slot="sidebar-inner"] > [data-slot="sidebar-clip"]')!
    expect(clip).toHaveClass("-top-3.5", "start-1/2")
    expect(clip).not.toHaveClass("top-1")
    expect(container.querySelector('[data-slot="sidebar-inner"]')).toHaveClass("pt-6")
  })

  it("collapsible=none has no clip and no top padding unless asked: the clip is opt-in and stands ON the paper, the pad clears it", () => {
    const a = renderUI(<Demo sidebar={{ collapsible: "none" }} />)
    expect(a.container.querySelector('[data-slot="sidebar-clip"]')).toBeNull()
    expect(root()).not.toHaveClass("pt-11")
    a.unmount()
    const b = renderUI(<Demo sidebar={{ collapsible: "none", clip: true, className: "pt-12" }} />)
    const pad = root()
    const clip = pad.querySelector<SVGElement>(':scope > [data-slot="sidebar-clip"]')!
    expect(clip).toBeTruthy()
    expect(clip).toHaveAttribute("data-kind", "binder-clip")
    expect(clip).toHaveClass("top-1")
    expect(clip).not.toHaveClass("-top-3.5")
    expect(pad).toHaveClass("pt-12")
    expect(pad).not.toHaveClass("pt-11")
    b.unmount()
    renderUI(<Demo sidebar={{ collapsible: "none", clip: true }} />)
    expect(root()).toHaveClass("pt-11")
  })
})

describe("Sidebar (phone)", () => {
  beforeEach(() => setWidth(500))
  afterEach(() => setWidth(1024))

  it("useIsMobile is false on the first render and true once the window is measured", async () => {
    const seen: boolean[] = []
    function Probe() {
      const m = useIsMobile()
      seen.push(m)
      return <output>{String(m)}</output>
    }
    renderUI(<Probe />)
    expect(seen[0]).toBe(false)
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("true"))
  })

  it("shows nothing but the trigger until opened, then the pad in a sheet with a hidden title", async () => {
    const { user } = renderUI(<Demo />, opts)
    await waitFor(() => expect(document.querySelector('[data-slot="sidebar-wrapper"]')).toBeTruthy())
    expect(screen.queryByRole("dialog")).toBeNull()
    await user.click(trigger())
    const sheet = await screen.findByRole("dialog", { name: "Sidebar" })
    expect(sheet).toHaveAttribute("data-mobile", "true")
    expect(sheet).toHaveAttribute("data-sidebar", "sidebar")
    expect(sheet).toHaveAttribute("data-stock", "pad")
    expect(sheet.style.getPropertyValue("--sidebar-width")).toBe("18rem")
    expect(within(sheet).getByRole("link", { name: "Docs" })).toBeInTheDocument()
    expect(within(sheet).queryByRole("button", { name: "Close" })).toBeNull()
    expect(sheet.querySelector('[data-slot="sidebar-clip"]')).toBeTruthy()
  })

  it("the sheet is portalled out of the provider, so it carries --sidebar-width-icon itself (a rail or an icon column in it read it)", async () => {
    const { user } = renderUI(<Demo provider={{ style: { "--sidebar-width-icon": "4rem" } as React.CSSProperties }} />, opts)
    await waitFor(() => expect(document.querySelector('[data-slot="sidebar-wrapper"]')).toBeTruthy())
    expect((document.querySelector('[data-slot="sidebar-wrapper"]') as HTMLElement).style.getPropertyValue("--sidebar-width-icon")).toBe("4rem")
    await user.click(trigger())
    const sheet = await screen.findByRole("dialog", { name: "Sidebar" })
    expect(sheet.closest('[data-slot="sidebar-wrapper"]')).toBeNull()
    expect(sheet.style.getPropertyValue("--sidebar-width-icon")).toBe("3rem")
  })

  it("the sheet's top edge is the top of the screen, so its clip stands on the paper (handles included) and the pad starts below it", async () => {
    const { user } = renderUI(<Demo />, opts)
    await waitFor(() => expect(document.querySelector('[data-slot="sidebar-wrapper"]')).toBeTruthy())
    await user.click(trigger())
    const sheet = await screen.findByRole("dialog", { name: "Sidebar" })
    const clip = sheet.querySelector('[data-slot="sidebar-clip"]')!
    expect(clip).toHaveClass("top-1")
    expect(clip).not.toHaveClass("-top-3.5")
    expect(sheet).toHaveClass("pt-11")
    expect(sheet).not.toHaveClass("pt-6")
  })

  it("without a clip the sheet keeps a small top padding", async () => {
    const { user } = renderUI(<Demo sidebar={{ clip: false }} />, opts)
    await waitFor(() => expect(document.querySelector('[data-slot="sidebar-wrapper"]')).toBeTruthy())
    await user.click(trigger())
    const sheet = await screen.findByRole("dialog", { name: "Sidebar" })
    expect(sheet.querySelector('[data-slot="sidebar-clip"]')).toBeNull()
    expect(sheet).toHaveClass("pt-2")
  })

  it("Escape closes it and Ctrl+B toggles it", async () => {
    const { user } = renderUI(<Demo />, opts)
    await waitFor(() => expect(trigger()).toBeInTheDocument())
    fireEvent.keyDown(window, { key: "b", ctrlKey: true })
    await screen.findByRole("dialog", { name: "Sidebar" })
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("collapsible=none stays a static pad on a phone", () => {
    renderUI(<Demo sidebar={{ collapsible: "none" }} />)
    expect(root()).toHaveClass("ll-paper")
    expect(screen.queryByRole("dialog")).toBeNull()
  })
})

describe("menu parts", () => {
  it("carry upstream's data-slot and data-sidebar attributes", () => {
    const { container } = renderUI(<Demo />)
    const pairs: Array<[string, string]> = [
      ["sidebar-header", "header"],
      ["sidebar-input", "input"],
      ["sidebar-content", "content"],
      ["sidebar-group", "group"],
      ["sidebar-group-label", "group-label"],
      ["sidebar-group-action", "group-action"],
      ["sidebar-group-content", "group-content"],
      ["sidebar-menu", "menu"],
      ["sidebar-menu-item", "menu-item"],
      ["sidebar-menu-button", "menu-button"],
      ["sidebar-menu-action", "menu-action"],
      ["sidebar-menu-badge", "menu-badge"],
      ["sidebar-menu-skeleton", "menu-skeleton"],
      ["sidebar-menu-sub", "menu-sub"],
      ["sidebar-menu-sub-item", "menu-sub-item"],
      ["sidebar-menu-sub-button", "menu-sub-button"],
      ["sidebar-separator", "separator"],
      ["sidebar-footer", "footer"],
      ["sidebar-rail", "rail"],
      ["sidebar-trigger", "trigger"],
    ]
    for (const [slot, attr] of pairs) {
      const el = container.querySelector(`[data-slot="${slot}"]`)
      expect(el, slot).not.toBeNull()
      expect(el!.getAttribute("data-sidebar") ?? (slot === "sidebar-input" ? "input" : null), slot).toBe(attr)
    }
    expect(container.querySelector('[data-slot="sidebar-inset"]')).not.toBeNull()
  })

  it("a menu button is a plain button (or your link) with the state in data-active and data-size", () => {
    renderUI(<Demo />)
    const home = screen.getByRole("button", { name: "Home", hidden: true })
    expect(home.tagName).toBe("BUTTON")
    expect(home).toHaveAttribute("data-active", "false")
    expect(home).toHaveAttribute("data-size", "default")
    expect(home.className).toContain("hover:ll-swipe")
    const docs = screen.getByRole("link", { name: "Docs", hidden: true })
    expect(docs.tagName).toBe("A")
    expect(docs).toHaveAttribute("data-slot", "sidebar-menu-button")
    expect(docs).toHaveAttribute("data-active", "true")
  })

  it("only the current page (and the outline variant) mounts a drawing: the highlighter and margin bracket, hosted by a child of the button", () => {
    renderUI(<Demo />)
    const home = screen.getByRole("button", { name: "Home", hidden: true })
    expect(home.hasAttribute("data-ink-host")).toBe(false)
    expect(home.querySelector('[data-slot="sidebar-menu-button-mark"]')).toBeNull()
    const docs = screen.getByRole("link", { name: "Docs", hidden: true })
    const mark = docs.querySelector<HTMLElement>('[data-slot="sidebar-menu-button-mark"]')!
    expect(mark).toBeTruthy()
    expect(mark).toHaveAttribute("aria-hidden", "true")
    expect(mark).toHaveAttribute("data-ink-host")
    expectInkLayers(mark, { min: 1, kinds: ["mark"], absolute: true, layers: ["rest"] })
    expect(mark.querySelector('g[data-part="bracket"]')).toBeTruthy()
    expect(mark.className).toContain("-z-10")
    expect(mark.className).toContain("group-data-[collapsible=icon]:[&_[data-part=bracket]]:hidden")
    expect(docs.className).toContain("data-[active=true]:ll-swipe")
    expect(docs.className).toContain("data-[active=true]:has-[>[data-ink-ready]]:bg-transparent")
    const outline = screen.getByRole("button", { name: "Settings", hidden: true })
    expect(outline.querySelector('[data-slot="sidebar-menu-button-mark"] g[data-part="bracket"]')).toBeNull()
    expect(outline.querySelector('[data-slot="sidebar-menu-button-mark"] svg[data-ink="mark"]')).toBeTruthy()
  })

  it("a long menu costs no ink per row: 150 rows and one active page draw exactly one mark", () => {
    const rows = Array.from({ length: 150 }, (_, i) => `Row ${i}`)
    const { container } = renderUI(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              {rows.map((r, i) => (
                <SidebarMenuItem key={r}>
                  <SidebarMenuButton isActive={i === 7}>
                    <Icon name="file" />
                    <span>{r}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    )
    expect(container.querySelectorAll('[data-slot="sidebar-menu-button-mark"]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-slot="sidebar-menu-item"] [data-ink-host]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-slot="sidebar-menu"] svg[data-ink]:not([data-ink="icon"])')).toHaveLength(1)
  })

  it("each row's button carries its own ruled line as a CSS gradient (so the lines meet the rows, whatever their number), hidden when collapsed to icons and in calm density", () => {
    renderUI(<Demo />)
    const b = screen.getByRole("button", { name: "Home", hidden: true })
    expect(b.className).toContain("after:bg-(--ll-pad-rule)")
    expect(b.className).toContain("group-data-[collapsible=icon]:after:hidden")
    expect(b.className).toContain("calm:after:hidden")
    expect(b.className).toContain("group-odd/menu-item:after:[mask-image:")
    expect(b.className).toContain("group-even/menu-item:after:[mask-image:")
    expect(document.querySelector('[data-slot="sidebar-menu-item"]')!.className).not.toContain("after:")
  })

  it("the tooltip names a row only when the sidebar is collapsed to icons", async () => {
    const a = renderUI(<Demo />, opts)
    a.user.tab()
    await a.user.hover(screen.getByRole("button", { name: "Home", hidden: true }))
    expect(screen.queryByRole("tooltip")).toBeNull()
    a.unmount()
    const b = renderUI(<Demo provider={{ defaultOpen: false }} sidebar={{ collapsible: "icon" }} />, opts)
    await b.user.hover(screen.getByRole("button", { name: "Home", hidden: true }))
    const tip = await screen.findByRole("tooltip")
    expect(tip).toHaveTextContent("Home")
  })

  it("the sub-menu is a list with a pencil line drawn down its start edge, and its buttons mark the current page with the highlighter", () => {
    renderUI(<Demo />)
    const sub = document.querySelector<HTMLElement>('[data-slot="sidebar-menu-sub"]')!
    expect(sub.tagName).toBe("UL")
    expect(sub).toHaveAttribute("data-ink-host")
    expectInkLayers(sub, { min: 1, kinds: ["rule"], absolute: true, layers: ["rest"] })
    expect(sub.querySelector(":scope > svg[data-ink=rule]")).toBeTruthy()
    expect(sub.querySelectorAll("li")).toHaveLength(2)
    const active = within(sub).getByRole("link", { name: "Get started", hidden: true })
    expect(active).toHaveAttribute("data-active", "true")
    expect(active).toHaveAttribute("data-size", "sm")
    expect(active.className).toContain("data-[active=true]:ll-swipe")
  })

  it("a sub-row is 28 px for one line and grows for a title that wraps (a fixed h-7 let the second line run over the next row)", () => {
    renderUI(<Demo />)
    const sub = within(document.querySelector<HTMLElement>('[data-slot="sidebar-menu-sub"]')!).getByRole("link", { name: "Introduction", hidden: true })
    expect(sub).toHaveClass("min-h-7", "py-0.5", "leading-snug", "items-center")
    for (const fixed of ["h-7", "h-8", "h-auto"]) expect(sub).not.toHaveClass(fixed)
    expect(sub.className).toContain("[&>span:last-child]:truncate")
  })

  it("the skeleton is deterministic: the same seed gives the same width, on the server too", () => {
    const line = (seed: string) => renderToString(<SidebarMenuSkeleton seed={seed} />)
    expect(line("a")).toBe(line("a"))
    const widths = ["a", "b", "c", "d", "e", "f"].map((s) => /--skeleton-width:(\d+)%/.exec(line(s))![1])
    expect(new Set(widths).size).toBeGreaterThan(1)
    for (const w of widths) {
      expect(Number(w)).toBeGreaterThanOrEqual(50)
      expect(Number(w)).toBeLessThanOrEqual(90)
    }
    expect(renderToString(<SidebarMenuSkeleton showIcon seed="a" />)).toContain('data-sidebar="menu-skeleton-icon"')
  })

  it("actions and badges sit at the end and are hidden when collapsed to icons; showOnHover reveals the action on hover or focus", () => {
    renderUI(<Demo />)
    const action = screen.getByRole("button", { name: "More", hidden: true })
    expect(action.className).toContain("group-data-[collapsible=icon]:hidden")
    expect(action.className).toContain("group-hover/menu-item:opacity-100")
    expect(action.className).toContain("group-focus-within/menu-item:opacity-100")
    expect(action.className).toContain("end-1")
    const badge = document.querySelector<HTMLElement>('[data-slot="sidebar-menu-badge"]')!
    expect(badge).toHaveTextContent("12")
    expect(badge.className).toContain("group-data-[collapsible=icon]:hidden")
    expect(badge.className).toContain("pointer-events-none")
  })

  it("group labels are typewriter kickers that fade when collapsed; asChild makes them your element", () => {
    const { container } = renderUI(
      <SidebarProvider>
        <Sidebar>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <button type="button">Projects</button>
            </SidebarGroupLabel>
          </SidebarGroup>
        </Sidebar>
      </SidebarProvider>
    )
    const label = container.querySelector<HTMLElement>('[data-slot="sidebar-group-label"]')!
    expect(label.tagName).toBe("BUTTON")
    expect(label.className).toContain("font-type")
    expect(label.className).toContain("group-data-[collapsible=icon]:opacity-0")
  })

  it("the search field is an Input, the separator a hand-drawn rule", () => {
    const { container } = renderUI(<Demo />)
    const frame = container.querySelector('[data-slot="input-frame"]')
    expect(frame).not.toBeNull()
    expect(screen.getByRole("textbox", { name: "Search", hidden: true })).toHaveAttribute("data-slot", "sidebar-input")
    expect(container.querySelector('[data-slot="sidebar-separator"]')).toHaveAttribute("data-ink-host")
  })

  it("SidebarInset is a main region; on the inset variant it is paper on the desk (switched on by the Sidebar's data-variant, which also brings the tiles)", () => {
    const { container } = renderUI(<Demo sidebar={{ variant: "inset" }} />)
    const main = container.querySelector<HTMLElement>("main")!
    expect(main).toHaveAttribute("data-slot", "sidebar-inset")
    expect(main.className).toContain("md:peer-data-[variant=inset]:m-2")
    expect(main.querySelector(":scope > svg[data-ink]")).toBeNull()
  })

  it("the inset page wears the literal ll-paper classes (a variant-prefixed ll-paper misses the stylesheet's .ll-paper::before paper, so the page was bare desk) and paints its sheet only beside an inset pad", () => {
    const { container } = renderUI(<Demo sidebar={{ variant: "inset" }} />)
    const main = container.querySelector<HTMLElement>("main")!
    expect(main).toHaveClass("ll-paper", "ll-stock-paper", "ll-tooth-cold")
    expect(main.className).not.toMatch(/peer-data-\[variant=inset\]:ll-/)
    expect(main).toHaveClass("before:hidden", "md:peer-data-[variant=inset]:before:block")
  })

  it("a page that IS a sheet on every variant turns the switch back on with before:block (PageSheet does)", () => {
    const { container } = renderUI(
      <SidebarProvider>
        <SidebarInset className="before:block" />
      </SidebarProvider>
    )
    const main = container.querySelector<HTMLElement>("main")!
    expect(main).toHaveClass("ll-paper", "before:block", "md:peer-data-[variant=inset]:before:block")
    expect(main).not.toHaveClass("before:hidden")
  })

  it("only the inset variant brings the tiles of the inset page's paper (the relief tile is 47 KB)", () => {
    const relief = /data-href="[^"]*ll-tex-relief/
    expect(renderToString(<Demo sidebar={{ variant: "inset" }} />)).toMatch(relief)
    expect(renderToString(<Demo />)).not.toMatch(relief)
    expect(renderToString(<Demo sidebar={{ variant: "floating" }} />)).not.toMatch(relief)
  })
})

describe("sidebar recipes", () => {
  const req = { seed: "s", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length

  it("the mark draws the highlighter and a bracket part, the box only for the outline variant", () => {
    const f = runRecipe(sidebarMarkRecipe, { ...req, box: { w: 240, h: 32 }, params: { active: true, outline: false }, density: "comfortable" })
    expect(f.layers).toEqual(["rest"])
    expect(f.parts.rest).toContain('data-part="bracket"')
    expect(nodes(f.parts.rest!)).toBeLessThanOrEqual(12)
    expect(f.parts.rest!.length).toBeLessThanOrEqual(8000)
    const o = runRecipe(sidebarMarkRecipe, { ...req, box: { w: 240, h: 32 }, params: { active: false, outline: true }, density: "comfortable" })
    expect(o.parts.rest).not.toContain('data-part="bracket"')
    expect(o.parts.rest!.length).toBeGreaterThan(200)
  })

  it("the bracket stands in the gutter, on the other side in right-to-left", () => {
    const at = (dir: "ltr" | "rtl") => runRecipe(sidebarMarkRecipe, { ...req, dir, box: { w: 240, h: 32 }, params: { active: true, outline: false }, density: "comfortable" }).parts.rest!
    expect(at("rtl")).not.toBe(at("ltr"))
  })

  it("draws sane markup at every size, density and tier", () => {
    for (const [w, h] of [[32, 32], [120, 28], [240, 32], [240, 48], [600, 32]]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const params of [{ active: true, outline: false }, { active: false, outline: true }, { active: true, outline: true }]) {
            const out = Object.values(runRecipe(sidebarMarkRecipe, { ...req, box: { w, h }, params, density, tier }).parts).join("")
            expect(out, `${w}x${h}/${density}/${tier}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
          }
          const rule = Object.values(runRecipe(sidebarRuleRecipe, { ...req, box: { w: 4, h: h * 6 }, params: {}, density, tier }).parts).join("")
          expect(rule).not.toMatch(/NaN|undefined|Infinity/)
        }
      }
    }
  })
})

describe("rendering", () => {
  it("has no axe violations expanded, collapsed and on a phone with the sheet open", async () => {
    const { container, user } = renderUI(<Demo />, opts)
    await axeCheck(container)
    await user.click(trigger())
    await axeCheck(container)
  })

  it("renders deterministically on the server and hydrates without warnings, bare and inside the provider", () => {
    const tree = <Demo sidebar={{ seed: "s" }} />
    const html = renderToString(tree)
    expect(html).toContain('data-slot="sidebar"')
    expect(renderToString(tree)).toBe(html)
    expect(html.replace(/<style[\s\S]*?<\/style>/g, "")).not.toMatch(/\bNaN\b|\bundefined\b/)
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(tree) as React.ReactElement
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

  it("mounts under StrictMode", () => {
    renderUI(
      <React.StrictMode>
        <Demo />
      </React.StrictMode>
    )
    expect(root()).toHaveAttribute("data-state", "expanded")
  })

  it("a click on a row does not redraw anything", async () => {
    const { user } = renderUI(<Demo />, opts)
    const before = document.querySelector('[data-slot="sidebar-menu-button-mark"]')!.innerHTML
    await user.click(screen.getByRole("button", { name: "Home", hidden: true }))
    expect(document.querySelector('[data-slot="sidebar-menu-button-mark"]')!.innerHTML).toBe(before)
  })
})
