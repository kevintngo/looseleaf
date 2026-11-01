import * as React from "react"

import { InputOTP, InputOTPGroup, InputOTPSlot, REGEXP_ONLY_DIGITS_AND_CHARS } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Letters and digits, a wrong code",
  description: "pattern lets letters in (anything else is refused, also when pasted). The right code here is AB12; the box starts on AB13, so you can see what a wrong code looks like: red boxes and a message you write. Change the last character to 2 and it clears.",
  layout: "center" as const,
  height: 240,
}

export default function Example() {
  const [value, setValue] = React.useState("AB13")
  const wrong = value.length === 4 && value.toUpperCase() !== "AB12"
  return (
    <div className="grid gap-3">
      <Label htmlFor="otp-code">Invite code</Label>
      <InputOTP id="otp-code" maxLength={4} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} inputMode="text" value={value} onChange={(v) => setValue(v.toUpperCase())} invalid={wrong} aria-describedby="otp-code-msg">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
      <p id="otp-code-msg" role={wrong ? "alert" : undefined} className={wrong ? "font-hand text-sm text-red" : "font-hand text-sm text-ink-muted"}>
        {wrong ? "That code does not match. Try again." : value.toUpperCase() === "AB12" ? "That is the one." : "Four letters or digits."}
      </p>
    </div>
  )
}
