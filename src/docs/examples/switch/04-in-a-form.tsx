import * as React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export const meta = {
  title: "In a form",
  description: "With a name (and optional value) a switch submits like a native checkbox: on gives \"on\" or its value, off sends nothing. Controlled here, so the summary follows it.",
  layout: "stack" as const,
}

export default function Example() {
  const [digest, setDigest] = React.useState(true)
  const [sent, setSent] = React.useState("")
  return (
    <form
      className="grid w-full max-w-sm gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        setSent(`Saved: digest ${data.get("digest") ?? "off"}, marketing ${data.get("marketing") ?? "off"}`)
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="digest">Weekly digest</Label>
        <Switch id="digest" name="digest" value="weekly" checked={digest} onCheckedChange={setDigest} />
      </div>
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="marketing">Product news</Label>
        <Switch id="marketing" name="marketing" />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit">Save</Button>
        <span role="status" className="text-sm text-ink-muted">
          {sent}
        </span>
      </div>
    </form>
  )
}
