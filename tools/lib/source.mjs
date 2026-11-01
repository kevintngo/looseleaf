import { parseSync } from 'rolldown/utils'
import { lineIndex } from './util.mjs'

export function parseSource(file, text) {
  const lang = file.endsWith('.tsx') ? 'tsx' : file.endsWith('.ts') || file.endsWith('.mts') ? 'ts' : file.endsWith('.jsx') ? 'jsx' : 'js'
  let result
  try {
    result = parseSync(file, text, { lang, sourceType: 'module' })
  } catch (e) {
    return { program: null, comments: [], errors: [{ message: String(e?.message ?? e) }], posOf: lineIndex(text) }
  }
  return {
    program: result.program,
    comments: result.comments ?? [],
    errors: result.errors ?? [],
    posOf: lineIndex(text),
  }
}

const SKIP_KEYS = new Set(['type', 'start', 'end', 'range', 'loc', 'parent', 'decorators'])

export function walk(root, enter, leave) {
  const ancestors = []
  const visit = (node) => {
    if (!node || typeof node.type !== 'string') return
    const descend = enter(node, ancestors)
    if (descend !== false) {
      ancestors.push(node)
      for (const key of Object.keys(node)) {
        if (SKIP_KEYS.has(key)) continue
        const v = node[key]
        if (Array.isArray(v)) {
          for (const item of v) if (item && typeof item === 'object') visit(item)
        } else if (v && typeof v === 'object') visit(v)
      }
      ancestors.pop()
    }
    if (leave) leave(node, ancestors)
  }
  visit(root)
}

export const isFunctionNode = (n) =>
  n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression'

export function jsxName(nameNode) {
  if (!nameNode) return ''
  switch (nameNode.type) {
    case 'JSXIdentifier':
      return nameNode.name
    case 'JSXNamespacedName':
      return `${nameNode.namespace.name}:${nameNode.name.name}`
    case 'JSXMemberExpression':
      return `${jsxName(nameNode.object)}.${nameNode.property.name}`
    default:
      return ''
  }
}

export function jsxAttrs(opening) {
  return opening.attributes ?? []
}

export function findAttr(opening, name) {
  for (const a of jsxAttrs(opening)) if (a.type === 'JSXAttribute' && jsxName(a.name) === name) return a
  return null
}

export function stringValue(node) {
  if (!node) return null
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) return node.quasis[0].value.cooked ?? node.quasis[0].value.raw
  return null
}

export function unwrap(node) {
  let n = node
  while (
    n &&
    (n.type === 'TSAsExpression' ||
      n.type === 'TSSatisfiesExpression' ||
      n.type === 'TSNonNullExpression' ||
      n.type === 'ParenthesizedExpression' ||
      n.type === 'TSTypeAssertion')
  )
    n = n.expression
  return n
}

export function calleeName(call) {
  const callee = unwrap(call.callee)
  if (!callee) return ''
  if (callee.type === 'Identifier') return callee.name
  if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') return callee.property.name
  return ''
}

export const DEFAULT_CLASS_FNS = ['cn', 'clsx', 'cx', 'twMerge', 'twJoin', 'classNames', 'classnames', 'cva', 'tv']
const CLASS_ATTR = /^(class|className|classNames|[a-z][A-Za-z]*ClassName|[a-z][A-Za-z]*ClassNames)$/

function piece(out, context, text, offset, leftOpen, rightOpen) {
  out.push({ context, text, offset, leftOpen, rightOpen })
}

function collectExpr(node, context, out, opts, sides = { left: false, right: false }) {
  node = unwrap(node)
  if (!node) return
  switch (node.type) {
    case 'Literal':
      if (typeof node.value === 'string') piece(out, context, node.value, node.start + 1, sides.left, sides.right)
      return
    case 'TemplateLiteral': {
      const n = node.quasis.length
      node.quasis.forEach((q, i) => {
        const text = q.value.cooked ?? q.value.raw
        piece(out, context, text, q.start + 1, i > 0 || sides.left, i < n - 1 || sides.right)
      })
      node.expressions.forEach((e) => collectExpr(e, context, out, opts))
      return
    }
    case 'ConditionalExpression':
      collectExpr(node.consequent, context, out, opts, sides)
      collectExpr(node.alternate, context, out, opts, sides)
      return
    case 'LogicalExpression':
      collectExpr(node.right, context, out, opts, sides)
      if (node.operator !== '&&') collectExpr(node.left, context, out, opts, sides)
      return
    case 'BinaryExpression':
      if (node.operator === '+') {
        collectExpr(node.left, context, out, opts, { left: sides.left, right: true })
        collectExpr(node.right, context, out, opts, { left: true, right: sides.right })
      }
      return
    case 'ArrayExpression':
      node.elements.forEach((e) => e && collectExpr(e.type === 'SpreadElement' ? e.argument : e, context, out, opts))
      return
    case 'ObjectExpression':
      for (const p of node.properties) {
        if (p.type !== 'Property') continue
        if (opts.objectKeys && !p.computed) {
          const k = p.key
          if (k.type === 'Literal' && typeof k.value === 'string') piece(out, context, k.value, k.start + 1, false, false)
        }
        collectExpr(p.value, context, out, opts)
      }
      return
    default:
  }
}

function collectCva(call, out) {
  const [base, config] = call.arguments
  if (base) collectExpr(base.type === 'SpreadElement' ? base.argument : base, 'cva', out, {})
  const cfg = unwrap(config)
  if (!cfg || cfg.type !== 'ObjectExpression') return
  for (const p of cfg.properties) {
    if (p.type !== 'Property' || p.computed) continue
    const key = p.key.name ?? p.key.value
    const val = unwrap(p.value)
    if (key === 'variants' && val?.type === 'ObjectExpression') {
      for (const group of val.properties) {
        const g = unwrap(group.value)
        if (g?.type === 'ObjectExpression') for (const opt of g.properties) collectExpr(opt.value, 'cva', out, {})
        else collectExpr(g, 'cva', out, {})
      }
    } else if (key === 'compoundVariants' && val?.type === 'ArrayExpression') {
      for (const el of val.elements) {
        const o = unwrap(el)
        if (o?.type !== 'ObjectExpression') continue
        for (const q of o.properties) {
          const qk = q.key?.name ?? q.key?.value
          if (qk === 'class' || qk === 'className') collectExpr(q.value, 'cva', out, {})
        }
      }
    } else if (key === 'base' || key === 'slots') {
      collectExpr(val, 'cva', out, {})
    }
  }
}

export function extractClassPieces(program, { classFns = DEFAULT_CLASS_FNS, ambient = true } = {}) {
  const out = []
  const fnSet = new Set(classFns)
  const ambientNodes = []

  walk(program, (node, ancestors) => {
    const parent = ancestors[ancestors.length - 1]
    if (node.type === 'JSXAttribute') {
      const name = jsxName(node.name)
      if (CLASS_ATTR.test(name)) {
        const v = node.value
        if (v) collectExpr(v.type === 'JSXExpressionContainer' ? v.expression : v, 'attr', out, { objectKeys: false })
      } else if (node.value && node.value.type === 'Literal') {
        return false
      }
    }
    if (node.type === 'CallExpression') {
      const name = calleeName(node)
      if (fnSet.has(name)) {
        if (name === 'cva' || name === 'tv') collectCva(node, out)
        else for (const a of node.arguments) collectExpr(a.type === 'SpreadElement' ? a.argument : a, 'call', out, { objectKeys: true })
      }
    }
    if (ambient && node.type === 'Literal' && typeof node.value === 'string') {
      const skip =
        parent &&
        ((parent.type === 'ImportDeclaration' || parent.type === 'ExportAllDeclaration' || parent.type === 'ExportNamedDeclaration') ||
          (parent.type === 'Property' && parent.key === node && !parent.computed) ||
          (parent.type === 'PropertyDefinition' && parent.key === node) ||
          (parent.type === 'ImportExpression') ||
          (parent.type === 'ExpressionStatement' && node.value.startsWith('use ')) ||
          parent.type === 'TSLiteralType' ||
          parent.type === 'TSEnumMember' ||
          parent.type === 'ImportAttribute')
      if (!skip) ambientNodes.push(node)
    }
    if (ambient && node.type === 'TemplateLiteral' && !(parent && parent.type === 'TaggedTemplateExpression')) {
      const n = node.quasis.length
      node.quasis.forEach((q, i) => ambientNodes.push({ q, leftOpen: i > 0, rightOpen: i < n - 1 }))
    }
    return true
  })

  const seen = new Set()
  const unique = []
  for (const p of out) {
    const key = `${p.offset}:${p.text.length}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(p)
  }
  if (ambient) {
    for (const n of ambientNodes) {
      if (n.q) {
        const off = n.q.start + 1
        if (seen.has(`${off}:${(n.q.value.cooked ?? n.q.value.raw).length}`)) continue
        unique.push({ context: 'ambient', text: n.q.value.cooked ?? n.q.value.raw, offset: off, leftOpen: n.leftOpen, rightOpen: n.rightOpen })
      } else {
        const off = n.start + 1
        if (seen.has(`${off}:${n.value.length}`)) continue
        unique.push({ context: 'ambient', text: n.value, offset: off, leftOpen: false, rightOpen: false })
      }
    }
  }
  return unique
}

export function tokensOf(pieceObj) {
  const { text, offset, leftOpen, rightOpen } = pieceObj
  const tokens = []
  const re = /\S+/g
  let m
  while ((m = re.exec(text))) {
    const start = m.index
    const end = start + m[0].length
    if (start === 0 && leftOpen) continue
    if (end === text.length && rightOpen) continue
    tokens.push({ token: m[0], offset: offset + start })
  }
  return tokens
}
