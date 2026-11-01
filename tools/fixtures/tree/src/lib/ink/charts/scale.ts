export function linear(domain: [number, number], range: [number, number]): (v: number) => number {
  const k = (range[1] - range[0]) / (domain[1] - domain[0] || 1)
  return (v) => range[0] + (v - domain[0]) * k
}
