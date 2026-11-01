"use client"

import * as React from "react"
import { Slot, Switch as SwitchPrimitive } from "radix-ui"

import { Icon } from "@/components/ui/icon"
import { splitFieldClass } from "@/lib/field-class"
import { pillPoly, roundRectPoly } from "@/lib/ink/geom"
import { blobFill } from "@/lib/ink/fills"
import { box, dashedBox, focusRing } from "@/lib/ink/shapes"
import { useInk, useMergedRef } from "@/lib/ink/react"
import { defineRecipe } from "@/lib/ink/recipes"
import { drawFieldFrame } from "@/lib/ink/recipes/field-frame-ink"
import { cn } from "@/lib/utils"

export const pillRecipe = defineRecipe<{ tone: "hi" | "marker"; disabled?: boolean }>({
  id: "pattern-pill",
  kind: "pill",
  layers: ["rest", "hover", "focus", "disabled"],
  lazy: ["focus"],
  pad: 12,
  draw(ink, { w, h }, { tone, disabled }, ctx) {
    if (disabled) {
      if (ctx.lazyOnly) return
      ink.layer("disabled", () => dashedBox(ink, 0, 0, w, h, { r: h / 2, pen: "pencil" }))
      return
    }
    ctx.lazy("focus", (f) => focusRing(f, 0, 0, w, h, { r: h / 2 }))
    if (ctx.lazyOnly) return
    ink.layer("rest", () => {
      ink.part("fill", () => blobFill(ink, pillPoly(1.5, 1.5, w - 3, h - 3), tone, { alpha: 0.85 }))
      box(ink, 0, 0, w, h, { pen: "ink.fine", corner: h / 2 })
    })
    ink.layer("hover", () => box(ink, 1, 1, w - 2, h - 2, { pen: "ink.fine", corner: h / 2, ghost: false, opts: { alpha: 0.6 } }))
  },
})

export function Pill({
  tone = "hi",
  asChild = false,
  disabled,
  seed,
  className,
  children,
  ref,
  ...props
}: React.ComponentProps<"span"> & { tone?: "hi" | "marker"; asChild?: boolean; disabled?: boolean; seed?: string | number }) {
  const { hostRef, hostProps, node } = useInk({ recipe: pillRecipe, params: { tone, disabled: !!disabled }, seed })
  const Comp = asChild ? Slot.Root : "span"
  return (
    <Comp
      data-slot="pill"
      ref={useMergedRef<HTMLElement>(hostRef, ref as React.Ref<HTMLElement> | undefined)}
      {...hostProps}
      className={cn("relative isolate inline-flex h-6 items-center px-3 font-hand text-sm font-bold whitespace-nowrap [&_svg:not(.absolute)]:size-3.5", className)}
      {...props}
    >
      <Slot.Slottable>{children}</Slot.Slottable>
      {node}
    </Comp>
  )
}

export const selectFrameRecipe = defineRecipe<{ disabled?: boolean; invalid?: boolean }>({
  id: "pattern-select-frame",
  kind: "field",
  layers: ["rest", "hover", "focus", "invalid", "disabled"],
  lazy: ["focus", "hover"],
  pad: 12,
  draw: (ink, box, params, ctx) => drawFieldFrame(ink, box, params, ctx),
})

export function NativeSelect({ className, children, seed, ...props }: React.ComponentProps<"select"> & { seed?: string | number }) {
  const { hostRef, hostProps, node } = useInk({
    recipe: selectFrameRecipe,
    params: { disabled: !!props.disabled, invalid: props["aria-invalid"] === true || props["aria-invalid"] === "true" },
    seed,
    still: true,
  })
  const split = splitFieldClass(className)
  return (
    <span data-slot="native-select-frame" data-ink-focus="within" ref={hostRef} {...hostProps} className={cn("relative isolate flex h-9 w-full items-center font-hand", split.frame)}>
      {node}
      <select data-slot="native-select" className={cn("h-full w-full min-w-0 appearance-none bg-transparent ps-3 pe-9", split.control)} {...props}>
        {children}
      </select>
      <Icon name="chevron-down" size={16} className="pointer-events-none absolute end-3" />
    </span>
  )
}

export const switchRecipe = defineRecipe<{ disabled?: boolean }>({
  id: "pattern-switch",
  kind: "switch",
  layers: ["rest", "hover", "checked", "focus"],
  lazy: ["focus"],
  pad: 12,
  draw(ink, { w, h }, { disabled }, ctx) {
    if (!disabled) ctx.lazy("focus", (f) => focusRing(f, 0, 0, w, h, { r: h / 2 }))
    if (ctx.lazyOnly) return
    ink.layer("rest", () => {
      if (disabled) dashedBox(ink, 0, 0, w, h, { r: h / 2, pen: "pencil" })
      else {
        ink.poly("under", roundRectPoly(1, 1, w - 2, h - 2, h / 2), "slip", 0.8)
        box(ink, 0, 0, w, h, { pen: "ink.fine", corner: h / 2 })
      }
    })
    ink.layer("checked", () => {
      ink.part("fill", () => blobFill(ink, pillPoly(1.5, 1.5, w - 3, h - 3), disabled ? "pencil-mark" : "marker", { alpha: disabled ? 0.4 : 0.86 }))
    })
    if (!disabled) ink.layer("hover", () => box(ink, 1, 1, w - 2, h - 2, { pen: "ink.fine", corner: h / 2, ghost: false, opts: { alpha: 0.6 } }))
  },
})

export function Switch({ className, seed, disabled, ref, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root> & { seed?: string | number }) {
  const { hostRef, hostProps, node } = useInk({ recipe: switchRecipe, params: { disabled: !!disabled }, seed })
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      ref={useMergedRef<HTMLButtonElement>(hostRef, ref)}
      {...hostProps}
      disabled={disabled}
      className={cn("peer relative isolate inline-flex h-6 w-11 shrink-0 items-center disabled:cursor-not-allowed after:absolute after:-inset-1", className)}
      {...props}
    >
      {node}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none relative block size-4 translate-x-1 rounded-full bg-ink transition-transform duration-(--ll-dur-pop) ease-pop data-[state=checked]:translate-x-6 rtl:translate-x-[-4px] rtl:data-[state=checked]:translate-x-[-24px]"
      />
    </SwitchPrimitive.Root>
  )
}
