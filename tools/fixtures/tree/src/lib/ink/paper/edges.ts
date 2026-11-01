export function deckle(rnd: () => number, w: number, steps = 12): string {
  const pts = Array.from({ length: steps + 1 }, (_, i) => `${Math.round((i / steps) * w * 10) / 10} ${Math.round(rnd() * 30) / 10}`)
  return `M ${pts.join(" L ")}`
}
