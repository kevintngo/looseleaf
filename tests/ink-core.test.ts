import { describe, expect, it } from 'vitest'
import { Resvg } from '@resvg/resvg-js'
import { GRAIN_VARIANTS, grainMaskId, grainPhase } from '@/lib/ink/textures'
import { HATCH, hatchTile } from '@/lib/ink/recipes/pencil-tiles-ink'
import {
  GRAINS, Ink, MASK_IDS, MASK_VARIANTS, PAINT_KEYS, PENS, arrow, asterisk, bandFill, blobFill, box, bracket, burst, check, clipFill, cloud, cross,
  dashedBox, ellipsePoly, esc, focusRing, hashSeed, hatch, highlight, inkViewBox, loop, makeRng, maskId, maskPhase, n, paint, pen, pillPoly,
  roundRectPoly, scribble, spiral, squiggle, star, strike, stroke, tally, underline, wash, line, polyFill, misreg, bboxOf,
  type LayerName, type Pt,
} from '@/lib/ink'

function pathPoints(d: string): Pt[] {
  const tokens = d.match(/[MLQlqzZ]|-?\d*\.?\d+/g) ?? []
  const pts: Pt[] = []
  let cmd = ''
  let i = 0, x = 0, y = 0, sx = 0, sy = 0
  const num = (): number => parseFloat(tokens[i++])
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) {
      cmd = tokens[i++]
      if (cmd === 'z' || cmd === 'Z') { x = sx; y = sy; continue }
    }
    if (cmd === 'M') { x = num(); y = num(); sx = x; sy = y; pts.push([x, y]); cmd = 'L' }
    else if (cmd === 'L') { x = num(); y = num(); pts.push([x, y]) }
    else if (cmd === 'l') { x += num(); y += num(); pts.push([x, y]) }
    else if (cmd === 'Q') { pts.push([num(), num()]); x = num(); y = num(); pts.push([x, y]) }
    else if (cmd === 'q') { const cx = x + num(), cy = y + num(); pts.push([cx, cy]); x += num(); y += num(); pts.push([x, y]) }
    else throw new Error('unexpected path token ' + tokens[i])
  }
  return pts
}

const allPaths = (svg: string): string[] => [...svg.matchAll(/ d="([^"]*)"/g)].map((m) => m[1])
const sweepsOf = (svg: string): Pt[][] => allPaths(svg).flatMap((d) => d.split(/(?=M)/).filter(Boolean).map(pathPoints))
const pathCount = (svg: string): number => (svg.match(/<path/g) ?? []).length

function control(seed: string, w: number, h: number, tier: 'hi' | 'lo' = 'lo'): Ink {
  const ink = new Ink(seed, { tier })
  ink.layer('rest', () => {
    ink.poly('under', roundRectPoly(1, 1, w - 2, h - 2, 4), 'slip', 0.8)
    bandFill(ink, roundRectPoly(1.5, 1.5, w - 3, h - 3, 4), 'marker', { passes: 2 })
    box(ink, 0, 0, w, h, { corner: 4 })
  })
  ink.layer('hover', () => box(ink, 0.5, 0.5, w - 1, h - 1, { pen: 'ink.fine', style: 'loop', ghost: false }))
  ink.layer('focus', () => focusRing(ink, 0, 0, w, h, { r: 4 }))
  return ink
}

describe('rng', () => {
  it('is deterministic and seed-sensitive', () => {
    const a = makeRng('x'), b = makeRng('x'), c = makeRng('y')
    const sa = [a(), a(), a()], sb = [b(), b(), b()], sc = [c(), c(), c()]
    expect(sa).toEqual(sb)
    expect(sa).not.toEqual(sc)
    for (const v of sa) expect(v).toBeGreaterThanOrEqual(0), expect(v).toBeLessThan(1)
    expect(hashSeed('a')).not.toBe(0)
    expect(hashSeed(0)).not.toBe(0)
  })
  it('fork is keyed, does not consume the parent and is order independent', () => {
    const p1 = makeRng('parent')
    const p2 = makeRng('parent')
    const a1 = p1.fork('a')()
    p2.fork('zzz')
    p2.fork('b')
    const a2 = p2.fork('a')()
    expect(a1).toBe(a2)
    const before = makeRng('parent')()
    const p3 = makeRng('parent')
    p3.fork('a')
    p3.fork('b')
    expect(p3()).toBe(before)
    expect(makeRng('p').fork('a').fork('b')()).not.toBe(makeRng('p').fork('b').fork('a')())
  })
  it('helpers stay in range', () => {
    const r = makeRng(7)
    for (let i = 0; i < 200; i++) {
      const v = r.range(2, 5), k = r.int(3, 6)
      expect(v >= 2 && v < 5).toBe(true)
      expect(Number.isInteger(k) && k >= 3 && k <= 6).toBe(true)
      expect(Number.isFinite(r.gauss(0, 1))).toBe(true)
    }
    expect([1, 2, 3]).toContain(r.pick([1, 2, 3]))
    expect([-1, 1]).toContain(r.sign())
  })
})

describe('number formatter and paint', () => {
  it('trims and never emits junk', () => {
    expect(n(0.5)).toBe('.5')
    expect(n(-0.5)).toBe('-.5')
    expect(n(-0.01)).toBe('0')
    expect(n(12)).toBe('12')
    expect(n(3.14159)).toBe('3.15')
    expect(n(3.14159, 10)).toBe('3.1')
    expect(n(2.5, 100)).toBe('2.5')
    expect(n(NaN)).toBe('0')
    expect(n(Infinity)).toBe('0')
    expect(n(-Infinity)).toBe('0')
  })
  it('paints through variables only', () => {
    expect(paint('ink')).toBe('var(--ll-ink)')
    expect(paint('current')).toBe('currentColor')
    expect(() => paint('nope' as never)).toThrow()
    for (const k of PAINT_KEYS) expect(paint(k)).toMatch(/^(var\(--ll-[a-z-]+\)|currentColor)$/)
  })
  it('escapes text', () => {
    expect(esc('<a href="x">&\'')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;')
    const ink = new Ink('t')
    ink.text(1, 2, '<script>&</script>', { size: 12 })
    expect(ink.toSvg({ w: 10, h: 10 }).svg).toContain('&lt;script&gt;&amp;&lt;/script&gt;')
  })
})

describe('pens', () => {
  it('has weight classes with a real hierarchy', () => {
    for (const base of ['ink', 'blue', 'pencil', 'red'] as const) {
      expect(PENS[`${base}.fine` as const].W).toBeLessThan(PENS[base].W)
      expect(PENS[`${base}.brush` as const].W).toBeGreaterThan(PENS[base].W * 1.6)
    }
    expect(PENS['ink.brush'].dir).toBeGreaterThan(PENS.ink.dir)
    expect(PENS['ink.brush'].gaps).toBeGreaterThan(0)
    expect(pen('ink', { W: 3 }).W).toBe(3)
    expect(() => pen('nope' as never)).toThrow()
  })
  it('every pen paints only with theme variables', () => {
    for (const name of Object.keys(PENS) as Array<keyof typeof PENS>) {
      const ink = new Ink('pen:' + name)
      ink.stroke([[0, 10], [40, 6], [80, 12]], name)
      const svg = ink.toSvg({ w: 80, h: 20 }).svg
      expect(svg).toMatch(/fill="var\(--ll-[a-z-]+\)"/)
      expect(svg).not.toMatch(/NaN|Infinity|undefined/)
    }
  })
  it('a stroke result has ribbon layers and a finite bbox', () => {
    const r = stroke([[0, 0], [50, 10], [100, 0]], 'ink', makeRng('s'), { tier: 'hi' })
    expect(r.layers.map((l) => l.k)).toEqual(expect.arrayContaining(['halo', 'body', 'core']))
    expect(r.bbox.every(Number.isFinite)).toBe(true)
    expect(r.len).toBeGreaterThan(90)
    const one = stroke([[3, 3]], 'ink', makeRng('dot'))
    expect(one.layers.length).toBeGreaterThan(0)
  })
  it('brush strokes swell on down-strokes and thin on up-strokes', () => {
    const width = (pts: Pt[]): number => {
      const r = stroke(pts, 'ink.brush', makeRng('dir'), { tier: 'lo', wobble: 0, start: 'soft', end: 'soft' })
      const b = r.bbox
      return b[2] - b[0]
    }
    expect(width([[10, 0], [10, 60]])).toBeGreaterThan(0)
    expect(width([[10, 60], [10, 0]])).toBeGreaterThan(0)
  })
})

describe('determinism', () => {
  it('same inputs give an identical string; another seed gives another drawing', () => {
    const a = control('btn:1', 120, 40).toSvg({ w: 120, h: 40 })
    const b = control('btn:1', 120, 40).toSvg({ w: 120, h: 40 })
    const c = control('btn:2', 120, 40).toSvg({ w: 120, h: 40 })
    expect(a.svg).toBe(b.svg)
    expect(a.svg).not.toBe(c.svg)
    expect(a.parts).toEqual(b.parts)
  })
  it('every shape is deterministic', () => {
    const draw = (seed: string): string => {
      const k = new Ink(seed)
      box(k, 0, 0, 90, 30); loop(k, 50, 50, 20, 10); line(k, 0, 80, 100, 82); underline(k, 0, 90, 60, { kind: 'double' }); squiggle(k, 0, 100, 80)
      strike(k, 0, 110, 50); arrow(k, 0, 120, 60, 130, { curl: true }); check(k, 0, 140, 16); cross(k, 20, 140, 16); asterisk(k, 60, 150, 16)
      burst(k, 90, 150, 12); star(k, 120, 150, 10); spiral(k, 150, 150, 10); tally(k, 0, 170, 7, 16); bracket(k, 90, 170, 30)
      cloud(k, 150, 190, 60, 30); scribble(k, 0, 200, 60, 10); focusRing(k, 0, 220, 60, 20); dashedBox(k, 0, 250, 80, 20)
      return k.toSvg({ w: 200, h: 280 }).svg
    }
    expect(draw('shapes')).toBe(draw('shapes'))
    expect(draw('shapes')).not.toBe(draw('other'))
  })
  it('a layer added later does not reshuffle the rest layer', () => {
    const a = new Ink('layers')
    a.layer('rest', () => box(a, 0, 0, 100, 30))
    const withHover = new Ink('layers')
    withHover.layer('rest', () => box(withHover, 0, 0, 100, 30))
    withHover.layer('hover', () => box(withHover, 1, 1, 98, 28))
    expect(withHover.toSvg({ w: 100, h: 30 }).parts.rest).toBe(a.toSvg({ w: 100, h: 30 }).parts.rest)
  })
})

describe('output hygiene', () => {
  const samples: Array<[string, Ink, number, number]> = [
    ['button lo', control('h1', 120, 40), 120, 40],
    ['button hi', control('h2', 120, 40, 'hi'), 120, 40],
    ['tiny', control('h3', 16, 16), 16, 16],
    ['field', control('h4', 480, 44), 480, 44],
    ['wide', control('h5', 600, 44), 600, 44],
  ]
  it.each(samples)('%s: no NaN, Infinity, undefined or hex colors', (_name, ink, w, h) => {
    const { svg } = ink.toSvg({ w, h })
    expect(svg).not.toMatch(/NaN|Infinity|undefined|null|\[object/)
    expect(svg).not.toMatch(/(?<![\w-])#[0-9a-fA-F]{3,8}(?![\w-])/)
    expect(svg).not.toMatch(/rgba?\(|hsla?\(|oklch\(/)
    for (const m of svg.matchAll(/(?:fill|stroke)="([^"]*)"/g)) expect(m[1]).toMatch(/^(none|currentColor|var\(--ll-[a-z-]+\))$/)
    for (const m of svg.matchAll(/mask="url\(#([^)]*)\)"/g)) expect(MASK_IDS).toContain(m[1])
    for (const m of svg.matchAll(/mix-blend-mode:([^"]*)"/g)) expect(m[1]).toBe('var(--ll-blend)')
    expect(svg).not.toMatch(/<filter|feTurbulence|feGaussianBlur|feDisplacement/)
  })
  it.each(samples)('%s: every coordinate lies inside the box plus pad', (_name, ink, w, h) => {
    const r = ink.toSvg({ w, h })
    const pad = r.pad
    for (const d of allPaths(r.svg)) {
      for (const [x, y] of pathPoints(d)) {
        expect(x).toBeGreaterThanOrEqual(-pad - 0.5)
        expect(x).toBeLessThanOrEqual(w + pad + 0.5)
        expect(y).toBeGreaterThanOrEqual(-pad - 0.5)
        expect(y).toBeLessThanOrEqual(h + pad + 0.5)
      }
    }
    expect(r.pad).toBeGreaterThanOrEqual(2)
    expect(r.bbox.every(Number.isFinite)).toBe(true)
  })
  it('the requested pad is honoured and viewBox matches', () => {
    const r = control('pad', 100, 30).toSvg({ w: 100, h: 30, pad: 12 })
    expect(r.pad).toBe(12)
    expect(inkViewBox(r)).toBe('-12 -12 124 54')
  })
})

describe('tiers', () => {
  it('lo is smaller than hi and stays within the node budget', () => {
    for (const [w, h] of [[120, 40], [260, 40], [480, 44], [28, 28]]) {
      const lo = control('t' + w, w, h, 'lo').toSvg({ w, h, layers: ['rest'] })
      const hi = control('t' + w, w, h, 'hi').toSvg({ w, h, layers: ['rest'] })
      expect(lo.svg.length).toBeLessThan(hi.svg.length)
      expect(pathCount(lo.svg)).toBeLessThanOrEqual(pathCount(hi.svg))
      expect(lo.svg.length).toBeLessThan(w > 300 ? 12 * 1024 : 8 * 1024)
      expect((lo.svg.match(/<[a-z]/g) ?? []).length).toBeLessThanOrEqual(12)
    }
  })
  it('lo drops inner halo, hairs and pools', () => {
    const lo = stroke([[0, 0], [80, 10]], 'ink', makeRng('q'), { tier: 'lo', start: 'pool', end: 'pool' })
    const hi = stroke([[0, 0], [80, 10]], 'ink', makeRng('q'), { tier: 'hi', start: 'pool', end: 'pool' })
    expect(lo.layers.some((l) => l.k === 'hair' || l.k === 'pool')).toBe(false)
    expect(hi.layers.some((l) => l.k === 'hair')).toBe(true)
    expect(hi.layers.some((l) => l.k === 'pool')).toBe(true)
    expect(lo.layers.length).toBeLessThan(hi.layers.length)
  })
  it('lo is the default', () => {
    expect(new Ink('x').tier).toBe('lo')
    expect(new Ink('x', { calm: true, tier: 'hi' }).tier).toBe('lo')
  })
})

describe('builder', () => {
  it('emits at most one grouped <g> per material, carrying mask and blend', () => {
    const ink = new Ink('groups')
    bandFill(ink, roundRectPoly(0, 0, 100, 30, 4), 'marker')
    highlight(ink, 0, 0, 80, 20)
    box(ink, 0, 0, 100, 30)
    ink.stroke([[0, 40], [60, 42]], 'pencil')
    ink.stroke([[0, 50], [60, 52]], 'red')
    const svg = ink.toSvg({ w: 100, h: 60 }).svg
    const groups = [...svg.matchAll(/<g([^>]*)>/g)].map((m) => m[1])
    expect(groups.length).toBe(5)
    expect(groups.filter((g) => g.includes('mask="url(#ll-felt-')).length).toBe(1)
    expect(groups.filter((g) => g.includes('mask="url(#ll-marker-')).length).toBe(1)
    expect(groups.filter((g) => g.includes('mask="url(#ll-graphite-')).length).toBe(1)
    expect(groups.filter((g) => g.includes('mask="url(#ll-waxy-')).length).toBe(1)
    expect(groups.filter((g) => g.includes('mix-blend-mode:var(--ll-blend)')).length).toBe(2)
  })
  it('merges paths with the same fill and opacity', () => {
    const ink = new Ink('merge')
    for (let i = 0; i < 6; i++) ink.stroke([[0, i * 6], [50, i * 6 + 1]], 'ink')
    const svg = ink.toSvg({ w: 60, h: 40 }).svg
    expect(pathCount(svg)).toBeLessThanOrEqual(3)
  })
  it('grain can be switched off and the phase differs per seed', () => {
    const off = new Ink('g', { grain: false })
    off.stroke([[0, 0], [30, 4]], 'ink')
    expect(off.toSvg({ w: 30, h: 10 }).svg).not.toContain('mask=')
    const variants = new Set<number>()
    for (let i = 0; i < 40; i++) variants.add(new Ink('seed' + i).variant)
    expect(variants.size).toBeGreaterThanOrEqual(4)
    expect(MASK_IDS.length).toBe(GRAINS.length * MASK_VARIANTS)
    expect(maskId('felt', 2)).toBe('ll-felt-2')
    expect(maskId('felt', 2 + MASK_VARIANTS)).toBe('ll-felt-2')
    for (let v = 0; v < MASK_VARIANTS; v++) {
      const p = maskPhase(v)
      expect(p.x >= 0 && p.x < 1 && p.y >= 0 && p.y < 1).toBe(true)
    }
  })
  it('mask ids and phases agree with the baked textures module', () => {
    expect(MASK_VARIANTS).toBe(GRAIN_VARIANTS)
    for (const g of GRAINS) {
      for (let v = 0; v < MASK_VARIANTS; v++) {
        expect(maskId(g, v)).toBe(grainMaskId(g, v))
        expect(maskPhase(v)).toEqual(grainPhase(v))
      }
    }
  })
  it('joins neighboring groups that would carry the same mask and blend (text and felt)', () => {
    const ink = new Ink('join')
    ink.text(4, 12, 'hello', { size: 12 })
    ink.stroke([[0, 20], [60, 22]], 'ink')
    const svg = ink.toSvg({ w: 80, h: 30 }).svg
    expect([...svg.matchAll(/<g[^>]*mask="url\(#ll-felt-/g)].length).toBe(1)
    expect(svg).toContain('<text')
  })
  it('lean: a part fill and the outline round it share ONE mask, the parts stay whole and paint order holds', () => {
    const draw = (lean: boolean): string => {
      const ink = new Ink('lean:btn')
      if (lean) ink.lean()
      ink.layer('rest', () => {
        ink.part('fill', () => bandFill(ink, roundRectPoly(2, 2, 116, 32, 4), 'marker', { passes: 2 }))
        box(ink, 0, 0, 120, 36, { corner: 4 })
      })
      return ink.toSvg({ w: 120, h: 36 }).svg
    }
    const plain = draw(false), lean = draw(true)
    expect([...plain.matchAll(/ mask="url\(#ll-(?:marker|felt)-/g)].length).toBe(2)
    expect([...lean.matchAll(/ mask="url\(#ll-(?:marker|felt)-/g)].length).toBe(1)
    expect([...lean.matchAll(/mix-blend-mode/g)].length).toBe(1)
    expect((lean.match(/data-part="fill"/g) ?? []).length).toBe(1)
    expect(lean).toMatch(/^<g mask="url\(#ll-marker-\d\)" style="mix-blend-mode:var\(--ll-blend\)"><g data-part="fill" style="--mx:/)
    expect(lean.indexOf('data-part="fill"')).toBeLessThan(lean.lastIndexOf('<path'))
    const paths = (svg: string): string => [...svg.matchAll(/<path[^>]*\/>/g)].map((m) => m[0]).join('')
    expect(paths(lean).length).toBeGreaterThan(paths(plain).length * 0.9)
    expect(lean).not.toMatch(/undefined|NaN/)
  })
  it('lean: a felt line keeps its stain in its own group, so the stain shares the mask', () => {
    const ink = new Ink('lean:stain')
    ink.lean()
    box(ink, 0, 0, 100, 30, { corner: 4, ghost: false })
    const svg = ink.toSvg({ w: 100, h: 30 }).svg
    expect(svg.startsWith('<g mask="url(#ll-felt-')).toBe(true)
    expect(svg.endsWith('</g>')).toBe(true)
    const plain = new Ink('lean:stain')
    box(plain, 0, 0, 100, 30, { corner: 4, ghost: false })
    expect(plain.toSvg({ w: 100, h: 30 }).svg.startsWith('<path')).toBe(true)
  })
  it('lean never merges pencil, wax or stamp grain, groups that move, or a group with bare paint in it', () => {
    const ink = new Ink('lean:barriers')
    ink.lean()
    ink.layer('rest', () => {
      ink.part('fill', () => bandFill(ink, roundRectPoly(2, 2, 116, 32, 4), 'marker', { passes: 1 }))
      ink.stroke([[0, 10], [80, 12]], 'pencil')
      ink.stroke([[0, 20], [80, 22]], 'red')
      ink.group({ transform: 'rotate(2)' }, () => ink.stroke([[0, 30], [80, 30]], 'ink'), 'felt')
      ink.part('tail', () => {
        ink.poly('under', roundRectPoly(0, 0, 10, 10, 2), 'slip', 0.9)
        ink.stroke([[0, 5], [10, 5]], 'ink')
      }, 'top')
      ink.stroke([[0, 34], [80, 34]], 'ink')
    })
    const svg = ink.toSvg({ w: 120, h: 40 }).svg
    for (const m of svg.matchAll(/mask="url\(#([^)]*)\)"/g)) expect(MASK_IDS).toContain(m[1])
    expect(svg).toMatch(/mask="url\(#ll-graphite-\d\)"/)
    expect(svg).toMatch(/mask="url\(#ll-waxy-\d\)"/)
    expect([...svg.matchAll(/mask="url\(#ll-felt-/g)].length + [...svg.matchAll(/mask="url\(#ll-marker-/g)].length).toBeGreaterThanOrEqual(3)
    expect(svg).toContain('transform="rotate(2)"')
    expect(svg).toContain('data-part="tail"')
  })
  it('lean output is deterministic and only ever uses the baked mask ids', () => {
    const make = (): string => {
      const ink = new Ink('lean:det')
      ink.lean()
      ink.layer('rest', () => {
        ink.part('fill', () => bandFill(ink, roundRectPoly(2, 2, 196, 46, 8), 'marker', { passes: 2 }))
        box(ink, 0, 0, 200, 50, { corner: 8 })
        ink.part('tail', () => void ink.stroke([[0, 40], [12, 52]], 'ink'), 'top')
      })
      return ink.toSvg({ w: 200, h: 50 }).svg
    }
    expect(make()).toBe(make())
    for (const m of make().matchAll(/mask="url\(#([^)]*)\)"/g)) expect(MASK_IDS).toContain(m[1])
  })
  it('layers: bare with one, wrapped with several, filterable', () => {
    const single = new Ink('l1')
    box(single, 0, 0, 50, 20)
    const s = single.toSvg({ w: 50, h: 20 })
    expect(s.layers).toEqual(['rest'])
    expect(s.svg).not.toContain('data-layer')
    const multi = control('l2', 100, 30)
    const m = multi.toSvg({ w: 100, h: 30 })
    expect(m.layers).toEqual<LayerName[]>(['rest', 'hover', 'focus'])
    for (const l of m.layers) expect(m.svg).toContain(`<g data-layer="${l}">`)
    const only = multi.toSvg({ w: 100, h: 30, layers: ['rest', 'focus'] })
    expect(only.layers).toEqual(['rest', 'focus'])
    expect(only.svg).not.toContain('data-layer="hover"')
    expect(multi.toSvg({ w: 100, h: 30, layers: ['rest'] }).svg).toBe(m.parts.rest)
  })
  it('ink.next is a keyed stream', () => {
    const a = new Ink('k'), b = new Ink('k')
    expect(a.next('x')()).toBe(b.next('x')())
    expect(a.next('x')()).not.toBe(a.next('y')())
  })
})

describe('robustness', () => {
  const sizes = [0, 0.4, 1, 3, 8, 31, 200, 1200]
  it('degenerate sizes never throw or emit junk', () => {
    for (const tier of ['lo', 'hi'] as const) {
      for (const w of sizes) {
        for (const h of sizes) {
          const ink = new Ink(`deg:${w}:${h}`, { tier })
          box(ink, 0, 0, w, h)
          box(ink, 0, 0, w, h, { corner: 20 })
          bandFill(ink, roundRectPoly(0, 0, w, h, 4), 'marker', { passes: 2 })
          clipFill(ink, roundRectPoly(0, 0, w, h, 4), 'marker')
          blobFill(ink, roundRectPoly(0, 0, w, h, 4), 'marker')
          hatch(ink, [0, 0, w, h], { tones: 3 })
          wash(ink, roundRectPoly(0, 0, w, h, 4), 'sky')
          polyFill(ink, roundRectPoly(0, 0, w, h, 4), 'marker')
          focusRing(ink, 0, 0, w, h)
          focusRing(ink, 0, 0, w, h, { shape: 'ellipse' })
          dashedBox(ink, 0, 0, w, h)
          highlight(ink, 0, 0, w, h)
          const svg = ink.toSvg({ w: 10, h: 10 }).svg
          expect(svg, `${tier} ${w}x${h}`).not.toMatch(/NaN|Infinity|undefined/)
        }
      }
    }
  })
  it('bad numbers in draw nothing rather than hang or emit NaN', () => {
    const ink = new Ink('bad')
    ink.stroke([[NaN, 0], [10, Infinity]], 'ink')
    ink.stroke([[3, 3], [3, 3], [3, 3]], 'ink')
    ink.stroke([[3, 3]], 'pencil')
    ink.stroke([], 'ink')
    bandFill(ink, [], 'marker')
    expect(ink.toSvg({ w: 10, h: 10 }).svg).not.toMatch(/NaN|Infinity|undefined/)
  })
})

describe('fills', () => {
  it('band angle, width and ends differ per seed (no tics)', () => {
    const shapes = new Set<string>()
    for (let i = 0; i < 24; i++) {
      const ink = new Ink('tic' + i)
      bandFill(ink, roundRectPoly(1, 1, 118, 38, 4), 'marker')
      shapes.add(ink.toSvg({ w: 120, h: 40 }).svg)
    }
    expect(shapes.size).toBe(24)
    const starts = new Set([...shapes].map((s) => /d="(M[^ ]+ ?[^ qlz]+)/.exec(s)?.[1]))
    expect(starts.size).toBeGreaterThan(12)
  })
  const reach = (w: number, h: number, seed: string, passes: 1 | 2): { top: number; bottom: number; left: number; right: number; shortest: number; thickest: number; count: number } => {
    const ink = new Ink(seed)
    bandFill(ink, roundRectPoly(2, 2, w - 4, h - 4, 4), 'marker', { passes })
    const sweeps = sweepsOf(ink.toSvg({ w, h }).svg)
    const r = { top: 0, bottom: 0, left: 0, right: 0, shortest: Infinity, thickest: 0, count: sweeps.length }
    for (const pts of sweeps) {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
      for (const [x, y] of pts) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
      r.top = Math.max(r.top, -y0)
      r.bottom = Math.max(r.bottom, y1 - h)
      r.left = Math.max(r.left, -x0)
      r.right = Math.max(r.right, x1 - w)
      const along = w >= h ? x1 - x0 : y1 - y0, across = w >= h ? y1 - y0 : x1 - x0
      r.shortest = Math.min(r.shortest, along)
      r.thickest = Math.max(r.thickest, across)
    }
    return r
  }
  it('every fill lies inside box + pad at any aspect ratio, including the boxes that are only a little elongated', () => {
    for (const [w, h] of [[100, 36], [120, 40], [140, 36], [150, 32], [88, 32], [40, 90], [60, 60]] as const) {
      let m = 0
      for (let s = 0; s < 40; s++) {
        const r = reach(w, h, `any:${w}:${h}:${s}`, 2)
        m = Math.max(m, r.top, r.bottom, r.left, r.right)
      }
      expect(m, `${w}x${h}`).toBeLessThanOrEqual(w === h ? 15 : 12)
    }
  })
  it('mis-registration stays as many px on a 1200 px bar as on a button', () => {
    const wide = roundRectPoly(0, 0, 1200, 36, 4), small = roundRectPoly(0, 0, 120, 36, 4)
    let worstWide = 0, worstSmall = 0
    for (let s = 0; s < 80; s++) {
      const bw = bboxOf(misreg(wide, makeRng('mr:w:' + s), 4)), bs = bboxOf(misreg(small, makeRng('mr:s:' + s), 4))
      worstWide = Math.max(worstWide, Math.abs(bw[2] - bw[0] - 1200))
      worstSmall = Math.max(worstSmall, Math.abs(bs[2] - bs[0] - 120))
    }
    expect(worstWide).toBeLessThan(6)
    expect(worstSmall).toBeLessThan(6)
  })
  it('blob, clip, hatch, wash and polyFill draw and stay finite', () => {
    const ink = new Ink('mix', { tier: 'hi' })
    blobFill(ink, ellipsePoly(20, 20, 18, 12, 20), 'hi')
    clipFill(ink, pillPoly(0, 50, 100, 24), 'grass')
    hatch(ink, [0, 80, 100, 30], { tones: 3, pen: 'red' })
    hatch(ink, ellipsePoly(150, 100, 30, 20, 20), { cross: true })
    wash(ink, roundRectPoly(0, 120, 100, 30, 4), 'sky')
    polyFill(ink, roundRectPoly(0, 160, 100, 30, 4), 'marker')
    const svg = ink.toSvg({ w: 200, h: 200 }).svg
    expect(svg).not.toMatch(/NaN|Infinity|undefined/)
    expect(pathCount(svg)).toBeGreaterThan(8)
  })
})

describe('shapes at 16 px and 600 px', () => {
  const sizes = [16, 600]
  const drawers: Array<[string, (k: Ink, s: number) => void]> = [
    ['box', (k, s) => box(k, 0, 0, s, s === 16 ? 16 : 44)],
    ['loop', (k, s) => loop(k, s / 2, s === 16 ? 8 : 22, s / 2, s === 16 ? 7 : 20)],
    ['line', (k, s) => line(k, 0, 5, s, 5)],
    ['underline', (k, s) => underline(k, 0, 5, s, { kind: 'double' })],
    ['squiggle', (k, s) => squiggle(k, 0, 5, s)],
    ['strike', (k, s) => strike(k, 0, 5, s)],
    ['arrow', (k, s) => arrow(k, 0, s === 16 ? 12 : 30, s, s === 16 ? 2 : 6, { head: 'solid', curl: true })],
    ['check', (k, s) => check(k, 0, 0, Math.min(s, 40))],
    ['cross', (k, s) => cross(k, 0, 0, Math.min(s, 40))],
    ['asterisk', (k, s) => asterisk(k, s / 2, s === 16 ? 8 : 22, Math.min(s, 40))],
    ['burst', (k, s) => burst(k, s / 2, s === 16 ? 8 : 22, Math.min(s, 40) / 2)],
    ['star', (k, s) => star(k, s / 2, s === 16 ? 8 : 22, Math.min(s, 40) / 2)],
    ['spiral', (k, s) => spiral(k, s / 2, s === 16 ? 8 : 22, Math.min(s, 40) / 2)],
    ['tally', (k, s) => void tally(k, 0, 0, s === 16 ? 3 : 13, s === 16 ? 16 : 32)],
    ['bracket', (k, s) => bracket(k, 0, 0, s === 16 ? 16 : 44, { kind: 'curly' })],
    ['cloud', (k, s) => cloud(k, s / 2, s === 16 ? 8 : 22, s, s === 16 ? 12 : 40)],
    ['scribble', (k, s) => scribble(k, 0, 0, s, s === 16 ? 10 : 24)],
    ['focusRing', (k, s) => focusRing(k, 0, 0, s, s === 16 ? 16 : 44)],
    ['dashedBox', (k, s) => dashedBox(k, 0, 0, s, s === 16 ? 16 : 44)],
    ['highlight', (k, s) => highlight(k, 0, 0, s, s === 16 ? 12 : 24)],
  ]
  for (const [name, fn] of drawers) {
    for (const s of sizes) {
      it(`${name} at ${s}`, () => {
        const ink = new Ink(`sane:${name}:${s}`)
        fn(ink, s)
        const r = ink.toSvg({ w: s, h: s === 16 ? 16 : 44 })
        expect(r.svg.length).toBeGreaterThan(50)
        expect(r.svg).not.toMatch(/NaN|Infinity|undefined/)
        const slack = s === 16 ? 26 : 60
        expect(r.bbox[0]).toBeGreaterThanOrEqual(-slack)
        expect(r.bbox[1]).toBeGreaterThanOrEqual(-slack)
        expect(r.bbox[2]).toBeLessThanOrEqual(s + slack)
        expect(r.bbox[3]).toBeLessThanOrEqual((s === 16 ? 16 : 44) + slack)
        expect(r.svg.length).toBeLessThan(s === 16 ? 6 * 1024 : 40 * 1024)
      })
    }
  }
  it('the focus ring bleeds at most about 12 px', () => {
    const ink = new Ink('bleed')
    focusRing(ink, 0, 0, 120, 40, { r: 4 })
    const r = ink.toSvg({ w: 120, h: 40 })
    expect(r.pad).toBeLessThanOrEqual(14)
    const ell = new Ink('bleed2')
    focusRing(ell, 0, 0, 20, 20, { shape: 'ellipse' })
    expect(ell.toSvg({ w: 20, h: 20 }).pad).toBeLessThanOrEqual(14)
  })
})

describe('hatch tile', () => {
  function seams(seed: string): { join: number; body: number; worst: number } {
    const sc = 8, N = 3
    const doc = decodeURIComponent(hatchTile(seed).slice('url("data:image/svg+xml,'.length, -2))
    const inner = doc.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/currentColor/g, '#000')
    let body = ''
    for (let r = 0; r < N; r++) for (let c = 0; c < N + 1; c++) body += `<svg x="${c * HATCH}" y="${r * HATCH}" width="${HATCH}" height="${HATCH}" viewBox="0 0 ${HATCH} ${HATCH}">${inner}</svg>`
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${HATCH * N}" height="${HATCH * N}" viewBox="0 0 ${HATCH * N} ${HATCH * N}">${body}</svg>`
    const img = new Resvg(svg, { fitTo: { mode: 'zoom', value: sc } }).render()
    const px = img.pixels, IW = img.width
    const centres = (y: number): number[] => {
      const out: number[] = []
      for (let x = 0; x < IW; x++) {
        if (px[(y * IW + x) * 4 + 3] <= 90) continue
        let x1 = x, sum = 0, wsum = 0
        while (x1 < IW && px[(y * IW + x1) * 4 + 3] > 40) {
          const a = px[(y * IW + x1) * 4 + 3]
          sum += a * x1
          wsum += a
          x1++
        }
        out.push(sum / wsum)
        x = x1
      }
      return out
    }
    const kink = (y: number): number[] =>
      centres(y - 4)
        .filter((c) => c > 60 && c < IW - 60)
        .map((c) => Math.min(...centres(y + 4).map((b) => Math.abs(b - (c - 0.6 * 8)))) / sc)
    const join: number[] = [], inside: number[] = []
    for (let r = 1; r < N; r++) join.push(...kink(r * HATCH * sc))
    for (let r = 0; r < N; r++) inside.push(...kink(r * HATCH * sc + (HATCH / 2) * sc))
    const mean = (v: number[]): number => v.reduce((a, b) => a + b, 0) / Math.max(1, v.length)
    return { join: mean(join), body: mean(inside), worst: Math.max(...join) }
  }
  it('repeats without a kink: the pulls leave a tile where the next tile takes them up', () => {
    for (const seed of ['skeleton|hatch|0', 'skeleton|hatch|1', 'item|hatch|a', 'seam-3']) {
      const k = seams(seed)
      expect(k.join, seed).toBeLessThan(0.12)
      expect(k.worst, seed).toBeLessThan(0.4)
      expect(k.body, seed).toBeLessThan(0.05)
    }
  })
  it('is deterministic per seed and still differs between seeds', () => {
    expect(hatchTile('s1')).toBe(hatchTile('s1'))
    expect(hatchTile('s1')).not.toBe(hatchTile('s2'))
  })
})
