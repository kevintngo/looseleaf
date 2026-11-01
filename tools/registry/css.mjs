import postcss from 'postcss'

const SEMANTIC_NON_COLOR = new Set(['--radius'])

export const FONT_VARIABLES = ['--font-hand', '--font-script', '--font-type', '--font-mono']

const NAMED_COLORS = new Set(
  'transparent currentcolor white black red green blue gray grey silver maroon purple fuchsia lime olive yellow navy teal aqua orange'.split(' ')
)
const COLOR_FN = /^(#[0-9a-f]{3,8}\b|(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\()/i

export function splitTopLevel(text, sep = ',') {
  const out = []
  let depth = 0
  let quote = ''
  let cur = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quote) {
      cur += ch
      if (ch === '\\') cur += text[++i] ?? ''
      else if (ch === quote) quote = ''
      continue
    }
    if (ch === '"' || ch === "'") quote = ch
    else if (ch === '(' || ch === '[') depth++
    else if (ch === ')' || ch === ']') depth--
    if (ch === sep && depth === 0) {
      out.push(cur.trim())
      cur = ''
    } else cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

export function isColorValue(value, lookup = () => undefined, depth = 0) {
  const v = value.trim().replace(/\s*!important$/i, '')
  if (COLOR_FN.test(v) || NAMED_COLORS.has(v.toLowerCase())) return true
  const m = /^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]*))?\)$/.exec(v)
  if (!m || depth > 8) return false
  const target = lookup(m[1])
  if (target !== undefined) return isColorValue(target, lookup, depth + 1)
  return m[2] ? isColorValue(m[2], lookup, depth + 1) : false
}

const tidySelector = (s) => s.replace(/\s*\n\s*/g, ' ').trim()

function resolveSelector(parent, child) {
  const parents = parent === null ? [null] : splitTopLevel(parent)
  const children = splitTopLevel(tidySelector(child))
  const out = []
  for (const p of parents) {
    for (const c of children) {
      if (p === null) out.push(c)
      else if (c.includes('&')) {
        const simple = !/[\s>+~]/.test(p) || /^&/.test(c)
        out.push(c.replaceAll('&', simple ? p : `:is(${p})`))
      } else out.push(`${p} ${c}`)
    }
  }
  return out.join(', ')
}

const CONTAINER_AT_RULES = new Set(['media', 'supports', 'container', 'layer', 'scope', 'starting-style'])
const isRootSel = (sel) => sel.replace(/\s+/g, '') === ':root'
const isDarkSel = (sel) => sel.replace(/\s+/g, '') === '.dark'

export function convertCss(source, { file = 'looseleaf.css' } = {}) {
  const warnings = []
  const errors = []
  const warn = (node, msg) => warnings.push(`${file}:${node?.source?.start?.line ?? '?'} ${msg}`)
  const fail = (node, msg) => errors.push(`${file}:${node?.source?.start?.line ?? '?'} ${msg}`)

  const root = postcss.parse(source, { from: file })
  const css = {}
  const theme = {}
  const dependencies = new Set()
  const devDependencies = new Set()
  const fontFamilies = {}
  const getOrCreate = (obj, key) => (obj[key] && typeof obj[key] === 'object' ? obj[key] : (obj[key] = {}))
  const decl = (d) => (d.important ? `${d.value} !important` : d.value)

  const lightRaw = new Map()
  const darkRaw = new Map()
  const varBlocks = new Map()
  const collectVarBlocks = (nodes) => {
    for (const n of nodes) {
      if (n.type !== 'rule') continue
      const which = isRootSel(n.selector) ? 'light' : isDarkSel(n.selector) ? 'dark' : null
      if (!which) continue
      varBlocks.set(n, which)
      for (const d of n.nodes) {
        if (d.type === 'decl' && d.prop.startsWith('--')) (which === 'light' ? lightRaw : darkRaw).set(d.prop, decl(d))
      }
    }
  }
  collectVarBlocks(root.nodes)
  for (const n of root.nodes) if (n.type === 'atrule' && n.name === 'layer' && n.params.trim() === 'base' && n.nodes) collectVarBlocks(n.nodes)

  const cssVars = { theme, light: {}, dark: {} }
  const lookupLight = (name) => lightRaw.get(name)
  const lookupDark = (name) => darkRaw.get(name) ?? lightRaw.get(name)

  function emitVarBlock(rule, which) {
    const lookup = which === 'light' ? lookupLight : lookupDark
    const selector = which === 'light' ? ':root' : '.dark'
    for (const child of rule.nodes) {
      if (child.type === 'decl') {
        if (child.prop.startsWith('--') && (isColorValue(decl(child), lookup) || SEMANTIC_NON_COLOR.has(child.prop))) {
          cssVars[which][child.prop.slice(2)] = decl(child)
        } else {
          getOrCreate(css, selector)[child.prop] = decl(child)
        }
      } else if (child.type === 'atrule' || child.type === 'rule') {
        emitNested(css, selector, child)
      }
    }
  }

  function emitRuleBody(target, selector, ruleNode) {
    const obj = getOrCreate(target, selector)
    for (const child of ruleNode.nodes ?? []) emitChild(target, obj, selector, child)
  }

  function emitChild(target, obj, selector, child) {
    if (child.type === 'decl') {
      const prev = obj[child.prop]
      if (typeof prev === 'string' && prev !== decl(child)) {
        warn(child, `"${selector}" declares ${child.prop} twice; JSON keeps the last (${prev} dropped, e.g. a fallback)`)
      }
      obj[child.prop] = decl(child)
    } else if (child.type === 'atrule' && child.name === 'apply' && !child.nodes) {
      obj[`@apply ${child.params}`] = {}
    } else if (child.type === 'rule' || child.type === 'atrule') {
      emitNested(target, selector, child)
    }
  }

  function emitNested(target, parentSelector, child) {
    if (child.type === 'rule') {
      const sel = resolveSelector(parentSelector, child.selector)
      emitRuleBody(target, sel, child)
    } else if (CONTAINER_AT_RULES.has(child.name) && child.nodes) {
      const inner = getOrCreate(target, `@${child.name} ${child.params}`.trim())
      const obj = getOrCreate(inner, parentSelector)
      for (const c of child.nodes) emitChild(inner, obj, parentSelector, c)
    } else if (child.name === 'variant' || child.name === 'custom-variant') {
      fail(child, `@${child.name} nested in "${parentSelector}" cannot be expressed in a shadcn registry item; write the selector out (e.g. \`.dark ${parentSelector}\`) or use @apply with a variant`)
    } else {
      warn(child, `at-rule @${child.name} inside "${parentSelector}" is not supported and was dropped`)
    }
  }

  function emitTopLevelContainer(target, node) {
    const key = `@${node.name} ${node.params}`.trim()
    if (!node.nodes) {
      target[key] = {}
      return
    }
    const inner = getOrCreate(target, key)
    for (const child of node.nodes) {
      if (child.type === 'comment') continue
      if (child.type === 'rule') {
        if (node.name === 'layer' && varBlocks.has(child)) emitVarBlock(child, varBlocks.get(child))
        else emitRuleBody(inner, resolveSelector(null, child.selector), child)
      } else if (child.type === 'atrule') {
        emitTopLevelAtRule(inner, child)
      } else if (child.type === 'decl') {
        fail(child, `declaration \`${child.prop}\` directly inside ${key} is not supported`)
      }
    }
    if (node.name === 'layer' && !Object.keys(inner).length) delete target[key]
  }

  function keyframesObject(node) {
    const obj = {}
    for (const step of node.nodes ?? []) {
      if (step.type !== 'rule') continue
      const stepObj = getOrCreate(obj, step.selector.replace(/\s*,\s*/g, ', '))
      for (const d of step.nodes) if (d.type === 'decl') stepObj[d.prop] = decl(d)
    }
    return obj
  }

  function utilityObject(node) {
    const obj = {}
    const walk = (into, nodes, selector) => {
      for (const c of nodes) {
        if (c.type === 'decl') into[c.prop] = decl(c)
        else if (c.type === 'atrule' && c.name === 'apply' && !c.nodes) into[`@apply ${c.params}`] = {}
        else if (c.type === 'rule') {
          const sel = resolveSelector(selector, c.selector)
          walk(getOrCreate(obj, sel), c.nodes, sel)
        } else if (c.type === 'atrule' && CONTAINER_AT_RULES.has(c.name) && c.nodes) {
          const flat = into === obj && c.nodes.every((n) => n.type === 'decl' || n.type === 'comment')
          if (!flat) fail(c, `@${c.name} in @utility ${node.params} may only sit at the top of the utility and contain only declarations`)
          else {
            const inner = getOrCreate(obj, `@${c.name} ${c.params}`)
            for (const n of c.nodes) if (n.type === 'decl') inner[n.prop] = decl(n)
          }
        }
      }
    }
    walk(obj, node.nodes ?? [], '&')
    return obj
  }

  function handleImport(node) {
    const m = /^\s*(?:url\(\s*)?(["']?)([^"')\s]+)\1\s*\)?\s*(.*)$/.exec(node.params)
    if (!m) return warn(node, `unparseable @import ${node.params}`)
    const [, , spec, rest] = m
    if (/^https?:\/\//.test(spec) || spec.startsWith('//')) {
      css[`@import ${node.params.trim()}`] = {}
      return
    }
    if (spec === 'tailwindcss' || spec.startsWith('tailwindcss/')) {
      if (rest) warn(node, `@import "${spec}" ${rest}: import options are not carried over, the consumer's own Tailwind import is used`)
      return
    }
    if (spec.startsWith('.') || spec.startsWith('/')) return
    css[rest ? `@import "${spec}" ${rest}` : `@import "${spec}"`] = {}
    const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]
    if (pkg.startsWith('@fontsource')) dependencies.add(pkg)
    else devDependencies.add(pkg)
  }

  function handleTheme(node) {
    if (node.params && !['inline', 'default'].includes(node.params.trim().split(/\s+/)[0]) ) {
      warn(node, `@theme ${node.params}: merged into the consumer's \`@theme inline\` (shadcn's CLI has no other slot)`)
    }
    for (const c of node.nodes ?? []) {
      if (c.type === 'decl') {
        const name = c.prop
        if (!name.startsWith('--')) continue
        if (c.value.trim() === 'initial' || name.endsWith('-*')) {
          warn(c, `${name}: ${c.value} would wipe the consumer's Tailwind defaults and is skipped`)
          continue
        }
        if (FONT_VARIABLES.includes(name)) {
          fontFamilies[name] = decl(c)
          continue
        }
        theme[name.slice(2)] = decl(c)
      } else if (c.type === 'atrule' && c.name === 'keyframes') {
        css[`@keyframes ${c.params}`] = keyframesObject(c)
      } else if (c.type === 'atrule') {
        warn(c, `@${c.name} inside @theme is not supported and was dropped`)
      }
    }
  }

  function emitTopLevelAtRule(target, node) {
    switch (node.name) {
      case 'import':
        return handleImport(node)
      case 'plugin': {
        const spec = node.params.replace(/^["']|["']$/g, '')
        if (spec.startsWith('.') || spec.startsWith('/')) return warn(node, `@plugin ${node.params} is a local file and was dropped`)
        target[`@plugin "${spec}"`] = {}
        devDependencies.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0])
        return
      }
      case 'source':
      case 'config':
      case 'reference':
        return warn(node, `@${node.name} ${node.params} depends on the consumer's project layout and was dropped`)
      case 'custom-variant':
        if (node.nodes) return fail(node, '@custom-variant with a block body cannot be expressed in a shadcn registry item; use the one-line form')
        target[`@custom-variant ${node.params}`] = {}
        return
      case 'theme':
        return handleTheme(node)
      case 'keyframes':
        target[`@keyframes ${node.params}`] = keyframesObject(node)
        return
      case 'utility':
        target[`@utility ${node.params}`] = utilityObject(node)
        return
      case 'property':
        return warn(node, `@property ${node.params} was dropped: the shadcn CLI cannot merge it idempotently (it would be appended again on every add). Put it in the app stylesheet by hand or avoid it`)
      case 'font-face':
        return warn(node, '@font-face cannot be expressed in a shadcn registry item (fonts ship as registry:font items) and was dropped')
      case 'apply':
        return
      default:
        if (CONTAINER_AT_RULES.has(node.name)) return emitTopLevelContainer(target, node)
        if (!node.nodes) {
          target[`@${node.name} ${node.params}`.trim()] = {}
          return
        }
        warn(node, `unknown at-rule @${node.name} kept as a generic container`)
        return emitTopLevelContainer(target, node)
    }
  }

  for (const node of root.nodes) {
    if (node.type === 'comment') continue
    if (node.type === 'atrule') {
      emitTopLevelAtRule(css, node)
    } else if (node.type === 'rule') {
      if (varBlocks.has(node)) emitVarBlock(node, varBlocks.get(node))
      else emitRuleBody(css, resolveSelector(null, node.selector), node)
    } else if (node.type === 'decl') {
      fail(node, `stray declaration \`${node.prop}\` at top level`)
    }
  }

  for (const key of ['light', 'dark']) if (!Object.keys(cssVars[key]).length) delete cssVars[key]
  if (!Object.keys(cssVars.theme).length) delete cssVars.theme
  const emptyCssVars = !Object.keys(cssVars).length

  return {
    cssVars: emptyCssVars ? undefined : cssVars,
    css: Object.keys(css).length ? css : undefined,
    dependencies: [...dependencies].sort(),
    devDependencies: [...devDependencies].sort(),
    fontFamilies,
    warnings,
    errors,
  }
}
