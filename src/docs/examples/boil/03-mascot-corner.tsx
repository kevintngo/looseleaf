import { Boil, useBoilFrame } from "@/components/ui/boil"
import { Mascot } from "@/components/ui/mascot"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "A live corner",
  description: "A real use: the mascot in a card's corner and the underline of its heading boil, the text does not. Your own drawings join in with useBoilFrame or useBoilSeed.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 280,
}

function Underline() {
  const wobble = [0, 2, 1, 3][useBoilFrame()]
  return (
    <svg aria-hidden="true" viewBox="0 0 200 10" className="mt-1 h-2.5 w-48 text-ink-you">
      <path d={`M2 6 Q 50 ${2 + wobble * 2} 100 5 T 198 ${4 + wobble}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export default function Example() {
  return (
    <Paper stock="card" className="relative w-80 p-6" tilt={false}>
      <div className="absolute -end-4 -top-8">
        <Boil>
          <Mascot pose="wave" size={88} />
        </Boil>
      </div>
      <p className="font-script text-3xl leading-none">Welcome back</p>
      <Boil>
        <Underline />
      </Boil>
      <p className="mt-3 text-sm text-muted-foreground">The text holds still. Only the pencil is nervous.</p>
    </Paper>
  )
}
