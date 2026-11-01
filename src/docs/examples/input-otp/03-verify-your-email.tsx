import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Verify your email",
  description: "The whole flow: the last digit completes the code (onComplete), which checks it; a wrong one turns the boxes red and offers a fresh start; 246810 is the right code. Resend is a link-style Button.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 420,
}

export default function Example() {
  const [value, setValue] = React.useState("")
  const [state, setState] = React.useState<"idle" | "wrong" | "done">("idle")
  return (
    <Card seed="verify" tape="corner" className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>We sent a six-digit code to ada@analytical.engine.</CardDescription>
      </CardHeader>
      <CardContent className="grid justify-items-center gap-3 py-4">
        <Label htmlFor="verify-code" className="sr-only">
          Verification code
        </Label>
        <InputOTP
          id="verify-code"
          maxLength={6}
          value={value}
          disabled={state === "done"}
          invalid={state === "wrong"}
          aria-describedby="verify-msg"
          onChange={(v) => {
            setValue(v)
            if (state === "wrong") setState("idle")
          }}
          onComplete={(code) => setState(code === "246810" ? "done" : "wrong")}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p id="verify-msg" role={state === "wrong" ? "alert" : "status"} className={state === "wrong" ? "font-hand text-sm text-red" : "font-hand text-sm text-ink-muted"}>
          {state === "done" ? "Verified. Welcome to the notebook." : state === "wrong" ? "That is not the code. Check the email and try again." : "It expires in ten minutes."}
        </p>
      </CardContent>
      <CardFooter className="justify-between gap-3 border-t">
        <Button variant="link" size="sm" onClick={() => { setValue(""); setState("idle") }}>
          {state === "wrong" ? "Start over" : "Send it again"}
        </Button>
        <Button disabled={value.length < 6 || state === "done"} onClick={() => setState(value === "246810" ? "done" : "wrong")}>
          Verify
        </Button>
      </CardFooter>
    </Card>
  )
}
