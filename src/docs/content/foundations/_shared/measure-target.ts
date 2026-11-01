export interface Size {
  w: number
  h: number
  grow: number
}

export function measureTarget(root: HTMLElement): Size {
  const box = root.getBoundingClientRect()
  let w = box.width
  let h = box.height
  const control = root.querySelector<HTMLElement>("button, input, [role=checkbox], [role=switch], [role=radio]")
  const real = typeof navigator === "undefined" || !/jsdom/i.test(navigator.userAgent)
  if (control && real && (w > 0 || h > 0)) {
    try {
      const after = getComputedStyle(control, "::after")
      if (after.position === "absolute") {
        const aw = Number.parseFloat(after.width)
        const ah = Number.parseFloat(after.height)
        if (aw > w) w = aw
        if (ah > h) h = ah
      }
    } catch {
    }
  }
  return { w: Math.round(w), h: Math.round(h), grow: Math.max(0, Math.round(Math.min(w - box.width, h - box.height) / 2)) }
}
