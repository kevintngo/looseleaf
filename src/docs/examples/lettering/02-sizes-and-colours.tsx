import { Lettering } from "@/components/ui/lettering"

export const meta = {
  title: "Sizes, colors, duotone and wobble",
  description: "Five sizes; the second color is a token; a duotone print adds a third pass; wobble writes each word a hair off the baseline.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
        <Lettering as="p" size="sm">small</Lettering>
        <Lettering as="p" size="md">medium</Lettering>
        <Lettering as="p" size="lg">large</Lettering>
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-2">
        <Lettering as="p" size="md" tone="teal">teal</Lettering>
        <Lettering as="p" size="md" tone="grape">grape</Lettering>
        <Lettering as="p" size="md" tone="bubblegum">bubblegum</Lettering>
        <Lettering as="p" size="md" tone="grass">grass</Lettering>
      </div>
      <div className="flex flex-wrap gap-x-10 gap-y-2">
        <Lettering as="p" size="lg" duotone="sky">Two colors</Lettering>
        <Lettering as="p" size="lg" tone="teal" wobble={1.6}>hand cut words</Lettering>
      </div>
    </div>
  )
}
