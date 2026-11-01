export function hashSeed(s) {
  if (typeof s === 'number') return (s >>> 0) || 0x9e3779b9;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  return (h >>> 0) || 0x9e3779b9;
}

export function makeRng(seed) {
  const base = hashSeed(seed);
  let s = base;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Object.assign(next, { fork: (name) => makeRng((base ^ hashSeed('f:' + name)) >>> 0) });
}

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const sstep = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
export const wrap = (v, n) => ((v % n) + n) % n;

export function normalise(f) {
  let m = 0;
  for (let i = 0; i < f.length; i++) m += f[i];
  m /= f.length;
  let v = 0;
  for (let i = 0; i < f.length; i++) v += (f[i] - m) ** 2;
  const sd = Math.sqrt(v / f.length) || 1;
  for (let i = 0; i < f.length; i++) f[i] = (f[i] - m) / sd;
  return f;
}

function blurAxis(f, w, h, sigma, horizontal) {
  if (sigma < 0.3) return;
  const len = horizontal ? w : h;
  const lines = horizontal ? h : w;
  const stride = horizontal ? 1 : w;
  const lineStride = horizontal ? w : 1;
  const tmp = new Float32Array(len);
  if (sigma < 6) {
    const R = Math.max(1, Math.ceil(sigma * 3));
    const k = new Float64Array(2 * R + 1);
    let ks = 0;
    for (let i = -R; i <= R; i++) ks += (k[i + R] = Math.exp(-(i * i) / (2 * sigma * sigma)));
    for (let i = 0; i < k.length; i++) k[i] /= ks;
    for (let l = 0; l < lines; l++) {
      const o = l * lineStride;
      for (let x = 0; x < len; x++) {
        let acc = 0;
        for (let i = -R; i <= R; i++) acc += k[i + R] * f[o + wrap(x + i, len) * stride];
        tmp[x] = acc;
      }
      for (let x = 0; x < len; x++) f[o + x * stride] = tmp[x];
    }
    return;
  }
  const q = Math.max(1, Math.round((Math.sqrt(1 + 4 * sigma * sigma) - 1) / 2));
  const inv = 1 / (2 * q + 1);
  for (let l = 0; l < lines; l++) {
    const o = l * lineStride;
    for (let pass = 0; pass < 3; pass++) {
      let sum = 0;
      for (let i = -q; i <= q; i++) sum += f[o + wrap(i, len) * stride];
      for (let x = 0; x < len; x++) {
        tmp[x] = sum * inv;
        sum += f[o + wrap(x + q + 1, len) * stride] - f[o + wrap(x - q, len) * stride];
      }
      for (let x = 0; x < len; x++) f[o + x * stride] = tmp[x];
    }
  }
}

export function blur(f, w, h, sx, sy = sx) {
  blurAxis(f, w, h, sx, true);
  blurAxis(f, w, h, sy, false);
  return f;
}

export function smoothField(w, h, sx, sy, rng) {
  const f = new Float32Array(w * h);
  for (let i = 0; i < f.length; i++) f[i] = rng() - 0.5;
  blur(f, w, h, sx, sy);
  return normalise(f);
}

export function upsampleWrap(src, sw, sh, dw, dh) {
  const out = new Float32Array(dw * dh);
  for (let y = 0; y < dh; y++) {
    const fy = (y * sh) / dh, y0 = Math.floor(fy), ty = sstep(fy - y0);
    for (let x = 0; x < dw; x++) {
      const fx = (x * sw) / dw, x0 = Math.floor(fx), tx = sstep(fx - x0);
      const a = src[wrap(y0, sh) * sw + wrap(x0, sw)], b = src[wrap(y0, sh) * sw + wrap(x0 + 1, sw)];
      const c = src[wrap(y0 + 1, sh) * sw + wrap(x0, sw)], d = src[wrap(y0 + 1, sh) * sw + wrap(x0 + 1, sw)];
      out[y * dw + x] = (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
    }
  }
  return out;
}

export function softLine(F, w, h, x0, y0, x1, y1, amt, wd = 0.6, mode = 'max') {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const st = Math.max(1, Math.ceil(len / 0.5));
  const reach = Math.ceil(wd + 1);
  for (let i = 0; i <= st; i++) {
    const t = i / st;
    const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    const fx = Math.floor(x), fy = Math.floor(y);
    for (let dy = -reach; dy <= reach; dy++) {
      for (let dx = -reach; dx <= reach; dx++) {
        const d = Math.hypot(fx + dx + 0.5 - x, fy + dy + 0.5 - y);
        const k = 1 - d / (wd + 0.5);
        if (k <= 0) continue;
        const ix = wrap(fx + dx, w), iy = wrap(fy + dy, h);
        const v = amt * k * k * (3 - 2 * k);
        if (mode === 'add') F[iy * w + ix] += v * 0.35;
        else if (v > F[iy * w + ix]) F[iy * w + ix] = v;
      }
    }
  }
}

export function fibre(F, w, h, p) {
  const { x, y, len, angle, bend, amt, wd } = p;
  const cx = x + Math.cos(angle) * len * 0.5 - Math.sin(angle) * bend;
  const cy = y + Math.sin(angle) * len * 0.5 + Math.cos(angle) * bend;
  const ex = x + Math.cos(angle) * len, ey = y + Math.sin(angle) * len;
  const seg = Math.max(3, Math.ceil(len / 2));
  let px = x, py = y;
  for (let i = 1; i <= seg; i++) {
    const t = i / seg;
    const nx = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * ex;
    const ny = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy + t * t * ey;
    const a = amt * Math.pow(Math.max(0, Math.sin(Math.PI * (t - 0.5 / seg))), 0.7);
    softLine(F, w, h, px, py, nx, ny, a, wd, p.mode ?? 'max');
    px = nx; py = ny;
  }
}

export function reliefUL(H, w, h, d = 1, k = [0.5, 0.15]) {
  const out = new Float32Array(w * h);
  const at = (x, y) => H[wrap(y, h) * w + wrap(x, w)];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      out[y * w + x] = (at(x + d, y + d) - at(x - d, y - d)) * k[0] + (at(x + d, y) - at(x - d, y)) * k[1] + (at(x, y + d) - at(x, y - d)) * k[1];
    }
  }
  return out;
}

export function stats(a, ps = [0.01, 0.1, 0.5, 0.9, 0.99]) {
  const n = a.length;
  let m = 0;
  for (let i = 0; i < n; i++) m += a[i];
  m /= n;
  let v = 0;
  for (let i = 0; i < n; i++) v += (a[i] - m) ** 2;
  const s = Float64Array.from(a).sort();
  return { mean: m, sd: Math.sqrt(v / n), min: s[0], max: s[n - 1], p: Object.fromEntries(ps.map((p) => [p, s[Math.min(n - 1, Math.floor(p * n))]])) };
}

export function lloydMax(values, levels, iters = 24) {
  const s = Float64Array.from(values).sort();
  const n = s.length;
  let c = Array.from({ length: levels }, (_, i) => s[Math.min(n - 1, Math.floor(((i + 0.5) / levels) * n))]);
  for (let it = 0; it < iters; it++) {
    const sum = new Float64Array(levels), cnt = new Float64Array(levels);
    let j = 0;
    for (let i = 0; i < n; i++) {
      while (j < levels - 1 && Math.abs(s[i] - c[j + 1]) < Math.abs(s[i] - c[j])) j++;
      sum[j] += s[i]; cnt[j]++;
    }
    c = c.map((v, i) => (cnt[i] ? sum[i] / cnt[i] : v));
    c.sort((a, b) => a - b);
  }
  return c;
}

export function nearestIndex(values, centroids) {
  const out = new Uint8Array(values.length);
  const mids = centroids.slice(1).map((v, i) => (v + centroids[i]) / 2);
  for (let i = 0; i < values.length; i++) {
    let lo = 0, hi = mids.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (values[i] > mids[m]) lo = m + 1; else hi = m; }
    out[i] = lo;
  }
  return out;
}

export function seamRatio(get, w, h) {
  const axis = (n, m, at) => {
    const d = new Float64Array(n);
    for (let k = 0; k < n; k++) {
      let s = 0;
      for (let j = 0; j < m; j++) s += Math.abs(at(k, j) - at(wrap(k - 1, n), j));
      d[k] = s / m;
    }
    const seam = d[0];
    let mean = 0;
    for (let k = 1; k < n; k++) mean += d[k];
    mean /= n - 1;
    let v = 0;
    for (let k = 1; k < n; k++) v += (d[k] - mean) ** 2;
    const sd = Math.sqrt(v / (n - 1)) || 1e-9;
    return { ratio: seam / (mean || 1e-9), z: (seam - mean) / sd };
  };
  const x = axis(w, h, (k, j) => get(k, j)), y = axis(h, w, (k, j) => get(j, k));
  return { x: x.ratio, y: y.ratio, zx: x.z, zy: y.z };
}
