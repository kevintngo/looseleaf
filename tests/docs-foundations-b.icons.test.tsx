import { act, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import IconsBody from "@/docs/content/foundations/icons"
import { ICON_ENTRIES, ICON_FAMILIES, undrawnIcons } from "@/docs/content/foundations/_shared-b/catalog"
import { aliasHint, filterIcons, tierSentence } from "@/docs/content/foundations/_shared-b/icon-browser"
import { icons } from "@/lib/ink/art/icons"
import { axeCheck, renderUI } from "./helpers"
import { installIntersectionObserver, revealAll, revealFirst } from "./docs-foundations-b-lib"

beforeEach(() => installIntersectionObserver())
afterEach(() => vi.unstubAllGlobals())

const browser = () => document.querySelector<HTMLElement>('[data-slot="icon-browser"]')!
const tiles = () => Array.from(browser().querySelectorAll<HTMLButtonElement>("[data-tile]"))
const drawnIn = (el: ParentNode) => el.querySelectorAll('[data-tile] svg[data-ink="icon"]').length

describe("the icon browser", () => {
  it("draws only the first family at once, then a block whenever it scrolls near", () => {
    renderUI(<IconsBody />)
    const first = ICON_FAMILIES[0]!.ids.length
    expect(tiles()).toHaveLength(first)
    expect(drawnIn(browser())).toBe(first)
    expect(browser().querySelectorAll('[data-lazy="waiting"]').length).toBe(ICON_FAMILIES.length - 1)
    revealFirst(1, browser())
    expect(tiles()).toHaveLength(first + ICON_FAMILIES[1]!.ids.length)
    expect(drawnIn(browser())).toBeLessThan(ICON_ENTRIES.length / 4)
  })

  it("draws everything at once where there is no IntersectionObserver, rather than leave holes", () => {
    vi.stubGlobal("IntersectionObserver", undefined)
    renderUI(<IconsBody />)
    expect(tiles()).toHaveLength(ICON_ENTRIES.length)
    expect(browser().querySelectorAll('[data-lazy="waiting"]')).toHaveLength(0)
  })

  it("lists every drawn icon once, grouped by family, when everything has been scrolled to", () => {
    renderUI(<IconsBody />)
    revealAll()
    const names = tiles().map((t) => t.getAttribute("data-tile"))
    expect(names).toHaveLength(Object.keys(icons).length)
    expect(new Set(names).size).toBe(names.length)
    for (const family of ICON_FAMILIES) expect(screen.getByRole("heading", { level: 3, name: family.label })).toBeInTheDocument()
  })

  it("searches by name, alias and tag, best first, and says how many match", async () => {
    const { user } = renderUI(<IconsBody />)
    const box = screen.getByRole("searchbox", { name: "Search icons" })
    await user.type(box, "Trash2")
    revealAll()
    await waitFor(() => expect(tiles()[0]?.getAttribute("data-tile")).toBe("trash"))
    await user.clear(box)
    await user.type(box, "warning")
    revealAll()
    await waitFor(() => expect(tiles().map((t) => t.getAttribute("data-tile"))).toContain("triangle-alert"))
    expect(within(browser()).getAllByRole("status").some((s) => /\d+ of 160 icons/.test(s.textContent ?? ""))).toBe(true)
  })

  it("says which older name a search matched", async () => {
    const { user } = renderUI(<IconsBody />)
    await user.type(screen.getByRole("searchbox", { name: "Search icons" }), "home")
    revealAll()
    await waitFor(() => expect(tiles()[0]?.getAttribute("data-tile")).toBe("house"))
    expect(tiles()[0]).toHaveTextContent("also home")
    expect(tiles()[0]).toHaveAccessibleName("house")
  })

  it("narrows to one family", async () => {
    const { user } = renderUI(<IconsBody />)
    await user.click(screen.getByRole("radio", { name: /^Media/ }))
    revealAll()
    await waitFor(() => expect(tiles().length).toBe(ICON_FAMILIES.find((f) => f.key === "media")!.ids.length))
  })

  it("explains a lucide name that is not drawn", async () => {
    const { user } = renderUI(<IconsBody />)
    await user.type(screen.getByRole("searchbox", { name: "Search icons" }), "telescope")
    expect(await screen.findByText("telescope is not drawn yet")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /what is missing/i })).toBeInTheDocument()
  })

  it("copies the JSX of the size and tone on screen, and shows the icon in the dock", async () => {
    const { user } = renderUI(<IconsBody />)
    await user.click(screen.getByRole("radio", { name: "16 pixels" }))
    await user.click(tiles().find((t) => t.dataset.tile === "chevron-down")!)
    expect(await navigator.clipboard.readText()).toBe('<Icon name="chevron-down" />')
    expect(screen.getByText("Copied <Icon name=\"chevron-down\" />")).toBeInTheDocument()
    const dock = document.querySelector<HTMLElement>("[data-dock]")!
    expect(within(dock).getByText("chevron-down")).toBeInTheDocument()
    expect(within(dock).getByText(/16 px: 16 px redraw/)).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: "doodle: with colour" }))
    await user.click(tiles().find((t) => t.dataset.tile === "chevron-down")!)
    expect(await navigator.clipboard.readText()).toBe('<Icon name="chevron-down" tone="doodle" />')
  })

  it("says which drawing the size on the slider gets", async () => {
    const { user } = renderUI(<IconsBody />)
    const slider = screen.getByRole("slider", { name: "Size" })
    expect(screen.getByText(tierSentence(32))).toBeInTheDocument()
    slider.focus()
    await user.keyboard("{Home}")
    expect(slider).toHaveAttribute("aria-valuenow", "12")
    expect(slider).toHaveAttribute("aria-valuetext", "12 pixels")
    expect(screen.getByText(tierSentence(12))).toBeInTheDocument()
    await user.keyboard("{End}")
    expect(screen.getByText(tierSentence(96))).toBeInTheDocument()
    expect(tierSentence(96)).toMatch(/extra detail/)
    expect(tierSentence(16)).toMatch(/16 px redraw/)
    expect(tierSentence(24)).toMatch(/24 px master/)
  })

  it("is one tab stop with arrow keys inside", async () => {
    const { user } = renderUI(<IconsBody />)
    revealFirst(1, browser())
    const all = tiles()
    expect(all.filter((t) => t.tabIndex === 0)).toHaveLength(1)
    expect(all[0]!.tabIndex).toBe(0)
    all[0]!.focus()
    await user.keyboard("{ArrowRight}")
    expect(all[1]).toHaveFocus()
    expect(all[1]!.tabIndex).toBe(0)
    expect(all[0]!.tabIndex).toBe(-1)
    await user.keyboard("{End}")
    expect(all.at(-1)).toHaveFocus()
    await user.keyboard("{Home}")
    expect(all[0]).toHaveFocus()
  })

  it("moves by row with the arrow keys when the tiles have places", async () => {
    const { user } = renderUI(<IconsBody />)
    revealFirst(1, browser())
    const all = tiles()
    all.forEach((t, i) => {
      t.getBoundingClientRect = () => ({ left: (i % 4) * 100, top: Math.floor(i / 4) * 100, right: 0, bottom: 0, width: 90, height: 90, x: 0, y: 0, toJSON: () => ({}) })
    })
    all[1]!.focus()
    await user.keyboard("{ArrowDown}")
    expect(all[5]).toHaveFocus()
    await user.keyboard("{ArrowUp}")
    expect(all[1]).toHaveFocus()
  })

  it("has no accessibility violations", async () => {
    const { container } = renderUI(<IconsBody />)
    revealAll()
    await axeCheck(container)
  })
})

describe("aliasHint", () => {
  const house = ICON_ENTRIES.find((e) => e.id === "house")!
  it("names the alias only when the name did not match", () => {
    expect(aliasHint(house, "home")).toBe("also home")
    expect(aliasHint(house, "hou")).toBeUndefined()
    expect(aliasHint(house, "")).toBeUndefined()
    expect(aliasHint(house, "zzz")).toBeUndefined()
  })
})

describe("filterIcons", () => {
  it("keeps family order without a query and ranks with one", () => {
    const all = filterIcons(ICON_ENTRIES, { query: "", family: "all", washOnly: false })
    expect(all.map((e) => e.id)).toEqual(ICON_ENTRIES.map((e) => e.id))
    expect(filterIcons(ICON_ENTRIES, { query: "chevron", family: "all", washOnly: false })[0]!.id).toMatch(/^chevron/)
    expect(filterIcons(ICON_ENTRIES, { query: "home", family: "all", washOnly: false })[0]!.id).toBe("house")
  })

  it("narrows by family and by colour wash", () => {
    const washed = filterIcons(ICON_ENTRIES, { query: "", family: "all", washOnly: true })
    expect(washed.length).toBeGreaterThan(0)
    expect(washed.every((e) => e.accent)).toBe(true)
    expect(filterIcons(ICON_ENTRIES, { query: "", family: "media", washOnly: false }).every((e) => e.family === "media")).toBe(true)
  })
})

describe("the undrawn list", () => {
  it("names only icons that are really missing, and orders them by demand", () => {
    const list = undrawnIcons()
    expect(list.length).toBeGreaterThan(10)
    for (const u of list) expect(icons).not.toHaveProperty(u.name)
    const uses = list.map((u) => u.uses)
    expect(uses).toEqual([...uses].sort((a, b) => b - a))
  })
})

void act
