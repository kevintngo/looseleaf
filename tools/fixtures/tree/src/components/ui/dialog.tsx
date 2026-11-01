"use client"

import type { ComponentProps } from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger

function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-ink/30 data-[state=open]:animate-in" />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn("ll-sheet fixed top-1/2 left-1/2 w-96 -translate-x-1/2 -translate-y-1/2 p-6 animate-soak", className)}
        {...props}
      >
        {children}
        <DialogPrimitive.Close asChild>
          <Button variant="ghost" size="sm" className="absolute top-2 right-2">
            Close
          </Button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export { Dialog, DialogTrigger, DialogContent }
