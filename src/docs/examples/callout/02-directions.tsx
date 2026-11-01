import { Callout } from "@/components/ui/callout"

export const meta = {
  title: "Eight directions",
  description: "The arrow points where you say; the words sit on its tail.",
  layout: "stack" as const,
}

const NOTES = [
  ["left", "check the date!"],
  ["right", "ask sam"],
  ["up", "this again?"],
  ["down", "so true"],
  ["up-left", "nice one"],
  ["up-right", "wait, why?"],
  ["down-left", "move this up"],
  ["down-right", "the best line"],
] as const

export default function Example() {
  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-8 py-2 sm:grid-cols-4">
      {NOTES.map(([direction, text], i) => (
        <Callout key={direction} direction={direction} seed={`d${i}`} curve={i === 6 ? "curl" : "curved"}>
          {text}
        </Callout>
      ))}
    </div>
  )
}
