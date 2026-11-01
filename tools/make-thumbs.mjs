#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { PROJECT_ROOT, c, parseArgs, toPosix } from './lib/util.mjs'

const WIDTH = 640
const QUALITY = 80
const MIN_ASPECT = 1.3
const MAX_ASPECT = 1.9
const TITLE_STRIP = 0.04
const BUDGET_MB = 25

const rel = (p) => toPosix(path.relative(PROJECT_ROOT, p))
const dirs = {
  meta: path.join(PROJECT_ROOT, 'src/docs/meta'),
  components: path.join(PROJECT_ROOT, 'lookdev/components'),
  art: path.join(PROJECT_ROOT, 'lookdev/art'),
  out: path.join(PROJECT_ROOT, 'public/thumbs'),
  browser: path.join(PROJECT_ROOT, 'lookdev/browser/thumbs'),
  scratch: path.join(PROJECT_ROOT, 'lookdev/_tmp/thumbs'),
}
const TS_MANIFEST = path.join(PROJECT_ROOT, 'src/docs/content/home/thumbs.generated.ts')

const listPngs = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.png')) : [])
const stem = (f) => f.replace(/\.png$/, '')

export function pngSize(file) {
  const fd = fs.openSync(file, 'r')
  try {
    const head = Buffer.alloc(24)
    fs.readSync(fd, head, 0, 24, 0)
    if (head.toString('latin1', 1, 4) !== 'PNG') throw new Error(`${file} is not a PNG`)
    return { w: head.readUInt32BE(16), h: head.readUInt32BE(20) }
  } finally {
    fs.closeSync(fd)
  }
}

export function pickSource(slug, slugs, files = { components: listPngs(dirs.components), art: listPngs(dirs.art) }) {
  if (fs.existsSync(path.join(dirs.browser, `${slug}.png`))) return path.join(dirs.browser, `${slug}.png`)
  if (files.components.includes(`${slug}.png`)) return path.join(dirs.components, `${slug}.png`)
  const related = files.components
    .filter((f) => f.startsWith(`${slug}-`) && !slugs.has(stem(f)))
    .sort((a, b) => a.length - b.length || a.localeCompare(b))
  if (related.length) return path.join(dirs.components, related[0])
  const art = files.art.filter((f) => stem(f) === slug || stem(f) === `${slug}s` || stem(f).startsWith(`${slug}-`)).sort((a, b) => a.length - b.length || a.localeCompare(b))
  return art.length ? path.join(dirs.art, art[0]) : null
}

export function cropFor({ w, h }) {
  const aspect = w / h
  if (aspect > MAX_ASPECT) {
    const nw = Math.round(h * MAX_ASPECT)
    return { w: nw, h, x: Math.round((w - nw) / 2), y: 0 }
  }
  if (aspect < MIN_ASPECT) {
    const nh = Math.round(w / MIN_ASPECT)
    return { w, h: nh, x: 0, y: Math.min(Math.round(h * TITLE_STRIP), h - nh) }
  }
  return null
}

function hasSips() {
  if (process.platform !== 'darwin') return false
  return spawnSync('sips', ['--help'], { stdio: 'ignore' }).error === undefined
}

function sipsSize(file) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' })
  return { w: Number(/pixelWidth:\s*(\d+)/.exec(out)?.[1]), h: Number(/pixelHeight:\s*(\d+)/.exec(out)?.[1]) }
}

function build(slug, src, useSips) {
  const size = pngSize(src)
  if (!useSips) {
    const dest = path.join(dirs.out, `${slug}.png`)
    fs.copyFileSync(src, dest)
    return { file: `${slug}.png`, ...size, dest }
  }
  const dest = path.join(dirs.out, `${slug}.jpg`)
  let input = src
  const crop = cropFor(size)
  if (crop) {
    fs.mkdirSync(dirs.scratch, { recursive: true })
    input = path.join(dirs.scratch, `${slug}.png`)
    execFileSync('sips', ['-c', String(crop.h), String(crop.w), '--cropOffset', String(crop.y), String(crop.x), src, '--out', input], { stdio: 'ignore' })
  }
  execFileSync('sips', ['--resampleWidth', String(WIDTH), '-s', 'format', 'jpeg', '-s', 'formatOptions', String(QUALITY), input, '--out', dest], { stdio: 'ignore' })
  const out = sipsSize(dest)
  return { file: `${slug}.jpg`, ...out, dest }
}

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(path.join(dirs.out, 'manifest.json'), 'utf8'))
  } catch {
    return {}
  }
}

function writeManifest(entries) {
  const sorted = Object.fromEntries(Object.keys(entries).sort().map((k) => [k, entries[k]]))
  fs.writeFileSync(path.join(dirs.out, 'manifest.json'), JSON.stringify(sorted, null, 2) + '\n')
  const rows = Object.entries(sorted)
    .map(([slug, t]) => `  ${JSON.stringify(slug)}: { file: ${JSON.stringify(t.file)}, w: ${t.w}, h: ${t.h} },`)
    .join('\n')
  fs.mkdirSync(path.dirname(TS_MANIFEST), { recursive: true })
  fs.writeFileSync(
    TS_MANIFEST,
    `export interface Thumb {\n  file: string\n  w: number\n  h: number\n}\n\n` +
      `export const THUMBS: Readonly<Record<string, Thumb>> = {\n${rows}\n}\n`,
  )
}

function main() {
  const { flags, errors } = parseArgs(process.argv.slice(2), { bool: ['force', 'check', 'quiet'], list: ['only'] })
  if (errors.length) {
    console.error(errors.join('\n'))
    process.exit(2)
  }
  const slugs = fs.existsSync(dirs.meta)
    ? fs.readdirSync(dirs.meta).filter((f) => /\.tsx?$/.test(f) && !f.startsWith('_')).map((f) => f.replace(/\.tsx?$/, ''))
    : []
  const known = new Set(slugs)
  const wanted = flags.only.length ? slugs.filter((s) => flags.only.includes(s)) : slugs
  const files = { components: listPngs(dirs.components), art: listPngs(dirs.art) }
  const manifest = readManifest()
  const useSips = hasSips()
  if (!useSips && !flags.check) console.warn(c.yellow('warning: sips is not available; copying the full-size PNGs (large). Run this on macOS to resize.'))

  const missing = []
  const stale = []
  let built = 0
  if (!flags.check) fs.mkdirSync(dirs.out, { recursive: true })
  for (const slug of wanted) {
    const src = pickSource(slug, known, files)
    if (!src) {
      missing.push(slug)
      delete manifest[slug]
      continue
    }
    const entry = manifest[slug]
    const dest = entry ? path.join(dirs.out, entry.file) : null
    const fresh = dest && fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs
    if (fresh && !flags.force) continue
    if (flags.check) {
      stale.push(slug)
      continue
    }
    const { dest: _dest, ...t } = build(slug, src, useSips)
    manifest[slug] = t
    built++
    if (!flags.quiet) console.log(`${c.green('thumb')} ${slug.padEnd(22)} ${rel(src)} -> ${t.file} (${t.w}x${t.h})`)
  }
  if (flags.check) {
    if (missing.length) console.log(`no sheet for: ${missing.join(', ')}`)
    if (stale.length) console.log(`${c.red('missing or stale')}: ${stale.join(', ')}`)
    process.exit(stale.length ? 1 : 0)
  }
  for (const slug of Object.keys(manifest)) {
    if (!known.has(slug) || !fs.existsSync(path.join(dirs.out, manifest[slug].file))) delete manifest[slug]
  }
  writeManifest(manifest)

  const bytes = fs.readdirSync(dirs.out).reduce((n, f) => n + fs.statSync(path.join(dirs.out, f)).size, 0)
  const mb = bytes / 1024 / 1024
  console.log(`${built} built, ${Object.keys(manifest).length} thumbnails, ${mb.toFixed(1)} MB in ${rel(dirs.out)}`)
  if (missing.length) console.log(c.yellow(`no look-dev sheet for: ${missing.join(', ')} (the gallery draws a placeholder)`))
  if (mb > BUDGET_MB) console.warn(c.yellow(`warning: ${mb.toFixed(1)} MB is over the ${BUDGET_MB} MB budget`))
}

if (import.meta.url === `file://${process.argv[1]}`) main()
