import { StrictMode } from "react"
import { act, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DocsApp } from "@/docs/App"
import { createCatalog } from "@/docs/core/catalog"
import { LibraryProviders } from "@/docs/providers"
import { axeCheck, renderUI } from "./helpers"
import { fixtureCatalog, fixtureSources } from "./docs-fixtures"
import basicSource from "./docs-fixtures/examples/button/01-basic.tsx?raw"
import buttonSource from "./docs-fixtures/ui/button.tsx?raw"

function renderDocs(hash = "", catalog = fixtureCatalog()) {
  window.location.hash = hash
  return renderUI(<DocsApp catalog={catalog} />)
}

const docNav = () => screen.getByRole("navigation", { name: "Documentation" })
const trimmed = (text: string) => text.replace(/\n+$/, "")

class SeenIO {
  constructor(private cb: IntersectionObserverCallback) {}
  observe(target: Element) {
    queueMicrotask(() => this.cb([{ isIntersecting: true, intersectionRatio: 1, target } as unknown as IntersectionObserverEntry], this as unknown as IntersectionObserver))
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

beforeEach(() => {
  window.localStorage.clear()
  window.location.hash = ""
  document.documentElement.removeAttribute("data-density")
  document.documentElement.removeAttribute("data-motion")
  window.scrollTo = vi.fn()
  vi.stubGlobal("IntersectionObserver", SeenIO)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("shell", () => {
  it("renders landmarks, a skip link and the home page", async () => {
    renderDocs()
    expect(screen.getAllByRole("banner")[0]).toHaveClass("dk-topbar")
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument()
    expect(docNav()).toBeInTheDocument()
    expect(screen.getByRole("main")).toBeInTheDocument()
    expect(await screen.findByRole("contentinfo")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main")
    expect(screen.getByRole("heading", { level: 1, name: "Looseleaf" })).toBeInTheDocument()
    expect(document.title).toBe("Looseleaf — shadcn/ui, drawn by hand")
  })

  it("asks for the colophon and its sticker book only when the page is idle", async () => {
    const idle: Array<() => void> = []
    vi.stubGlobal("requestIdleCallback", (cb: () => void) => idle.push(cb))
    vi.stubGlobal("cancelIdleCallback", () => {})
    renderDocs("#/components/button")
    expect(await screen.findByRole("heading", { level: 1, name: "Button" })).toBeInTheDocument()
    expect(screen.queryByRole("contentinfo")).toBeNull()
    act(() => idle.splice(0).forEach((cb) => cb()))
    expect(await screen.findByRole("contentinfo")).toBeInTheDocument()
  })

  it("has a top strip with the way out to GitHub and a colophon with the rubber stamp", async () => {
    renderDocs("#/components/button")
    const github = within(screen.getByRole("banner")).getByRole("link", { name: /GitHub/ })
    expect(github).toHaveAttribute("target", "_blank")
    expect(github).toHaveAttribute("rel", expect.stringContaining("noreferrer"))
    const footer = await screen.findByRole("contentinfo")
    expect(within(footer).getByRole("img", { name: "Hand drawn: no pixels harmed" })).toBeInTheDocument()
    expect(within(footer).getByRole("link", { name: "Changelog" })).toHaveAttribute("href", "#/changelog")
  })

  it("shows real counts on the home page", () => {
    renderDocs()
    const stats = screen.getByText("Components", { selector: "dt" }).parentElement!
    expect(within(stats).getByText("4")).toBeInTheDocument()
    expect(screen.getByRole("list", { name: "Categories" })).toHaveTextContent("Forms")
  })

  it("moves focus to the page heading and scrolls to the top when the route changes, not on first load", async () => {
    const { user } = renderDocs()
    expect(document.body).toHaveFocus()
    expect(window.scrollTo).not.toHaveBeenCalled()

    await user.click(within(docNav()).getByRole("link", { name: "Getting started" }))
    await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Getting started" })).toHaveFocus())
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" })
    expect(document.title).toBe("Getting started — Looseleaf")
    await waitFor(() => expect(document.body).toHaveTextContent("Navigated to Getting started — Looseleaf"))
  })

  it("leaves the scroll position to the browser on Back and Forward, and still moves focus to the heading", async () => {
    const navigation = new EventTarget()
    vi.stubGlobal("navigation", navigation)
    const navigate = (navigationType: string, hash: string) => {
      navigation.dispatchEvent(Object.assign(new Event("navigate"), { navigationType }))
      window.location.hash = hash
    }
    renderDocs("#/")
    navigate("traverse", "#/getting-started")
    await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Getting started" })).toHaveFocus())
    expect(window.scrollTo).not.toHaveBeenCalled()

    navigate("push", "#/changelog")
    await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Changelog" })).toHaveFocus())
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" })
  })

  it("scrolls to an in-page anchor", async () => {
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll
    renderDocs("#/getting-started#fonts")
    await waitFor(() => expect(scroll).toHaveBeenCalled())
    expect(document.getElementById("fonts")).toBeInTheDocument()
  })

  it("the skip link focuses main without changing the route", async () => {
    const { user } = renderDocs("#/changelog")
    await user.tab()
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(screen.getByRole("main")).toHaveFocus()
    expect(window.location.hash).toBe("#/changelog")
  })

  it("renders every static route without crashing", () => {
    for (const hash of ["#/", "#/getting-started", "#/foundations", "#/components", "#/blocks", "#/playground", "#/changelog", "#/nope/at/all"]) {
      const { unmount } = renderDocs(hash)
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
      unmount()
    }
  })
})

describe("React strict mode", () => {
  it("survives double-run effects: no stray announcement, examples load, palette focus works", async () => {
    window.location.hash = "#/components/card"
    const { user } = renderUI(
      <StrictMode>
        <DocsApp catalog={fixtureCatalog()} />
      </StrictMode>,
    )
    expect(await screen.findByTestId("card-example")).toBeInTheDocument()
    expect(document.body).not.toHaveTextContent("Navigated to")
    await user.keyboard("{Control>}k{/Control}")
    expect(await screen.findByRole("combobox")).toHaveFocus()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).toBeNull()
  })
})

describe("library providers seam", () => {
  it("renders the site inside LibraryProviders whether or not the ink provider exists yet", () => {
    window.location.hash = "#/"
    renderUI(<DocsApp catalog={fixtureCatalog()} Providers={LibraryProviders} />)
    expect(screen.getByRole("heading", { level: 1, name: "Looseleaf" })).toBeInTheDocument()
  })
})

describe("navigation", () => {
  it("groups components by category with counts and marks the active page", () => {
    renderDocs("#/components/date-picker")
    const nav = docNav()
    const forms = within(nav).getByRole("button", { name: /^Forms/ })
    expect(forms).toHaveAttribute("aria-expanded", "true")
    expect(forms.closest("li")).toHaveTextContent(/Forms\s*2/)
    expect(within(nav).getByRole("button", { name: /^Actions/ }).closest("li")).toHaveTextContent(/Actions\s*1/)
    expect(within(nav).getByRole("link", { name: "Date Picker" })).toHaveAttribute("aria-current", "page")
    expect(within(nav).getByRole("link", { name: "Input" })).not.toHaveAttribute("aria-current")
    expect(within(nav).getByRole("link", { name: "Components" }).closest("[data-slot=sidebar-group-label]")).toHaveTextContent("Components4")
    const headings = [...nav.querySelectorAll("[data-slot=sidebar-group-label]")].map((h) => h.textContent)
    expect(headings.join("|")).toMatch(/Start.*Foundations.*Components.*Blocks.*More/)
  })

  it("collapses and re-opens a category", async () => {
    const { user } = renderDocs("#/components/button")
    const nav = docNav()
    const forms = within(nav).getByRole("button", { name: /^Forms/ })
    expect(within(nav).getByRole("link", { name: "Input" })).toBeVisible()
    await user.click(forms)
    expect(forms).toHaveAttribute("aria-expanded", "false")
    expect(within(nav).queryByRole("link", { name: "Input" })).toBeNull()
    await user.click(forms)
    expect(within(nav).getByRole("link", { name: "Input" })).toBeVisible()
  })

  it("re-opens a collapsed category when you navigate into it", async () => {
    const { user } = renderDocs("#/components/button")
    const nav = docNav()
    await user.click(within(nav).getByRole("button", { name: /^Forms/ }))
    expect(within(nav).queryByRole("link", { name: "Input" })).toBeNull()
    act(() => {
      window.location.hash = "#/components/input"
    })
    await waitFor(() => expect(within(nav).getByRole("link", { name: "Input" })).toHaveAttribute("aria-current", "page"))
  })

  it("starts a big library collapsed except for the active category, and remembers what the viewer changes", async () => {
    const meta: Record<string, unknown> = {}
    const groups = ["Actions", "Forms", "Layout"]
    for (let i = 0; i < 45; i++) {
      const slug = `thing-${String(i).padStart(2, "0")}`
      meta[`/m/meta/${slug}.ts`] = { default: { slug, title: `Thing ${i}`, category: groups[i % 3], description: "", parts: [], usage: "" } }
    }
    const { user, unmount } = renderDocs("#/components/thing-01", createCatalog({ meta }))
    const nav = docNav()
    expect(within(nav).getByRole("button", { name: /^Forms/ })).toHaveAttribute("aria-expanded", "true")
    expect(within(nav).getByRole("button", { name: /^Actions/ })).toHaveAttribute("aria-expanded", "false")
    expect(within(nav).getByRole("button", { name: /^Layout/ })).toHaveAttribute("aria-expanded", "false")
    await user.click(within(nav).getByRole("button", { name: /^Actions/ }))
    expect(within(nav).getByRole("link", { name: "Thing 0" })).toBeVisible()
    unmount()

    renderDocs("#/components/thing-01", createCatalog({ meta }))
    expect(within(docNav()).getByRole("button", { name: /^Actions/ })).toHaveAttribute("aria-expanded", "true")
  })

  it("lists the eleven foundations, principles first, and the blocks", () => {
    renderDocs("#/foundations/motion")
    const nav = docNav()
    const names = ["Principles", "Colour", "Typography", "Pens", "Paper", "Icons", "Stickers & doodles", "Motion", "Density", "Accessibility", "Theming"]
    for (const name of names) {
      expect(within(nav).getByRole("link", { name })).toBeInTheDocument()
    }
    expect(within(nav).getAllByRole("link").slice(2, 2 + names.length).map((a) => a.textContent)).toEqual(names)
    expect(within(nav).getByRole("link", { name: "Motion" })).toHaveAttribute("aria-current", "page")
    expect(within(nav).getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "#/blocks/login")
  })
})

describe("component page", () => {
  it("shows title, description, status and upstream", () => {
    renderDocs("#/components/button")
    expect(screen.getByRole("heading", { level: 1, name: "Button" })).toBeInTheDocument()
    expect(screen.getByText(/Triggers an action/)).toBeInTheDocument()
    expect(screen.getByText("stable")).toBeInTheDocument()
    expect(screen.getByText("extends shadcn/ui button")).toBeInTheDocument()
    expect(document.title).toBe("Button — Looseleaf")
  })

  it("renders the first example live inside a stage", async () => {
    renderDocs("#/components/button")
    const stage = await screen.findByRole("group", { name: "Basic button preview" })
    expect(within(stage).getByRole("button", { name: "Save changes" })).toBeInTheDocument()
    expect(stage).toHaveAttribute("data-layout", "center")
  })

  it("respects layout and height from the example meta", async () => {
    renderDocs("#/components/button")
    const stage = await screen.findByRole("group", { name: "Tall overlay preview" })
    expect(stage).toHaveAttribute("data-layout", "stack")
    expect(stage).toHaveStyle({ minHeight: "320px" })
    expect(screen.getByRole("heading", { level: 3, name: "Tall overlay" })).toBeInTheDocument()
  })

  it("keeps each example in an error boundary", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const { user } = renderDocs("#/components/button")
    expect(await screen.findByText("boom from example")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("This example crashed")
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2, name: "API reference" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(await screen.findByText("boom from example")).toBeInTheDocument()
  })

  it("gives the Code tab the exact raw text of the example file", async () => {
    const { user } = renderDocs("#/components/button")
    await screen.findByRole("group", { name: "Basic button preview" })
    const tabs = screen.getByRole("tablist", { name: "Basic button: preview or code" })
    const preview = within(tabs).getByRole("tab", { name: "Preview" })
    const code = within(tabs).getByRole("tab", { name: "Code" })
    expect(preview).toHaveAttribute("aria-selected", "true")
    expect(screen.queryByRole("group", { name: "Code: examples/button/01-basic.tsx" })).toBeNull()

    await user.click(code)
    expect(code).toHaveAttribute("aria-selected", "true")
    const block = await screen.findByRole("group", { name: "Code: examples/button/01-basic.tsx" })
    expect(block.textContent).toBe(trimmed(basicSource))
    expect(block.querySelectorAll('[data-slot="code-line"]').length).toBe(trimmed(basicSource).split("\n").length)
    expect(block.querySelector('[class~="text-(--ll-code-keyword)"]')).not.toBeNull()
    expect(document.getElementById(code.getAttribute("aria-controls")!)!.firstElementChild).not.toHaveAttribute("hidden")
    expect(document.getElementById(preview.getAttribute("aria-controls")!)!.firstElementChild).toHaveAttribute("hidden")

    await user.click(preview)
    expect(screen.getByRole("group", { name: "Basic button preview" })).toBeVisible()
    expect(screen.getByRole("group", { name: "Code: examples/button/01-basic.tsx", hidden: true })).toBeInTheDocument()
  })

  it("supports arrow-key navigation between Preview and Code", async () => {
    const { user } = renderDocs("#/components/button")
    await screen.findByRole("group", { name: "Basic button preview" })
    const tabs = screen.getByRole("tablist", { name: "Basic button: preview or code" })
    const [preview, code] = within(tabs).getAllByRole("tab")
    preview!.focus()
    await user.keyboard("{ArrowRight}")
    expect(code).toHaveFocus()
    expect(code).toHaveAttribute("aria-selected", "true")
    expect(code).toHaveAttribute("tabindex", "0")
    expect(preview).toHaveAttribute("tabindex", "-1")
    await user.keyboard("{Home}")
    expect(preview).toHaveFocus()
    await user.keyboard("{End}")
    expect(code).toHaveFocus()
  })

  it("copies code to the clipboard and says so", async () => {
    const { user } = renderDocs("#/components/card")
    const block = screen.getByRole("group", { name: "Code: Terminal" }).closest("figure")!
    await user.click(within(block).getByRole("button", { name: "Copy code" }))
    expect(await navigator.clipboard.readText()).toBe("npx shadcn@latest add @looseleaf/card")
    await waitFor(() => expect(within(block).getByRole("status")).toHaveTextContent("Copied"))
    expect(within(block).getByRole("button", { name: "Copy code" })).toHaveTextContent("copied")
  })

  it("shows the install box with registry data, package managers and a manual tab", async () => {
    const { user } = renderDocs("#/components/button")
    const cli = screen.getByRole("tablist", { name: "Installation method" })
    expect(within(cli).getAllByRole("tab").map((t) => t.textContent)).toEqual(["CLI", "Manual"])
    expect(screen.getByRole("tablist", { name: "Package manager" })).toBeInTheDocument()
    expect(screen.getByRole("group", { name: "Code: Terminal" })).toHaveTextContent("npx shadcn@latest add @looseleaf/button")

    await user.click(screen.getByRole("tab", { name: "pnpm" }))
    expect(screen.getByRole("group", { name: "Code: Terminal" })).toHaveTextContent("pnpm dlx shadcn@latest add @looseleaf/button")

    expect(await screen.findByText("Also installs")).toBeInTheDocument()
    const summary = screen.getByText("Also installs").closest("dl")!
    expect(within(summary).getByText("ink")).toBeInTheDocument()
    expect(within(summary).queryByText("looseleaf-theme")).toBeNull()
    expect(within(summary).getByText("radix-ui")).toBeInTheDocument()
    expect(within(summary).getByText("class-variance-authority")).toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: "Manual" }))
    expect(await screen.findByRole("button", { name: "Show button.tsx" })).toHaveAttribute("aria-expanded", "false")
    expect(screen.getAllByRole("group", { name: "Code: Terminal" }).some((g) => g.textContent === "pnpm add radix-ui class-variance-authority")).toBe(true)
    expect(screen.queryByRole("group", { name: "Code: components/ui/button.tsx" })).toBeNull()
    await user.click(screen.getByRole("button", { name: "Show button.tsx" }))
    expect(screen.getByRole("group", { name: "Code: components/ui/button.tsx" }).textContent).toBe(trimmed(buttonSource))
  })

  it("infers dependencies from the ui source when there is no registry.json", async () => {
    const { user } = renderDocs("#/components/button", fixtureCatalog({ registry: {} }))
    await user.click(screen.getByRole("tab", { name: "Manual" }))
    await screen.findByRole("button", { name: "Show button.tsx" })
    expect(screen.getAllByRole("group", { name: "Code: Terminal" }).some((g) => g.textContent === "npm install class-variance-authority radix-ui")).toBe(true)
  })

  it("keeps the CLI tab honest for components without a ui file", async () => {
    renderDocs("#/components/card")
    expect(screen.getByRole("group", { name: "Code: Terminal" })).toHaveTextContent("@looseleaf/card")
    expect(screen.queryByText("Also installs")).toBeNull()
  })

  it("renders usage, API tables, accessibility notes, related links and prev/next", async () => {
    renderDocs("#/components/button")
    expect(screen.getByRole("group", { name: "Code: button.tsx" })).toHaveTextContent('import { Button } from "@/components/ui/button"')

    const api = screen.getByRole("region", { name: "API reference" })
    expect(within(api).getByRole("heading", { level: 3, name: "Button" })).toHaveAttribute("id", "api-button")
    const table = within(api).getByRole("table", { name: "Button props" })
    const rows = within(table).getAllByRole("row")
    expect(rows).toHaveLength(3)
    expect(within(rows[1]!).getByRole("rowheader")).toHaveTextContent("variant")
    expect(within(rows[1]!).getByText('"default"')).toBeInTheDocument()
    expect(within(rows[2]!).getByRole("rowheader")).toHaveTextContent(/asChild.*\(required\)/)
    expect(within(rows[2]!).getByLabelText("no default")).toBeInTheDocument()

    expect(screen.getByText("Renders a native button, so Enter and Space activate it.")).toBeInTheDocument()

    const related = screen.getByRole("region", { name: "Related" })
    expect(within(related).getByRole("link", { name: "Card" })).toHaveAttribute("href", "#/components/card")
    expect(within(related).getByText("not-written-yet").closest("a")).toBeNull()
    expect(within(related).getByText("(not documented yet)")).toBeInTheDocument()

    const pager = screen.getByRole("navigation", { name: "Previous and next component" })
    expect(within(pager).getByRole("link", { name: /Next\s*Date Picker/ })).toHaveAttribute("href", "#/components/date-picker")
    expect(within(pager).queryByRole("link", { name: /Previous/ })).toBeNull()
  })

  it("lists an 'On this page' rail and per-part anchors that scroll", async () => {
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll
    renderDocs("#/components/card#api-cardheader")
    const toc = screen.getByRole("navigation", { name: "On this page" })
    expect(within(toc).getAllByRole("link").map((a) => a.textContent)).toEqual(["Preview", "Installation", "Usage", "API reference", "Related"])
    expect(within(toc).getByRole("link", { name: "Usage" })).toHaveAttribute("href", "#/components/card#usage")
    await waitFor(() => expect(scroll).toHaveBeenCalled())
    expect(document.getElementById("api-cardheader")).toHaveFocus()
  })

  it("shows an empty state for a component without examples or a ui file", async () => {
    const { user } = renderDocs("#/components/input")
    expect(await screen.findByText("No examples yet")).toBeInTheDocument()
    await user.click(screen.getByRole("tab", { name: "Manual" }))
    expect(screen.getByText("Nothing beyond React and the utilities below.")).toBeInTheDocument()
    expect(screen.getByText("The source file is not part of this build.")).toBeInTheDocument()
  })

  it("suggests the closest component for an unknown slug", () => {
    renderDocs("#/components/buton")
    expect(screen.getByRole("heading", { level: 1, name: "We could not find that component" })).toBeInTheDocument()
    expect(within(screen.getByRole("main")).getByRole("link", { name: "Button" })).toHaveAttribute("href", "#/components/button")
    expect(document.title).toBe("Component not found — Looseleaf")
  })
})

describe("home content slots", () => {
  const content = (key: string, text: string) => ({ [`/tests/docs-fixtures/content/${key}.tsx`]: async () => ({ default: () => <p>{text}</p> }) })

  it("adds hero art when content/home-hero.tsx exists", async () => {
    renderDocs("#/", fixtureCatalog({ content: { ...fixtureSources().content, ...content("home-hero", "Hero doodle") } }))
    expect(await screen.findByText("Hero doodle")).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1, name: "Looseleaf" })).toBeInTheDocument()
  })

  it("replaces the whole home page when content/home.tsx exists", async () => {
    renderDocs("#/", fixtureCatalog({ content: content("home", "A completely custom home") }))
    expect(await screen.findByText("A completely custom home")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { level: 1, name: "Looseleaf" })).toBeNull()
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)))
    expect(screen.queryByRole("contentinfo")).toBeNull()
  })
})

describe("components overview", () => {
  it("groups the grid by category and filters with the fuzzy matcher", async () => {
    const { user } = renderDocs("#/components")
    const forms = screen.getByRole("region", { name: "Forms" })
    const tiles = [...forms.querySelectorAll(".dk-tile")].map((a) => a.textContent)
    expect(tiles).toEqual([expect.stringContaining("Date Picker"), expect.stringContaining("Input")])
    expect(within(forms).getByText("2")).toBeInTheDocument()
    await user.type(screen.getByRole("searchbox", { name: "Filter components" }), "pick")
    const main = screen.getByRole("main")
    expect(within(main).getByRole("status")).toHaveTextContent("1 match")
    expect(within(main).getByRole("link", { name: /Date Picker/ })).toBeInTheDocument()
    expect(within(main).queryByRole("link", { name: /^Card/ })).toBeNull()
    expect(within(main).queryByRole("link", { name: /^Input/ })).toBeNull()
    await user.clear(screen.getByRole("searchbox", { name: "Filter components" }))
    await user.type(screen.getByRole("searchbox", { name: "Filter components" }), "zzz")
    expect(within(main).getByRole("status")).toHaveTextContent('No component matches "zzz".')
  })
})

describe("foundations", () => {
  it("shows a placeholder with facts, and live token swatches or font specimens", () => {
    renderDocs("#/foundations/colour")
    expect(screen.getByRole("heading", { level: 1, name: "Colour" })).toBeInTheDocument()
  })

  it("renders the placeholder when no content module exists", () => {
    renderDocs("#/foundations/typography")
    expect(screen.getByText("This page is still being drawn")).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2, name: "In brief" })).toBeInTheDocument()
    expect(screen.getAllByText("IBM Plex Mono", { exact: false }).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Sphinx of black quartz/)).toHaveLength(4)
    expect(screen.getByRole("navigation", { name: "Previous and next foundation" })).toHaveTextContent("Pens")
  })

  it("lets a content module replace the placeholder body", async () => {
    renderDocs("#/foundations/colour")
    expect(await screen.findByText("Hand-written colour page body")).toBeInTheDocument()
    expect(screen.queryByText("This page is still being drawn")).toBeNull()
  })

  it("draws swatches from tokens when there is no content module", () => {
    renderDocs("#/foundations/colour", fixtureCatalog({ content: {} }))
    expect(document.querySelectorAll(".dk-swatch")).toHaveLength(22)
    const chip = document.querySelector<HTMLElement>(".dk-swatch-chip")!
    expect(chip.getAttribute("style")).toContain("var(--ll-paper)")
  })

  it("has a principles page first, so the why comes before the what", () => {
    renderDocs("#/foundations/principles", fixtureCatalog({ content: {} }))
    expect(screen.getByRole("heading", { level: 1, name: "Principles" })).toBeInTheDocument()
    expect(document.body).toHaveTextContent("Ten laws decide")
    const pager = screen.getByRole("navigation", { name: "Previous and next foundation" })
    expect(within(pager).getByRole("link", { name: /Colour/ })).toHaveAttribute("href", "#/foundations/colour")
    expect(within(pager).queryByRole("link", { name: /Previous/ })).toBeNull()
  })

  it("has an index of all eleven topics and a not-found for unknown ones", () => {
    const { unmount } = renderDocs("#/foundations")
    expect(within(screen.getByRole("main")).getAllByRole("link")).toHaveLength(11)
    unmount()
    renderDocs("#/foundations/zzz")
    expect(screen.getByRole("heading", { level: 1, name: "We could not find that foundation" })).toBeInTheDocument()
  })
})

describe("getting started", () => {
  it("covers registry install, manual install, fonts, tokens and the provider", () => {
    renderDocs("#/getting-started")
    for (const name of ["Requirements", "Install with the registry", "Manual installation", "Fonts", "Tokens", "Provider", "Next steps"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument()
    }
    expect(document.body).toHaveTextContent('npx shadcn@latest registry add "@looseleaf=https://kevintngo.github.io/looseleaf/r/{name}.json"')
    expect(document.body).toHaveTextContent("npx shadcn@latest add @looseleaf/looseleaf")
    expect(screen.getByRole("navigation", { name: "On this page" })).toBeInTheDocument()
  })

  it("remembers the package manager across the site", async () => {
    const { user } = renderDocs("#/getting-started")
    await user.click(screen.getAllByRole("tab", { name: "bun" })[0]!)
    expect(document.body).toHaveTextContent("bunx --bun shadcn@latest init")
    expect(window.localStorage.getItem("looseleaf-docs:pm")).toBe("bun")
    act(() => {
      window.location.hash = "#/components/card"
    })
    await waitFor(() => expect(screen.getByRole("group", { name: "Code: Terminal" })).toHaveTextContent("bunx --bun shadcn@latest add @looseleaf/card"))
  })
})

describe("blocks", () => {
  it("shows a preview on plain paper, or on the desk when the block's meta says so", async () => {
    const first = renderDocs("#/blocks/login")
    expect(await screen.findByRole("group", { name: "Sign in preview" })).not.toHaveClass("ll-desk")
    first.unmount()

    const key = "/tests/docs-fixtures/content/blocks/login.meta.ts"
    const blockMeta = { ...fixtureSources().blockMeta, [key]: { default: { title: "Sign in", surface: "desk" } } }
    renderDocs("#/blocks/login", fixtureCatalog({ blockMeta }))
    expect(await screen.findByRole("group", { name: "Sign in preview" })).toHaveClass("ll-desk")
  })

  it("lists blocks with their metadata", () => {
    renderDocs("#/blocks")
    const link = within(screen.getByRole("main")).getByRole("link", { name: /Sign in/ })
    expect(link).toHaveAttribute("href", "#/blocks/login")
    expect(link).toHaveTextContent("An email and password form")
    expect(link).toHaveTextContent("auth")
  })

  it("shows a live preview, the install command and the source files", async () => {
    const { user } = renderDocs("#/blocks/login")
    expect(screen.getByRole("heading", { level: 1, name: "Sign in" })).toBeInTheDocument()
    expect(await screen.findByText("Login block preview")).toBeInTheDocument()
    expect(screen.getByRole("group", { name: "Sign in preview" })).toHaveAttribute("data-layout", "full")
    expect(screen.getByRole("group", { name: "Code: Terminal" })).toHaveTextContent("@looseleaf/login")
    const files = screen.getByRole("tablist", { name: "Sign in files" })
    expect(within(files).getAllByRole("tab").map((t) => t.textContent)).toEqual(["index.tsx", "login-form.tsx"])
    expect(await screen.findByRole("group", { name: "Code: blocks/login/index.tsx" })).toHaveTextContent("LoginBlock")
    await user.click(within(files).getByRole("tab", { name: "login-form.tsx" }))
    expect(await screen.findByRole("group", { name: "Code: blocks/login/login-form.tsx" })).toHaveTextContent("LoginForm")
  })

  it("has a not-found page for an unknown block", () => {
    renderDocs("#/blocks/nothing")
    expect(screen.getByRole("heading", { level: 1, name: "We could not find that block" })).toBeInTheDocument()
  })
})

describe("empty tree", () => {
  const empty = () => createCatalog({})

  it("renders sensible empty states everywhere", async () => {
    const { unmount } = renderDocs("#/", empty())
    expect(await screen.findByText("The library is still being drawn")).toBeInTheDocument()
    expect(within(docNav()).getByText("No components yet")).toBeInTheDocument()
    expect(within(docNav()).getByText("No blocks yet")).toBeInTheDocument()
    unmount()

    const second = renderDocs("#/components", empty())
    expect(await screen.findByText("No components yet", { selector: ".dk-empty-title" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1, name: "Components" })).toBeInTheDocument()
    second.unmount()

    renderDocs("#/blocks", empty())
    expect(await screen.findByText("No blocks yet", { selector: ".dk-empty-title" })).toBeInTheDocument()
  })

  it("still searches pages and foundations", async () => {
    const { user } = renderDocs("#/", empty())
    await user.keyboard("{Control>}k{/Control}")
    await user.keyboard("typography")
    expect(await screen.findByRole("option", { name: /Typography/ })).toBeInTheDocument()
  })
})

describe("command palette", () => {
  it("opens with Ctrl+K, keeps focus inside, and closes with Escape returning focus", async () => {
    const { user } = renderDocs("#/")
    const trigger = screen.getByRole("button", { name: /^Search/ })
    trigger.focus()
    await user.keyboard("{Control>}k{/Control}")
    const dialog = await screen.findByRole("dialog", { name: "Search documentation" })
    const input = within(dialog).getByRole("combobox")
    expect(input).toHaveFocus()

    await user.tab()
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
    await user.tab({ shift: true })
    expect(dialog).toContainElement(document.activeElement as HTMLElement)

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog", { name: "Search documentation" })).toBeNull()
    expect(trigger).toHaveFocus()
  })

  it("toggles with Meta+K and opens with the slash key outside inputs", async () => {
    const { user } = renderDocs("#/")
    await user.keyboard("{Meta>}k{/Meta}")
    expect(await screen.findByRole("dialog", { name: "Search documentation" })).toBeInTheDocument()
    await user.keyboard("{Meta>}k{/Meta}")
    expect(screen.queryByRole("dialog", { name: "Search documentation" })).toBeNull()
    await user.keyboard("/")
    expect(await screen.findByRole("dialog", { name: "Search documentation" })).toBeInTheDocument()
    await user.keyboard("/")
    expect(screen.getAllByRole("dialog")).toHaveLength(1)
  })

  it("does not steal the slash key from other inputs", async () => {
    const { user } = renderDocs("#/components")
    await user.type(screen.getByRole("searchbox", { name: "Filter components" }), "a/b")
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.getByRole("searchbox", { name: "Filter components" })).toHaveValue("a/b")
  })

  it("ranks results, navigates with the arrow keys and Enter, and closes", async () => {
    const { user } = renderDocs("#/")
    await user.click(screen.getByRole("button", { name: /^Search/ }))
    const input = await screen.findByRole("combobox")
    await user.type(input, "card")

    const options = screen.getAllByRole("option")
    expect(options[0]).toHaveTextContent("Card")
    expect(options[0]).toHaveAttribute("aria-selected", "true")
    expect(options[1]).toHaveTextContent("CardHeader")
    expect(document.body).toHaveTextContent(/\d+ results?/)
    await waitFor(() => expect(input).toHaveAttribute("aria-activedescendant", options[0]!.id))

    await user.keyboard("{ArrowDown}")
    expect(options[1]).toHaveAttribute("aria-selected", "true")
    expect(input).toHaveAttribute("aria-activedescendant", options[1]!.id)
    await user.keyboard("{ArrowUp}{ArrowUp}")
    expect(screen.getAllByRole("option").at(-1)).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{ArrowDown}{ArrowDown}")

    await user.keyboard("{Enter}")
    expect(screen.queryByRole("dialog")).toBeNull()
    await waitFor(() => expect(window.location.hash).toBe("#/components/card#api-cardheader"))
  })

  it("navigates on click and highlights matched characters", async () => {
    const { user } = renderDocs("#/")
    await user.keyboard("{Control>}k{/Control}")
    await user.type(await screen.findByRole("combobox"), "datepick")
    const option = await screen.findByRole("option", { name: /Date Picker/ })
    expect(option.querySelectorAll("mark").length).toBeGreaterThan(0)
    await user.click(option)
    await waitFor(() => expect(window.location.hash).toBe("#/components/date-picker"))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("explains an empty result set and offers suggestions before typing", async () => {
    const { user } = renderDocs("#/")
    await user.keyboard("{Control>}k{/Control}")
    expect(screen.getByRole("listbox", { name: "Suggestions" })).toBeInTheDocument()
    expect(screen.getAllByRole("option").length).toBeGreaterThan(3)
    await user.type(await screen.findByRole("combobox"), "qqqqzzzz")
    expect(screen.queryAllByRole("option")).toHaveLength(0)
    expect(await screen.findByText(/Nothing matches "qqqqzzzz"/)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-activedescendant"))
  })

  it("closes from the backdrop", async () => {
    const { user } = renderDocs("#/")
    await user.keyboard("{Control>}k{/Control}")
    const backdrop = document.querySelector("[data-slot=dialog-overlay]")!
    await user.pointer({ keys: "[MouseLeft]", target: backdrop })
    expect(screen.queryByRole("dialog")).toBeNull()
  })
})

describe("previous and next keys", () => {
  it("[ and ] walk the pager, and leave text fields and open dialogs alone", async () => {
    const { user } = renderDocs("#/components/date-picker")
    await user.keyboard("]")
    await waitFor(() => expect(window.location.hash).toBe("#/components/input"))
    await user.keyboard("[[")
    await waitFor(() => expect(window.location.hash).toBe("#/components/date-picker"))

    await user.keyboard("{Control>}k{/Control}")
    await user.keyboard("]")
    expect(window.location.hash).toBe("#/components/date-picker")
    expect(await screen.findByRole("combobox")).toHaveValue("]")
  })
})

describe("mobile navigation", () => {
  const width = window.innerWidth
  const narrow = () => Object.defineProperty(window, "innerWidth", { configurable: true, value: 500 })
  afterEach(() => Object.defineProperty(window, "innerWidth", { configurable: true, value: width }))

  it("opens the pad as a sheet, starts on the current page, closes on Escape and after navigating", async () => {
    narrow()
    const { user } = renderDocs("#/components/button")
    const menu = screen.getByRole("button", { name: "Menu" })
    expect(menu).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull()
    expect(screen.queryByRole("navigation", { name: "Documentation" })).toBeNull()

    await user.click(menu)
    const sheet = screen.getByRole("dialog", { name: "Menu" })
    expect(menu).toHaveAttribute("aria-expanded", "true")
    expect(within(sheet).getByRole("navigation", { name: "Documentation" })).toBeInTheDocument()
    expect(within(sheet).getByRole("link", { name: "Button" })).toHaveFocus()

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull()
    expect(screen.getByRole("button", { name: "Menu" })).toHaveFocus()

    await user.click(screen.getByRole("button", { name: "Menu" }))
    await user.click(within(screen.getByRole("dialog", { name: "Menu" })).getByRole("link", { name: "Input" }))
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull())
    expect(screen.getByRole("heading", { level: 1, name: "Input" })).toBeInTheDocument()
  })

  it("hides and shows the pad on a wide screen with the toolbar button and Ctrl+B", async () => {
    const { user } = renderDocs("#/components/button")
    expect(docNav()).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Hide navigation" }))
    expect(screen.queryByRole("navigation", { name: "Documentation" })).toBeNull()
    await user.keyboard("{Control>}b{/Control}")
    expect(docNav()).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Hide navigation" })).toHaveAttribute("aria-expanded", "true")
  })
})

describe("display settings", () => {
  it("applies density and motion to <html> and remembers them", async () => {
    const { user, unmount } = renderDocs("#/")
    expect(document.documentElement).toHaveAttribute("data-density", "comfortable")
    await user.click(screen.getByRole("button", { name: "Display settings" }))
    await user.click(screen.getByRole("radio", { name: "Compact" }))
    await user.click(screen.getByRole("radio", { name: "Reduced" }))
    expect(document.documentElement).toHaveAttribute("data-density", "compact")
    expect(document.documentElement).toHaveAttribute("data-motion", "reduced")
    expect(window.localStorage.getItem("looseleaf-docs:density")).toBe("compact")

    await user.click(screen.getByRole("radio", { name: "Follow system" }))
    expect(document.documentElement).not.toHaveAttribute("data-motion")

    unmount()
    document.documentElement.removeAttribute("data-density")
    renderDocs("#/")
    expect(document.documentElement).toHaveAttribute("data-density", "compact")
  })

  it("puts things on the desk, and takes them off again", async () => {
    const { user } = renderDocs("#/")
    expect(document.querySelector('[data-slot="desk-objects"]')).not.toBeNull()
    await user.click(screen.getByRole("button", { name: "Display settings" }))
    const knob = screen.getByRole("switch", { name: "Things on the desk" })
    expect(knob).toBeChecked()
    await user.click(knob)
    expect(document.querySelector('[data-slot="desk-objects"]')).toBeNull()
    expect(window.localStorage.getItem("looseleaf-docs:desk-clutter")).toBe("off")
  })

  it("closes the settings panel with Escape and hands focus back", async () => {
    const { user } = renderDocs("#/")
    const button = screen.getByRole("button", { name: "Display settings" })
    await user.click(button)
    expect(button).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("dialog", { name: "Display settings" })).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(button).toHaveAttribute("aria-expanded", "false")
    expect(button).toHaveFocus()
  })

  it("keeps working when storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    const { user } = renderDocs("#/")
    await user.click(screen.getByRole("button", { name: "Display settings" }))
    await user.click(screen.getByRole("radio", { name: "Calm" }))
    expect(document.documentElement).toHaveAttribute("data-density", "calm")
  })
})

describe("accessibility (axe)", () => {
  const pageRules = { region: { enabled: true } }

  it("home has no violations", async () => {
    renderDocs("#/")
    await axeCheck(document.body, { rules: pageRules })
  })

  it("getting started has no violations", async () => {
    renderDocs("#/getting-started")
    await axeCheck(document.body, { rules: pageRules })
  })

  it("a component page with live, code and failing examples has no violations", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const { user } = renderDocs("#/components/button")
    await screen.findByText("boom from example")
    await user.click(screen.getAllByRole("tab", { name: "Code" })[0]!)
    await screen.findByRole("group", { name: "Code: examples/button/01-basic.tsx" })
    await user.click(screen.getByRole("tab", { name: "Manual" }))
    await axeCheck(document.body, { rules: pageRules })
  })

  it("foundations, components overview, blocks and not-found have no violations", async () => {
    for (const hash of ["#/foundations/colour", "#/foundations/typography", "#/components", "#/blocks", "#/blocks/login", "#/nope", "#/changelog", "#/playground"]) {
      const { unmount } = renderDocs(hash)
      await screen.findByRole("heading", { level: 1 })
      await axeCheck(document.body, { rules: pageRules })
      unmount()
    }
  })

  it("the open command palette has no violations", async () => {
    const { user } = renderDocs("#/")
    await user.keyboard("{Control>}k{/Control}")
    await user.type(await screen.findByRole("combobox"), "card")
    await axeCheck(document.body)
  })

  it("the settings panel has no violations", async () => {
    const { user } = renderDocs("#/components/card")
    await user.click(screen.getByRole("button", { name: "Display settings" }))
    await axeCheck(document.body)
  })

  it("the phone menu and the source sheet have no violations", async () => {
    const width = window.innerWidth
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 500 })
    try {
      const phone = renderDocs("#/components/button")
      await phone.user.click(screen.getByRole("button", { name: "Menu" }))
      await axeCheck(document.body)
      await phone.user.keyboard("{Escape}")
      phone.unmount()
    } finally {
      Object.defineProperty(window, "innerWidth", { configurable: true, value: width })
    }
    const { user } = renderDocs("#/components/button")
    await user.click(screen.getByRole("button", { name: "View source" }))
    await screen.findByRole("group", { name: "Code: components/ui/button.tsx" })
    await axeCheck(document.body)
  })
})
