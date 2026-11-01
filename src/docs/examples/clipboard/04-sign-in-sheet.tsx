import * as React from "react"

import { Button } from "@/components/ui/button"
import { Clipboard, ClipboardPaper } from "@/components/ui/clipboard"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "A sign-in sheet",
  description: "A real form on the paper: a name, a visit, a button, and the visitors so far listed as they sign. The paper is a `form` with a label.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 440,
}

export default function Example() {
  const [who, setWho] = React.useState<string[]>(["Ada Lovelace", "Grace Hopper"])
  const [name, setName] = React.useState("")
  return (
    <Clipboard tone="teal" seed="sign" tilt={-0.8} className="mx-auto">
      <ClipboardPaper
        as="form"
        aria-label="Visitors sign-in sheet"
        seed="sign-p"
        onSubmit={(e) => {
          e.preventDefault()
          if (name.trim()) setWho((w) => [...w, name.trim()])
          setName("")
        }}
      >
        <h3 className="font-script text-[1.75rem] leading-7 font-bold">Visitors</h3>
        <ol className="list-decimal ps-5 leading-7">
          {who.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ol>
        <div className="mt-3 flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor="visitor">Your name</Label>
            <Input id="visitor" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sign here" />
          </div>
          <Button type="submit">Sign</Button>
        </div>
      </ClipboardPaper>
    </Clipboard>
  )
}
