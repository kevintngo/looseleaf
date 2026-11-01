export function feltWidth(rand: () => number, base = 1.4): number {
  return base * (0.8 + rand() * 0.5)
}
