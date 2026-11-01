import { act, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import StickersDoodlesBody from "@/docs/content/foundations/stickers-doodles"
import { BADGE_ENTRIES, DOODLE_ENTRIES, DOODLE_FAMILIES, PEELABLE_ENTRIES, PEELABLE_FAMILIES, POSES, SCENE_ENTRIES, STAMP_ENTRIES, STICKER_FAMILIES, poseNote } from "@/docs/content/foundations/_shared-b/catalog"
import { customStampSnippet, doodleSnippet, emptySceneSnippet, iconSnippet, iconVariant, mascotSnippet, sealSnippet, stickerSnippet } from "@/docs/content/foundations/_shared-b/snippets"
import { doodles } from "@/lib/ink/art/doodles"
import { mascot } from "@/lib/ink/art/mascots"
import { scenes } from "@/lib/ink/art/scenes"
import { stickers } from "@/lib/ink/art/stickers"
import { axeCheck, renderUI } from "./helpers"
import { installIntersectionObserver, revealAll } from "./docs-foundations-b-lib"

beforeEach(() => installIntersectionObserver())
afterEach(() => vi.unstubAllGlobals())

const shelf = (slug: string) => document.querySelector<HTMLElement>(`[data-slot="${slug}-shelf"]`)!
const tilesOf = (slug: string) => Array.from(shelf(slug).querySelectorAll<HTMLButtonElement>("[data-tile]"))
const tile = (slug: string, id: string) => tilesOf(slug).find((t) => t.dataset.tile === id)!
const clip = () => navigator.clipboard.readText()

describe("the catalog reads the art barrels", () => {
  it("lists every doodle, sticker, pose and scene exactly once", () => {
    expect(DOODLE_ENTRIES.map((e) => e.id).sort()).toEqual(Object.keys(doodles).sort())
    expect([...PEELABLE_ENTRIES, ...STAMP_ENTRIES].map((e) => e.id).sort()).toEqual(Object.keys(stickers).sort())
    expect([...POSES].sort()).toEqual(Object.keys(mascot).sort())
    expect(SCENE_ENTRIES.map((e) => e.id).sort()).toEqual(Object.keys(scenes).sort())
    expect(DOODLE_FAMILIES.flatMap((f) => f.ids)).toHaveLength(DOODLE_ENTRIES.length)
    expect(STICKER_FAMILIES.flatMap((f) => f.ids)).toHaveLength(PEELABLE_ENTRIES.length + STAMP_ENTRIES.length)
  })

  it("keeps the stamps out of the sticker families, so the chips count what the shelf shows", () => {
    expect(PEELABLE_FAMILIES.flatMap((f) => f.ids).sort()).toEqual(PEELABLE_ENTRIES.map((e) => e.id).sort())
    expect(PEELABLE_FAMILIES.at(-1)!.label).toBe("Badges")
  })

  it("finds the stamps by their generator and the badges by name", () => {
    expect(STAMP_ENTRIES.length).toBeGreaterThanOrEqual(6)
    expect(STAMP_ENTRIES.every((e) => e.id.startsWith("stamp-") && e.text)).toBe(true)
    expect(BADGE_ENTRIES.length).toBeGreaterThan(8)
    expect(BADGE_ENTRIES.every((e) => e.kind === "sticker")).toBe(true)
  })

  it("has a note and a pose in every scene it can draw", () => {
    for (const s of SCENE_ENTRIES) {
      expect(s.title.length).toBeGreaterThan(2)
      expect(s.pose && POSES.includes(s.pose)).toBe(true)
    }
    for (const p of POSES) expect(poseNote(p).does).not.toBe("One of Stubby's poses.")
  })
})

describe("snippets", () => {
  it("leave the defaults out", () => {
    expect(iconSnippet("trash")).toBe('<Icon name="trash" />')
    expect(iconSnippet("trash", { size: 24, tone: "doodle" })).toBe('<Icon name="trash" size={24} tone="doodle" />')
    expect(doodleSnippet("star")).toBe('<Doodle name="star" />')
    expect(doodleSnippet("star", { size: 48 })).toBe('<Doodle name="star" size={48} />')
    expect(stickerSnippet("rocket", { size: 96, peel: false, rotate: "auto" })).toBe('<Sticker name="rocket" />')
    expect(stickerSnippet("rocket", { size: 128, peel: true, rotate: -10 })).toBe('<Sticker name="rocket" size={128} peel rotate={-10} />')
    expect(mascotSnippet("wave")).toBe('<Mascot pose="wave" />')
    expect(mascotSnippet("wave", { size: 48 })).toBe('<Mascot pose="wave" size={48} />')
  })

  it("quote a value a JSX attribute could not hold", () => {
    expect(customStampSnippet({ text: "Paid", shape: "rect", ink: "green", tilt: 0 })).toBe('<Stamp text="Paid" shape="rect" ink="green" tilt={0} />')
    expect(customStampSnippet({ text: 'Say "hi"', shape: "rect", ink: "red" })).toContain('text={"Say \\"hi\\""}')
    expect(customStampSnippet({ text: "Paid", ring: "ONE * TWO", shape: "round", ink: "ink-you", ghost: true, dashed: true })).toBe('<Stamp text="Paid" ring="ONE * TWO" shape="round" ink="ink-you" ghost dashed />')
    expect(sealSnippet({ variant: "rosette", text: "BEST", tone: "lemon", size: 64 })).toBe('<Seal variant="rosette" text="BEST" tone="lemon" size={64} />')
    expect(emptySceneSnippet("shrug", "Page not found")).toContain('<EmptyMedia pose="shrug" size={96} />')
  })

  it("name the drawing the engine really picks for a size", () => {
    expect(iconVariant("chevron-down", 12)).toBe("micro")
    expect(iconVariant("trash", 12)).toBe("small")
    expect(iconVariant("trash", 16)).toBe("small")
    expect(iconVariant("trash", 24)).toBe("master")
    expect(iconVariant("trash", 96)).toBe("master")
  })
})

describe("the stickers and doodles page", () => {
  it("has its six sections, and draws only the first block of each shelf", () => {
    renderUI(<StickersDoodlesBody />)
    for (const name of ["Doodles", "Stickers", "Badges and seals", "Stamps", "Stubby", "Using the art"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument()
    }
    expect(tilesOf("doodle").length).toBe(DOODLE_FAMILIES[0]!.ids.length)
    expect(tilesOf("sticker").length).toBeLessThanOrEqual(24)
    expect(shelf("sticker").querySelectorAll('[data-lazy="waiting"]').length).toBeGreaterThan(0)
  })

  it("copies a doodle at the size on screen", async () => {
    const { user } = renderUI(<StickersDoodlesBody />)
    await user.click(tile("doodle", DOODLE_FAMILIES[0]!.ids[0]!))
    expect(await clip()).toBe(`<Doodle name="${DOODLE_FAMILIES[0]!.ids[0]}" />`)
    await user.click(within(shelf("doodle")).getByRole("radio", { name: "48 pixels" }))
    await user.click(tile("doodle", DOODLE_FAMILIES[0]!.ids[0]!))
    expect(await clip()).toBe(`<Doodle name="${DOODLE_FAMILIES[0]!.ids[0]}" size={48} />`)
  })

  it("copies a sticker with the peel and rotation that are switched on", async () => {
    const { user } = renderUI(<StickersDoodlesBody />)
    await user.type(within(shelf("sticker")).getByRole("searchbox", { name: "Search stickers" }), "rocket")
    revealAll()
    await waitFor(() => expect(tilesOf("sticker")[0]?.dataset.tile).toBe("rocket"))
    await user.click(within(shelf("sticker")).getByRole("switch", { name: "Lift the corner" }))
    await user.click(within(shelf("sticker")).getByRole("radio", { name: "minus ten degrees" }))
    await user.click(tile("sticker", "rocket"))
    expect(await clip()).toBe('<Sticker name="rocket" peel rotate={-10} />')
    expect(within(shelf("sticker")).getByText(/Press a tile to copy/)).toHaveTextContent('<Sticker name="name" peel rotate={-10} />')
  })

  it("makes a stamp and says how to write it", async () => {
    const { user } = renderUI(<StickersDoodlesBody />)
    const lab = document.querySelector<HTMLElement>('[data-slot="stamp-lab"]')!
    const words = within(lab).getByRole("textbox", { name: "Words" })
    await user.clear(words)
    await user.type(words, "Paid")
    await user.click(within(lab).getByRole("radio", { name: "round" }))
    await user.click(within(lab).getByRole("radio", { name: "ink-you" }))
    expect(within(lab).getByRole("img", { name: "Paid" })).toBeInTheDocument()
    expect(within(lab).getByText(/^<Stamp text="Paid"/)).toHaveTextContent('<Stamp text="Paid" ring="PAID IN FULL * THANK YOU * MAR 2026" shape="round" ink="ink-you" tilt={-8} />')
    await user.click(within(lab).getByRole("button", { name: "Copy JSX" }))
    expect(await clip()).toBe('<Stamp text="Paid" ring="PAID IN FULL * THANK YOU * MAR 2026" shape="round" ink="ink-you" tilt={-8} />')
  })

  it("makes a seal with words or with a mark", async () => {
    const { user } = renderUI(<StickersDoodlesBody />)
    const lab = document.querySelector<HTMLElement>('[data-slot="seal-lab"]')!
    expect(within(lab).getByText(/^<Seal/)).toHaveTextContent('<Seal variant="rosette" text="BEST" tone="lemon" />')
    await user.click(within(lab).getByRole("radio", { name: "check" }))
    expect(within(lab).getByText(/^<Seal/)).toHaveTextContent('<Seal variant="rosette" mark="check" tone="lemon" />')
    expect(lab.querySelector('svg[data-slot="seal"]')).toHaveAttribute("aria-label", "Verified")
  })

  it("picks a pose for Stubby, from the picker and from the sheet", async () => {
    const { user } = renderUI(<StickersDoodlesBody />)
    const studio = document.querySelector<HTMLElement>('[data-slot="mascot-studio"]')!
    expect(studio.querySelector("svg[data-pose]")).toHaveAttribute("data-pose", "idle")
    await user.click(within(studio).getByRole("radio", { name: "think" }))
    expect(studio.querySelector("svg[data-pose]")).toHaveAttribute("data-pose", "think")
    expect(within(studio).getByText(poseNote("think").does)).toBeInTheDocument()
    await user.click(within(studio).getByRole("radio", { name: "32 pixels" }))
    expect(within(studio).getByText(/the small redraw: adds blush/)).toBeInTheDocument()
    expect(within(studio).getByText(/^<Mascot/)).toHaveTextContent('<Mascot pose="think" size={32} />')
    revealAll()
    await user.click(tile("pose", "oops"))
    expect(studio.querySelector("svg[data-pose]")).toHaveAttribute("data-pose", "oops")
    expect(await clip()).toBe('<Mascot pose="oops" />')
  })

  it("has no accessibility violations", async () => {
    const { container } = renderUI(<StickersDoodlesBody />)
    revealAll()
    await axeCheck(container)
  })
})

void act
