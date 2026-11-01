import { deflateSync, inflateSync, constants as Z } from 'node:zlib';

export const COLOR_TYPE = { gray: 0, rgb: 2, indexed: 3, graya: 4, rgba: 6 };
const CHANNELS = { gray: 1, rgb: 3, indexed: 1, graya: 2, rgba: 4 };
const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
export const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
};

function packRows(img) {
  const { width: w, height: h, data } = img;
  const bd = img.bitDepth ?? 8;
  const ch = CHANNELS[img.colorType];
  if (bd === 8) return { rowBytes: w * ch, rows: Buffer.from(data.buffer, data.byteOffset, w * h * ch) };
  const rowBytes = Math.ceil((w * bd) / 8);
  const rows = Buffer.alloc(rowBytes * h);
  const maxV = (1 << bd) - 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = data[y * w + x];
      if (v > maxV) throw new Error(`png: sample ${v} does not fit ${bd} bits`);
      rows[y * rowBytes + ((x * bd) >> 3)] |= v << (8 - bd - ((x * bd) & 7));
    }
  }
  return { rowBytes, rows };
}

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

function filterRow(type, cur, prev, bpp, out, off) {
  const n = cur.length;
  out[off] = type;
  for (let i = 0; i < n; i++) {
    const a = i >= bpp ? cur[i - bpp] : 0;
    const b = prev ? prev[i] : 0;
    const c = i >= bpp && prev ? prev[i - bpp] : 0;
    let p = 0;
    if (type === 1) p = a;
    else if (type === 2) p = b;
    else if (type === 3) p = (a + b) >> 1;
    else if (type === 4) p = paeth(a, b, c);
    out[off + 1 + i] = (cur[i] - p) & 255;
  }
}

function filterAll(rows, rowBytes, h, bpp, filter) {
  const raw = Buffer.alloc((rowBytes + 1) * h);
  const tmp = Buffer.alloc(rowBytes + 1);
  for (let y = 0; y < h; y++) {
    const cur = rows.subarray(y * rowBytes, (y + 1) * rowBytes);
    const prev = y ? rows.subarray((y - 1) * rowBytes, y * rowBytes) : null;
    if (filter === 'adaptive') {
      let best = 1e18, bestT = 0;
      for (let t = 0; t < 5; t++) {
        filterRow(t, cur, prev, bpp, tmp, 0);
        let s = 0;
        for (let i = 1; i <= rowBytes; i++) s += tmp[i] < 128 ? tmp[i] : 256 - tmp[i];
        if (s < best) { best = s; bestT = t; }
      }
      filterRow(bestT, cur, prev, bpp, raw, y * (rowBytes + 1));
    } else {
      filterRow(filter, cur, prev, bpp, raw, y * (rowBytes + 1));
    }
  }
  return raw;
}

const STRATEGIES = [Z.Z_DEFAULT_STRATEGY, Z.Z_FILTERED, Z.Z_HUFFMAN_ONLY, Z.Z_RLE];
const deflate = (raw, strategy) => deflateSync(raw, { level: 9, memLevel: 9, windowBits: 15, strategy });

function assemble(img, idat) {
  const { width: w, height: h } = img;
  const bd = img.bitDepth ?? 8;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = bd;
  ihdr[9] = COLOR_TYPE[img.colorType];
  const parts = [SIG, chunk('IHDR', ihdr)];
  if (img.colorType === 'indexed') {
    if (!img.palette?.length) throw new Error('png: indexed image needs a palette');
    parts.push(chunk('PLTE', Buffer.from(img.palette.flat())));
    if (img.trns?.length) {
      let last = img.trns.length;
      while (last > 0 && img.trns[last - 1] === 255) last--;
      if (last) parts.push(chunk('tRNS', Buffer.from(img.trns.slice(0, last))));
    }
  }
  parts.push(chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(parts);
}

export function encodePng(img, o = {}) {
  const { rowBytes, rows } = packRows(img);
  const bd = img.bitDepth ?? 8;
  const bpp = Math.max(1, (CHANNELS[img.colorType] * bd) >> 3);
  const raw = filterAll(rows, rowBytes, img.height, bpp, o.filter ?? 'adaptive');
  return assemble(img, deflate(raw, o.strategy ?? Z.Z_DEFAULT_STRATEGY));
}

export function bestPng(img, o = {}) {
  const { rowBytes, rows } = packRows(img);
  const bd = img.bitDepth ?? 8;
  const bpp = Math.max(1, (CHANNELS[img.colorType] * bd) >> 3);
  const filters = o.filters ?? [0, 1, 2, 3, 4, 'adaptive'];
  let best = null;
  for (const f of filters) {
    const raw = filterAll(rows, rowBytes, img.height, bpp, f);
    for (const s of o.strategies ?? STRATEGIES) {
      const z = deflate(raw, s);
      if (!best || z.length < best.z.length) best = { z, filter: f, strategy: s };
    }
  }
  return { png: assemble(img, best.z), filter: best.filter, strategy: best.strategy };
}

export const toDataUri = (png, mime = 'image/png') => `data:${mime};base64,${png.toString('base64')}`;

export function decodePng(buf) {
  if (!buf.subarray(0, 8).equals(SIG)) throw new Error('png: bad signature');
  let p = 8, w = 0, h = 0, bd = 8, ct = 0;
  let palette = null, trns = null;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('ascii', p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; if (data[12]) throw new Error('png: interlaced'); }
    else if (type === 'PLTE') { palette = []; for (let i = 0; i < len; i += 3) palette.push([data[i], data[i + 1], data[i + 2]]); }
    else if (type === 'tRNS') trns = [...data];
    else if (type === 'IDAT') idat.push(data);
    p += 12 + len;
  }
  const colorType = Object.keys(COLOR_TYPE).find((k) => COLOR_TYPE[k] === ct);
  const ch = CHANNELS[colorType];
  const bpp = Math.max(1, (ch * bd) >> 3);
  const rowBytes = Math.ceil((w * ch * bd) / 8);
  const raw = inflateSync(Buffer.concat(idat));
  const rows = Buffer.alloc(rowBytes * h);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (rowBytes + 1)];
    for (let i = 0; i < rowBytes; i++) {
      const v = raw[y * (rowBytes + 1) + 1 + i];
      const a = i >= bpp ? rows[y * rowBytes + i - bpp] : 0;
      const b = y ? rows[(y - 1) * rowBytes + i] : 0;
      const c = i >= bpp && y ? rows[(y - 1) * rowBytes + i - bpp] : 0;
      rows[y * rowBytes + i] = (f === 0 ? v : f === 1 ? v + a : f === 2 ? v + b : f === 3 ? v + ((a + b) >> 1) : v + paeth(a, b, c)) & 255;
    }
  }
  let samples;
  if (bd === 8) samples = new Uint8Array(rows.buffer, rows.byteOffset, w * h * ch);
  else {
    samples = new Uint8Array(w * h * ch);
    const maxV = (1 << bd) - 1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w * ch; x++) samples[y * w * ch + x] = (rows[y * rowBytes + ((x * bd) >> 3)] >> (8 - bd - ((x * bd) & 7))) & maxV;
  }
  const rgba = () => {
    const out = new Uint8Array(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      let r, g, b, a = 255;
      if (colorType === 'indexed') { const e = palette[samples[i]]; [r, g, b] = e; a = trns && samples[i] < trns.length ? trns[samples[i]] : 255; }
      else if (colorType === 'gray') { const v = bd === 8 ? samples[i] : Math.round((samples[i] * 255) / ((1 << bd) - 1)); r = g = b = v; }
      else if (colorType === 'graya') { r = g = b = samples[i * 2]; a = samples[i * 2 + 1]; }
      else if (colorType === 'rgb') { r = samples[i * 3]; g = samples[i * 3 + 1]; b = samples[i * 3 + 2]; }
      else { r = samples[i * 4]; g = samples[i * 4 + 1]; b = samples[i * 4 + 2]; a = samples[i * 4 + 3]; }
      out[i * 4] = r; out[i * 4 + 1] = g; out[i * 4 + 2] = b; out[i * 4 + 3] = a;
    }
    return out;
  };
  return { width: w, height: h, colorType, bitDepth: bd, data: samples, samples, palette, trns, rgba };
}
