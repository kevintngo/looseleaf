import fs from "node:fs"
import path from "node:path"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import { useState } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SidebarProvider } from "@/components/ui/sidebar"
import { icons } from "@/lib/ink/art/icons"
import { InkProvider } from "@/lib/ink/react"
import { AnnouncerProvider } from "@/docs/core/announcer"
import { CatalogProvider } from "@/docs/core/catalog-context"
import { createCatalog } from "@/docs/core/catalog"
import { RouterProvider } from "@/docs/core/router"
import { SettingsProvider } from "@/docs/core/settings"
import {
  ApiTable,
  Button,
  ButtonLink,
  Callout,
  Chip,
  CodeBlock,
  Glyph,
  IconButton,
  NavGroup,
  NavItem,
  NavSection,
  Overlay,
  Page,
  Pager,
  Scrim,
  Section,
  Stage,
  StatusChip,
  Tabs,
  Tile,
  TileGrid,
  type GlyphName,
} from "@/docs/kit"
import { ComponentActions } from "@/docs/widgets/ComponentActions"
import { ExampleViewer } from "@/docs/widgets/ExampleViewer"
import { PreviewFrame } from "@/docs/widgets/PreviewFrame"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { fixtureCatalog } from "./docs-fixtures"

const ROOT = path.resolve(import.meta.dirname, "..")

beforeEach(() => {
  window.localStorage.clear()
  window.location.hash = ""
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <RouterProvider>
        <CatalogProvider catalog={fixtureCatalog()}>
          <AnnouncerProvider announce={() => {}}>
            <InkProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </InkProvider>
          </AnnouncerProvider>
        </CatalogProvider>
      </RouterProvider>
    </SettingsProvider>
  )
}

describe("Tabs", () => {
  const items = (spy = vi.fn()) => [
    { id: "a", label: "Alpha", content: () => (spy("a"), <p>alpha body</p>) },
    { id: "b", label: "Beta", content: () => (spy("b"), <p>beta body</p>) },
    { id: "c", label: "Gamma", ariaLabel: "Third", content: <p>gamma body</p> },
  ]

  it("is a WAI-ARIA tab set on the library's tabs: one selected tab, arrows move and select", async () => {
    const { user } = renderUI(<Tabs label="Letters" items={items()} variant="pill" />)
    const list = screen.getByRole("tablist", { name: "Letters" })
    const [alpha, beta, third] = within(list).getAllByRole("tab")
    expect(alpha).toHaveAttribute("aria-selected", "true")
    expect(third).toHaveAccessibleName("Third")
    alpha!.focus()
    await user.keyboard("{ArrowRight}")
    expect(beta).toHaveFocus()
    expect(beta).toHaveAttribute("aria-selected", "true")
    expect(alpha).toHaveAttribute("tabindex", "-1")
    await user.keyboard("{End}")
    expect(third).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{Home}")
    expect(alpha).toHaveFocus()
  })

  it("mounts a panel the first time it opens and keeps it, hidden, afterwards", async () => {
    const spy = vi.fn()
    const { user } = renderUI(<Tabs label="Letters" items={items(spy)} />)
    expect(screen.queryByText("beta body")).toBeNull()
    await user.click(screen.getByRole("tab", { name: "Beta" }))
    expect(screen.getByText("beta body")).toBeVisible()
    await user.click(screen.getByRole("tab", { name: "Alpha" }))
    expect(screen.getByText("beta body").closest("[hidden]")).not.toBeNull()
    expect(screen.getByText("alpha body")).toBeVisible()
    expect(spy).toHaveBeenCalledWith("b")
  })

  it('mount="always" renders every panel up front', () => {
    renderUI(<Tabs label="Letters" items={items()} mount="always" />)
    expect(screen.getByText("gamma body")).toBeInTheDocument()
  })

  it("can be controlled", async () => {
    function Controlled() {
      const [value, setValue] = useState("b")
      return (
        <>
          <Tabs label="Letters" items={items()} value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      )
    }
    const { user } = renderUI(<Controlled />)
    expect(screen.getByRole("tab", { name: "Beta" })).toHaveAttribute("aria-selected", "true")
    await user.click(screen.getByRole("tab", { name: "Alpha" }))
    expect(screen.getByRole("status")).toHaveTextContent("a")
  })
})

describe("Callout", () => {
  it("is a note, except an error, which is announced at once", () => {
    renderUI(
      <>
        <Callout tone="tip" title="Tip">
          <p>be gentle</p>
        </Callout>
        <Callout tone="error" title="Broken">
          <p>it broke</p>
        </Callout>
        <Callout tone="todo">
          <p>unfinished</p>
        </Callout>
      </>,
    )
    expect(screen.getAllByRole("note")).toHaveLength(2)
    expect(screen.getByRole("alert")).toHaveTextContent("it broke")
    expect(screen.getByText("be gentle").closest("[data-tone]")).toHaveAttribute("data-tone", "tip")
  })

  it("names an untitled note by its tone, and a node title needs no label", () => {
    renderUI(
      <>
        <Callout tone="warn">
          <p>mind the gap</p>
        </Callout>
        <Callout tone="note" title={<b>Bold</b>}>
          <p>x</p>
        </Callout>
      </>,
    )
    expect(screen.getByRole("note", { name: "Careful" })).toBeInTheDocument()
    expect(screen.getByRole("note", { name: "Note" })).toBeInTheDocument()
  })

  it("has no axe violations in any tone", async () => {
    const { container } = renderUI(
      <>
        {(["note", "tip", "warn", "error", "todo"] as const).map((tone) => (
          <Callout key={tone} tone={tone} title={tone}>
            <p>body</p>
          </Callout>
        ))}
      </>,
    )
    await axeCheck(container)
  })
})

describe("Chip", () => {
  it("draws a badge by default, and a plain wash for a grid of a hundred", () => {
    const { container } = renderUI(
      <>
        <Chip tone="stable">stable</Chip>
        <Chip tone="stable" plain>
          plain
        </Chip>
        <StatusChip status="new" plain />
        <StatusChip status={undefined} />
      </>,
    )
    expect(container.querySelectorAll('[data-slot="badge"]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-slot="chip"]')).toHaveLength(2)
    expect(container.querySelector('[data-slot="chip"] svg')).toBeNull()
    expect(screen.getByText("new")).toBeInTheDocument()
  })
})

describe("Button family", () => {
  it("maps the site's three variants to the library's", () => {
    renderUI(
      <>
        <Button>plain</Button>
        <Button variant="primary">main</Button>
        <Button variant="quiet">quiet</Button>
        <IconButton label="Search" glyph="search" />
        <ButtonLink to="/components" variant="primary">
          Go
        </ButtonLink>
      </>,
      {},
    )
    expect(screen.getByRole("button", { name: "plain" })).toHaveAttribute("data-variant", "outline")
    expect(screen.getByRole("button", { name: "plain" })).toHaveAttribute("type", "button")
    expect(screen.getByRole("button", { name: "main" })).toHaveAttribute("data-variant", "default")
    expect(screen.getByRole("button", { name: "quiet" })).toHaveAttribute("data-variant", "ghost")
    expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute("data-size", "icon")
  })

  it("a ButtonLink is a real link to a hash route", () => {
    window.location.hash = ""
    renderUI(
      <RouterProvider>
        <ButtonLink to="/components">All</ButtonLink>
      </RouterProvider>,
    )
    expect(screen.getByRole("link", { name: "All" })).toHaveAttribute("href", "#/components")
    expect(screen.getByRole("link", { name: "All" })).toHaveAttribute("data-slot", "button")
  })
})

describe("Glyph", () => {
  const names: GlyphName[] = ["search", "menu", "close", "copy", "check", "chevron-down", "chevron-right", "arrow-left", "arrow-right", "sliders", "hash", "external", "leaf"]

  it("draws every glyph the site names from the library's own icon set", () => {
    const { container } = renderUI(
      <>
        {names.map((name) => (
          <Glyph key={name} name={name} />
        ))}
      </>,
    )
    expect(container.querySelectorAll('[data-slot="icon"]')).toHaveLength(names.length)
    expect(container.querySelector("[data-missing]")).toBeNull()
    const drawn = Array.from(container.querySelectorAll("[data-icon]")).map((el) => el.getAttribute("data-icon")!)
    for (const id of drawn) expect(Object.keys(icons)).toContain(id)
  })
})

describe("Stage", () => {
  it("is a dot-grid sheet for an example, and a plain sheet for a whole page", () => {
    renderUI(
      <>
        <Stage label="Dots">
          <p>a</p>
        </Stage>
        <Stage layout="full" label="Full">
          <p>b</p>
        </Stage>
      </>,
    )
    expect(screen.getByRole("group", { name: "Dots" })).toHaveAttribute("data-stock", "dot-grid")
    expect(screen.getByRole("group", { name: "Full" })).toHaveAttribute("data-stock", "paper")
    expect(screen.getByRole("group", { name: "Full" })).toHaveAttribute("data-layout", "full")
    const scroller = screen.getByRole("group", { name: "Dots" }).querySelector('[data-slot="stage-scroll"]')!
    expect(scroller.className).not.toContain("translateZ")
    expect(scroller).toHaveClass("overflow-auto")
  })

  it("keeps position:fixed things on the sheet, paper or desk, when the example asks to contain them", () => {
    renderUI(
      <>
        <Stage contain label="Paper frame">
          <p>a</p>
        </Stage>
        <Stage contain surface="desk" label="Desk frame">
          <p>b</p>
        </Stage>
      </>,
    )
    expect(screen.getByRole("group", { name: "Paper frame" }).querySelector('[data-slot="stage-scroll"]')!.className).toContain("[transform:translateZ(0)]")
    expect(screen.getByRole("group", { name: "Desk frame" }).className).toContain("[transform:translateZ(0)]")
  })

  it("lets a placeholder link do nothing instead of sending the router home, and leaves real links alone", () => {
    const { container } = renderUI(
      <Stage label="Links">
        <a href="#">dead</a>
        <a href="">empty</a>
        <a href="#/components/button">real</a>
        <a href="#page-2">
          <span>named</span>
        </a>
      </Stage>,
    )
    const click = (el: Element) => {
      const event = new MouseEvent("click", { bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      return event.defaultPrevented
    }
    const links = Array.from(container.querySelectorAll("a"))
    expect(links.map(click)).toEqual([true, true, false, false])
    expect(click(links[3]!.querySelector("span")!)).toBe(false)
    expect(click(container.querySelector("[data-slot=stage]")!)).toBe(false)
  })

  it("puts an example on the desk when asked, with its own two tiles, and keeps a min height", () => {
    renderUI(
      <Stage surface="desk" layout="stack" height={300} label="Desk">
        <p>c</p>
      </Stage>,
    )
    const desk = screen.getByRole("group", { name: "Desk" })
    expect(desk).toHaveClass("ll-desk")
    expect(desk).toHaveStyle({ minHeight: "300px" })
    expect(desk).not.toHaveAttribute("data-stock")
  })
})

describe("Overlay", () => {
  it("is a modal dialog that closes on Escape and gives focus back", async () => {
    function Host() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>open</button>
          <Overlay open={open} onClose={() => setOpen(false)} label="Pick one" initialFocus="#second">
            <button id="first">first</button>
            <button id="second">second</button>
          </Overlay>
        </>
      )
    }
    const { user } = renderUI(<Host />)
    const opener = screen.getByRole("button", { name: "open" })
    await user.click(opener)
    expect(screen.getByRole("dialog", { name: "Pick one" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "second" })).toHaveFocus()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(opener).toHaveFocus()
  })

  it("has a scrim that only exists while open and closes on a click", async () => {
    const onClick = vi.fn()
    const { rerender, user } = renderUI(<Scrim open={false} onClick={onClick} />)
    expect(document.querySelector('[aria-hidden="true"].fixed')).toBeNull()
    rerender(<Scrim open onClick={onClick} />)
    await user.click(document.querySelector('[aria-hidden="true"].fixed')!)
    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe("ApiTable", () => {
  it("is a hand-ruled table in a keyboard-reachable scroller, with required marks and honest empty defaults", () => {
    renderUI(
      <ApiTable
        caption="Thing props"
        props={[
          { name: "size", type: '"sm" | "lg"', default: '"sm"', description: "How big." },
          { name: "label", type: "string", description: "Words.", required: true },
        ]}
      />,
    )
    const scroller = screen.getByRole("group", { name: "Thing props" })
    expect(scroller).toHaveAttribute("tabindex", "0")
    const table = within(scroller).getByRole("table", { name: "Thing props" })
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Prop", "Type", "Default", "Description"])
    expect(within(table).getByRole("rowheader", { name: /label.*required/ })).toBeInTheDocument()
    expect(within(table).getByLabelText("no default")).toBeInTheDocument()
    expect(within(table).getByText('"sm" | "lg"').tagName).toBe("CODE")
  })
})

describe("Page", () => {
  it("is a sheet of paper with the title, lede and chips on it, and 'On this page' beside it", () => {
    window.location.hash = "#/components/x"
    renderUI(
      <RouterProvider>
        <Page kicker="Library" title="Things" description="All of them." meta={<Chip tone="outline">3</Chip>} toc={[{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }]}>
          <Section id="a" title="Alpha">
            <p>text</p>
          </Section>
        </Page>
      </RouterProvider>,
    )
    const article = screen.getByRole("article")
    expect(article).toHaveAttribute("data-slot", "page")
    expect(within(article).getByRole("heading", { level: 1, name: "Things" })).toHaveAttribute("tabindex", "-1")
    expect(within(article).getByRole("region", { name: "Alpha" })).toBeInTheDocument()
    const toc = screen.getByRole("navigation", { name: "On this page" })
    expect(within(toc).getByRole("link", { name: "Beta" })).toHaveAttribute("href", "#/components/x#b")
  })

  it("leaves the rail out for a page with one section", () => {
    renderUI(
      <RouterProvider>
        <Page title="Short" toc={[{ id: "a", label: "Only" }]} />
      </RouterProvider>,
    )
    expect(screen.queryByRole("navigation", { name: "On this page" })).toBeNull()
  })

  it("marks the section being read: the last heading that has reached the top", async () => {
    window.location.hash = "#/components/x"
    const rects: Record<string, number> = { a: -400, b: 90, c: 700 }
    const spy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const top = rects[this.id]
      return { top: top ?? 0, bottom: (top ?? 0) + 30, left: 0, right: 100, width: top === undefined ? 0 : 100, height: top === undefined ? 0 : 30, x: 0, y: top ?? 0, toJSON() {} } as DOMRect
    })
    renderUI(
      <RouterProvider>
        <Page title="Long" toc={[{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }, { id: "c", label: "Gamma" }]}>
          {["a", "b", "c"].map((id) => (
            <Section key={id} id={id} title={id.toUpperCase()} />
          ))}
        </Page>
      </RouterProvider>,
    )
    const toc = screen.getByRole("navigation", { name: "On this page" })
    await waitFor(() => expect(within(toc).getByRole("link", { name: "Beta" })).toHaveAttribute("aria-current", "location"))
    expect(within(toc).getByRole("link", { name: "Alpha" })).not.toHaveAttribute("aria-current")
    rects.c = 60
    act(() => {
      window.dispatchEvent(new Event("scroll"))
    })
    await waitFor(() => expect(within(toc).getByRole("link", { name: "Gamma" })).toHaveAttribute("aria-current", "location"))
    spy.mockRestore()
  })
})

describe("Tile", () => {
  it("is an index card in a box of them: the whole card is the link, and the same address always turns it the same way", () => {
    const tile = (
      <TileGrid>
        <Tile to="/components/card" title="Card" description="A sheet." meta={<Chip tone="outline" plain>x</Chip>} />
      </TileGrid>
    )
    const { container, unmount } = renderUI(<RouterProvider>{tile}</RouterProvider>)
    const link = screen.getByRole("link", { name: /Card/ })
    expect(link).toHaveAttribute("href", "#/components/card")
    expect(link.closest("li")).toHaveAttribute("data-slot", "paper")
    const turn = (container.querySelector("li") as HTMLElement).style.getPropertyValue("--ll-tilt")
    unmount()
    const again = renderUI(<RouterProvider>{tile}</RouterProvider>)
    expect((again.container.querySelector("li") as HTMLElement).style.getPropertyValue("--ll-tilt")).toBe(turn)
  })
})

describe("Pager", () => {
  it("walks with [ and ], but not with a modifier held or while typing", async () => {
    window.location.hash = "#/components/b"
    const { user } = renderUI(
      <RouterProvider>
        <Pager label="Pages" prev={{ to: "/components/a", title: "A" }} next={{ to: "/components/c", title: "C" }} />
        <input aria-label="field" />
      </RouterProvider>,
    )
    expect(screen.getByRole("link", { name: /Previous\s*A/ })).toHaveAttribute("rel", "prev")
    await user.keyboard("{Control>}]{/Control}")
    expect(window.location.hash).toBe("#/components/b")
    await user.click(screen.getByRole("textbox", { name: "field" }))
    await user.keyboard("]")
    expect(window.location.hash).toBe("#/components/b")
    await user.click(document.body)
    await user.keyboard("]")
    await waitFor(() => expect(window.location.hash).toBe("#/components/c"))
  })

  it("draws nothing without a neighbor", () => {
    const { container } = renderUI(
      <RouterProvider>
        <Pager label="Pages" />
      </RouterProvider>,
    )
    expect(container).toBeEmptyDOMElement()
  })
})

describe("Nav parts", () => {
  it("a group folds and unfolds, its count sits in the margin, and only the current row is marked", async () => {
    let restore = () => {}
    restore = mockBox(160, 32)
    try {
      function Host() {
        const [open, setOpen] = useState(true)
        return (
          <RouterProvider>
            <InkProvider>
              <SidebarProvider>
                <nav aria-label="Pad">
                  <NavSection label="Components" to="/components" count={45}>
                    <NavGroup label="Forms" count={40} open={open} onToggle={() => setOpen((o) => !o)} containsActive>
                      {Array.from({ length: 40 }, (_, i) => (
                        <NavItem key={i} to={`/components/item-${i}`} active={i === 3}>
                          {`Item ${i}`}
                        </NavItem>
                      ))}
                    </NavGroup>
                  </NavSection>
                </nav>
              </SidebarProvider>
            </InkProvider>
          </RouterProvider>
        )
      }
      const { user, container } = renderUI(<Host />)
      const forms = screen.getByRole("button", { name: /^Forms/ })
      expect(forms).toHaveAttribute("aria-expanded", "true")
      expect(screen.getByRole("link", { name: "Item 3" })).toHaveAttribute("aria-current", "page")
      expect(screen.getAllByRole("link")).toHaveLength(41)
      const drawn = container.querySelectorAll("svg[data-ink]:not([data-ink=icon])")
      expect(drawn.length).toBeLessThan(8)
      expect(container.querySelectorAll('[data-slot="sidebar-menu-button-mark"]')).toHaveLength(1)
      await user.click(forms)
      expect(screen.queryByRole("link", { name: "Item 3" })).toBeNull()
    } finally {
      restore()
    }
  })
})

describe("PreviewFrame", () => {
  const separator = () => screen.getByRole("separator", { name: "Resize preview" })
  const frame = () => document.querySelector<HTMLElement>('[data-slot="preview-frame"]')!

  it("narrows to a phone or a tablet with the presets, and back to full width", async () => {
    const { user } = renderUI(
      <PreviewFrame>
        <p>content</p>
      </PreviewFrame>,
    )
    expect(screen.getByRole("button", { name: "Full" })).toHaveAttribute("aria-pressed", "true")
    await user.click(screen.getByRole("button", { name: /Phone/ }))
    expect(frame()).toHaveStyle({ width: "375px" })
    expect(screen.getByRole("button", { name: /Phone/ })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("375 px wide")).toBeInTheDocument()
    expect(separator()).toHaveAttribute("aria-valuenow", "375")
    await user.click(screen.getByRole("button", { name: /Tablet/ }))
    expect(frame()).toHaveStyle({ width: "768px" })
    await user.click(screen.getByRole("button", { name: "Full" }))
    expect(frame().style.width).toBe("")
    expect(separator()).toHaveAttribute("aria-valuetext", "Full width")
  })

  it("is a keyboard separator: arrows resize, Shift steps further, Home is the narrowest, End is full", async () => {
    const { user } = renderUI(
      <PreviewFrame>
        <p>content</p>
      </PreviewFrame>,
    )
    separator().focus()
    await user.keyboard("{ArrowLeft}")
    expect(frame()).toHaveStyle({ width: "1184px" })
    await user.keyboard("{Shift>}{ArrowLeft}{/Shift}")
    expect(frame()).toHaveStyle({ width: "1120px" })
    await user.keyboard("{ArrowRight}")
    expect(frame()).toHaveStyle({ width: "1136px" })
    await user.keyboard("{Home}")
    expect(frame()).toHaveStyle({ width: "240px" })
    await user.keyboard("{ArrowLeft}")
    expect(frame()).toHaveStyle({ width: "240px" })
    await user.keyboard("{End}")
    expect(frame().style.width).toBe("")
  })

  it("follows the pointer while it is dragged by the grip", () => {
    renderUI(
      <PreviewFrame>
        <p>content</p>
      </PreviewFrame>,
    )
    const grip = separator()
    fireEvent.pointerDown(grip, { clientX: 600, pointerId: 1 })
    fireEvent.pointerMove(grip, { clientX: 400, pointerId: 1 })
    expect(frame()).toHaveStyle({ width: "1000px" })
    fireEvent.pointerUp(grip, { clientX: 400, pointerId: 1 })
    fireEvent.pointerMove(grip, { clientX: 100, pointerId: 1 })
    expect(frame()).toHaveStyle({ width: "1000px" })
    expect(grip).toHaveFocus()
  })
})

describe("ExampleViewer laziness", () => {
  class ControlledIO {
    static all: ControlledIO[] = []
    targets: Element[] = []
    readonly margin: string
    constructor(
      private cb: IntersectionObserverCallback,
      options?: IntersectionObserverInit,
    ) {
      this.margin = options?.rootMargin ?? ""
      ControlledIO.all.push(this)
    }
    observe(target: Element) {
      this.targets.push(target)
    }
    unobserve() {}
    disconnect() {
      this.targets = []
    }
    takeRecords() {
      return []
    }
    show() {
      this.cb(this.targets.map((target) => ({ isIntersecting: true, intersectionRatio: 1, target }) as unknown as IntersectionObserverEntry), this as unknown as IntersectionObserver)
    }
  }
  const showWithin = (px: number) => act(() => ControlledIO.all.filter((io) => io.margin.startsWith(`${px}px`)).forEach((io) => io.show()))
  const entry = (load: () => Promise<unknown>, id = "01-thing", path = `/x/${id}.tsx`) => ({
    id,
    path,
    fileName: `${id}.tsx`,
    title: "Thing",
    load: load as never,
    source: async () => "export default function Example() {}",
  })
  const placeholder = (container: HTMLElement) => container.querySelector<HTMLElement>('.dk-skeleton[aria-hidden="true"]')

  beforeEach(() => {
    ControlledIO.all = []
    vi.stubGlobal("IntersectionObserver", ControlledIO)
  })

  it("keeps quiet room for an example far below the window, fetches it a few screens ahead, and draws it when it is near", async () => {
    const load = vi.fn(async () => ({ default: () => <p>lazy example</p>, meta: { title: "Thing", height: 300 } }))
    const eager = vi.fn(async () => ({ default: () => <p>eager example</p>, meta: { title: "Eager" } }))
    const { container } = renderUI(
      <Frame>
        <ExampleViewer entry={entry(load, "01-lazy")} slug="thing" lazy />
        <ExampleViewer entry={entry(eager, "02-eager")} slug="thing" />
      </Frame>,
    )
    expect(await screen.findByText("eager example")).toBeInTheDocument()
    expect(load).not.toHaveBeenCalled()
    expect(screen.queryByRole("status")).toBeNull()
    expect(placeholder(container)).toHaveStyle({ minHeight: "240px" })

    showWithin(2400)
    await waitFor(() => expect(load).toHaveBeenCalledOnce())
    expect(screen.queryByText("lazy example")).toBeNull()
    await waitFor(() => expect(placeholder(container)).toHaveStyle({ minHeight: "348px" }))

    showWithin(600)
    expect(await screen.findByText("lazy example")).toBeInTheDocument()
    expect(load).toHaveBeenCalledOnce()
    expect(ControlledIO.all.every((io) => io.targets.length === 0)).toBe(true)
  })

  it("draws an example at once when the address points at it", async () => {
    window.location.hash = "#/components/thing#example-01-linked"
    const load = vi.fn(async () => ({ default: () => <p>linked example</p>, meta: { title: "Linked" } }))
    renderUI(
      <Frame>
        <ExampleViewer entry={entry(load, "01-linked")} slug="thing" lazy />
      </Frame>,
    )
    expect(await screen.findByText("linked example")).toBeInTheDocument()
    expect(ControlledIO.all.every((io) => io.targets.length === 0)).toBe(true)
  })

  it("draws it as usual where there is no IntersectionObserver", async () => {
    vi.stubGlobal("IntersectionObserver", undefined)
    const load = vi.fn(async () => ({ default: () => <p>plain example</p>, meta: { title: "Plain" } }))
    renderUI(
      <Frame>
        <ExampleViewer entry={entry(load, "01-plain")} slug="thing" lazy />
      </Frame>,
    )
    expect(await screen.findByText("plain example")).toBeInTheDocument()
  })

  describe("scroll and remembered room", () => {
    const observers: Array<(entries: unknown[]) => void> = []
    class ControlledRO {
      constructor(cb: (entries: unknown[]) => void) {
        observers.push(cb)
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    const box = (height: number, bottom: number) => vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({ height, bottom, top: bottom - height, left: 0, right: 0, width: 0, x: 0, y: 0, toJSON() {} })
    const resized = () =>
      act(() =>
        observers.forEach((cb) => {
          try {
            cb([])
          } catch {
          }
        }),
      )
    let scrollBy: ReturnType<typeof vi.fn>

    beforeEach(() => {
      observers.length = 0
      vi.stubGlobal("ResizeObserver", ControlledRO)
      scrollBy = vi.fn()
      window.scrollBy = scrollBy as never
    })

    it("adds back what an example above the window grew by, and remembers how tall it came out", async () => {
      vi.stubGlobal("CSS", { supports: () => false })
      const load = vi.fn(async () => ({ default: () => <p>tall example</p>, meta: { title: "Tall" } }))
      const tall = entry(load, "01-tall", "/x/remembered-tall.tsx")
      const first = renderUI(
        <Frame>
          <ExampleViewer entry={tall} slug="thing" lazy />
        </Frame>,
      )
      showWithin(600)
      expect(await screen.findByText("tall example")).toBeInTheDocument()

      box(400, -20)
      resized()
      expect(scrollBy).toHaveBeenCalledWith({ top: 400, left: 0, behavior: "instant" })
      resized()
      expect(scrollBy).toHaveBeenCalledTimes(1)

      box(520, 300)
      resized()
      expect(scrollBy).toHaveBeenCalledTimes(1)

      first.unmount()
      ControlledIO.all = []
      const again = renderUI(
        <Frame>
          <ExampleViewer entry={tall} slug="thing" lazy />
        </Frame>,
      )
      expect(placeholder(again.container)).toHaveStyle({ minHeight: "520px" })
    })

    it("leaves the page alone where the browser holds the scroll position itself", async () => {
      vi.stubGlobal("CSS", { supports: () => true })
      const load = vi.fn(async () => ({ default: () => <p>anchored example</p>, meta: { title: "Anchored" } }))
      renderUI(
        <Frame>
          <ExampleViewer entry={entry(load, "01-anchored")} slug="thing" lazy />
        </Frame>,
      )
      showWithin(600)
      expect(await screen.findByText("anchored example")).toBeInTheDocument()
      box(400, -20)
      resized()
      expect(scrollBy).not.toHaveBeenCalled()
    })
  })
})

describe("ComponentActions", () => {
  const catalog = fixtureCatalog()

  it("copies the install command for the chosen package manager", async () => {
    window.localStorage.setItem("looseleaf-docs:pm", "pnpm")
    const { user } = renderUI(
      <Frame>
        <ComponentActions entry={catalog.bySlug.get("button")!} />
      </Frame>,
    )
    await user.click(screen.getByRole("button", { name: /Copy install command/ }))
    expect(await navigator.clipboard.readText()).toBe("pnpm dlx shadcn@latest add @looseleaf/button")
    expect(screen.getByRole("button", { name: /Copied/ })).toBeInTheDocument()
  })

  it("reads the component's source on a page bound to the side, or offers nothing where there is no file", async () => {
    const { user, unmount } = renderUI(
      <Frame>
        <ComponentActions entry={catalog.bySlug.get("button")!} />
      </Frame>,
    )
    await user.click(screen.getByRole("button", { name: "View source" }))
    const sheet = screen.getByRole("dialog", { name: "button.tsx" })
    expect(await within(sheet).findByRole("group", { name: "Code: components/ui/button.tsx" })).toHaveTextContent("Button")
    await user.keyboard("{Escape}")
    expect(screen.getByRole("button", { name: "View source" })).toHaveFocus()
    unmount()

    renderUI(
      <Frame>
        <ComponentActions entry={catalog.bySlug.get("card")!} />
      </Frame>,
    )
    expect(screen.queryByRole("button", { name: "View source" })).toBeNull()
    expect(screen.getByRole("button", { name: /Copy install command/ })).toBeInTheDocument()
  })
})

describe("CodeBlock", () => {
  it("is the library's typed slip: file name, ribbon, a copy button that says so, a labeled scroller", async () => {
    const { user } = renderUI(
      <AnnouncerProvider announce={() => {}}>
        <CodeBlock code={"const a = 1\n\n\n"} lang="ts" title="a.ts" lineNumbers maxHeight={80} />
      </AnnouncerProvider>,
    )
    const scroller = screen.getByRole("group", { name: "Code: a.ts" })
    expect(scroller.textContent).toBe("const a = 1")
    expect(scroller).toHaveStyle({ maxHeight: "80px" })
    expect(scroller.closest("figure")).toHaveAttribute("data-slot", "code-block")
    expect(screen.getByText("a.ts")).toHaveAttribute("data-slot", "code-block-title")
    await user.click(screen.getByRole("button", { name: "Copy code" }))
    expect(await navigator.clipboard.readText()).toBe("const a = 1")
  })

  it("leaves the copy button out when asked and names an untitled slip by its language", () => {
    renderUI(
      <AnnouncerProvider announce={() => {}}>
        <CodeBlock code="echo hi" lang="bash" copy={false} />
      </AnnouncerProvider>,
    )
    expect(screen.queryByRole("button", { name: "Copy code" })).toBeNull()
    expect(screen.getByRole("group", { name: "Code: bash" })).toBeInTheDocument()
  })
})

describe("the stylesheet", () => {
  const css = fs.readFileSync(path.join(ROOT, "src/docs/docs.css"), "utf8")

  it("defines every helper class the hand-written pages use, and prints paper to paper", () => {
    const dir = path.join(ROOT, "src/docs/content")
    const files: string[] = []
    const walk = (d: string) => {
      for (const name of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, name.name)
        if (name.isDirectory()) walk(p)
        else if (/\.(tsx?|css)$/.test(name.name)) files.push(p)
      }
    }
    walk(dir)
    const used = new Set<string>()
    for (const file of files) for (const m of fs.readFileSync(file, "utf8").matchAll(/\bdk-[a-z0-9-]+/g)) used.add(m[0])
    const markers = new Set(["dk-stage"])
    const missing = [...used].filter((c) => !markers.has(c) && !css.includes(`.${c}`))
    expect(missing).toEqual([])
    expect(css).toContain("@media print")
    expect(css).toContain('@import "../styles/looseleaf.css"')
  })
})

describe("the site", () => {
  it("is built from the library: no lucide, no other icon set, no hand-made svg in the chrome but the logo mark", () => {
    const dirs = ["kit", "shell", "widgets", "pages"].map((d) => path.join(ROOT, "src/docs", d))
    const offenders: string[] = []
    const walk = (d: string) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name)
        if (e.isDirectory()) walk(p)
        else if (/\.tsx?$/.test(e.name)) {
          const src = fs.readFileSync(p, "utf8")
          if (/lucide|<svg\b|<path\b/.test(src) && e.name !== "LogoMark.tsx") offenders.push(path.relative(ROOT, p))
        }
      }
    }
    dirs.forEach(walk)
    expect(offenders).toEqual([])
  })
})
