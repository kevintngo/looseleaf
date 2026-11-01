#!/usr/bin/env node
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bestPng, decodePng } from './lib/png.mjs';
import { makeRng, smoothField, fibre, reliefUL, clamp, sstep, wrap, stats, lloydMax, nearestIndex, seamRatio } from './lib/noise-field.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_MASKS = path.join(ROOT, 'src/lib/ink/textures.generated.ts');
const OUT_PAPER = path.join(ROOT, 'src/lib/ink/textures-paper.generated.ts');

function smallestIndexed(img) {
  const need = img.palette.length;
  let best = null;
  for (const bitDepth of [1, 2, 4, 8]) {
    if (need > 1 << bitDepth) continue;
    const r = bestPng({ ...img, bitDepth });
    if (!best || r.png.length < best.png.length) best = { ...r, bitDepth };
  }
  return best;
}

function greyMaskPng(field, w, h, levels) {
  const c = lloydMax(field, levels);
  const idx = nearestIndex(field, c);
  const palette = c.map((v) => { const g = Math.round(clamp(v, 0, 1) * 255); return [g, g, g]; });
  const r = smallestIndexed({ width: w, height: h, colorType: 'indexed', data: idx, palette });
  return { ...r, levels, palette };
}

export function overlayPng(field, w, h, o) {
  const { nLit, nShade, aLit, aShade, lit, shade, dead = 0.05, keepExtremes = true } = o;
  const pos = [], neg = [];
  for (let i = 0; i < field.length; i++) { const v = field[i]; if (v > dead) pos.push(v); else if (v < -dead) neg.push(-v); }
  const cp = nLit && pos.length ? lloydMax(pos, nLit) : [];
  const cn = nShade && neg.length ? lloydMax(neg, nShade) : [];
  if (keepExtremes) {
    if (cp.length) cp[cp.length - 1] = Math.max(cp[cp.length - 1], pos.reduce((m, v) => Math.max(m, v), 0) * 0.92);
    if (cn.length) cn[cn.length - 1] = Math.max(cn[cn.length - 1], neg.reduce((m, v) => Math.max(m, v), 0) * 0.92);
  }
  const entries = [
    ...[...cn].reverse().map((c) => ({ sv: -c, rgb: shade, a: Math.round(255 * clamp(c * aShade, 0, 1)) })),
    { sv: 0, rgb: [255, 255, 255], a: 0 },
    ...cp.map((c) => ({ sv: c, rgb: lit, a: Math.round(255 * clamp(c * aLit, 0, 1)) })),
  ];
  const zero = cn.length;
  const ip = nearestIndex(pos, cp), ineg = nearestIndex(neg, cn);
  const idx = new Uint8Array(w * h);
  let a = 0, b = 0;
  for (let i = 0; i < idx.length; i++) {
    const v = field[i];
    if (v > dead) idx[i] = zero + 1 + ip[a++];
    else if (v < -dead) idx[i] = zero - 1 - ineg[b++];
    else idx[i] = zero;
  }
  const palette = entries.map((e) => e.rgb), trns = entries.map((e) => e.a);
  const r = smallestIndexed({ width: w, height: h, colorType: 'indexed', data: idx, palette, trns });
  return { ...r, levels: palette.length, palette, trns };
}

const fibreField = (rng, size, count, lenLo, lenHi, wd, amt = 1) => {
  const F = new Float32Array(size * size);
  for (let i = 0; i < count; i++) {
    fibre(F, size, size, { x: rng() * size, y: rng() * size, len: lenLo + (lenHi - lenLo) * Math.pow(rng(), 1.6), angle: rng() * Math.PI * 2, bend: (rng() - 0.5) * 6, amt, wd });
  }
  return F;
};

function feltMask(seed, size, grain, fibreDensity = 230) {
  const rng = makeRng(seed);
  const z1 = smoothField(size, size, 0.7, 0.7, rng.fork('z1')), z2 = smoothField(size, size, 1.1, 1.1, rng.fork('z2')), z3 = smoothField(size, size, 1.9, 1.9, rng.fork('z3'));
  const slow = smoothField(size, size, 9, 9, rng.fork('slow'));
  const cnt = Math.round((size * size) / fibreDensity);
  const light = fibreField(rng.fork('fl'), size, Math.round(cnt * 0.7), 5, 22, 0.35);
  const dark = fibreField(rng.fork('fd'), size, Math.round(cnt * 0.3), 5, 22, 0.35);
  const out = new Float32Array(size * size);
  for (let i = 0; i < out.length; i++) {
    const F = 0.5 + 0.11 * (0.35 * z1[i] + 0.45 * z2[i] + 0.4 * z3[i]) + 0.012 * slow[i];
    let a = 1 - grain * clamp((0.6 - F) * 2.6, 0, 1);
    a += 0.25 * grain * clamp(dark[i], 0, 1);
    a *= 1 - 0.9 * grain * clamp(light[i], 0, 1);
    out[i] = clamp(a, 0, 1);
  }
  return out;
}

function toothMask(seed, size, { lo, wd, floor, s1, s2, s3 }) {
  const rng = makeRng(seed);
  const z1 = smoothField(size, size, s1, s1, rng.fork('z1')), z2 = smoothField(size, size, s2, s2, rng.fork('z2')), z3 = smoothField(size, size, s3, s3, rng.fork('z3'));
  const out = new Float32Array(size * size);
  for (let i = 0; i < out.length; i++) {
    const z = 0.5 * z1[i] + 0.65 * z2[i] + 0.55 * z3[i];
    out[i] = floor + (1 - floor) * sstep((0.5 + (0.2 * z) / 0.99 - lo) / wd);
  }
  return out;
}

function stampMask(seed, size) {
  const rng = makeRng(seed);
  const wide = smoothField(size, size, 8, 8, rng.fork('wide')), mid = smoothField(size, size, 3, 3, rng.fork('mid'));
  const n1 = smoothField(size, size, 0.75, 0.75, rng.fork('n1')), n2 = smoothField(size, size, 1.6, 1.6, rng.fork('n2'));
  const scr = new Float32Array(size * size);
  const sr = rng.fork('scr');
  for (let i = 0; i < Math.round(size / 10); i++) fibre(scr, size, size, { x: sr() * size, y: sr() * size, len: 8 + 30 * sr(), angle: sr() * Math.PI * 2, bend: (sr() - 0.5) * 8, amt: 1, wd: 0.3 });
  const out = new Float32Array(size * size);
  for (let i = 0; i < out.length; i++) {
    const D = sstep((0.8 * wide[i] + 0.45 * mid[i] - 0.15) / 1.5);
    const n = 0.75 * n1[i] + 0.55 * n2[i];
    const thr = 1.95 - 1.7 * D;
    const drop = sstep((n - thr) / 0.32);
    const cut = clamp(scr[i], 0, 1) * 0.6;
    out[i] = clamp(1 - Math.max(0.94 * drop, cut) - 0.12 * D, 0.06, 1);
  }
  return out;
}

export const MASK_SPECS = {
  felt: { seed: 0xfe1717, size: 224, levels: 8, make: (s) => feltMask(0xfe1717, s, 0.36), note: 'felt-tip: fine tooth + paper-fibre gaps' },
  marker: { seed: 0x3a4c3, size: 256, levels: 8, make: (s) => feltMask(0x3a4c3, s, 0.24, 300), note: 'marker/highlighter: gentler, fewer fibres' },
  graphite: { seed: 0x70074, size: 224, levels: 16, make: (s) => toothMask(0x70074, s, { lo: 0.16, wd: 0.26, floor: 0.16, s1: 0.5, s2: 0.8, s3: 1.3 }), note: 'graphite: deep tooth dropout' },
  waxy: { seed: 0x3077e, size: 224, levels: 12, make: (s) => toothMask(0x3077e, s, { lo: 0.1, wd: 0.26, floor: 0.3, s1: 0.5, s2: 0.8, s3: 1.3 }), note: 'coloured pencil / wax: waxier, shallower tooth' },
  stamp: { seed: 0x57a3b, size: 320, levels: 6, make: (s) => stampMask(0x57a3b, s), note: 'rubber stamp: worn patches + specks' },
};
const MASK_DENSITY = 2;

export function buildMasks() {
  const out = {};
  for (const [name, spec] of Object.entries(MASK_SPECS)) {
    const field = spec.make(spec.size);
    const q = greyMaskPng(field, spec.size, spec.size, spec.levels);
    const st = stats(field);
    const dec = decodePng(q.png);
    const lut = q.palette.map((p) => p[0] / 255);
    const get = (x, y) => lut[dec.samples[y * spec.size + x]];
    out[name] = {
      name, size: spec.size, density: MASK_DENSITY, css: spec.size / MASK_DENSITY, levels: spec.levels, bitDepth: dec.bitDepth,
      png: q.png, filter: q.filter, note: spec.note,
      mean: st.mean, p10: st.p[0.1], p1: st.p[0.01], seam: seamRatio(get, spec.size, spec.size),
    };
  }
  return out;
}

export const LIT = [255, 253, 246];
export const UMBER = [128, 100, 68];

export function reliefField(T, seed, { k = 0.6, w = [0.3, 0.55, 1.0, 0.65], pitK = 0.9, pitH = 1.4 } = {}) {
  const rng = makeRng('relief' + seed);
  const f1 = smoothField(T, T, 1.1, 1.1, rng.fork('a')), f2 = smoothField(T, T, 2.3, 2.3, rng.fork('b')), f3 = smoothField(T, T, 5.2, 5.2, rng.fork('c')), f4 = smoothField(T, T, 13, 13, rng.fork('d'));
  const pitF = smoothField(T, T, 1.5, 1.5, rng.fork('p'));
  const zone = smoothField(T, T, 30, 30, rng.fork('z'));
  const H = new Float32Array(T * T);
  for (let i = 0; i < H.length; i++) {
    const pit = Math.max(0, -pitF[i] - 1.5);
    H[i] = w[0] * f1[i] + w[1] * f2[i] + w[2] * f3[i] + w[3] * f4[i] - pit * pitH;
  }
  const rel = reliefUL(H, T, T, 1);
  const L = new Float32Array(T * T);
  for (let i = 0; i < L.length; i++) {
    L[i] = Math.tanh(rel[i] * k * (1 + 0.28 * zone[i]));
    const pit = Math.max(0, -pitF[i] - 1.9);
    if (pit > 0) L[i] -= Math.min(1, pit * pitK);
  }
  return L;
}

export function fibreLayer(T, seed) {
  const rng = makeRng('fibre' + seed);
  const lit = new Float32Array(T * T), dk = new Float32Array(T * T);
  const fr = rng.fork('f');
  const n = Math.round((T * T) / 2600);
  for (let i = 0; i < n; i++) {
    const light = fr() < 0.55;
    fibre(light ? lit : dk, T, T, { x: fr() * T, y: fr() * T, len: 5 + 22 * Math.pow(fr(), 1.6), angle: fr() * Math.PI * 2, bend: (fr() - 0.5) * 4, amt: light ? 0.55 + 0.45 * fr() : 0.3 + 0.7 * fr(), wd: 0.5 });
  }
  for (let i = 0; i < 8; i++) {
    fibre(dk, T, T, { x: fr() * T, y: fr() * T, len: 26 + 30 * fr(), angle: fr() * Math.PI * 2, bend: (fr() - 0.5) * 14, amt: 0.22 + 0.15 * fr(), wd: 0.35 });
  }
  const fl = rng.fork('fleck');
  for (let i = 0; i < 10; i++) {
    fibre(dk, T, T, { x: fl() * T, y: fl() * T, len: 3 + 6 * fl(), angle: fl() * Math.PI * 2, bend: (fl() - 0.5) * 2, amt: 0.7 + 0.3 * fl(), wd: 0.55 });
  }
  const L = new Float32Array(T * T);
  for (let i = 0; i < L.length; i++) L[i] = clamp(lit[i] - dk[i], -1, 1);
  return L;
}

export function cloudLayer(N, seed) {
  const rng = makeRng('cloud' + seed);
  const big = smoothField(N, N, 5, 5, rng.fork('big')), wide = smoothField(N, N, 12, 12, rng.fork('wide')), floc = smoothField(N, N, 1.4, 1.4, rng.fork('floc'));
  const L = new Float32Array(N * N);
  for (let i = 0; i < L.length; i++) L[i] = clamp(0.55 * big[i] + 0.5 * wide[i] + 0.3 * floc[i], -2, 2) / 2;
  return L;
}

export function mottleLayer(N, seed) {
  const rng = makeRng('mottle' + seed);
  const a = smoothField(N, N, 8, 8, rng.fork('a')), b = smoothField(N, N, 3.4, 3.4, rng.fork('b')), c = smoothField(N, N, 1.2, 1.2, rng.fork('c'));
  const L = new Float32Array(N * N);
  for (let i = 0; i < L.length; i++) L[i] = clamp(0.62 * a[i] + 0.5 * b[i] + 0.28 * c[i], -2, 2) / 2;
  return L;
}

export function linenField(T, pitch, seed) {
  const nx = Math.round(T / pitch), pp = T / nx;
  const rng = makeRng('linen' + seed);
  const thrX = Array.from({ length: nx }, () => rng() - 0.5), thrY = Array.from({ length: nx }, () => rng() - 0.5);
  const slubX = smoothField(T, T, 1.0, 22, rng.fork('sx')), slubY = smoothField(T, T, 22, 1.0, rng.fork('sy'));
  const dispX = smoothField(T, T, 8, 8, rng.fork('dx')), dispY = smoothField(T, T, 8, 8, rng.fork('dy'));
  const H = new Float32Array(T * T);
  for (let y = 0; y < T; y++) {
    for (let x = 0; x < T; x++) {
      const i = y * T + x;
      const gx = (x + 0.45 * dispX[i]) / pp, gy = (y + 0.45 * dispY[i]) / pp;
      const ix = Math.floor(gx), iy = Math.floor(gy), fx = gx - ix, fy = gy - iy;
      const warpOver = (((ix + iy) % 2) + 2) % 2 === 0;
      H[i] = warpOver
        ? 0.5 + 0.5 * Math.pow(Math.sin(Math.PI * fx), 0.75) * (1 + 0.34 * thrX[wrap(ix, nx)] + 0.3 * slubX[i]) * (0.8 + 0.2 * Math.sin(Math.PI * fy))
        : 0.5 + 0.5 * Math.pow(Math.sin(Math.PI * fy), 0.75) * (1 + 0.34 * thrY[wrap(iy, nx)] + 0.3 * slubY[i]) * (0.8 + 0.2 * Math.sin(Math.PI * fx));
    }
  }
  const rel = reliefUL(H, T, T, 1, [0.9, 0.25]);
  const L = new Float32Array(T * T);
  for (let i = 0; i < L.length; i++) L[i] = clamp(Math.tanh(rel[i] * 1.1) * 0.9 + (H[i] - 0.7) * 0.5, -1, 1);
  return L;
}

export function kraftField(W, Hh, seed) {
  const rng = makeRng('kraft' + seed);
  const a = smoothField(W, Hh, 5, 1.1, rng.fork('a')), b = smoothField(W, Hh, 2.6, 0.8, rng.fork('b')), c = smoothField(W, Hh, 1.0, 1.0, rng.fork('c'));
  const streak = smoothField(W, Hh, 34, 1.3, rng.fork('s')), cloud = smoothField(W, Hh, 40, 30, rng.fork('cl'));
  const H = new Float32Array(W * Hh);
  for (let i = 0; i < H.length; i++) H[i] = 0.6 * a[i] + 0.7 * b[i] + 0.45 * c[i];
  const rel = reliefUL(H, W, Hh, 1, [0.5, 0.35]);
  const lit = new Float32Array(W * Hh), dk = new Float32Array(W * Hh);
  const fr = rng.fork('fib');
  for (let i = 0; i < 46; i++) {
    fibre(fr() < 0.5 ? lit : dk, W, Hh, { x: fr() * W, y: fr() * Hh, len: 8 + 26 * Math.pow(fr(), 1.4), angle: (fr() - 0.5) * 0.7, bend: (fr() - 0.5) * 3, amt: 0.35 + 0.5 * fr(), wd: 0.45 });
  }
  const sh = rng.fork('shive');
  for (let i = 0; i < 7; i++) fibre(dk, W, Hh, { x: sh() * W, y: sh() * Hh, len: 3 + 5 * sh(), angle: (sh() - 0.5) * 1.2, bend: 0, amt: 0.8, wd: 0.6 });
  const L = new Float32Array(W * Hh);
  for (let i = 0; i < L.length; i++) L[i] = clamp(Math.tanh(rel[i] * 0.6) * 0.62 + 0.06 * streak[i] + 0.07 * cloud[i] + lit[i] * 0.55 - dk[i] * 0.6, -1, 1);
  return L;
}

function describe(name, field, W, H, png, cssW, cssH, extra = {}) {
  const dec = decodePng(png.png);
  const rgba = dec.rgba();
  const get = (x, y) => (rgba[(y * W + x) * 4 + 3]);
  const mean = (() => {
    let s = 0;
    for (let i = 0; i < W * H; i++) {
      const a = rgba[i * 4 + 3] / 255;
      const stock = [248, 245, 238];
      const c = [rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2]];
      s += (0.3 * (c[0] - stock[0]) + 0.59 * (c[1] - stock[1]) + 0.11 * (c[2] - stock[2])) * a;
    }
    return s / (W * H);
  })();
  const alphas = Array.from({ length: W * H }, (_, i) => rgba[i * 4 + 3]);
  const st = stats(alphas);
  return { name, W, H, cssW, cssH, density: W / cssW, png: png.png, filter: png.filter, levels: png.levels, bitDepth: dec.bitDepth, alphaMean: st.mean, alphaSd: st.sd, lumShift: mean, seam: seamRatio(get, W, H), ...extra };
}

export function buildPaper() {
  const out = {};
  {
    const T = 384, L = reliefField(T, 7);
    out.relief = describe('relief', L, T, T, overlayPng(L, T, T, { nLit: 4, nShade: 5, aLit: 0.26, aShade: 0.19, lit: LIT, shade: UMBER, dead: 0.05 }), T / 2, T / 2, { note: 'cold-press relief + pits, lit from the upper left' });
  }
  {
    const T = 256, L = reliefField(T, 11, { k: 0.5, w: [0.85, 0.8, 0.35, 0.12], pitK: 0.35, pitH: 0.5 });
    out.slip = describe('slip', L, T, T, overlayPng(L, T, T, { nLit: 4, nShade: 5, aLit: 0.2, aShade: 0.14, lit: LIT, shade: UMBER, dead: 0.05 }), T / 2, T / 2, { note: 'fine tooth for slips, index cards, sticky notes' });
  }
  {
    const T = 480, L = fibreLayer(T, 3);
    out.fibre = describe('fibre', L, T, T, overlayPng(L, T, T, { nLit: 3, nShade: 3, aLit: 0.75, aShade: 0.34, lit: [255, 255, 252], shade: [128, 102, 72], dead: 0.06 }), T / 2, T / 2, { note: 'light + dark fibres, faint plant flecks' });
  }
  {
    const N = 240, L = cloudLayer(N, 5);
    out.cloud = describe('cloud', L, N, N, overlayPng(L, N, N, { nLit: 5, nShade: 6, aLit: 0.04, aShade: 0.04, lit: [255, 252, 244], shade: [132, 104, 72], dead: 0.02, keepExtremes: false }), 720, 720, { note: 'slow tonal mottling; drawn 3 css px per tile px' });
  }
  {
    const N = 180, L = mottleLayer(N, 4);
    out.mottle = describe('mottle', L, N, N, overlayPng(L, N, N, { nLit: 5, nShade: 6, aLit: 0.08, aShade: 0.1, lit: [238, 246, 232], shade: [52, 70, 60], dead: 0.03, keepExtremes: false }), 720, 720, { note: 'dyed-cloth mottling for the desk; drawn 4 css px per tile px' });
  }
  {
    const T = 320, L = linenField(T, 5, 3);
    out.linen = describe('linen', L, T, T, overlayPng(L, T, T, { nLit: 4, nShade: 5, aLit: 0.13, aShade: 0.12, lit: [248, 252, 246], shade: [70, 92, 84], dead: 0.06 }), T / 2, T / 2, { note: 'plain-weave bookcloth over the desk colour' });
  }
  {
    const W = 384, H = 192, L = kraftField(W, H, 9);
    out.kraft = describe('kraft', L, W, H, overlayPng(L, W, H, { nLit: 4, nShade: 5, aLit: 0.42, aShade: 0.24, lit: [255, 240, 215], shade: [110, 78, 46], dead: 0.05 }), W / 2, H / 2, { note: 'machine-direction streaks over kraft stock' });
  }
  return out;
}

const b64 = (png) => png.toString('base64');
const HEADER = () => ''

export function emitMasksModule(masks) {
  let s = HEADER('Colour-independent pen grain masks: greyscale indexed PNGs, white = pigment shows. Drawn at 2 tile px per css px.');
  s += `\nexport type GrainMaskKind = 'felt' | 'marker' | 'graphite' | 'waxy' | 'stamp'\n\n`;
  s += `export interface GrainTile {\n  uri: string\n  size: number\n  density: number\n  css: number\n  bytes: number\n  mean: number\n}\n\n`;
  s += `export const GRAIN_TILES: Record<GrainMaskKind, GrainTile> = {\n`;
  for (const m of Object.values(masks)) {
    s += `  ${m.name}: {\n    uri: 'data:image/png;base64,${b64(m.png)}',\n    size: ${m.size},\n    density: ${m.density},\n    css: ${m.css},\n    bytes: ${m.png.length},\n    mean: ${m.mean.toFixed(3)},\n  },\n`;
  }
  s += `}\n`;
  return s;
}

export function emitPaperModule(paper) {
  let s = HEADER('Optional paper / desk overlays: indexed PNG + tRNS, white (lit) + umber (shaded), lit from the upper left. They lie over ANY stock colour.');
  s += `\nexport type PaperTileName = 'relief' | 'slip' | 'fibre' | 'cloud' | 'mottle' | 'linen' | 'kraft'\n\n`;
  s += `export interface PaperTile {\n  uri: string\n  width: number\n  height: number\n  cssWidth: number\n  cssHeight: number\n  bytes: number\n  alpha: number\n  shift: number\n}\n\n`;
  const cname = (n) => 'PAPER_' + n.toUpperCase();
  for (const t of Object.values(paper)) {
    s += `export const ${cname(t.name)}: PaperTile = {\n  uri: 'data:image/png;base64,${b64(t.png)}',\n  width: ${t.W},\n  height: ${t.H},\n  cssWidth: ${t.cssW},\n  cssHeight: ${t.cssH},\n  bytes: ${t.png.length},\n  alpha: ${t.alphaMean.toFixed(1)},\n  shift: ${t.lumShift.toFixed(2)},\n}\n\n`;
  }
  s += `export const PAPER_TILES: Record<PaperTileName, PaperTile> = {\n`;
  for (const t of Object.values(paper)) s += `  ${t.name}: ${cname(t.name)},\n`;
  s += `}\n`;
  return s;
}

const sha = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 12);
const kb = (n) => (n / 1024).toFixed(1).padStart(6);

function report(masks, paper) {
  let mb = 0, pb = 0;
  console.log('\nGRAIN MASKS (2 tile px per css px)');
  console.log('name       tile   css   levels  bits  PNG KB  b64 KB  mean   p10    seam z(x,y)   sha');
  for (const m of Object.values(masks)) {
    mb += m.png.length;
    console.log(`${m.name.padEnd(9)} ${String(m.size).padStart(4)}  ${String(m.css).padStart(4)}  ${String(m.levels).padStart(5)}  ${String(m.bitDepth).padStart(4)}  ${kb(m.png.length)}  ${kb(Math.ceil((m.png.length * 4) / 3))}  ${m.mean.toFixed(3)}  ${m.p10.toFixed(2)}   ${m.seam.zx.toFixed(1)},${m.seam.zy.toFixed(1)}       ${sha(m.png)}`);
  }
  console.log(`total masks: ${kb(mb)} KB PNG = ${kb(Math.ceil((mb * 4) / 3))} KB base64 (budget 110)`);
  console.log('\nPAPER TILES');
  console.log('name    tile      css        levels bits  PNG KB  b64 KB  alpha  shift  seam z(x,y)   sha');
  for (const t of Object.values(paper)) {
    pb += t.png.length;
    console.log(`${t.name.padEnd(7)} ${(t.W + 'x' + t.H).padEnd(9)} ${(t.cssW + 'x' + t.cssH).padEnd(9)} ${String(t.levels).padStart(5)}  ${String(t.bitDepth).padStart(3)}  ${kb(t.png.length)}  ${kb(Math.ceil((t.png.length * 4) / 3))}  ${t.alphaMean.toFixed(1).padStart(5)}  ${t.lumShift.toFixed(2).padStart(5)}  ${t.seam.zx.toFixed(1)},${t.seam.zy.toFixed(1)}       ${sha(t.png)}`);
  }
  console.log(`total paper: ${kb(pb)} KB PNG = ${kb(Math.ceil((pb * 4) / 3))} KB base64 (budget 260)`);
  return { masksB64: Math.ceil((mb * 4) / 3), paperB64: Math.ceil((pb * 4) / 3) };
}

function main() {
  const args = new Set(process.argv.slice(2));
  const t0 = Date.now();
  const masks = buildMasks();
  const paper = buildPaper();
  const modM = emitMasksModule(masks), modP = emitPaperModule(paper);
  const sizes = report(masks, paper);
  console.log(`\nbaked in ${Date.now() - t0} ms`);

  if (args.has('--check')) {
    const m2 = emitMasksModule(buildMasks()), p2 = emitPaperModule(buildPaper());
    const same = m2 === modM && p2 === modP;
    console.log(`determinism: two bakes ${same ? 'IDENTICAL' : 'DIFFER'} (${sha(Buffer.from(modM))}, ${sha(Buffer.from(modP))})`);
    const onDisk = existsSync(OUT_MASKS) && existsSync(OUT_PAPER) && readFileSync(OUT_MASKS, 'utf8') === modM && readFileSync(OUT_PAPER, 'utf8') === modP;
    console.log(`files on disk ${onDisk ? 'are current' : 'are STALE or missing — run without --check'}`);
    const A = reliefField(256, 1), B = reliefField(256, 2), glued = new Float32Array(256 * 256);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) glued[y * 256 + x] = x < 128 ? A[y * 256 + x] : B[y * 256 + x];
    const ctl = seamRatio((x, y) => glued[y * 256 + x], 256, 256);
    console.log(`seam test power: glued control z = ${ctl.zx.toFixed(1)} (a real seam must score > 5)`);
    if (Math.abs(ctl.zx) < 5) { console.log('SEAM TEST HAS NO POWER'); process.exit(1); }
    const zmax = Math.max(...[...Object.values(masks), ...Object.values(paper)].flatMap((t) => [Math.abs(t.seam.zx), Math.abs(t.seam.zy)]));
    console.log(`max |seam z| over all tiles = ${zmax.toFixed(1)} (seamless if < 4)`);
    if (zmax >= 4) { console.log('SEAM DETECTED'); process.exit(1); }
    const over = sizes.masksB64 > 110 * 1024 || sizes.paperB64 > 260 * 1024;
    if (over) console.log('BUDGET EXCEEDED');
    process.exit(same && onDisk && !over ? 0 : 1);
  }

  mkdirSync(path.dirname(OUT_MASKS), { recursive: true });
  writeFileSync(OUT_MASKS, modM);
  writeFileSync(OUT_PAPER, modP);
  console.log(`wrote ${path.relative(ROOT, OUT_MASKS)} (${kb(modM.length)} KB) and ${path.relative(ROOT, OUT_PAPER)} (${kb(modP.length)} KB)`);
  if (args.has('--dump')) {
    const dir = path.join(ROOT, 'lookdev/_tmp/tex');
    mkdirSync(dir, { recursive: true });
    for (const m of Object.values(masks)) writeFileSync(path.join(dir, `mask-${m.name}.png`), m.png);
    for (const t of Object.values(paper)) writeFileSync(path.join(dir, `paper-${t.name}.png`), t.png);
    console.log('dumped tiles to lookdev/_tmp/tex/');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
