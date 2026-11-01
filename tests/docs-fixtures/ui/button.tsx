import { Slot } from "radix-ui"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const buttonVariants = cva("inline-flex")

export function Button({ className, asChild }: { className?: string; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return <Comp className={cn(buttonVariants(), className)} data-slot="button" />
}
