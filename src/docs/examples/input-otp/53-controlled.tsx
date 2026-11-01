import * as React from "react"

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

export const meta = {
  title: "Controlled",
  description: "shadcn's `input-otp-controlled`: `value` and `onChange` hold the code in your state, and a line under the boxes echoes it back. The line is a live region, so it is read out as you type.",
  layout: "center" as const,
}

export default function Example() {
  const [value, setValue] = React.useState("")

  return (
    <div className="space-y-2">
      <InputOTP maxLength={6} value={value} onChange={(value) => setValue(value)} aria-label="One-time password">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <div className="text-center text-sm" role="status">
        {value === "" ? <>Enter your one-time password.</> : <>You entered: {value}</>}
      </div>
    </div>
  )
}
