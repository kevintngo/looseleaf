import { useRef, type ReactNode } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface OverlayProps {
  open: boolean
  onClose: () => void
  label: string
  initialFocus?: string
  className?: string
  children: ReactNode
}

export function Overlay({ open, onClose, label, initialFocus, className, children }: OverlayProps) {
  const opener = useRef<Element | null>(null)
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          opener.current = document.activeElement
          const first = initialFocus && event.target instanceof HTMLElement ? event.target.querySelector<HTMLElement>(initialFocus) : null
          if (first) {
            event.preventDefault()
            first.focus()
          }
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          const el = opener.current
          opener.current = null
          if (el instanceof HTMLElement && el !== document.body && el.isConnected) el.focus({ preventScroll: true })
        }}
        className={cn("max-w-2xl", className)}
      >
        <DialogTitle className="sr-only">{label}</DialogTitle>
        <DialogDescription className="sr-only">{label}</DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export function Scrim({ open, onClick }: { open: boolean; onClick: () => void }) {
  if (!open) return null
  return <div className="fixed inset-0 z-(--ll-z-drawer) [background:var(--ll-overlay-dim)]" onClick={onClick} aria-hidden="true" />
}
