import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export const meta = {
  title: "Plan picker",
  description: "Radios with a title and a line of help, and a second horizontal group for billing. Hovering the row lights its radio; the description hangs off the label with aria-describedby.",
  layout: "stack" as const,
}

const plans = [
  ["starter", "Starter", "One notebook, one pen, no rush."],
  ["studio", "Studio", "Ten notebooks and the good highlighters."],
  ["workshop", "Workshop", "A whole desk. Washi tape included."],
] as const

export default function Example() {
  return (
    <div className="grid w-full max-w-md gap-6">
      <RadioGroup defaultValue="studio" aria-label="Plan" className="gap-4">
        {plans.map(([value, title, help]) => (
          <div key={value} className="group/field flex items-start gap-3">
            <RadioGroupItem value={value} id={`plan-${value}`} aria-describedby={`plan-${value}-help`} className="-mt-0.5 size-5" />
            <div className="grid gap-1">
              <Label htmlFor={`plan-${value}`}>{title}</Label>
              <p id={`plan-${value}-help`} className="text-sm text-ink-muted">
                {help}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
      <RadioGroup defaultValue="yearly" orientation="horizontal" aria-label="Billing">
        {["monthly", "yearly"].map((value) => (
          <div key={value} className="flex items-center gap-2.5">
            <RadioGroupItem value={value} id={`bill-${value}`} />
            <Label htmlFor={`bill-${value}`} className="capitalize">
              {value}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
