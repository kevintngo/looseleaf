import * as React from "react"
import { helper } from "./helper"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSeed } from "@/lib/ink/react/hooks"
import { clsx } from "clsx"
import type { Rng } from "@/lib/ink/rng"

export function badRecipe(w: number, h: number) {
  const width = document.documentElement.clientWidth
  const later = requestAnimationFrame(() => {})
  const stroke = "#2a2420"
  const blur = `<filter id="b"><feGaussianBlur stdDeviation="2"/></filter>`
  const seed = React.useId()
  void [helper, cn, Button, useSeed, clsx, later, blur, seed]
  return { svg: `<path stroke="${stroke}" d="M0 0 L${w + width} ${h}"/>`, w, h } as { svg: string; w: number; h: number; rng?: Rng }
}
