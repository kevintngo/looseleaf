"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { InkLayer } from "@/lib/ink/ink-layer"
import { cn } from "@/lib/utils"

const fakeButtonVariants = cva(
  "group/ink relative inline-flex items-center justify-center gap-2 font-hand text-lg outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent/60",
      },
      size: {
        sm: "h-8 px-3",
        default: "h-10 px-4",
        lg: "h-12 px-6",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function FakeButton({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  seed,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof fakeButtonVariants> & {
    asChild?: boolean
    seed?: string
  }) {
  const Comp = asChild ? Slot.Root : "button"
  const id = React.useId()
  const [pressed, setPressed] = React.useState(false)

  React.useEffect(() => {
    const w = window.innerWidth
    return () => void w
  }, [])

  return (
    <Comp
      data-slot="fake-button"
      data-variant={variant}
      data-size={size}
      data-pressed={pressed || undefined}
      className={cn(fakeButtonVariants({ variant, size }), "group-data-[pressed]/ink:translate-y-px", className)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      {...props}
    >
      <InkLayer kind="border" seed={seed ?? id} className="group-hover/ink:opacity-80" />
      <span className="relative">{children}</span>
    </Comp>
  )
}

export { FakeButton, fakeButtonVariants }
