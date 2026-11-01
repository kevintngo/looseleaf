#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { loadBatches, ROOT } from './art-batches.mjs'
const ART = path.join(ROOT, 'src/lib/ink/art')

export const KINDS = {
  icon: { dir: 'icons', map: 'icons', batches: 'iconBatches', type: 'IconName', support: ['aliases.ts'] },
  doodle: { dir: 'doodles', map: 'doodles', batches: 'doodleBatches', type: 'DoodleName', support: [] },
  sticker: { dir: 'stickers', map: 'stickers', batches: 'stickerBatches', type: 'StickerName', support: [] },
  mascot: { dir: 'mascots', map: 'mascot', batches: 'mascotBatches', type: 'MascotPose', support: [] },
  prop: { dir: 'props', map: 'props', batches: 'propBatches', type: 'PropName', support: [] },
  scene: { dir: 'scenes', map: 'scenes', batches: 'sceneBatches', type: 'SceneName', support: [] },
}

export const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
const base = (f) => path.basename(f, '.ts')

const HEADER = ''

function code(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/([^:])\/\/.*$/gm, '$1')
}

export function exportsOf(text) {
  const src = code(text)
  const out = []
  for (const m of src.matchAll(/^\s*export\s+(default|const|let|var|function|class|type|interface|enum|\*|\{)\s*([A-Za-z_$][\w$]*)?/gm)) out.push({ kind: m[1], name: m[2] ?? '' })
  return out
}

export const load = loadBatches

export function run({ check = false } = {}) {
  const batches = load()
  const problems = []
  const written = []
  const report = {}
  for (const [kind, K] of Object.entries(KINDS)) {
    const dir = path.join(ART, K.dir)
    const mine = batches.filter((b) => b.kind === kind)
    const present = []
    const allowed = new Set(['index.ts', ...K.support])
    for (const b of mine) {
      const files = [b.file, ...(b.extraFiles ?? [])]
      for (const f of files) allowed.add(path.basename(f))
      const abs = path.join(ROOT, b.file)
      if (!existsSync(abs)) continue
      const name = camel(base(b.file))
      const ex = exportsOf(readFileSync(abs, 'utf8'))
      const good = ex.filter((e) => e.kind === 'const' && e.name === name)
      if (good.length !== 1) problems.push(`${b.file}: must export const ${name}`)
      for (const e of ex) if (!(e.kind === 'const' && e.name === name)) problems.push(`${b.file}: extra export "${e.kind} ${e.name}" (a batch file exports only \`${name}\`; put helpers in the extraFiles of the batch)`)
      present.push({ batch: b.batch, file: base(b.file), name, extra: (b.extraFiles ?? []).map((f) => ({ file: base(f), name: camel(`${kind}-${base(f)}`) })) })
    }
    if (existsSync(dir)) {
      for (const f of readdirSync(dir)) if (f.endsWith('.ts') && !allowed.has(f)) problems.push(`${K.dir}/${f}: not a batch file in notes/art-batches.json (stray file; ask the lead to add the batch first)`)
    }
    const T = kind === 'sticker' ? 'StickerDef' : 'ArtDef'
    const lines = [HEADER.trimEnd(), `import type { ${T} } from '@/lib/ink/art/types'`]
    for (const p of present) lines.push(`import { ${p.name} } from '@/lib/ink/art/${K.dir}/${p.file}'`)
    for (const p of present) for (const e of p.extra) lines.push(`import * as ${e.name} from '@/lib/ink/art/${K.dir}/${e.file}'`)
    lines.push('')
    lines.push(`export const ${K.batches} = { ${present.map((p) => p.name).join(', ')} } as const`)
    lines.push(`export const ${K.map} = { ${present.map((p) => '...' + p.name).join(', ')} } satisfies Record<string, ${T}>`)
    lines.push(`export type ${K.type} = keyof typeof ${K.map}`)
    for (const p of present) for (const e of p.extra) lines.push(`export { ${e.name} }`)
    for (const s of K.support) if (existsSync(path.join(dir, s))) lines.push(`export * from '@/lib/ink/art/${K.dir}/${base(s)}'`)
    const text = lines.join('\n') + '\n'
    const target = path.join(dir, 'index.ts')
    const old = existsSync(target) ? readFileSync(target, 'utf8') : ''
    report[K.dir] = { batches: present.map((p) => p.batch), stale: old !== text }
    if (old !== text) {
      if (check) problems.push(`${K.dir}/index.ts is stale (run node tools/art-barrels.mjs)`)
      else {
        mkdirSync(dir, { recursive: true })
        writeFileSync(target, text)
        written.push(path.relative(ROOT, target))
      }
    }
  }
  return { problems, written, report }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  const { problems, written, report } = run({ check: args.includes('--check') })
  if (args.includes('--json')) console.log(JSON.stringify({ problems, written, report }, null, 2))
  else {
    for (const w of written) console.log('wrote', w)
    if (!written.length && !problems.length) console.log('art barrels up to date:', Object.entries(report).map(([d, r]) => `${d} ${r.batches.length}`).join(', '))
    for (const p of problems) console.error('error:', p)
  }
  process.exitCode = problems.length ? 1 : 0
}
