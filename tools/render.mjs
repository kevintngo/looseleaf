#!/usr/bin/env node
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withSlot } from './heavy.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FONT_DIR = path.join(ROOT, 'assets', 'fonts-ttf');
export const FONT_FILES = readdirSync(FONT_DIR)
  .filter((f) => f.endsWith('.ttf') || f.endsWith('.otf'))
  .map((f) => path.join(FONT_DIR, f));

export async function renderSvg(svg, { scale = 1, width, background } = {}) {
  return withSlot('render', 3, async () => {
    const fitTo = width ? { mode: 'width', value: width } : scale !== 1 ? { mode: 'zoom', value: scale } : { mode: 'original' };
    const r = new Resvg(svg, {
      fitTo,
      background,
      font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: 'Kalam', sansSerifFamily: 'Kalam', serifFamily: 'Kalam', monospaceFamily: 'IBM Plex Mono' },
      shapeRendering: 2,
      textRendering: 1,
      imageRendering: 0,
    });
    const png = r.render().asPng();
    return Buffer.from(png);
  });
}

export async function savePng(svg, outPath, opts) {
  const buf = await renderSvg(svg, opts);
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, buf);
  return outPath;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [inp, out, ...rest] = process.argv.slice(2);
  if (!inp || !out) {
    console.error('usage: node tools/render.mjs in.svg out.png [--scale 2] [--width 1200] [--bg "#f6f0e2"]');
    process.exit(2);
  }
  const opts = {};
  for (let i = 0; i < rest.length; i += 2) {
    if (rest[i] === '--scale') opts.scale = Number(rest[i + 1]);
    else if (rest[i] === '--width') opts.width = Number(rest[i + 1]);
    else if (rest[i] === '--bg') opts.background = rest[i + 1];
  }
  await savePng(readFileSync(inp, 'utf8'), out, opts);
  console.log('wrote', out);
}
