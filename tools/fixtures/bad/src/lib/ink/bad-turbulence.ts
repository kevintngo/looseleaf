import { hashSeed } from "./rng"

export const DEFS = `<filter id="x"><feTurbulence baseFrequency="0.3" /></filter>`
export const INK = "#1a1a1a"
export const seed = hashSeed("x")
