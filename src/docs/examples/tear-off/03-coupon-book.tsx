import * as React from "react"

import { Button } from "@/components/ui/button"
import { Confetti } from "@/components/ui/confetti"
import { TearOff, TearOffBody, TearOffStub } from "@/components/ui/tear-off"

export const meta = {
  title: "Coupon book",
  description: "A real use: onTear redeems the coupon, and a controlled torn state lets the book be reset. The confetti stays inside the ticket.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 330,
}

export default function Example() {
  const [torn, setTorn] = React.useState(false)
  const [redeemed, setRedeemed] = React.useState(0)
  return (
    <div className="flex flex-col items-center gap-4">
      <TearOff torn={torn} onTornChange={setTorn} onTear={() => setRedeemed((n) => n + 1)} tornMessage="Coupon redeemed.">
        <TearOffBody className="relative w-72">
          <Confetti active={torn} count={40} spread={100} />
          <p className="font-script text-3xl leading-none">Bakery of the month</p>
          <p className="mt-2 text-sm">One croissant, warm, any day.</p>
        </TearOffBody>
        <TearOffStub className="w-28 justify-start gap-0 pt-3.5 pb-2">
          <span className="font-script text-3xl leading-[30px]">free</span>
          <span className="text-sm leading-[30px] text-pencil-text">tear here</span>
        </TearOffStub>
      </TearOff>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Redeemed {redeemed} time{redeemed === 1 ? "" : "s"}</span>
        <Button variant="outline" size="sm" onClick={() => setTorn(false)}>
          New coupon
        </Button>
      </div>
    </div>
  )
}
