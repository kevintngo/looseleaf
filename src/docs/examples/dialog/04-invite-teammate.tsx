import * as React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Invite a teammate (controlled)",
  description: "A real flow: a controlled dialog around a form. Submitting closes it and the page answers; the field is cleared for next time. Focus returns to the trigger.",
  layout: "center" as const,
}

export default function Example() {
  const [open, setOpen] = React.useState(false)
  const [invited, setInvited] = React.useState<string[]>([])
  const [email, setEmail] = React.useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setInvited((l) => [...l, email.trim()])
    setEmail("")
    setOpen(false)
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Invite a teammate</Button>
        </DialogTrigger>
        <DialogContent tape="top" tapeKind="kraft" seed="invite" className="sm:max-w-sm">
          <form onSubmit={submit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Invite a teammate</DialogTitle>
              <DialogDescription>They will get a link to this notebook by email.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input id="invite-email" type="email" placeholder="ada@analytical.engine" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Not now
              </Button>
              <Button type="submit">Send invite</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <p className="min-h-6 text-sm text-muted-foreground" aria-live="polite">
        {invited.length ? `Invited: ${invited.join(", ")}` : "Nobody invited yet."}
      </p>
    </div>
  )
}
