export function containedClasses(contained: boolean) {
  return {
    provider: contained ? "h-full min-h-0" : undefined,
    sidebar: contained ? "h-full" : undefined,
    inset: contained ? "overflow-y-auto" : undefined,
  }
}
