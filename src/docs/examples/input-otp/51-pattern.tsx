import { InputOTP, InputOTPGroup, InputOTPSlot, REGEXP_ONLY_DIGITS_AND_CHARS } from "@/components/ui/input-otp"

export const meta = {
  title: "Digits and letters",
  description:
    "shadcn's `input-otp-pattern`: `pattern` takes a regular expression, and the package's presets are re-exported from the component file so the example needs no second import. Anything the pattern refuses is dropped, pasted or typed.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} aria-label="Code">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}
