import { execFileSync, spawn } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from './config.mjs'
import { withSlot } from '../heavy.mjs'

function heldSlotPids() {
  const base = path.join(REPO_ROOT, '.locks', 'heavy')
  if (!existsSync(base)) return new Set()
  const pids = new Set()
  for (const d of readdirSync(base)) {
    try {
      pids.add(Number(readFileSync(path.join(base, d, 'pid'), 'utf8')))
    } catch {}
  }
  return pids
}

export function ancestorHoldsHeavySlot() {
  const held = heldSlotPids()
  if (!held.size) return false
  let pid = process.ppid
  for (let i = 0; i < 10 && pid > 1; i++) {
    if (held.has(pid)) return true
    try {
      pid = Number(execFileSync('ps', ['-o', 'ppid=', '-p', String(pid)], { encoding: 'utf8' }).trim())
    } catch {
      return false
    }
  }
  return false
}

export async function withHeavy(fn) {
  if (ancestorHoldsHeavySlot() || process.env.LOOSELEAF_HEAVY_HELD) return fn()
  return withSlot('heavy', 1, async () => {
    process.env.LOOSELEAF_HEAVY_HELD = '1'
    try {
      return await fn()
    } finally {
      delete process.env.LOOSELEAF_HEAVY_HELD
    }
  })
}

export function runNode(args, { cwd = REPO_ROOT, env = process.env, timeoutMs = 240_000 } = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      child.kill('SIGKILL')
    }, timeoutMs)
    child.stdout.on('data', (d) => (stdout += d))
    child.stderr.on('data', (d) => (stderr += d))
    child.on('close', (code) => {
      clearTimeout(timer)
      resolve({ code, stdout, stderr, timedOut })
    })
    child.on('error', (e) => {
      clearTimeout(timer)
      resolve({ code: -1, stdout, stderr: stderr + String(e), timedOut })
    })
  })
}

export const plain = (s) => s.replace(/\u001b\[[0-9;?]*[A-Za-z]/g, '').replace(/\r/g, '\n')
