import * as React from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export const meta = {
  title: "Loading, with a spinner",
  description:
    "The shadcn pattern: a Spinner in front of the label inside a disabled button. The first and last are the static state (disabled buttons are dashed). Press the second to watch a request go through: it is `aria-disabled` while it works instead of `disabled`, so keyboard focus stays on it.",
  layout: "stack" as const,
}

export default function Example() {
  const [sending, setSending] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  function send() {
    if (sending) return
    setSending(true)
    timer.current = setTimeout(() => setSending(false), 2200)
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm" variant="outline" disabled>
        <Spinner />
        Submit
      </Button>
      <Button onClick={send} aria-disabled={sending} aria-busy={sending}>
        {sending && <Spinner />}
        {sending ? "Sending" : "Send the letter"}
      </Button>
      <Button variant="secondary" disabled>
        <Spinner />
        Please wait
      </Button>
    </div>
  )
}
