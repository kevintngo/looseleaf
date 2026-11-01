import * as React from "react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export const meta = {
  title: "Async action (controlled)",
  description: "A confirmation that does real work: the action keeps the dialog open while it runs (preventDefault), disables both answers, then closes it and the page reports the result.",
  layout: "center" as const,
}

export default function Example() {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [gone, setGone] = React.useState(false)

  async function remove(e: React.MouseEvent) {
    e.preventDefault()
    setBusy(true)
    await new Promise((r) => setTimeout(r, 900))
    setBusy(false)
    setGone(true)
    setOpen(false)
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <AlertDialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={gone}>
            {gone ? "Deleted" : "Delete project"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent tone="danger" seed="async">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete the project?</AlertDialogTitle>
            <AlertDialogDescription>Its notebooks, drawings and comments go with it.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={busy} onClick={remove}>
              {busy ? "Deleting…" : "Yes, delete it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p className="min-h-6 text-sm text-muted-foreground" aria-live="polite">
        {gone ? "The project was deleted." : "Nothing deleted yet."}
      </p>
    </div>
  )
}
