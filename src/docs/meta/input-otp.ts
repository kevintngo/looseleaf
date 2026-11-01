import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "input-otp",
  title: "Input OTP",
  category: "Forms",
  description:
    "A one-time code as a row of separate hand-drawn boxes. The box that takes the next character wears the blue ring and a blinking pencil stroke; typed characters are written in script; a wrong code turns the boxes red. Underneath is one real input (the input-otp package), so paste, SMS autofill, password managers and the mobile keyboard just work.",
  status: "stable",
  upstream: "input-otp",
  parts: [
    {
      name: "InputOTP",
      description:
        "The code input: `OTPInput` from the input-otp package. All its props work (`maxLength`, `value` / `onChange`, `onComplete`, `pattern`, `pasteTransformer`, `inputMode`, `autoComplete`, `disabled`, `name`, `required`...). It is a text input with `autocomplete=\"one-time-code\"` and a numeric keyboard by default. The boxes are its children.",
      props: [
        { name: "maxLength", type: "number", required: true, description: "How many characters; render that many `InputOTPSlot`s." },
        { name: "invalid", type: "boolean", description: "Red pencil boxes (also set by `aria-invalid`, which is put on the input too)." },
        { name: "pasteTransformer", type: "(pasted: string) => string", default: "drops spaces and hyphens", description: "Cleans what is pasted before `pattern` looks at it, so \"123 456\" or \"123-456\" from an email fills the row (the package would refuse the whole paste). Pass `(t) => t` to switch it off." },
        { name: "pattern", type: "string", description: "A regular expression the code must match: `REGEXP_ONLY_DIGITS`, `REGEXP_ONLY_CHARS` and `REGEXP_ONLY_DIGITS_AND_CHARS` are re-exported from this file." },
        { name: "containerClassName", type: "string", description: "Classes for the row around the boxes (default: `flex flex-nowrap gap-3`, at most as wide as its parent). Add `w-full justify-center` to centre it, `flex-wrap` if you would rather it broke into rows." },
      ],
    },
    { name: "InputOTPGroup", description: "A run of slots: separate boxes with a small gap (upstream's are joined into one bar). On a narrow screen the groups shrink (`min-w-0`) and the boxes narrow to as little as 24 px, so six boxes and a dash stay on one row from 390 px down to about 220 px." },
    {
      name: "InputOTPSlot",
      description:
        "One box of the code, `index` says which character it shows. A small ink host with its own hand: pencil when empty, fine-liner once it holds a character; the slot with the caret gets the blue ring (drawn for that one slot only) and a blinking pencil I-beam (a CSS mask, not ink); each typed character pops in, after the first keystroke, never at load.",
      props: [
        { name: "index", type: "number", required: true, description: "Position in the code." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same box." },
      ],
    },
    { name: "InputOTPSeparator", description: "The dash between two groups: a short hand-drawn minus, `role=\"separator\"`." },
  ],
  a11y: [
    "There is one real `<input>` (not six), so name it with a Label (`htmlFor` on the id you pass) or `aria-label`. Screen readers read the code as typed; the boxes are decoration (their drawings are `aria-hidden`).",
    "Typing, Backspace, arrow keys, selection, paste and SMS autofill (`autocomplete=\"one-time-code\"`) are the browser's own; a `pattern` filters what can be typed or pasted. Password managers get room for their badge (`pushPasswordManagerStrategy`).",
    "`aria-invalid` is set on the input when `invalid` is; the boxes turn red with a drawn pencil box, not only a colour change, and a message (`role=\"alert\"`) is yours to add.",
    "The active box has a drawn blue ring and a caret; in Windows high contrast it gets a real Highlight outline. The blink stops under reduced motion (and `data-motion=\"reduced\"`).",
    "Form reset: the code lives in the package's own state, so `<button type=\"reset\">` does not clear it; control the value (`value` + `onChange`) and clear it in your own reset handler.",
    "Touch: boxes are 40 x 48 px (36 x 40 compact, 32 x 36 calm; on a phone card they narrow to about 38 px, never below 24), and the invisible input covers the whole row, so a tap anywhere focuses it.",
  ],
  usage: `import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"

export function Example() {
  return (
    <InputOTP maxLength={6} aria-label="Verification code" onComplete={(code) => console.warn(code)}>
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
  )
}`,
  related: ["input", "label", "field", "card"],
} satisfies ComponentDoc
