import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const fixPath = (f) => f.replace('/art/mascot/', '/art/mascots/')

export function loadBatches() {
  return JSON.parse(readFileSync(path.join(ROOT, 'notes/art-batches.json'), 'utf8')).map((b) => ({
    ...b,
    file: fixPath(b.file),
    ...(b.extraFiles ? { extraFiles: b.extraFiles.map(fixPath) } : {}),
  }))
}
