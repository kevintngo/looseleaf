import * as React from "react"

import { Button } from "@/components/ui/button"
import { Paper } from "@/components/ui/paper"
import { Typewriter } from "@/components/ui/typewriter"

export const meta = {
  title: "Printing a receipt",
  description: "A real use: an order confirmation types itself onto a receipt, and onDone brings in the button. `reserve` holds the height of the finished receipt, so the paper does not grow (or move, in a centered stage) as it prints. Print another remounts it with a new key.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 420,
}

export default function Example() {
  const [run, setRun] = React.useState(0)
  const [done, setDone] = React.useState(false)
  return (
    <div className="flex flex-col items-center gap-4">
      <Paper stock="receipt" className="w-72 px-6 py-6" tilt={false}>
        <Typewriter
          key={run}
          text={["ORDER 0042", "one croissant", "one coffee, black", "one apology", "", "TOTAL  a smile"]}
          speed={26}
          pause={500}
          startOnView={false}
          reserve
          cursor="underscore"
          className="block text-base leading-7"
          onDone={() => setDone(true)}
        />
      </Paper>
      <div className="h-9">
        {done ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setDone(false)
              setRun((r) => r + 1)
            }}
          >
            Print another
          </Button>
        ) : null}
      </div>
    </div>
  )
}
