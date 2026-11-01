import * as React from "react"

import { Button } from "@/components/ui/button"
import { Paper } from "@/components/ui/paper"
import { Signature } from "@/components/ui/signature"

export const meta = {
  title: "The end of a letter",
  description: "Sign it: the name is written left to right, then the flourish follows the pen.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 360,
}

export default function Example() {
  const [signed, setSigned] = React.useState(true)
  return (
    <div className="grid w-full max-w-md gap-4">
      <Paper stock="paper" rules="ruled" tilt seed="letter" className="pt-4 pr-6 pb-6 pl-14">
        <p className="text-[15px] leading-[28px]">Thank you for the tomatoes, the jam, and the long letter; I read it twice. Come and see the garden in June.</p>
        <p className="text-[15px] leading-[28px]">Yours, always,</p>
        <div className="min-h-[72px] pt-[15px]">
          {signed ? (
            <Signature key="s" animate size="md">
              Sam Whitcombe
            </Signature>
          ) : null}
        </div>
      </Paper>
      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => {
          setSigned(false)
          setTimeout(() => setSigned(true), 60)
        }}
      >
        Sign again
      </Button>
    </div>
  )
}
