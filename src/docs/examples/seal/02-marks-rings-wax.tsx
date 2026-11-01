import { Seal } from "@/components/ui/seal"

export const meta = {
  title: "Marks, rings and wax",
  description: "A hand-drawn check or star takes the place of the words (it survives at 16 px where letters do not). A ringed seal carries lettering round its rim. Wax takes an initial, a check or a star.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <Seal mark="check" tone="sky" />
      <Seal variant="rosette" mark="check" tone="grass" ribbon="lemon" />
      <Seal variant="starburst" mark="star" tone="tangerine" />
      <Seal variant="ring" text="Verified" tone="sky" ring="Official seal" size={128} />
      <Seal variant="ring" mark="check" tone="grass" ring="Checked by hand" size={128} />
      <Seal variant="wax" text="L" tone="red" />
      <Seal variant="wax" mark="check" tone="grape" />
    </div>
  )
}
