import fs from 'node:fs'
import path from 'node:path'
import { lineIndex } from './util.mjs'

function blankComments(text) {
  let out = ''
  let i = 0
  let quote = ''
  while (i < text.length) {
    const ch = text[i]
    if (quote) {
      out += ch
      if (ch === '\\') {
        out += text[i + 1] ?? ''
        i += 2
        continue
      }
      if (ch === quote) quote = ''
      i++
    } else if (ch === '"' || ch === "'") {
      quote = ch
      out += ch
      i++
    } else if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      const stop = end === -1 ? text.length : end + 2
      out += text.slice(i, stop).replace(/[^\n]/g, ' ')
      i = stop
    } else {
      out += ch
      i++
    }
  }
  return out
}

export function parseCss(source) {
  const text = blankComments(source)
  const posOf = lineIndex(text)
  let i = 0

  function readStatement() {
    let depth = 0
    let quote = ''
    const start = i
    while (i < text.length) {
      const ch = text[i]
      if (quote) {
        if (ch === '\\') i++
        else if (ch === quote) quote = ''
      } else if (ch === '"' || ch === "'") quote = ch
      else if (ch === '(' || ch === '[') depth++
      else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1)
      else if (depth === 0 && (ch === ';' || ch === '{' || ch === '}')) {
        const stmt = { text: text.slice(start, i), end: ch, start }
        if (ch !== '}') i++
        return stmt
      }
      i++
    }
    return { text: text.slice(start, i), end: '', start }
  }

  function parseBlock(parent) {
    for (;;) {
      while (i < text.length && /\s/.test(text[i])) i++
      if (i >= text.length) return
      if (text[i] === '}') {
        i++
        return
      }
      const stmt = readStatement()
      const raw = stmt.text
      const trimmed = raw.trim()
      const lead = raw.length - raw.trimStart().length
      const line = posOf(stmt.start + lead).line
      if (stmt.end === '{') {
        const node = { kind: trimmed.startsWith('@') ? 'at' : 'rule', prelude: trimmed, line, decls: [], children: [] }
        if (node.kind === 'at') {
          const m = /^@([\w-]+)\s*(.*)$/s.exec(trimmed)
          node.name = m ? m[1] : ''
          node.prelude = m ? m[2].trim() : ''
        }
        parent.children.push(node)
        parseBlock(node)
      } else if (trimmed) {
        if (trimmed.startsWith('@')) {
          const m = /^@([\w-]+)\s*(.*)$/s.exec(trimmed)
          parent.children.push({ kind: 'at', name: m ? m[1] : '', prelude: m ? m[2].trim() : '', line, decls: [], children: [], statement: true })
        } else {
          const colon = trimmed.indexOf(':')
          if (colon > 0) {
            let value = trimmed.slice(colon + 1).trim()
            const important = /!\s*important$/i.test(value)
            if (important) value = value.replace(/!\s*important$/i, '').trim()
            parent.decls.push({ prop: trimmed.slice(0, colon).trim(), value, line, important })
          }
        }
        if (stmt.end === '}') {
          i++
          return
        }
      } else if (stmt.end === '}') {
        i++
        return
      }
    }
  }

  const root = { kind: 'rule', prelude: '', line: 1, decls: [], children: [] }
  parseBlock(root)
  while (i < text.length) {
    while (i < text.length && /\s/.test(text[i])) i++
    if (i < text.length) parseBlock(root)
  }
  return root
}

export function visitCss(node, fn, chain = []) {
  for (const child of node.children) {
    const next = [...chain, child]
    fn(child, next)
    visitCss(child, fn, next)
  }
}

export function customPropertyDecls(root) {
  const out = []
  visitCss(root, (node, chain) => {
    for (const d of node.decls) if (d.prop.startsWith('--')) out.push({ ...d, chain })
    if (node.kind === 'at' && node.name === 'property') {
      const name = node.prelude.trim()
      if (name.startsWith('--')) out.push({ prop: name, value: '', line: node.line, important: false, chain, atProperty: true })
    }
  })
  for (const d of root.decls) if (d.prop.startsWith('--')) out.push({ ...d, chain: [] })
  return out
}

export function varRefs(value) {
  const refs = []
  const re = /var\(\s*(--[A-Za-z0-9_ -￿-]+)\s*(,|\))/g
  let m
  while ((m = re.exec(value))) refs.push({ name: m[1], hasFallback: m[2] === ',' })
  return refs
}

export function chainLabel(chain) {
  return chain.map((n) => (n.kind === 'at' ? `@${n.name}${n.prelude ? ' ' + n.prelude : ''}` : n.prelude)).join(' > ')
}

export function loadStylesheetGraph(entryAbs, seen = new Set()) {
  const out = []
  const visit = (abs) => {
    if (seen.has(abs)) return
    seen.add(abs)
    let text
    try {
      text = fs.readFileSync(abs, 'utf8')
    } catch {
      return
    }
    const tree = parseCss(text)
    out.push({ file: abs, text, tree })
    for (const node of tree.children) {
      if (node.kind === 'at' && node.name === 'import') {
        const m = /^(?:url\()?\s*["']?([^"')\s]+)["']?/.exec(node.prelude)
        const spec = m?.[1]
        if (spec && (spec.startsWith('.') || spec.startsWith('/'))) visit(path.resolve(path.dirname(abs), spec))
      }
    }
  }
  visit(entryAbs)
  return out
}
