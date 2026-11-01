import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export const meta = {
  title: "Choice cards",
  description: "A FieldLabel around a whole Field becomes a hand-drawn card; when the radio or checkbox inside it is checked the card gets a highlighter wash and a felt box. Click anywhere on a card.",
  layout: "stack" as const,
}

const plans = [
  ["starter", "Starter", "One notebook, one pen, no rush."],
  ["studio", "Studio", "Ten notebooks and the good highlighters."],
  ["workshop", "Workshop", "A whole desk. Washi tape included."],
] as const

export default function Example() {
  return (
    <FieldGroup className="w-full max-w-md">
      <FieldSet>
        <FieldLegend variant="label">Plan</FieldLegend>
        <RadioGroup defaultValue="studio" className="gap-3" aria-label="Plan">
          {plans.map(([value, title, help]) => (
            <FieldLabel key={value} htmlFor={`cc-${value}`}>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>{title}</FieldTitle>
                  <FieldDescription>{help}</FieldDescription>
                </FieldContent>
                <RadioGroupItem value={value} id={`cc-${value}`} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </FieldSet>
      <FieldLabel htmlFor="cc-news">
        <Field orientation="horizontal">
          <Checkbox id="cc-news" defaultChecked />
          <FieldContent>
            <FieldTitle>Field notes newsletter</FieldTitle>
            <FieldDescription>Twice a month, always in pencil.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
    </FieldGroup>
  )
}
