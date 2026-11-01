import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import path from "node:path"
import { drawSkeleton } from "@/lib/ink/art-draw"
import { validateArt } from "@/lib/ink/art/dsl"
import { drawMascot, mascotVariant } from "@/lib/ink/art/mascot-draw"
import { mascot, mascotBody, mascotProps } from "@/lib/ink/art/mascots"
import type { ArtDef, Part } from "@/lib/ink/art/types"

const POSES = ["idle", "wave", "think", "write", "sketch", "celebrate", "oops", "shrug", "sleep", "peek", "point", "carry", "halt", "search", "unplug"]
const defs = mascot as unknown as Record<string, ArtDef>
const flip = mascotProps.frames as unknown as Record<string, ArtDef>
const propDefs = mascotProps.propDefs as unknown as Record<string, ArtDef>
const nodes = (svg: string) => (svg.match(/<(path|g|use|circle|rect|clipPath|mask)\b/g) ?? []).length
const drawn = (parts: readonly Part[]) => parts.filter((p) => p[0] !== "d").length

describe("Stubby, the die-cut pencil stub", () => {
  it("keeps all fifteen pose ids, each drawn at three sizes plus hero extras", () => {
    expect(Object.keys(defs).sort()).toEqual([...POSES].sort())
    for (const id of POSES) {
      const d = defs[id]
      expect(d.kind, id).toBe("mascot")
      expect(d.grid, id).toEqual([64, 72])
      expect(d.micro, id).toBeDefined()
      expect(d.small, id).toBeDefined()
      expect(d.hi, id).toBeDefined()
      expect(JSON.stringify(d.small), id).not.toBe(JSON.stringify(d.parts))
      expect(d.shade, id).toBe(false)
    }
  })

  it("is simple: at most 14 drawing parts at the master (idle 9), 14 at small, 10 at micro", () => {
    for (const id of POSES) {
      const d = defs[id]
      expect(drawn(d.parts), `${id} master`).toBeLessThanOrEqual(14)
      expect(drawn(d.small!), `${id} small`).toBeLessThanOrEqual(14)
      expect(drawn(d.micro!), `${id} micro`).toBeLessThanOrEqual(10)
    }
    expect(drawn(defs.idle.parts)).toBeLessThanOrEqual(10)
    for (const id of ["idle", "sleep", "wave"]) {
      expect(drawn(defs[id].parts), id).toBeLessThanOrEqual(11)
    }
  })

  it("passes the art grammar and the usable-area rules in every tier, frames and props too", () => {
    for (const [id, d] of Object.entries({ ...defs, ...flip, ...propDefs })) {
      const errors = validateArt(d, { id, kind: "mascot" }).filter((p) => p.level === "error")
      expect(errors, id).toEqual([])
    }
  })

  it("has no arms, hands, legs, feet or clothes in his code", () => {
    const names = Object.keys(mascotBody).join(" ")
    expect(names).not.toMatch(/arm|hand|leg|foot|feet|limb|mitten|skirt|belt|ferrule.*stripe/i)
    for (const f of ["body.ts", "poses.ts", "props.ts"]) {
      const code = readFileSync(path.join(process.cwd(), "src/lib/ink/art/mascots", f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")
      expect(code, f).not.toMatch(/\b(arms?|legs?|feet|mittens?|limbs?)\b/i)
    }
  })

  it("keeps the exports the scenes and the Spinner use: flip books and the fourteen stand-alone props", () => {
    expect(Object.keys(flip)).toEqual(["write-1", "write-2", "write-3", "wave-1", "wave-2", "wave-3", "celebrate-1", "celebrate-2"])
    expect(Object.keys(propDefs).sort()).toEqual(
      ["thought-cloud", "question-mark", "zzz", "sweat-drop", "ink-blot", "lead-shards", "confetti-burst", "magnifier", "dashed-frame", "cable-cut", "sheet-box", "stop-tick", "shavings", "scribble"].sort()
    )
    for (const [id, d] of Object.entries(propDefs)) expect(d.small, id).toBeDefined()
    expect(JSON.stringify(defs.write)).toBe(JSON.stringify(flip["write-3"]))
    expect(JSON.stringify(defs.wave)).toBe(JSON.stringify(flip["wave-1"]))
    expect(JSON.stringify(defs.celebrate)).toBe(JSON.stringify(flip["celebrate-1"]))
    expect(JSON.stringify(flip["write-1"])).not.toBe(JSON.stringify(flip["write-2"]))
  })

  it("picks the drawing by the size of the whole sticker: face-only under 28, small under 56, master under 140, hero from 140", () => {
    expect([16, 24, 27, 28, 32, 55, 56, 96, 139, 140, 160].map(mascotVariant)).toEqual(["micro", "micro", "micro", "small", "small", "small", "master", "master", "master", "hi", "hi"])
  })

  it("draws every pose at every size, deterministic, tokens only, and the box is `size` tall", () => {
    for (const id of POSES) {
      for (const size of [16, 24, 32, 48, 64, 96, 160]) {
        const a = drawMascot(defs[id], size, id)
        const b = drawMascot(defs[id], size, id)
        expect(a.svg, `${id} ${size}`).toBe(b.svg)
        expect(a.svg, `${id} ${size}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
        expect(a.h, `${id} ${size}`).toBeCloseTo(size, 0)
        for (const c of a.svg.matchAll(/(?:fill|stroke)="([^"]+)"/g)) {
          if (c[1] !== "none" && !c[1].startsWith("url(")) expect(c[1], `${id} ${size}`).toMatch(/^var\(--ll-[a-z-]+\)$|^currentColor$/)
        }
      }
    }
  })

  it("is light: idle at 96 px in the lo tier is about 30 nodes and 13 KB, and no pose or size runs away", () => {
    const idle = drawMascot(defs.idle, 96, "idle")
    expect(nodes(idle.svg)).toBeLessThanOrEqual(30)
    expect(idle.svg.length).toBeLessThan(16 * 1024)
    for (const id of POSES) {
      const r96 = drawMascot(defs[id], 96, id)
      expect(nodes(r96.svg), id).toBeLessThanOrEqual(36)
      expect(r96.svg.length, id).toBeLessThan(21 * 1024)
      const r160 = drawMascot(defs[id], 160, id)
      expect(r160.svg.length, id).toBeLessThan(34 * 1024)
    }
    const hi = drawMascot(defs.idle, 160, "idle", { tier: "hi" })
    expect(hi.svg.length).toBeGreaterThan(drawMascot(defs.idle, 160, "idle").svg.length * 1.5)
  })

  it("keeps the flat marker palette: lemon barrel, kraft cone, graphite tip, bubblegum eraser; accessories in another medium", () => {
    const idle = drawMascot(defs.idle, 96, "idle").svg
    for (const c of ["lemon", "kraft", "pencil", "bubblegum"]) expect(idle).toContain(`var(--ll-${c})`)
    expect(drawMascot(defs.sleep, 96, "sleep").svg).toContain("var(--ll-ink-you)")
    expect(drawMascot(defs.halt, 96, "halt").svg).toContain("var(--ll-tomato)")
    expect(drawMascot(defs.unplug, 96, "unplug").svg).toContain("var(--ll-tangerine)")
  })

  it("says the pose with the face and one doodle, not with limbs: poses differ in eyes, mouth or an accessory", () => {
    const at = (id: string) => drawMascot(defs[id], 96, "same").svg
    const seen = new Set<string>()
    for (const id of POSES) seen.add(at(id))
    expect(seen.size).toBe(POSES.length)
    const barrel = (svg: string) => /fill="var\(--ll-lemon\)"[^>]*/.exec(svg) ?? /d="[^"]*" fill="var\(--ll-lemon\)"/.exec(svg)
    expect(barrel(at("idle"))).not.toBeNull()
  })

  it("the engine can still draw him flat (drawSkeleton), which the gate does", () => {
    for (const id of POSES) for (const size of [32, 48, 96, 160]) expect(drawSkeleton(defs[id], size, id).svg.length).toBeGreaterThan(200)
  })

  it("art review: fills overlap instead of touching, so no seam of bare paper shows between cone, barrel and eraser at any size", () => {
    const ys = (d: string) => (d.match(/-?\d+\.?\d*/g) ?? []).map(Number).filter((_, i) => i % 2 === 1)
    for (const tier of ["parts", "small", "micro"] as const) {
      const fills = defs.idle[tier]!.filter((p) => p[0] === "f") as unknown as Array<readonly ["f", string, string]>
      const barrel = ys(fills.find((p) => p[1] === "lemon")![2])
      const eraser = ys(fills.find((p) => p[1] === "bubblegum" && Math.max(...ys(p[2])) > 62)![2])
      expect(Math.min(...barrel), tier).toBeLessThan(30)
      expect(Math.max(...barrel) - Math.min(...eraser), tier).toBeGreaterThan(1.5)
    }
  })

  it("art review: faces that survive 16-55 px: oops looks startled with big blots (no ring-and-brow scribble), wave looks aside while celebrate laughs, unplug looks down", () => {
    const blots = (id: string, tier: "parts" | "small" | "micro") => defs[id][tier]!.filter((p) => p[0] === "d").length
    for (const tier of ["parts", "small", "micro"] as const) {
      expect(blots("oops", tier), `oops ${tier}`).toBeGreaterThanOrEqual(2)
      expect(blots("unplug", tier), `unplug ${tier}`).toBeGreaterThanOrEqual(2)
    }
    expect(blots("wave", "parts")).toBeGreaterThanOrEqual(2)
    expect(blots("celebrate", "parts")).toBe(0)
  })
})
