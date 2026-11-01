import { createRequire, builtinModules, stripTypeScriptTypes } from 'node:module'
import vm from 'node:vm'
import path from 'node:path'
import { REPO_ROOT } from './config.mjs'

let babelParser
export function loadBabel() {
  if (babelParser !== undefined) return babelParser
  if (process.env.LL_NO_BABEL) return (babelParser = null)
  const bases = [import.meta.url, path.join(REPO_ROOT, 'node_modules', 'shadcn', 'package.json')]
  for (const base of bases) {
    try {
      babelParser = createRequire(base)('@babel/parser')
      return babelParser
    } catch {}
  }
  return (babelParser = null)
}

const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts'])
export const isCodeFile = (file) => CODE_EXT.has(path.extname(file))

function parseWithBabel(source, filename) {
  const parser = loadBabel()
  if (!parser) return null
  const ext = path.extname(filename)
  const plugins = ext === '.ts' || ext === '.mts' || ext === '.cts' ? ['typescript'] : ['typescript', 'jsx']
  try {
    return parser.parse(source, {
      sourceType: 'module',
      plugins,
      errorRecovery: true,
      allowReturnOutsideFunction: true,
      allowImportExportEverywhere: true,
    })
  } catch {
    return null
  }
}

const SKIP_KEYS = new Set(['loc', 'start', 'end', 'extra', 'leadingComments', 'trailingComments', 'innerComments', 'range'])
function walk(node, visit) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    for (const n of node) walk(n, visit)
    return
  }
  if (typeof node.type === 'string') visit(node)
  for (const key of Object.keys(node)) {
    if (SKIP_KEYS.has(key)) continue
    const v = node[key]
    if (v && typeof v === 'object') walk(v, visit)
  }
}

export function scanImports(source, filename = 'file.tsx') {
  const ast = parseWithBabel(source, filename)
  if (!ast) return scanImportsRegex(source)
  const found = []
  const add = (spec, typeOnly, kind) => {
    if (typeof spec === 'string' && spec) found.push({ spec, typeOnly, kind })
  }
  walk(ast.program, (n) => {
    switch (n.type) {
      case 'ImportDeclaration': {
        const specs = n.specifiers ?? []
        const typeOnly = n.importKind === 'type' || (specs.length > 0 && specs.every((s) => s.importKind === 'type'))
        add(n.source?.value, typeOnly, 'import')
        break
      }
      case 'ExportNamedDeclaration':
        if (n.source) add(n.source.value, n.exportKind === 'type', 'export')
        break
      case 'ExportAllDeclaration':
        add(n.source?.value, n.exportKind === 'type', 'export')
        break
      case 'CallExpression':
        if (n.callee?.type === 'Import' || (n.callee?.type === 'Identifier' && n.callee.name === 'require')) {
          const a = n.arguments?.[0]
          if (a?.type === 'StringLiteral') add(a.value, false, n.callee.type === 'Import' ? 'dynamic' : 'require')
          else if (a?.type === 'TemplateLiteral' && a.expressions.length === 0) add(a.quasis[0].value.cooked, false, 'dynamic')
        }
        break
      case 'ImportExpression':
        if (n.source?.type === 'StringLiteral') add(n.source.value, false, 'dynamic')
        break
      case 'TSImportType':
        add(n.argument?.value ?? n.argument?.literal?.value, true, 'type')
        break
      case 'TSExternalModuleReference':
        add(n.expression?.value, false, 'require')
        break
    }
  })
  return found
}

function blankTemplates(src) {
  let out = ''
  let i = 0
  const blank = (t) => t.replace(/[^\n]/g, ' ')
  while (i < src.length) {
    const ch = src[i]
    if (ch === '/' && src[i + 1] === '/') {
      const end = src.indexOf('\n', i)
      const stop = end === -1 ? src.length : end
      out += src.slice(i, stop)
      i = stop
    } else if (ch === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2)
      const stop = end === -1 ? src.length : end + 2
      out += src.slice(i, stop)
      i = stop
    } else if (ch === '"' || ch === "'") {
      let j = i + 1
      while (j < src.length && src[j] !== ch && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1
      out += src.slice(i, j + 1)
      i = j + 1
    } else if (ch === '`') {
      let j = i + 1
      let depth = 0
      while (j < src.length && !(src[j] === '`' && depth === 0)) {
        if (src[j] === '\\') j += 2
        else {
          if (src[j] === '$' && src[j + 1] === '{') depth++
          else if (src[j] === '}' && depth > 0) depth--
          j++
        }
      }
      out += `\`${blank(src.slice(i + 1, j))}\``
      i = j + 1
    } else {
      out += ch
      i++
    }
  }
  return out
}

function scanImportsRegex(source) {
  const found = []
  const stripped = blankTemplates(source).replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:])\/\/.*$/gm, '$1')
  const re = /^[ \t]*(import|export)\b(?:(?!\n\s*\n)[\s\S])*?\bfrom\s*(["'])([^"']+)\2|^[ \t]*import\s*(["'])([^"']+)\4/gm
  for (const m of stripped.matchAll(re)) {
    const head = m[0]
    const typeOnly = /^\s*(?:import|export)\s+type\b/.test(head)
    found.push({ spec: m[3] ?? m[5], typeOnly, kind: m[1] ?? 'import' })
  }
  for (const m of stripped.matchAll(/\b(?:import|require)\(\s*(["'])([^"']+)\1\s*\)/g)) {
    found.push({ spec: m[2], typeOnly: false, kind: 'dynamic' })
  }
  return found
}

export function scanExports(source, filename = 'file.tsx') {
  const ast = parseWithBabel(source, filename)
  if (!ast) {
    const names = new Set()
    for (const m of source.matchAll(/^export\s+(?:declare\s+)?(?:async\s+)?(?:function\*?|const|let|var|class|enum|interface|type)\s+([A-Za-z_$][\w$]*)/gm)) names.add(m[1])
    for (const m of source.matchAll(/^export\s*\{([^}]*)\}/gm)) {
      for (const part of m[1].split(',')) {
        const nm = part.trim().split(/\s+as\s+/).pop()
        if (nm) names.add(nm)
      }
    }
    return { names: [...names], typeOnly: [] }
  }
  const names = []
  const typeOnly = []
  for (const stmt of ast.program.body) {
    if (stmt.type === 'ExportNamedDeclaration') {
      const d = stmt.declaration
      if (d?.type === 'VariableDeclaration') {
        for (const v of d.declarations) if (v.id.type === 'Identifier') names.push(v.id.name)
      } else if (d?.id?.name) {
        ;(d.type === 'TSInterfaceDeclaration' || d.type === 'TSTypeAliasDeclaration' ? typeOnly : names).push(d.id.name)
      }
      for (const sp of stmt.specifiers ?? []) {
        const nm = sp.exported?.name ?? sp.exported?.value
        if (nm) (stmt.exportKind === 'type' || sp.exportKind === 'type' ? typeOnly : names).push(nm)
      }
    } else if (stmt.type === 'ExportDefaultDeclaration') names.push('default')
  }
  return { names, typeOnly }
}

const NODE_BUILTINS = new Set(builtinModules.flatMap((m) => [m, `node:${m}`]))
const IMPLICIT = /^(react|react-dom|next)(\/.*)?$/

export function packageName(spec) {
  if (spec.startsWith('@')) return spec.split('/').slice(0, 2).join('/')
  return spec.split('/')[0]
}

export function classifySpecifier(spec) {
  if (spec.startsWith('.')) return { kind: 'relative' }
  if (spec.startsWith('@/')) return { kind: 'alias', path: spec.slice(2) }
  if (spec.startsWith('#') || spec.startsWith('~/')) return { kind: 'other' }
  if (NODE_BUILTINS.has(spec) || spec.startsWith('node:')) return { kind: 'builtin' }
  if (/^[a-z]+:/i.test(spec)) return { kind: 'other' }
  if (IMPLICIT.test(spec)) return { kind: 'implicit' }
  return { kind: 'package', name: packageName(spec) }
}

const UNSUPPORTED = Symbol('unsupported')

function evalNode(node, consts) {
  switch (node?.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value
    case 'NullLiteral':
      return null
    case 'TemplateLiteral': {
      let out = ''
      for (let i = 0; i < node.quasis.length; i++) {
        out += node.quasis[i].value.cooked ?? ''
        if (i < node.expressions.length) {
          const v = evalNode(node.expressions[i], consts)
          if (v === UNSUPPORTED || typeof v === 'object') return UNSUPPORTED
          out += String(v)
        }
      }
      return out
    }
    case 'BinaryExpression': {
      if (node.operator !== '+') return UNSUPPORTED
      const a = evalNode(node.left, consts)
      const b = evalNode(node.right, consts)
      return a === UNSUPPORTED || b === UNSUPPORTED || typeof a === 'object' || typeof b === 'object' ? UNSUPPORTED : a + b
    }
    case 'UnaryExpression': {
      const v = evalNode(node.argument, consts)
      if (typeof v !== 'number') return UNSUPPORTED
      return node.operator === '-' ? -v : node.operator === '+' ? v : UNSUPPORTED
    }
    case 'ArrayExpression': {
      const out = []
      for (const el of node.elements) {
        if (!el) continue
        if (el.type === 'SpreadElement') {
          const v = evalNode(el.argument, consts)
          if (Array.isArray(v)) out.push(...v)
          continue
        }
        const v = evalNode(el, consts)
        if (v !== UNSUPPORTED) out.push(v)
      }
      return out
    }
    case 'ObjectExpression': {
      const out = {}
      for (const p of node.properties) {
        if (p.type === 'SpreadElement') {
          const v = evalNode(p.argument, consts)
          if (v && typeof v === 'object') Object.assign(out, v)
          continue
        }
        if (p.type !== 'ObjectProperty' && p.type !== 'ObjectMethod') continue
        if (p.type === 'ObjectMethod' || p.computed) continue
        const key = p.key.type === 'Identifier' ? p.key.name : p.key.value
        const v = evalNode(p.value, consts)
        if (v !== UNSUPPORTED) out[key] = v
      }
      return out
    }
    case 'Identifier':
      return consts.has(node.name) ? consts.get(node.name) : UNSUPPORTED
    case 'TSSatisfiesExpression':
    case 'TSAsExpression':
    case 'TSNonNullExpression':
    case 'TSTypeAssertion':
    case 'ParenthesizedExpression':
      return evalNode(node.expression, consts)
    default:
      return UNSUPPORTED
  }
}

export function readMeta(source, filename = 'meta.ts') {
  const ast = parseWithBabel(source, filename)
  if (ast) {
    const consts = new Map()
    let exported = null
    for (const stmt of ast.program.body) {
      if (stmt.type === 'VariableDeclaration') {
        for (const d of stmt.declarations) {
          if (d.id.type === 'Identifier' && d.init) {
            const v = evalNode(d.init, consts)
            if (v !== UNSUPPORTED) consts.set(d.id.name, v)
          }
        }
      } else if (stmt.type === 'ExportNamedDeclaration' && stmt.declaration?.type === 'VariableDeclaration') {
        for (const d of stmt.declaration.declarations) {
          if (d.id.type === 'Identifier' && d.init) {
            const v = evalNode(d.init, consts)
            if (v !== UNSUPPORTED) consts.set(d.id.name, v)
          }
        }
      } else if (stmt.type === 'ExportDefaultDeclaration') {
        exported = stmt.declaration
      }
    }
    if (!exported) return { data: null, error: 'no `export default` found' }
    const v = evalNode(exported, consts)
    if (v === UNSUPPORTED || v === null || typeof v !== 'object' || Array.isArray(v)) {
      return { data: null, error: 'default export is not an object literal' }
    }
    return { data: v }
  }
  try {
    let code = stripTypeScriptTypes(source, { mode: 'strip' })
    code = code
      .replace(/^[ \t]*import\s+(?:[^"'`;]*?\sfrom\s*)?(["'])[^"'\n]+\1;?/gm, '')
      .replace(/^[ \t]*export\s+default\s+/m, '__meta = ')
      .replace(/^[ \t]*export\s+(?=const|let|var)/gm, '')
    const ctx = vm.createContext({ __meta: null })
    vm.runInContext(code, ctx, { timeout: 1000 })
    return { data: JSON.parse(JSON.stringify(ctx.__meta)) }
  } catch (e) {
    return { data: null, error: `could not evaluate meta file: ${e.message}` }
  }
}
