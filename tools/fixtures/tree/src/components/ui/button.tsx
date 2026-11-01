import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Ink } from "@/lib/ink"
import { buttonRecipe } from "@/lib/ink/recipes/button-ink"
import { useTilt } from "@/hooks/use-tilt"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 font-hand text-base whitespace-nowrap outline-none focus-visible:ring-2 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        ghost: "bg-transparent text-ink hover:bg-highlighter/40",
      },
      size: { default: "h-10 px-4", sm: "h-8 px-3", lg: "h-12 px-6" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  seed,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean; seed?: string }) {
  const id = React.useId()
  const tilt = useTilt(seed ?? id)
  const outline = buttonRecipe(seed ?? id)
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? "default"}
      style={{ rotate: `${tilt}deg` }}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {props.children}
      <svg data-ink="border" aria-hidden="true" focusable="false" viewBox={`0 0 ${outline.w} ${outline.h}`} className="pointer-events-none absolute inset-0 size-full overflow-visible">
        <path d={outline.d} fill="none" stroke="currentColor" strokeWidth={1.4} />
      </svg>
      <Ink seed={seed ?? id} />
    </Comp>
  )
}

export { Button, buttonVariants }
