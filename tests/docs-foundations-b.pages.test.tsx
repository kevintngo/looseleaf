import { screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import AccessibilityBody from "@/docs/content/foundations/accessibility"
import PrinciplesBody from "@/docs/content/foundations/principles"
import { CONTRAST_ROWS } from "@/docs/content/foundations/_shared-b/contrast-data.generated"
import { HEADLINE_ROWS, gradeOf } from "@/docs/content/foundations/_shared-b/a11y-demos"
import { LAWS } from "@/docs/content/foundations/_shared-b/principles-specimens"
import { axeCheck, renderUI } from "./helpers"
import { installIntersectionObserver } from "./docs-foundations-b-lib"

beforeEach(() => installIntersectionObserver())
afterEach(() => vi.unstubAllGlobals())

describe("the accessibility page", () => {
  it("has every section, in order, each reachable from the table of promises", () => {
    renderUI(<AccessibilityBody />)
    const ids = ["guarantees", "keyboard", "focus", "contrast", "motion", "forced-colors", "rtl", "targets", "screen-readers", "jitter", "limits", "testing", "browsers", "csp"]
    const headings = screen.getAllByRole("heading", { level: 2 })
    expect(headings.map((h) => h.id)).toEqual(ids)
    const table = screen.getByRole("region", { name: "The nine promises" })
    const links = within(table).getAllByRole("link")
    expect(links).toHaveLength(9)
    for (const link of links) expect(ids).toContain(link.getAttribute("href")!.split("#").pop())
  })

  it("quotes the promises from the measured ratios, not from memory", () => {
    renderUI(<AccessibilityBody />)
    const ink = CONTRAST_ROWS.find((r) => r.fg === "card-foreground" && r.bg === "card")!
    const ring = CONTRAST_ROWS.find((r) => r.fg === "ring" && r.bg === "card")!
    const table = screen.getByRole("region", { name: "The nine promises" })
    expect(table).toHaveTextContent(`(${ink.ratio.toFixed(1)} : 1)`)
    expect(table).toHaveTextContent(`${ring.ratio.toFixed(1)} : 1 on paper`)
    expect(table).toHaveTextContent(`measures ${CONTRAST_ROWS.length} pairs`)
    expect(document.body.textContent).not.toContain("? : 1")
  })

  it("shows the pairs people ask about, then all of them", async () => {
    const { user } = renderUI(<AccessibilityBody />)
    const headline = screen.getByRole("region", { name: "The contrast pairs people ask about" })
    expect(within(headline).getAllByRole("row")).toHaveLength(HEADLINE_ROWS.length + 1)
    expect(HEADLINE_ROWS.length).toBeGreaterThanOrEqual(12)
    expect(within(headline).getAllByText("known limit").length).toBeGreaterThan(0)
    await user.click(screen.getByRole("button", { name: `Show all ${CONTRAST_ROWS.length} pairs` }))
    const sections = new Set(CONTRAST_ROWS.map((r) => r.section))
    const all = document.getElementById("all-contrast")!
    expect(within(all).getAllByRole("heading", { level: 3 })).toHaveLength(sections.size)
    expect(within(all).getAllByRole("row").length).toBe(CONTRAST_ROWS.length + sections.size)
    expect(screen.getByRole("button", { name: "Hide the full table" })).toHaveAttribute("aria-expanded", "true")
  })

  it("puts a word on every ratio", () => {
    expect(gradeOf(14)).toBe("AAA")
    expect(gradeOf(4.6)).toBe("AA")
    expect(gradeOf(3.2)).toBe("AA large text and marks")
    expect(gradeOf(1.9)).toBe("decorative only")
  })

  it("reads each drawing's attributes from the DOM", async () => {
    renderUI(<AccessibilityBody />)
    const table = screen.getByRole("region", { name: "What the DOM says about each kind of drawing" })
    await waitFor(() => expect(within(table).queryAllByText("...")).toHaveLength(0))
    const line = (code: string) => within(table).getByText(code).closest("tr")!.querySelector("[data-attrs]")!.textContent
    expect(line('<Icon name="trash" />')).toBe('aria-hidden="true" focusable="false"')
    expect(line('<Icon name="trash" label="Delete" />')).toBe('role="img" aria-label="Delete" focusable="false"')
    expect(line('<Doodle name="star" />')).toBe('aria-hidden="true" focusable="false"')
    expect(line('<Stamp name="stamp-approved" />')).toBe('role="img" aria-label="Approved" focusable="false"')
    expect(line('<Mascot pose="wave" />')).toBe('aria-hidden="true" focusable="false"')
  })

  it("puts the calm-ink island and the right-to-left pane on the page", () => {
    renderUI(<AccessibilityBody />)
    expect(document.querySelector('[data-motion="reduced"]')).not.toBeNull()
    const rtl = document.querySelector<HTMLElement>('[dir="rtl"]')!
    expect(within(rtl).getByRole("textbox", { name: "Search (rtl)" })).toBeInTheDocument()
    expect(within(rtl).getByRole("slider", { name: "Pencil pressure (rtl)" })).toBeInTheDocument()
  })

  it("outlines the real boxes of the buttons on request", async () => {
    const { user } = renderUI(<AccessibilityBody />)
    const targets = document.querySelector<HTMLElement>('[data-slot="targets"]')!
    const button = () => within(targets).getAllByRole("button", { name: "Save" })[0]!
    const box = () => button().closest("div")!
    expect(box().className).toContain("outline-dashed")
    await user.click(within(targets).getByRole("switch", { name: "Outline each button's real box" }))
    expect(box().className).not.toContain("outline-dashed")
  })

  it("shows that jittered text reads as typed", async () => {
    renderUI(<AccessibilityBody />)
    const plain = document.querySelector("[data-plain]")!
    await waitFor(() => expect(plain.textContent).toBe("Ask Sam about the pond, and bring the big umbrella!"))
  })

  it("has no accessibility violations", async () => {
    const { container } = renderUI(<AccessibilityBody />)
    await axeCheck(container)
  })
})

describe("the principles page", () => {
  it("has the ten laws, in order, each with a specimen", () => {
    renderUI(<PrinciplesBody />)
    expect(LAWS.map((l) => l.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const list = document.getElementById("law-1")!.parentElement!
    expect(Array.from(list.children).map((li) => li.id)).toEqual(LAWS.map((l) => `law-${l.n}`))
    for (const law of LAWS) {
      const item = document.getElementById(`law-${law.n}`)!
      expect(within(item).getByRole("heading", { level: 3 })).toHaveTextContent(`Law ${law.n}: ${law.title}`)
      expect(within(item).getByRole("group", { name: new RegExp(`^Law ${law.n}:`) })).toBeInTheDocument()
    }
    expect(screen.getByRole("heading", { level: 2, name: "The ten laws of the hand" })).toBeInTheDocument()
  })

  it("draws six different stars for six seeds (law three)", () => {
    renderUI(<PrinciplesBody />)
    const stars = Array.from(document.getElementById("law-3")!.querySelectorAll('svg[data-ink="doodle"]')).map((s) => s.innerHTML)
    expect(stars).toHaveLength(6)
    expect(new Set(stars).size).toBe(6)
  })

  it("has the pens, the principles and a checklist you can tick", async () => {
    const { user } = renderUI(<PrinciplesBody />)
    const roles = screen.getByRole("region", { name: "What each pen means" })
    expect(within(roles).getAllByRole("row")).toHaveLength(9)
    expect(screen.getByRole("heading", { level: 2, name: "Design principles" })).toBeInTheDocument()
    const boxes = within(document.getElementById("checklist")!.closest("section")!).getAllByRole("checkbox")
    expect(boxes).toHaveLength(10)
    await user.click(boxes[0]!)
    expect(boxes[0]).toBeChecked()
  })

  it("has no accessibility violations", async () => {
    const { container } = renderUI(<PrinciplesBody />)
    await axeCheck(container)
  })
})
