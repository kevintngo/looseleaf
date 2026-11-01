import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const SCHEMA_DIR = path.join(REPO_ROOT, 'tools', 'schema')
export const DEFAULT_REGISTRY_URL = 'https://kevintngo.github.io/looseleaf/r'
export const DEFAULT_NAMESPACE = '@looseleaf'
export const REGISTRY_NAME = 'looseleaf'
export const SHADCN_BIN = path.join(REPO_ROOT, 'node_modules', 'shadcn', 'dist', 'index.js')

export const DEFAULT_PINS = {
  zod: '^4',
  '@hookform/resolvers': '^5',
  'react-hook-form': '^7',
  'react-day-picker': '^10',
  'react-resizable-panels': '^4',
}

export function readDotenv(dir) {
  const out = {}
  for (const name of ['.env', '.env.local']) {
    const file = path.join(dir, name)
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line)
      if (!m || m[1].startsWith('#')) continue
      let v = m[2]
      if (/^(["']).*\1$/.test(v)) v = v.slice(1, -1)
      else v = v.replace(/\s+#.*$/, '')
      out[m[1]] = v
    }
  }
  return out
}

export function resolveConfig({ root, url, deps, namespace, homepage, themeDep, pins, env = process.env } = {}) {
  const dotenv = readDotenv(root ?? REPO_ROOT)
  const raw = url ?? env.VITE_REGISTRY_URL ?? dotenv.VITE_REGISTRY_URL ?? DEFAULT_REGISTRY_URL
  const registryUrl = String(raw).replace(/\/+$/, '')
  if (!/^https?:\/\/[^\s]+$/.test(registryUrl)) {
    throw new Error(`Registry URL must be an absolute http(s) URL, got "${raw}" (set VITE_REGISTRY_URL or pass --url).`)
  }
  const depsMode = deps ?? env.LOOSELEAF_DEPS ?? 'url'
  if (!['url', 'namespace', 'name'].includes(depsMode)) {
    throw new Error(`--deps must be url | namespace | name, got "${depsMode}".`)
  }
  const ns = namespace ?? env.LOOSELEAF_NAMESPACE ?? DEFAULT_NAMESPACE
  if (!/^@[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(ns)) throw new Error(`Namespace must look like @looseleaf, got "${ns}".`)
  const tdep = themeDep ?? env.LOOSELEAF_THEME_DEP ?? 'all'
  if (!['all', 'none'].includes(tdep)) throw new Error(`--theme-dep must be all | none, got "${tdep}".`)
  const pinMode = pins ?? env.LOOSELEAF_PINS ?? 'on'
  if (!['on', 'off'].includes(pinMode)) throw new Error(`--pins must be on | off, got "${pinMode}".`)
  return {
    pins: pinMode === 'on' ? { ...DEFAULT_PINS } : {},
    registryUrl,
    homepage: (homepage ?? env.LOOSELEAF_HOMEPAGE ?? registryUrl.replace(/\/r$/, '')).replace(/\/+$/, ''),
    depsMode,
    namespace: ns,
    themeDep: tdep,
  }
}

export function itemAddress(name, cfg) {
  if (cfg.depsMode === 'name') return name
  if (cfg.depsMode === 'namespace') return `${cfg.namespace}/${name}`
  return `${cfg.registryUrl}/${name}.json`
}

export function addressToName(addr, cfg) {
  const url = `${cfg.registryUrl}/`
  if (addr.startsWith(url) && addr.endsWith('.json')) return addr.slice(url.length, -'.json'.length)
  const ns = `${cfg.namespace}/`
  if (addr.startsWith(ns)) return addr.slice(ns.length)
  if (!/^(https?:|@|\.{0,2}\/)/.test(addr) && !addr.endsWith('.json') && cfg.depsMode === 'name') return addr
  return null
}
