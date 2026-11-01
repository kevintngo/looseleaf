import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export const meta = {
  title: "Sizes and states",
  description: "16, 20 and 28 px; off, on, invalid (red pencil, still red on top of the dot) and disabled (dashed, graphite dot). A horizontal group lays its radios in a row.",
  layout: "stack" as const,
}

const sizes = [
  ["size-4", "16 px"],
  ["size-5", "20 px"],
  ["size-7", "28 px"],
] as const

export default function Example() {
  return (
    <div className="grid gap-5">
      {sizes.map(([size, name]) => (
        <RadioGroup key={size} orientation="horizontal" defaultValue="on" className="items-center gap-x-7" aria-label={name}>
          <span className="w-14 text-sm text-ink-muted">{name}</span>
          <RadioGroupItem value="off" className={size} aria-label={`${name} off`} />
          <RadioGroupItem value="on" className={size} aria-label={`${name} on`} />
          <RadioGroupItem value="bad" className={size} aria-invalid aria-label={`${name} invalid`} />
          <RadioGroupItem value="locked" className={size} disabled aria-label={`${name} disabled`} />
        </RadioGroup>
      ))}
    </div>
  )
}
