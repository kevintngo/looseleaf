#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { tsImport } from 'tsx/esm/api'
import { loadBatches } from './art-batches.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TSCONFIG = path.join(ROOT, 'tsconfig.json')
const imp = (rel) => tsImport(pathToFileURL(path.join(ROOT, rel)).href, { parentURL: import.meta.url, tsconfig: TSCONFIG })
const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
const ID = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

const args = process.argv.slice(2)
const flag = (f) => args.includes(f)
const opt = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : undefined)
const COMPLETE = flag('--complete')
const STRICT = flag('--strict')
const JSON_OUT = flag('--json')
const ONLY = opt('--batch')

const FORBIDDEN = [
  [/#[0-9a-fA-F]{3,8}\b/, 'hex colour (colours are engine paint keys)'],
  [/\bMath\.random\b/, 'Math.random (art is deterministic)'],
  [/\bDate\b/, 'Date'],
  [/\b(window|document|localStorage|sessionStorage|navigator)\b/, 'DOM global'],
  [/\b(fetch|eval|require|XMLHttpRequest)\s*\(/, 'fetch / eval / require'],
  [/\bprocess\./, 'process'],
  [/\bfilter\s*[=:]|feTurbulence|feGaussianBlur/, 'filters (shadows are CSS)'],
]

const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/.*$/gm, '$1')
const strings = (t) => [...stripComments(t).matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)].map((m) => m[1] ?? m[2] ?? m[3] ?? '')

const batches = loadBatches()
const report = { ok: true, batches: [], totals: { errors: 0, warnings: 0, drawn: 0, planned: 0 } }

function add(b, level, code, msg, id, at) {
  b.problems.push({ level, code, id, at, msg })
  if (level === 'error') report.totals.errors++
  else report.totals.warnings++
}

const { validateArt, kindOfDef } = await imp('src/lib/ink/art/dsl.ts')
const { hasGlyph } = await imp('src/lib/ink/art/glyph-text.ts')
const sk = await imp('src/lib/ink/art-draw.ts')
const { isGen } = await imp('src/lib/ink/art/types.ts')

const SIZES = {
  icon: [12, 16, 20, 24, 32, 48],
  doodle: [32, 48, 64, 96, 128],
  sticker: [48, 64, 96, 128],
  mascot: [32, 48, 96, 160],
}
const NODE_BUDGET = { icon: 8, doodle: 26, sticker: 80, mascot: 60 }
const BYTE_BUDGET = { icon: 6200, doodle: 26000, sticker: 60000, mascot: 60000 }

function checkOutput(b, id, size, svg, kind, what) {
  const bad = /NaN|undefined|Infinity|\[object/.exec(svg)
  if (bad) add(b, 'error', 'output', `${what} at ${size}px contains "${bad[0]}"`, id)
  if (/#[0-9a-fA-F]{3,8}["' ;)]/.test(svg)) add(b, 'error', 'output', `${what} at ${size}px contains a hex colour`, id)
  const colours = [...svg.matchAll(/(?:fill|stroke|stop-color)="([^"]+)"/g)].map((m) => m[1]).filter((c) => c !== 'none' && !c.startsWith('url('))
  for (const c of colours) if (!c.startsWith('var(--ll-') && c !== 'currentColor') add(b, 'error', 'output', `${what} at ${size}px paints with "${c}" (only var(--ll-*) and currentColor)`, id)
  const nodes = (svg.match(/<(path|g|use|circle|rect|clipPath|mask)\b/g) ?? []).length
  const limit = NODE_BUDGET[kind]
  if (limit && nodes > limit * (size >= (kind === 'icon' ? 41 : 96) ? 1.8 : 1)) add(b, 'warn', 'nodes', `${what} at ${size}px is ${nodes} DOM nodes (budget ${limit})`, id)
  const bytes = svg.length
  const bl = BYTE_BUDGET[kind]
  if (bl && bytes > bl * (size >= (kind === 'icon' ? 41 : 96) ? 2.4 : 1)) add(b, 'warn', 'bytes', `${what} at ${size}px is ${(bytes / 1024).toFixed(1)} KB (budget ${(bl / 1024).toFixed(1)} KB)`, id)
}

async function checkBatch(bt) {
  const b = { batch: bt.batch, file: bt.file, kind: bt.kind, present: false, planned: bt.ids.length, drawn: [], missing: [], problems: [] }
  report.batches.push(b)
  report.totals.planned += bt.ids.length
  if (bt.ids.length > 16) add(b, 'error', 'batch-size', `${bt.ids.length} ids; a batch has at most 16`)
  const abs = path.join(ROOT, bt.file)
  if (!existsSync(abs)) {
    b.missing = bt.ids.slice()
    if (COMPLETE) add(b, 'error', 'file', `${bt.file} does not exist`)
    return
  }
  b.present = true
  const text = readFileSync(abs, 'utf8')
  const code = stripComments(text)
  for (const [re, what] of FORBIDDEN) {
    if (what.startsWith('hex')) {
      if (strings(text).some((s) => re.test(s))) add(b, 'error', 'source', `${what} in a string`)
    } else if (re.test(code)) add(b, 'error', 'source', `${what} is not allowed in art files`)
  }
  const allowedImports = new Set(['@/lib/ink/art/types', ...(bt.extraFiles ?? []).map((f) => `@/lib/ink/art/${bt.file.split('/').slice(-2)[0]}/${path.basename(f, '.ts')}`)])
  for (const m of code.matchAll(/^\s*import\s+(?:type\s+)?[^'"]*from\s+['"]([^'"]+)['"]/gm)) if (!allowedImports.has(m[1])) add(b, 'error', 'import', `import from "${m[1]}" is not allowed (art files import only ${[...allowedImports].join(', ')})`)
  for (const m of code.matchAll(/\bimport\s*\(/g)) add(b, 'error', 'import', 'dynamic import in an art file')
  const name = camel(path.basename(bt.file, '.ts'))
  let mod
  try {
    mod = await imp(bt.file)
  } catch (e) {
    add(b, 'error', 'load', `cannot load ${bt.file}: ${String(e.message).split('\n')[0]}`)
    return
  }
  const keys = Object.keys(mod)
  if (!keys.includes(name)) {
    add(b, 'error', 'export', `must export const ${name}`)
    return
  }
  for (const k of keys) if (k !== name) add(b, 'error', 'export', `extra export "${k}": a batch file exports only ${name}`)
  const defs = mod[name]
  const ids = Object.keys(defs)
  b.drawn = ids
  report.totals.drawn += ids.length
  const allowed = new Set(bt.ids)
  const tiers = bt.tiers ?? {}
  for (const id of ids) {
    if (!ID.test(id) || id.length > 28) add(b, 'error', 'id', `"${id}" is not a kebab-case id of at most 28 characters`, id)
    if (!allowed.has(id)) add(b, 'error', 'extra-id', `"${id}" is not an id of batch ${bt.batch} (ids: notes/art-batches.json)`, id)
  }
  b.missing = bt.ids.filter((i) => !ids.includes(i))
  if (b.missing.length) add(b, COMPLETE ? 'error' : 'warn', 'missing-ids', `${b.missing.length} of ${bt.ids.length} ids still to draw: ${b.missing.join(', ')}`)
  const glyph = (font, ch) => hasGlyph(font, ch)
  const kind = bt.kind
  for (const id of ids) {
    const def = defs[id]
    if (isGen(def)) {
      if (!def.text || typeof def.text !== 'string') add(b, 'error', 'gen', 'generator preset needs `text`', id)
      for (const ch of String(def.text ?? '').toUpperCase()) if (!hasGlyph(def.gen === 'stamp' ? 'type' : 'hand', ch)) add(b, 'error', 'text', `no glyph for "${ch}"`, id)
      if (def.gen === 'stamp' && !['rect', 'round', 'burst', 'void'].includes(def.shape)) add(b, 'error', 'gen', `unknown stamp shape "${def.shape}"`, id)
    } else {
      for (const p of validateArt(def, { id, kind: kindOfDef(def), glyph })) add(b, p.level, p.code, p.msg, id, p.at)
      if (kind !== 'prop' && kind !== 'scene') {
        if (!def.small) add(b, 'error', 'tier', 'missing `small` redraw (icon 16, doodle 48, sticker 64, mascot 48): the low tier is redrawn, not scaled', id)
        const microList = kind === 'mascot' ? tiers.head32 : tiers.micro
        if (microList?.includes(id) && !def.micro) add(b, 'error', 'tier', `missing \`micro\` redraw (${kind === 'mascot' ? 'face-only redraw for 16-27 px' : '8-12 px'}); the batch lists it`, id)
        const hiList = [...(tiers.hi48 ?? []), ...(tiers.hi128 ?? []), ...(tiers.hero160 ?? [])]
        if (hiList.includes(id) && !def.hi) add(b, COMPLETE ? 'error' : 'warn', 'tier', 'missing `hi` extras (the batch lists a 48 / 128 / hero tier for it)', id)
      }
      if (!def.tags?.length && kind === 'icon') add(b, 'warn', 'tags', 'no `tags` (search words)', id)
    }
    try {
      for (const size of SIZES[kind] ?? []) {
        if (isGen(def)) {
          if (def.gen === 'stamp') {
            const s1 = sk.stamp(def.text, def.shape, { ...def, seed: id }).svg
            const s2 = sk.stamp(def.text, def.shape, { ...def, seed: id }).svg
            if (s1 !== s2) add(b, 'error', 'determinism', 'stamp is not deterministic', id)
            checkOutput(b, id, size, s1, 'sticker', 'stamp')
            break
          }
          const r1 = sk.renderSticker(def, size, id, { peel: size === 96 }).svg
          const r2 = sk.renderSticker(def, size, id, { peel: size === 96 }).svg
          if (r1 !== r2) add(b, 'error', 'determinism', `not deterministic at ${size}px`, id)
          checkOutput(b, id, size, r1, 'sticker', 'badge')
          continue
        }
        const v = sk.variantFor(kind, size)
        if (kind === 'sticker') {
          const r1 = sk.dieCut(def, size, id, { peel: size === 96 }).svg
          const r2 = sk.dieCut(def, size, id, { peel: size === 96 }).svg
          if (r1 !== r2) add(b, 'error', 'determinism', `not deterministic at ${size}px`, id)
          checkOutput(b, id, size, r1, kind, 'die-cut')
        } else {
          for (const tone of kind === 'icon' ? ['ui', 'doodle'] : ['doodle']) {
            const r1 = sk.drawSkeleton(def, size, id, { tone }).svg
            const r2 = sk.drawSkeleton(def, size, id, { tone }).svg
            if (r1 !== r2) add(b, 'error', 'determinism', `not deterministic at ${size}px (${tone})`, id)
            if (!r1) add(b, 'error', 'output', `draws nothing at ${size}px (${v})`, id)
            checkOutput(b, id, size, r1, kind, `${v} tier ${tone}`)
          }
        }
      }
    } catch (e) {
      add(b, 'error', 'draw', `drawing throws: ${String(e.message).split('\n')[0]}`, id)
    }
  }
}

const todo = batches.filter((x) => !ONLY || x.batch === ONLY)
if (ONLY && !todo.length) {
  console.error(`no batch "${ONLY}" in notes/art-batches.json`)
  process.exit(2)
}
{
  const seen = new Map()
  for (const bt of batches) for (const id of bt.ids) {
    const k = `${bt.kind}:${id}`
    if (seen.has(k) && seen.get(k) !== bt.batch) {
      report.ok = false
      report.totals.errors++
      console.error(`error: ${bt.kind} id "${id}" is in both ${seen.get(k)} and ${bt.batch}`)
    }
    seen.set(k, bt.batch)
  }
}
for (const bt of todo) await checkBatch(bt)
report.ok = report.totals.errors === 0 && !(STRICT && report.totals.warnings)

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2))
} else {
  for (const b of report.batches) {
    const errs = b.problems.filter((p) => p.level === 'error').length
    const warns = b.problems.filter((p) => p.level === 'warn').length
    const state = !b.present ? 'not started' : `${b.drawn.length}/${b.planned} drawn`
    console.log(`${errs ? 'FAIL' : warns ? 'warn' : ' ok '}  ${b.batch.padEnd(26)} ${state}${errs || warns ? `  (${errs} errors, ${warns} warnings)` : ''}`)
    for (const p of b.problems) console.log(`        ${p.level === 'error' ? 'error' : 'warn '} ${p.code}${p.id ? ` [${p.id}${p.at ? ' ' + p.at : ''}]` : ''}: ${p.msg}`)
  }
  console.log(`\n${report.totals.drawn}/${report.totals.planned} ids drawn in ${report.batches.filter((b) => b.present).length} batch files, ${report.totals.errors} errors, ${report.totals.warnings} warnings`)
}
process.exitCode = report.ok ? 0 : 1
