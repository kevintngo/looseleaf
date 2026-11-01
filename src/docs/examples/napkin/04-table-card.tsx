import * as React from "react"

import { Button } from "@/components/ui/button"
import { Napkin, NapkinContent, NapkinFooter, NapkinTitle } from "@/components/ui/napkin"
import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "A note for the table",
  description: "A real use: a guest writes a note on the napkin and pins it to the board. The napkin holds a form; its script font is only for what is written.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 420,
}

export default function Example() {
  const [note, setNote] = React.useState("")
  const [sent, setSent] = React.useState(false)
  return (
    <Napkin as="article" seed="table" className="mx-auto w-80 min-h-72 gap-3" aria-label="Note for the kitchen">
      <NapkinTitle>{sent ? "Sent!" : "For the kitchen"}</NapkinTitle>
      {sent ? (
        <NapkinContent>{note || "(nothing, but thank you)"}</NapkinContent>
      ) : (
        <>
          <Textarea aria-label="Your note" placeholder="allergies, birthdays, the very small pie..." value={note} onChange={(e) => setNote(e.target.value)} className="min-h-24" />
          <NapkinFooter>
            <Button size="sm" onClick={() => setSent(true)}>
              Send it
            </Button>
          </NapkinFooter>
        </>
      )}
    </Napkin>
  )
}
