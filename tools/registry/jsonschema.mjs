import { readFileSync } from 'node:fs'
import path from 'node:path'
import { SCHEMA_DIR } from './config.mjs'

export const SCHEMA_IDS = {
  'https://ui.shadcn.com/schema/registry.json': 'registry.json',
  'https://ui.shadcn.com/schema/registry-item.json': 'registry-item.json',
}

let loaded
export function loadSchemas(dir = SCHEMA_DIR) {
  if (loaded && dir === SCHEMA_DIR) return loaded
  const byId = {}
  for (const [id, file] of Object.entries(SCHEMA_IDS)) {
    byId[id] = JSON.parse(readFileSync(path.join(dir, file), 'utf8'))
  }
  if (dir === SCHEMA_DIR) loaded = byId
  return byId
}

const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v)
const matchesType = (v, t) => {
  const actual = typeOf(v)
  return actual === t || (t === 'number' && actual === 'integer')
}

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)

export function validate(value, schema, { schemas = loadSchemas() } = {}) {
  function resolveRef(ref, rootSchema) {
    if (ref === '#') return { schema: rootSchema, root: rootSchema }
    if (ref.startsWith('#/')) {
      let node = rootSchema
      for (const part of ref.slice(2).split('/')) node = node?.[part.replace(/~1/g, '/').replace(/~0/g, '~')]
      if (!node) throw new Error(`unresolvable $ref ${ref}`)
      return { schema: node, root: rootSchema }
    }
    const [url, frag] = ref.split('#')
    const target = schemas[url]
    if (!target) throw new Error(`unknown $ref ${ref} (register it in SCHEMA_IDS)`)
    return frag ? resolveRef(`#${frag}`, target) : { schema: target, root: target }
  }

  function errorsFor(v, s, rootSchema, at) {
    if (s === true || s === undefined) return []
    if (s === false) return [`${at || '/'}: not allowed`]
    if (s.$ref) {
      const r = resolveRef(s.$ref, rootSchema)
      return errorsFor(v, r.schema, r.root, at)
    }
    const errs = []
    const fail = (msg) => errs.push(`${at || '/'}: ${msg}`)
    const valid = (sub, val = v, where = at) => errorsFor(val, sub, rootSchema, where).length === 0

    if (s.type !== undefined) {
      const types = Array.isArray(s.type) ? s.type : [s.type]
      if (!types.some((t) => matchesType(v, t))) fail(`expected ${types.join(' | ')}, got ${typeOf(v)}`)
    }
    if (s.enum && !s.enum.some((e) => deepEqual(e, v))) fail(`must be one of ${s.enum.map((e) => JSON.stringify(e)).join(', ')} (got ${JSON.stringify(v)})`)
    if (s.const !== undefined && !deepEqual(s.const, v)) fail(`must equal ${JSON.stringify(s.const)}`)
    if (typeof v === 'string') {
      if (s.minLength !== undefined && v.length < s.minLength) fail(`shorter than ${s.minLength}`)
      if (s.pattern && !new RegExp(s.pattern).test(v)) fail(`does not match /${s.pattern}/`)
    }
    if (Array.isArray(v)) {
      if (s.minItems !== undefined && v.length < s.minItems) fail(`fewer than ${s.minItems} items`)
      if (s.items && !Array.isArray(s.items)) v.forEach((item, i) => errs.push(...errorsFor(item, s.items, rootSchema, `${at}/${i}`)))
    }
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const req of s.required ?? []) if (!(req in v)) fail(`missing required property "${req}"`)
      const props = s.properties ?? {}
      for (const [k, sub] of Object.entries(props)) if (k in v) errs.push(...errorsFor(v[k], sub, rootSchema, `${at}/${k}`))
      if (s.additionalProperties !== undefined && s.additionalProperties !== true) {
        for (const k of Object.keys(v)) {
          if (k in props) continue
          if (s.additionalProperties === false) fail(`unexpected property "${k}"`)
          else errs.push(...errorsFor(v[k], s.additionalProperties, rootSchema, `${at}/${k}`))
        }
      }
    }
    for (const sub of s.allOf ?? []) errs.push(...errorsFor(v, sub, rootSchema, at))
    if (s.anyOf && !s.anyOf.some((sub) => valid(sub))) fail('matches none of the anyOf alternatives')
    if (s.oneOf) {
      const n = s.oneOf.filter((sub) => valid(sub)).length
      if (n !== 1) fail(`matches ${n} of the oneOf alternatives (needs exactly 1)`)
    }
    if (s.not && valid(s.not)) fail('matches a forbidden schema')
    if (s.if) {
      if (valid(s.if)) {
        if (s.then) errs.push(...errorsFor(v, s.then, rootSchema, at))
      } else if (s.else) errs.push(...errorsFor(v, s.else, rootSchema, at))
    }
    return errs
  }

  return [...new Set(errorsFor(value, schema, schema, ''))]
}

export function validateRegistry(registry) {
  const s = loadSchemas()
  return validate(registry, s['https://ui.shadcn.com/schema/registry.json'])
}

export function validateRegistryItem(item) {
  const s = loadSchemas()
  return validate(item, s['https://ui.shadcn.com/schema/registry-item.json'])
}
