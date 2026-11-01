import type { ComponentProps } from "react"
import { Icon } from "@/components/ui/icon"

const ICON = {
  search: "search",
  menu: "menu",
  close: "x",
  copy: "copy",
  check: "check",
  "chevron-down": "chevron-down",
  "chevron-right": "chevron-right",
  "arrow-left": "arrow-left",
  "arrow-right": "arrow-right",
  sliders: "sliders-horizontal",
  hash: "link",
  external: "external-link",
  leaf: "pencil",
} as const

export type GlyphName = keyof typeof ICON

export interface GlyphProps extends Omit<ComponentProps<typeof Icon>, "name"> {
  name: GlyphName
}

export function Glyph({ name, size = 20, ...props }: GlyphProps) {
  return <Icon name={ICON[name]} size={size} {...props} />
}
