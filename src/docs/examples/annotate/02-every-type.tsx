import { Annotate, type AnnotateType } from "@/components/ui/annotate"

export const meta = {
  title: "Every type",
  description: "The eight marks side by side. Each is a real component underneath (Highlight, Underline, Circled, Strike, Scribble) with the same props.",
  layout: "stack" as const,
}

const TYPES: Array<[AnnotateType, string]> = [
  ["highlight", "swipe"],
  ["underline", "line"],
  ["circle", "loop"],
  ["box", "box"],
  ["brackets", "brackets"],
  ["strike-through", "struck"],
  ["crossed-off", "crossed off"],
  ["scribble", "scribbled"],
]

export default function Example() {
  return (
    <ul role="list" className="grid max-w-xl grid-cols-2 gap-x-6 gap-y-6 py-2 text-[17px] sm:grid-cols-4">
      {TYPES.map(([type, word]) => (
        <li key={type} className="grid gap-1.5">
          <span className="font-type text-[11px] whitespace-nowrap text-pencil-text">{type}</span>
          <span>
            <Annotate type={type} color={type === "highlight" ? "yellow" : type === "strike-through" || type === "crossed-off" || type === "circle" ? "red" : "blue"}>
              {word}
            </Annotate>
          </span>
        </li>
      ))}
    </ul>
  )
}
