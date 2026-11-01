export function frame(rnd: () => number, w: number, h: number): string {
  const j = () => Math.round((rnd() - 0.5) * 30) / 10
  return `M ${1 + j()} ${1 + j()} L ${w - 1 + j()} ${1 + j()} L ${w - 1 + j()} ${h - 1 + j()} L ${1 + j()} ${h - 1 + j()} Z`
}
