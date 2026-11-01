import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"

export const meta = {
  title: "Action and undo",
  description: "The real pattern: do the thing at once, then offer to take it back. The action is a highlighter-marked button (a Looseleaf Button also works as the label); the page updates when you press it.",
  layout: "center" as const,
}

const ID = "sonner-undo"

export default function Example() {
  const [notes, setNotes] = React.useState(["Rain from six.", "Tea, two cups.", "Long letter to Ada."])

  function remove(index: number) {
    const gone = notes[index]
    setNotes((n) => n.filter((_, i) => i !== index))
    toast("Note deleted", {
      toasterId: ID,
      description: `"${gone}"`,
      duration: 6000,
      action: { label: "Undo", onClick: () => setNotes((n) => [...n.slice(0, index), gone, ...n.slice(index)]) },
      cancel: { label: "Dismiss", onClick: () => {} },
    })
  }

  return (
    <div className="grid w-full max-w-xs gap-2">
      {notes.map((n, i) => (
        <div key={n} className="flex items-center justify-between gap-2 border-b border-dashed border-pencil-mark/60 py-1">
          <span>{n}</span>
          <Button size="xs" variant="ghost" onClick={() => remove(i)} aria-label={`Delete "${n}"`}>
            Delete
          </Button>
        </div>
      ))}
      {notes.length === 0 && <p className="text-sm text-muted-foreground">Nothing left. Press Undo on the slip.</p>}
      <Toaster id={ID} closeButton />
    </div>
  )
}
