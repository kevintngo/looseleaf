import type { ComponentProps, ReactNode } from "react"
import { Button as LibButton } from "@/components/ui/button"
import { Link, type LinkProps } from "../core/router"
import { Glyph, type GlyphName } from "./glyphs"

type Variant = "default" | "primary" | "quiet"
type Size = "default" | "sm" | "lg"

const VARIANT = { default: "outline", primary: "default", quiet: "ghost" } as const

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = "default", size, type = "button", ...props }: ButtonProps) {
  return <LibButton type={type} variant={VARIANT[variant]} size={size} {...props} />
}

export interface IconButtonProps extends Omit<ComponentProps<"button">, "children"> {
  label: string
  glyph: GlyphName
  size?: number
  variant?: Variant
  children?: ReactNode
}

export function IconButton({ label, glyph, size = 20, variant = "quiet", type = "button", children, ...props }: IconButtonProps) {
  return (
    <LibButton type={type} variant={VARIANT[variant]} size={children ? "default" : "icon"} aria-label={label} {...props}>
      <Glyph name={glyph} size={size} />
      {children}
    </LibButton>
  )
}

export interface ButtonLinkProps extends LinkProps {
  variant?: Variant
  size?: Size
}

export function ButtonLink({ variant = "default", size, ...props }: ButtonLinkProps) {
  return (
    <LibButton asChild variant={VARIANT[variant]} size={size}>
      <Link {...props} />
    </LibButton>
  )
}
