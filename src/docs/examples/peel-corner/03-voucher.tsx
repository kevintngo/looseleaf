import * as React from "react"

import { Button } from "@/components/ui/button"
import { PeelCorner, PeelCornerPage, PeelCornerUnder } from "@/components/ui/peel-corner"

export const meta = {
  title: "Voucher with a copy button",
  description: "A real use: the code lives on the sheet underneath, with a working button. It is inert until the corner is open, then a normal control. Controlled, so the page can open it too.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 340,
}

export default function Example() {
  const [open, setOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  return (
    <div className="flex flex-col items-center gap-3">
      <PeelCorner peeled={open} onPeeledChange={setOpen} className="w-80" label="Reveal the voucher code">
        <PeelCornerPage className="h-52">
          <p className="font-script text-3xl leading-none">Loyalty voucher</p>
          <p className="mt-2 text-sm">Thank you for ten coffees. This one is on us.</p>
        </PeelCornerPage>
        <PeelCornerUnder className="items-end justify-end">
          <div className="flex flex-col items-end gap-2 pb-1">
            <p className="font-script text-4xl leading-none">FREE-10</p>
            <Button
              size="xs"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard?.writeText("FREE-10")
                setCopied(true)
              }}
            >
              {copied ? "Copied" : "Copy code"}
            </Button>
          </div>
        </PeelCornerUnder>
      </PeelCorner>
      <Button variant="link" size="sm" onClick={() => setOpen((o) => !o)}>
        {open ? "Close the corner" : "Or open it from here"}
      </Button>
    </div>
  )
}
