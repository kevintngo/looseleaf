#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM';
  }
}

export async function acquire(name = 'heavy', slots = 1, { pollMs = 350, timeoutMs = 30 * 60_000 } = {}) {
  const base = path.join(ROOT, '.locks', name);
  mkdirSync(base, { recursive: true });
  const t0 = Date.now();
  let warned = false;
  for (;;) {
    for (let i = 0; i < slots; i++) {
      const dir = path.join(base, `slot-${i}`);
      try {
        mkdirSync(dir);
      } catch {
        let owner = 0;
        try {
          owner = Number(readFileSync(path.join(dir, 'pid'), 'utf8'));
        } catch {}
        if (owner && alive(owner)) continue;
        rmSync(dir, { recursive: true, force: true });
        try {
          mkdirSync(dir);
        } catch {
          continue;
        }
      }
      writeFileSync(path.join(dir, 'pid'), String(process.pid));
      let released = false;
      const release = () => {
        if (released) return;
        released = true;
        rmSync(dir, { recursive: true, force: true });
      };
      for (const sig of ['exit', 'SIGINT', 'SIGTERM', 'SIGHUP']) {
        process.once(sig, () => {
          release();
          if (sig !== 'exit') process.exit(130);
        });
      }
      return release;
    }
    if (!warned) {
      console.error(`[heavy] waiting for a free "${name}" slot (${slots} at a time)…`);
      warned = true;
    }
    if (Date.now() - t0 > timeoutMs) throw new Error(`[heavy] gave up waiting for "${name}" after ${timeoutMs / 1000}s`);
    await sleep(pollMs + Math.random() * 200);
  }
}

export async function withSlot(name, slots, fn) {
  const release = await acquire(name, slots);
  try {
    return await fn();
  } finally {
    release();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  let name = 'heavy';
  let slots = 1;
  while (argv[0] && argv[0].startsWith('--')) {
    const flag = argv.shift();
    if (flag === '--') break;
    if (flag === '--name') name = argv.shift();
    else if (flag === '--slots') slots = Number(argv.shift());
    else {
      console.error(`unknown flag ${flag}`);
      process.exit(2);
    }
  }
  if (argv[0] === '--') argv.shift();
  if (!argv.length) {
    console.error('usage: node tools/heavy.mjs [--name n] [--slots k] -- <command> [args…]');
    process.exit(2);
  }
  const nested = name === 'heavy' && Boolean(process.env.LOOSELEAF_HEAVY_HELD);
  const release = nested ? () => {} : await acquire(name, slots);
  const bin = path.join(ROOT, 'node_modules', '.bin');
  const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}` };
  if (name === 'heavy') env.LOOSELEAF_HEAVY_HELD = '1';
  if (!env.NODE_OPTIONS) env.NODE_OPTIONS = '--max-old-space-size=2048';
  const child = spawn(argv[0], argv.slice(1), { stdio: 'inherit', cwd: ROOT, env });
  child.on('exit', (code, signal) => {
    release();
    process.exit(code ?? (signal ? 1 : 0));
  });
  child.on('error', (e) => {
    release();
    console.error(e);
    process.exit(1);
  });
}
