import * as React from "react"

import { Button } from "@/components/ui/button"
import { Circled } from "@/components/ui/circled"

export const meta = {
  title: "The answer key",
  description: "Mark the right answer, written on with the pen. The circle is decoration: the answer is also given in words.",
  layout: "stack" as const,
  height: 240,
}

export default function Example() {
  const [show, setShow] = React.useState(false)
  return (
    <div className="grid w-full max-w-sm gap-4">
      <p className="font-script text-2xl">Which of these is a fine-liner?</p>
      <ul className="grid gap-2.5 py-1 text-[17px]">
        <li>a) A chisel-tip marker</li>
        <li>
          <Circled animate show={show} tone="red">
            b) A 0.4 mm felt pen
          </Circled>
        </li>
        <li>c) A stick of graphite</li>
      </ul>
      <Button variant="outline" size="sm" className="w-fit" aria-pressed={show} onClick={() => setShow((s) => !s)}>
        {show ? "Hide the answer (b)" : "Show the answer"}
      </Button>
    </div>
  )
}
