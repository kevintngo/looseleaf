"use client"

import * as React from "react"

import { Lettering } from "@/components/ui/lettering"
import { Paper } from "@/components/ui/paper"
import { Newsletter01Envelope } from "@/blocks/newsletter-01/components/newsletter-01-envelope"
import { Newsletter01Form, type Newsletter01Status } from "@/blocks/newsletter-01/components/newsletter-01-form"

type Newsletter01Props = {
  onSubscribe?: (email: string) => void | Promise<void>
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Newsletter01({ onSubscribe }: Newsletter01Props) {
  const titleId = React.useId()
  const [status, setStatus] = React.useState<Newsletter01Status>("idle")
  const [email, setEmail] = React.useState("")
  const [open, setOpen] = React.useState(false)

  const submit = async () => {
    if (!EMAIL.test(email.trim())) {
      setStatus("invalid")
      return
    }
    setStatus("sending")
    try {
      await onSubscribe?.(email.trim())
      setStatus("done")
      setOpen(true)
    } catch {
      setStatus("failed")
    }
  }

  return (
    <section aria-labelledby={titleId} className="@container relative w-full overflow-x-clip">
      <div className="px-8 py-14 @xl:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-x-14 gap-y-6 @3xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Paper stock="paper" tilt={false} tape="corner" tapeKind="washi-dots" seed="newsletter-card" className="px-6 py-8 @xl:px-9 @xl:py-10">
            <p className="font-type text-sm text-pencil-text">The Sunday letter</p>
            <Lettering as="h2" id={titleId} size="md" tone="marker" wobble={0.4} seed="newsletter-title" className="mt-3">
              One short letter, every Sunday
            </Lettering>
            <p className="mt-4 mb-6 text-lg/7 text-ink-soft">What we shipped, what we drew, and one good link. Three minutes, best with tea.</p>
            <Newsletter01Form
              status={status}
              email={email}
              onEmailChange={(v) => {
                setEmail(v)
                if (status === "invalid" || status === "failed") setStatus("idle")
              }}
              onSubmit={submit}
              onReset={() => {
                setStatus("idle")
                setEmail("")
                setOpen(false)
              }}
            />
          </Paper>

          <Newsletter01Envelope open={open} onOpenChange={setOpen} stamped={status === "done"} />
        </div>
      </div>
    </section>
  )
}

export type { Newsletter01Props }
