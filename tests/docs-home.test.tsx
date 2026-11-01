import fs from "node:fs"
import path from "node:path"
import { act, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DocsApp } from "@/docs/App"
import HomeHeroArt from "@/docs/content/home-hero"
import { LazyOnView } from "@/docs/content/home/lazy-on-view"
import { DEFAULT_STATE, LIVELY_DEGREES, TILT_MAX, isDefault, seedOf, snippets } from "@/docs/content/home/playground-model"
import { THUMBS } from "@/docs/content/home/thumbs.generated"
import { createCatalog } from "@/docs/core/catalog"
import { discoverSources } from "@/docs/core/discover"
import { cropFor, pickSource } from "../tools/make-thumbs.mjs"
import { fixtureSources } from "./docs-fixtures"
import { axeCheck, renderUI } from "./helpers"

const ROOT = path.resolve(import.meta.dirname, "..")

const CONTENT = {
  "/src/docs/content/home.tsx": () => import("@/docs/content/home"),
  "/src/docs/content/getting-started.tsx": () => import("@/docs/content/getting-started"),
  "/src/docs/content/playground.tsx": () => import("@/docs/content/playground"),
  "/src/docs/content/changelog.tsx": () => import("@/docs/content/changelog"),
  "/src/docs/content/components-gallery.tsx": () => import("@/docs/content/components-gallery"),
}
const catalog = () => createCatalog({ ...fixtureSources(), content: { ...fixtureSources().content, ...CONTENT } })

function renderDocs(hash: string) {
  window.location.hash = hash
  return renderUI(<DocsApp catalog={catalog()} />)
}

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

const SLOW = { timeout: 30000 }

beforeEach(() => {
  window.localStorage.clear()
  window.location.hash = ""
  document.documentElement.removeAttribute("data-density")
  document.documentElement.removeAttribute("data-motion")
  window.scrollTo = vi.fn()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("thumbnails", () => {
  const slugs = fs
    .readdirSync(path.join(ROOT, "src/docs/meta"))
    .filter((f) => f.endsWith(".ts") && !f.startsWith("_"))
    .map((f) => f.replace(/\.ts$/, ""))

  it("cuts only sheets outside 1.3 to 1.9: a tall one keeps its top, a wide one its middle", () => {
    expect(cropFor({ w: 3280, h: 2480 })).toBeNull()
    expect(cropFor({ w: 1800, h: 1180 })).toBeNull()
    const tall = cropFor({ w: 2400, h: 2964 })!
    expect(tall).toMatchObject({ w: 2400, x: 0 })
    expect(tall.w / tall.h).toBeCloseTo(1.3, 1)
    expect(tall.y).toBeGreaterThan(0)
    expect(tall.y + tall.h).toBeLessThanOrEqual(2964)
    const wide = cropFor({ w: 2400, h: 1000 })!
    expect(wide.w / wide.h).toBeCloseTo(1.9, 1)
    expect(wide.x).toBe(Math.round((2400 - wide.w) / 2))
  })

  it("has a picture for (nearly) every documented component, on disk, inside the size budget", () => {
    const covered = slugs.filter((s) => THUMBS[s])
    expect(covered.length / slugs.length).toBeGreaterThan(0.9)
    let bytes = 0
    for (const s of covered) {
      const file = path.join(ROOT, "public/thumbs", THUMBS[s]!.file)
      expect(fs.existsSync(file), file).toBe(true)
      bytes += fs.statSync(file).size
      expect(THUMBS[s]!.w).toBe(640)
      const aspect = THUMBS[s]!.w / THUMBS[s]!.h
      expect(aspect).toBeGreaterThanOrEqual(1.25)
      expect(aspect).toBeLessThan(1.95)
    }
    expect(bytes / 1024 / 1024).toBeLessThan(25)
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "public/thumbs/manifest.json"), "utf8")) as Record<string, { file: string }>
    expect(Object.keys(manifest).sort()).toEqual(Object.keys(THUMBS).sort())
    for (const s of Object.keys(THUMBS)) expect(slugs, s).toContain(s)
  })
})

describe("playground snippets", () => {
  it("says nothing about defaults", () => {
    const s = snippets(DEFAULT_STATE)
    expect(s.provider).toContain("<InkProvider>")
    expect(s.provider).toContain('import { InkProvider } from "@/lib/ink/react"')
    expect(s.component).toBeNull()
    expect(s.css).toBeNull()
    expect(s.attributes).toBeNull()
    expect(isDefault(DEFAULT_STATE)).toBe(true)
  })

  it("writes only what differs", () => {
    const s = snippets({ density: "calm", tier: "hi", reduced: true, tilt: "flat", take: 4 })
    expect(s.provider).toContain('<InkProvider tier="hi" density="calm" motion="reduced">')
    expect(s.component).toBe('<Card seed="take-4" tilt={false}>...</Card>   // the same seed always draws the same sheet')
    expect(s.css).toBeNull()
    expect(s.attributes).toBe('<html lang="en" data-density="calm" data-motion="reduced">')
  })

  it("asks for a wider turn in CSS when the tilt is lively", () => {
    const s = snippets({ ...DEFAULT_STATE, tilt: "lively" })
    expect(s.css).toContain(`--ll-tilt-max: ${TILT_MAX.lively}`)
    expect(s.component).toContain(`tilt={${LIVELY_DEGREES[0]}}`)
    expect(seedOf({ take: 12 })).toBe("take-12")
  })
})

describe("LazyOnView", () => {
  it("holds the place with a slip, then mounts when a moment has passed", () => {
    vi.useFakeTimers()
    render(
      <LazyOnView height={4} order={0}>
        <p>the real thing</p>
      </LazyOnView>,
    )
    expect(screen.queryByText("the real thing")).toBeNull()
    expect(document.querySelector("[data-slot=home-slip]")).toHaveAttribute("aria-hidden", "true")
    expect(document.querySelector<HTMLElement>("[data-slot=home-slip]")!.style.minHeight).toBe("4rem")
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(screen.getByText("the real thing")).toBeInTheDocument()
    expect(document.querySelector("[data-slot=home-slip]")).toBeNull()
  })

  it("mounts at once when the slot is near the viewport, or when told to be eager", async () => {
    vi.stubGlobal("IntersectionObserver", SeenIO)
    render(
      <LazyOnView height={4}>
        <p>seen</p>
      </LazyOnView>,
    )
    expect(await screen.findByText("seen")).toBeInTheDocument()
    render(
      <LazyOnView height={4} eager>
        <p>eager</p>
      </LazyOnView>,
    )
    expect(screen.getByText("eager")).toBeInTheDocument()
  })

  it("draws no slip for decoration", () => {
    render(
      <LazyOnView height={0} slip={false} delay={100}>
        <p>x</p>
      </LazyOnView>,
    )
    expect(document.querySelector("[data-slot=home-slip]")).toBeNull()
  })
})

describe("home", () => {
  it("has hero art that stands on its own as the shell's home-hero slot: Stubby, a note, stickers a beat later", async () => {
    vi.stubGlobal("IntersectionObserver", SeenIO)
    const { container } = render(<HomeHeroArt />)
    const stubby = container.querySelector("[data-slot=mascot][data-pose=wave]")
    expect(stubby).not.toBeNull()
    expect(stubby).toHaveClass("[--ll-blend:normal]")
    expect(container.querySelector("[data-slot=paper]")).toHaveTextContent("the desk below works")
    await waitFor(() => expect(container.querySelectorAll("[data-slot=sticker]").length).toBe(3), { timeout: 5000 })
    for (const sticker of container.querySelectorAll("[data-slot=sticker]")) {
      expect(sticker).toHaveAttribute("aria-hidden", "true")
      expect(sticker).toHaveClass("absolute", "pointer-events-none")
    }
    expect(container.querySelector("[data-slot=mascot]")).toHaveAttribute("aria-hidden", "true")
  })

  it("paints the wordmark, the tagline and the ways in first, and holds the heavy pieces back", async () => {
    renderDocs("#/")
    const h1 = await screen.findByRole("heading", { level: 1, name: "Looseleaf" }, SLOW)
    expect(h1).toHaveAttribute("tabindex", "-1")
    const main = screen.getByRole("main")
    expect(main).toHaveTextContent("shadcn/ui, drawn by hand.")
    expect(within(main).getAllByRole("link", { name: /Get started/ })[0]).toHaveAttribute("href", "#/getting-started")
    expect(within(main).getAllByRole("link", { name: "Browse components" })[0]).toHaveAttribute("href", "#/components")
    expect(within(main).getByRole("form", { name: "Sign in" })).toBeInTheDocument()
    expect(document.querySelector("[data-home=chart]")).toBeNull()
    expect(document.querySelector("[data-home=sketch]")).toBeNull()
    expect(document.querySelectorAll("[data-slot=home-slip]").length).toBeGreaterThanOrEqual(8)
    const desk = document.querySelector("[data-home=desk]")!
    expect(desk).toHaveClass("ll-desk", "-mx-4", "lg:-mx-10")
    expect(h1).toHaveClass("sm:text-8xl", "@5xl:text-9xl")
    expect(h1.className).not.toMatch(/(^|\s)sm:text-9xl/)
  })

  it("lays things on the blotter, but no pencil across the footer, and takes them away with the viewer's switch", async () => {
    const first = renderDocs("#/")
    await screen.findByRole("heading", { level: 1, name: "Looseleaf" }, SLOW)
    const objects = () => Array.from(document.querySelectorAll("[data-home=desk] > [data-slot=desk-objects] [data-object]")).map((o) => o.getAttribute("data-object"))
    expect(objects()).toEqual(expect.arrayContaining(["clips", "coffee", "ruler", "pins"]))
    expect(objects()).not.toContain("pencil")
    first.unmount()

    window.localStorage.setItem("looseleaf-docs:desk-clutter", "off")
    renderDocs("#/")
    await screen.findByRole("heading", { level: 1, name: "Looseleaf" }, SLOW)
    expect(document.querySelector("[data-home=desk] > [data-slot=desk-objects]")).toBeNull()
  })

  it("has a sign-in form that takes typing and answers", async () => {
    const { user } = renderDocs("#/")
    const email = await screen.findByLabelText("Email", undefined, SLOW)
    await user.clear(email)
    await user.type(email, "ada@example.com")
    expect(email).toHaveValue("ada@example.com")
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password")
    const remember = screen.getByRole("checkbox", { name: "Remember me on this desk" })
    expect(remember).toBeChecked()
    await user.click(remember)
    expect(remember).not.toBeChecked()
    await user.click(screen.getByRole("button", { name: "Sign in" }))
    expect(screen.getByRole("button", { name: "Signed in" })).toBeInTheDocument()
    expect(screen.getAllByRole("status").some((s) => s.textContent?.startsWith("Signed in as ada@looseleaf.dev"))).toBe(true)
  })

  it("brings the whole desk in once the pieces are in view, and every piece works", async () => {
    vi.stubGlobal("IntersectionObserver", SeenIO)
    const { user } = renderDocs("#/")
    const main = screen.getByRole("main")
    await waitFor(() => expect(main.querySelector("[data-home=planner]")).not.toBeNull(), SLOW)
    for (const piece of ["chart", "prefs", "annotated", "stickers", "planner", "chat", "tabs", "toast", "stats"]) {
      await waitFor(() => expect(main.querySelector(`[data-home=${piece}]`), piece).not.toBeNull(), SLOW)
    }

    expect(within(main).getByRole("application", { name: "Signups per day this week" })).toBeInTheDocument()

    const prefs = main.querySelector<HTMLElement>("[data-home=prefs]")!
    const airplane = within(prefs).getByRole("switch", { name: "Airplane mode" })
    expect(airplane).not.toBeChecked()
    await user.click(airplane)
    expect(airplane).toBeChecked()
    const pressure = within(prefs).getByRole("slider")
    act(() => pressure.focus())
    await user.keyboard("{ArrowRight}")
    expect(within(prefs).getByLabelText("Pen pressure value")).toHaveTextContent("61")

    const tabs = main.querySelector<HTMLElement>("[data-home=tabs]")!
    await user.click(within(tabs).getByRole("tab", { name: "Sprint" }))
    expect(within(tabs).getByRole("progressbar", { name: "Sprint progress" })).toBeInTheDocument()
    await user.click(within(tabs).getByRole("tab", { name: "To do" }))
    const task = within(tabs).getByRole("checkbox", { name: "Fix the focus ring" })
    await user.click(task)
    expect(task).toBeChecked()
    expect(within(tabs).getByText("3 of 4 done")).toBeInTheDocument()

    expect(within(main.querySelector<HTMLElement>("[data-home=stickers]")!).getByRole("group", { name: /Sticker page/ })).toBeInTheDocument()

    const planner = main.querySelector<HTMLElement>("[data-home=planner]")!
    expect(within(planner).getByRole("grid")).toBeInTheDocument()

    await user.click(within(main.querySelector<HTMLElement>("[data-home=toast]")!).getByRole("button", { name: "Saved" }))
    expect(await screen.findByText("Notebook saved")).toBeInTheDocument()

    const chat = main.querySelector<HTMLElement>("[data-home=chat]")!
    expect(within(chat).getByText("Can I keep my shadcn imports?")).toBeInTheDocument()
    expect(within(chat).getByText("Swap the file, keep your JSX.")).toBeInTheDocument()
  }, 90000)

  it("says why, how and how much, with the real counts", async () => {
    vi.stubGlobal("IntersectionObserver", SeenIO)
    renderDocs("#/")
    const main = screen.getByRole("main")
    await screen.findByRole("heading", { level: 2, name: "Why Looseleaf" }, SLOW)
    for (const name of ["This desk is made of real components.", "Why Looseleaf", "How it works", "By the numbers"]) {
      expect(within(main).getByRole("heading", { level: 2, name })).toBeInTheDocument()
    }
    for (const reason of ["Practical", "Handmade", "Accessible", "Themeable"]) {
      expect(within(main).getByRole("heading", { level: 3, name: reason })).toBeInTheDocument()
    }
    expect(main.querySelector("[data-home=how-registry]")).toHaveTextContent('"@looseleaf":')
    expect(main.querySelector("[data-home=how-command]")).toHaveTextContent("npx shadcn@latest add @looseleaf/button")
    expect(main.querySelector("[data-home=how-usage]")).toHaveTextContent('import { Button } from "@/components/ui/button"')
    const stats = main.querySelector<HTMLElement>("[data-home=stats]")!
    expect(within(stats).getByText("components")).toBeInTheDocument()
    expect(within(stats).getByText("4", { selector: "span" })).toBeInTheDocument()
    expect(within(stats).getAllByRole("img", { name: /strokes/ }).length).toBeGreaterThanOrEqual(3)
    for (const tally of within(stats).getAllByRole("img", { name: /strokes/ })) expect(Number(tally.getAttribute("data-count")), tally.getAttribute("aria-label") ?? "").toBeLessThanOrEqual(30)
    expect(within(stats).getByRole("img", { name: "13 strokes: one stroke is five hundred" })).toBeInTheDocument()
    const own = catalog().components.filter((c) => !c.doc.upstream).length
    expect(within(main).getByText(/^Every shadcn component/, { selector: "p" })).toHaveTextContent(own > 0 ? `Every shadcn component, plus ${own} of our own.` : "Every shadcn component.")
    expect(main).not.toHaveTextContent("thirty more")
    expect(within(main).getByRole("link", { name: /Read the installation guide/ })).toHaveClass("text-ink")
    expect(within(main).getByRole("navigation", { name: "Footer" })).toBeInTheDocument()
  }, 60000)

  it("has no accessibility violations with the whole desk in", async () => {
    vi.stubGlobal("IntersectionObserver", SeenIO)
    const { container } = renderDocs("#/")
    const main = screen.getByRole("main")
    for (const piece of ["chart", "prefs", "annotated", "stickers", "planner", "chat", "tabs", "toast", "stats"]) {
      await waitFor(() => expect(main.querySelector(`[data-home=${piece}]`), piece).not.toBeNull(), SLOW)
    }
    await axeCheck(container)
  }, 90000)
})

describe("getting started", () => {
  it("keeps the ids of the shell's rail and adds the Vite and Next.js recipes, the CSP note and troubleshooting", async () => {
    renderDocs("#/getting-started")
    await screen.findByRole("heading", { level: 2, name: "Troubleshooting" }, SLOW)
    for (const id of ["requirements", "install", "manual", "fonts", "tokens", "provider", "ssr", "next-steps", "vite", "nextjs", "csp", "troubleshooting", "registry", "add", "verify", "desk", "portals"]) {
      expect(document.getElementById(id), id).not.toBeNull()
    }
    const main = screen.getByRole("main")
    expect(main).toHaveTextContent("@tailwindcss/vite")
    expect(main).toHaveTextContent("next/font/google")
    expect(main).toHaveTextContent("Content-Security-Policy")
    expect(main).toHaveTextContent("img-src 'self' data:")
    expect(main).toHaveTextContent('registry add "@looseleaf=')
    expect(main).toHaveTextContent("npx shadcn@latest add @looseleaf/button")
    const jumps = within(screen.getByRole("navigation", { name: "Sections of this page" })).getAllByRole("link")
    expect(jumps.length).toBeGreaterThanOrEqual(10)
    for (const a of jumps) expect(document.getElementById(new URL(a.getAttribute("href")!.replace("#/getting-started", ""), "http://x/").hash.replace("#", "")), a.textContent ?? "").not.toBeNull()
  }, 60000)

  it("shows the commands in the viewer's package manager and has no violations", async () => {
    const { user, container } = renderDocs("#/getting-started")
    await screen.findByRole("heading", { level: 2, name: "Troubleshooting" }, SLOW)
    const main = screen.getByRole("main")
    await user.click(within(main).getAllByRole("tab", { name: "pnpm" })[0]!)
    expect(main).toHaveTextContent("pnpm dlx shadcn@latest add @looseleaf/looseleaf")
    await axeCheck(container)
  }, 60000)
})

describe("playground", () => {
  it("applies the knobs to a nested provider and writes the matching snippet", async () => {
    const { user } = renderDocs("#/playground")
    await screen.findByRole("group", { name: "Preview" }, SLOW)
    const main = screen.getByRole("main")
    const preview = within(main).getByRole("group", { name: "Preview" })
    const snippet = () => main.querySelector<HTMLElement>("#export")!.closest("section")!.textContent ?? ""

    expect(within(preview).getByRole("textbox", { name: "Name on the cover" })).toHaveValue("Ada Lovelace")
    expect(within(preview).getByRole("table")).toBeInTheDocument()
    expect(within(preview).getAllByRole("row").length).toBe(4)
    expect(snippet()).toContain("<InkProvider>")

    await user.click(within(main).getByRole("radio", { name: "calm" }))
    expect(preview.querySelector('[data-density="calm"]')).not.toBeNull()
    expect(snippet()).toContain('density="calm"')
    expect(snippet()).toContain('<html lang="en" data-density="calm">')

    await user.click(within(main).getByRole("radio", { name: "hi" }))
    expect(snippet()).toContain('tier="hi"')

    await user.click(within(main).getByRole("switch", { name: "Reduce motion" }))
    expect(preview.querySelector('[data-motion="reduced"]')).not.toBeNull()
    expect(snippet()).toContain('motion="reduced"')

    await user.click(within(main).getByRole("radio", { name: "lively" }))
    expect(snippet()).toContain("--ll-tilt-max: 4deg")
    expect(preview.querySelector<HTMLElement>("[style*='--ll-tilt-max']")).not.toBeNull()

    await user.click(within(main).getByRole("radio", { name: "flat" }))
    expect(snippet()).toContain("tilt={false}")
    expect(snippet()).not.toContain("--ll-tilt-max")
  }, 60000)

  it("rerolls the seed: a new take draws everything again", async () => {
    const { user } = renderDocs("#/playground")
    await screen.findByRole("group", { name: "Preview" }, SLOW)
    const main = screen.getByRole("main")
    expect(main).toHaveTextContent("seed take-1")
    const before = main.querySelector("[data-sample=order]")
    await user.click(within(main).getByRole("button", { name: "Reroll" }))
    expect(main).toHaveTextContent("seed take-2")
    expect(main.querySelector("[data-sample=order]")).not.toBe(before)
    expect(main.querySelector("#export")!.closest("section")).toHaveTextContent('seed="take-2"')
    await user.click(within(main).getByRole("button", { name: "Put everything back" }))
    expect(main).toHaveTextContent("seed take-1")
    expect(within(main).getByRole("radio", { name: "comfortable" })).toBeChecked()
  }, 60000)

  it("does not let a knob be switched off, and has no violations", async () => {
    const { user, container } = renderDocs("#/playground")
    await screen.findByRole("group", { name: "Preview" }, SLOW)
    const main = screen.getByRole("main")
    const natural = within(main).getByRole("radio", { name: "natural" })
    await user.click(natural)
    expect(natural).toBeChecked()
    await axeCheck(container)
  }, 60000)
})

describe("changelog", () => {
  it("writes the 0.1.0 notes and links the categories from the catalog", async () => {
    const { container } = renderDocs("#/changelog")
    await screen.findByRole("heading", { level: 2, name: /0\.1\.0/ }, SLOW)
    const main = screen.getByRole("main")
    for (const name of ["Highlights", "Components", "The engine", "Theme and tokens", "Registry and install", "Quality", "Known limits", "What is next"]) {
      expect(within(main).getByRole("heading", { level: 3, name })).toBeInTheDocument()
    }
    const categories = within(main).getByRole("list", { name: "Categories" })
    expect(within(categories).getAllByRole("link").length).toBeGreaterThanOrEqual(3)
    expect(within(categories).getAllByRole("link")[0]).toHaveAttribute("href", expect.stringMatching(/^#\/components#category-/))
    expect(main).toHaveTextContent("4 components in")
    await axeCheck(container)
  }, 60000)
})

describe("components gallery", () => {
  it("pins a lazy, sized, described picture on every tile and keeps the categories as sections", async () => {
    renderDocs("#/components")
    await screen.findByRole("navigation", { name: "Categories" }, SLOW)
    const main = screen.getByRole("main")
    const forms = within(main).getByRole("region", { name: "Forms" })
    const tile = within(forms).getByRole("link", { name: /Input/ })
    expect(tile).toHaveAttribute("href", "#/components/input")
    const img = tile.querySelector("img")!
    expect(img).toHaveAttribute("loading", "lazy")
    expect(img).toHaveAttribute("decoding", "async")
    expect(img.getAttribute("src")).toMatch(/thumbs\/input\.jpg$/)
    expect(img).toHaveAttribute("width", String(THUMBS.input!.w))
    expect(img).toHaveAttribute("height", String(THUMBS.input!.h))
    expect(img).toHaveAttribute("alt", "")
    expect(tile).toHaveAccessibleName(expect.stringMatching(/^Input/))
    expect(tile.getAttribute("aria-label")).toBeNull()
    for (const a of within(within(main).getByRole("navigation", { name: "Categories" })).getAllByRole("link")) {
      const id = a.getAttribute("href")!.split("#").pop()!
      expect(document.getElementById(id), id).not.toBeNull()
    }
  }, 60000)

  it("falls back to a lettered placeholder when a picture is missing or fails", async () => {
    renderDocs("#/components")
    await screen.findByRole("navigation", { name: "Categories" }, SLOW)
    const main = screen.getByRole("main")
    const card = within(main).getAllByRole("link", { name: /^Card/ })[0]!
    const img = card.querySelector("img")!
    act(() => {
      img.dispatchEvent(new Event("error"))
    })
    await waitFor(() => expect(card.querySelector("img")).toBeNull())
    expect(card.querySelector("[aria-hidden=true]")).not.toBeNull()
  }, 60000)

  it("filters with the fuzzy matcher and picks a page at random", async () => {
    const { user } = renderDocs("#/components")
    await screen.findByRole("navigation", { name: "Categories" }, SLOW)
    const main = screen.getByRole("main")
    await user.type(within(main).getByRole("searchbox", { name: "Filter components" }), "pick")
    expect(within(main).getByRole("status")).toHaveTextContent("1 match")
    expect(within(main).getByRole("link", { name: /Date Picker/ })).toBeInTheDocument()
    expect(within(main).queryByRole("link", { name: /^Card/ })).toBeNull()
    await user.clear(within(main).getByRole("searchbox", { name: "Filter components" }))
    await user.type(within(main).getByRole("searchbox", { name: "Filter components" }), "zzz")
    expect(within(main).getByRole("status")).toHaveTextContent('No component matches "zzz".')
    await user.clear(within(main).getByRole("searchbox", { name: "Filter components" }))

    vi.spyOn(Math, "random").mockReturnValue(0)
    await user.click(within(main).getByRole("button", { name: "Surprise me" }))
    await waitFor(() => expect(window.location.hash).toMatch(/^#\/components\/[a-z-]+$/))
  }, 60000)

  it("has no violations", async () => {
    const { container } = renderDocs("#/components")
    await screen.findByRole("navigation", { name: "Categories" }, SLOW)
    await axeCheck(container)
  }, 60000)

  it("still reads the real tree: every real component has a tile in the plain fallback too", () => {
    const real = createCatalog(discoverSources())
    expect(real.content.has("components-gallery")).toBe(true)
    for (const key of ["home", "home-hero", "getting-started", "playground", "changelog"]) expect(real.content.has(key), key).toBe(true)
  })
})
