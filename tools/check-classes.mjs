#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { PROJECT_ROOT, TOOLS_DIR, c, collectFiles, formatTable, matchAny, parseArgs, plural, readJson, readText, resolveRoot } from './lib/util.mjs'
import { extractClassPieces, parseSource, tokensOf } from './lib/source.mjs'
import { cssClassNamesOf, loadDesign, splitVariants, structuralProblem } from './lib/tw.mjs'
import { loadStylesheetGraph } from './lib/css.mjs'

const FALLBACK_CSS = path.join(TOOLS_DIR, 'fixtures', 'good', 'src', 'styles', 'looseleaf.css')

const DEFAULT_CONFIG = {
  exclude: ['**/*.d.ts', '**/*.test.{ts,tsx}', '**/*.generated.{ts,tsx}', 'src/docs/meta/**'],
  ignoreClasses: ['group', 'peer', 'dark', 'light', 'not-prose', 'prose', 'toaster', 'sr-only-focusable'],
  ignorePatterns: ['^group/[\\w-]+$', '^peer/[\\w-]+$', '^@container/[\\w-]+$', '^(?:recharts|rdp|embla|cmdk|sonner|vaul|radix)-[\\w-]+$'],
  knownGroups: [],
  ambient: { minRatio: 0.6, minValidTokens: 2 },
}

export async function checkClasses({ root, cssFile, only = [], config = {} }) {
  const cfg = { ...DEFAULT_CONFIG, ...config, ambient: { ...DEFAULT_CONFIG.ambient, ...(config.ambient ?? {}) } }
  const files = collectFiles(root, ['src/**/*.{ts,tsx}'], cfg.exclude)
  const result = { files: files.length, uniqueTokens: 0, findings: [], stylesheet: cssFile, usedFallback: false }
  if (!files.length) return result

  let cssAbs = cssFile
  if (!fs.existsSync(cssAbs)) {
    cssAbs = FALLBACK_CSS
    result.usedFallback = true
    result.stylesheet = cssAbs
  }
  const design = await loadDesign(cssAbs)
  const graph = loadStylesheetGraph(cssAbs)
  const cssClasses = cssClassNamesOf(graph.map((g) => g.text))
  const ignoreSet = new Set(cfg.ignoreClasses)
  const ignoreRes = cfg.ignorePatterns.map((p) => new RegExp(p))
  const isIgnored = (t) => ignoreSet.has(t) || cssClasses.has(t) || ignoreRes.some((re) => re.test(t))

  const perFile = []
  for (const rel of files) {
    const text = readText(path.join(root, rel))
    if (text == null) continue
    const parsed = parseSource(rel, text)
    if (!parsed.program) continue
    const pieces = extractClassPieces(parsed.program)
    perFile.push({ rel, posOf: parsed.posOf, pieces: pieces.map((p) => ({ ...p, tokens: tokensOf(p) })) })
  }
  const all = new Set()
  for (const f of perFile) for (const p of f.pieces) for (const t of p.tokens) all.add(t.token)
  result.uniqueTokens = all.size
  design.prime(all)

  const declaredGroups = new Set(cfg.knownGroups)
  const references = []
  const reportable = (rel) => !only.length || matchAny(only, rel)
  const push = (rel, posOf, offset, token, d) => {
    if (!reportable(rel)) return
    const { line, col } = posOf(offset)
    result.findings.push({ file: rel, line, col, token, kind: d.kind, message: d.message, suggestions: d.suggestions ?? [] })
  }

  for (const f of perFile) {
    for (const p of f.pieces) {
      const toks = p.tokens
      for (const { token, offset } of toks) {
        const { variants, utility } = splitVariants(token)
        const u = utility.replace(/^!|!$/g, '')
        const decl = /^(group|peer)\/([\w-]+)$/.exec(u)
        if (decl) declaredGroups.add(`${decl[1]}/${decl[2]}`)
        for (const v of variants) {
          let parsed = null
          try {
            parsed = design.ds.parseVariant(v)
          } catch {
            parsed = null
          }
          if (parsed && parsed.kind === 'compound' && (parsed.root === 'group' || parsed.root === 'peer') && parsed.modifier?.kind === 'named') {
            const { line, col } = f.posOf(offset)
            references.push({ file: f.rel, line, col, token, name: `${parsed.root}/${parsed.modifier.value}` })
          }
        }
      }

      let ambientOk = true
      if (p.context === 'ambient') {
        const valid = toks.filter((t) => design.valid(t.token) || isIgnored(t.token)).length
        ambientOk = toks.length > 0 && valid >= cfg.ambient.minValidTokens && valid / toks.length >= cfg.ambient.minRatio
      }
      if (!ambientOk) continue
      for (const { token, offset } of toks) {
        if (isIgnored(token)) continue
        const broken = structuralProblem(token)
        if (broken && /[[(]/.test(token)) {
          push(f.rel, f.posOf, offset, token, { kind: 'malformed', message: `malformed arbitrary value (${broken}) — Tailwind would emit broken CSS`, suggestions: [] })
          continue
        }
        if (design.valid(token)) continue
        if (/^[^\w[!@-]/.test(token) || /[{}<>;]/.test(token.replace(/\[[^\]]*\]/g, ''))) continue
        const bare = splitVariants(token).utility
        if (isIgnored(bare.replace(/^!|!$/g, ''))) {
          continue
        }
        if (!design.looksLikeUtility(token)) continue
        const d = design.diagnose(token)
        if (d) push(f.rel, f.posOf, offset, token, d)
      }
    }
  }

  for (const ref of references) {
    if (declaredGroups.has(ref.name)) continue
    if (!reportable(ref.file)) continue
    const near = design.nearest(ref.name.split('/')[1], [...declaredGroups].filter((g) => g.startsWith(ref.name.split('/')[0])).map((g) => g.split('/')[1]), 2)
    result.findings.push({
      file: ref.file,
      line: ref.line,
      col: ref.col,
      token: ref.token,
      kind: 'orphan-group',
      message: `nothing declares "${ref.name}" — the ${ref.name.split('/')[0]}-*/${ref.name.split('/')[1]}: variant can never match`,
      suggestions: near.map((n) => `${ref.name.split('/')[0]}/${n}`),
    })
  }

  result.findings.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line || a.col - b.col))
  return result
}

async function main() {
  const { flags, positionals, errors } = parseArgs(process.argv.slice(2), {
    bool: ['json', 'quiet', 'help'],
    str: ['root', 'css', 'config', 'max'],
    list: ['only'],
  })
  if (errors.length || flags.help) {
    if (errors.length) console.error(errors.join('\n'))
    console.error("usage: node tools/check-classes.mjs [--only <glob>]… [files…] [--root dir] [--css file] [--json] [--max N]")
    process.exitCode = flags.help ? 0 : 2
    return
  }
  const root = resolveRoot(flags.root)
  const cssFile = flags.css ? path.resolve(process.cwd(), flags.css) : path.join(root, 'src', 'styles', 'looseleaf.css')
  const only = [...flags.only, ...positionals.map((p) => path.relative(root, path.resolve(process.cwd(), p)).split(path.sep).join('/'))]
  const userCfgPath = flags.config ? path.resolve(process.cwd(), flags.config) : path.join(TOOLS_DIR, 'check-classes.config.json')
  let config = {}
  try {
    config = readJson(userCfgPath, {}) ?? {}
  } catch (e) {
    console.error(`check-classes: ${e.message}`)
    process.exitCode = 2
    return
  }

  let result
  try {
    result = await checkClasses({ root, cssFile, only, config })
  } catch (e) {
    console.error(`check-classes: could not compile the stylesheet ${path.relative(root, cssFile)}\n${e.stack ?? e.message}`)
    process.exitCode = 2
    return
  }
  const rel = (f) => path.relative(root, f).split(path.sep).join('/') || f

  if (flags.json) {
    console.log(JSON.stringify({ root, stylesheet: rel(result.stylesheet), usedFallback: result.usedFallback, files: result.files, uniqueTokens: result.uniqueTokens, findings: result.findings }, null, 2))
    process.exitCode = result.findings.length ? 1 : 0
    return
  }

  if (!result.files) {
    console.log(`${c.green('✔ check-classes')} · no source files under src/ yet (empty tree: nothing to check)`)
    return
  }
  if (result.usedFallback) console.log(c.yellow(`! ${path.relative(root, cssFile)} does not exist — using the fixture stylesheet ${path.relative(PROJECT_ROOT, result.stylesheet)}; theme-key results are advisory`))
  if (result.findings.length) {
    const max = Number(flags.max ?? 200)
    const shown = result.findings.slice(0, max)
    const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s)
    console.log(
      formatTable(
        ['LOCATION', 'CLASS', 'PROBLEM', 'DID YOU MEAN'],
        shown.map((f) => [`${f.file}:${f.line}:${f.col}`, c.red(trunc(f.token, 64)), f.message, f.suggestions.join('  ')])
      )
    )
    if (result.findings.length > shown.length) console.log(`  … ${result.findings.length - shown.length} more (raise --max or use --json)`)
    const files = new Set(result.findings.map((f) => f.file)).size
    console.log(`\n${c.red(`✖ ${plural(result.findings.length, 'class problem')}`)} in ${plural(files, 'file')} · ${plural(result.uniqueTokens, 'unique class token')} checked in ${plural(result.files, 'file')} · ${rel(result.stylesheet)}`)
    process.exitCode = 1
    return
  }
  console.log(`${c.green('✔ check-classes clean')} · ${plural(result.uniqueTokens, 'unique class token')} in ${plural(result.files, 'file')} · ${rel(result.stylesheet)}${only.length ? ` · reporting only ${only.join(', ')}` : ''}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
