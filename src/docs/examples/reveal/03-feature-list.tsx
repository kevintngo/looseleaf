import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Reveal } from "@/components/ui/reveal"

export const meta = {
  title: "A list that arrives line by line",
  description: "A real use: stagger makes direct children arrive one after another, each drying like wet ink. A group-data variant lets a tick inside key on the reveal.",
  layout: "stack" as const,
}

const FEATURES = ["Hand-drawn, every pixel", "Accessible, every state", "Keyboard first", "Works without a mouse", "Reduced motion respected"]

export default function Example() {
  return (
    <Reveal as="ul" effect="soak" stagger={0.14} threshold={0.15} className="flex max-w-sm flex-col gap-3">
      {FEATURES.map((f, i) => (
        <li key={f} className="flex items-center gap-2">
          <Checkbox id={`feat-${i}`} defaultChecked aria-label={f} />
          <Label htmlFor={`feat-${i}`} className="text-base font-normal">
            {f}
          </Label>
        </li>
      ))}
    </Reveal>
  )
}
