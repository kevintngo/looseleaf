import { Circled } from "@/components/ui/circled"

export const meta = {
  title: "Shapes and pens",
  description: "A circle, a box and a pair of brackets; ink, blue, red and a brush pen.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid max-w-lg gap-6 py-2 text-[17px] leading-[2]">
      <p>
        A <Circled className="mx-1.5">circle</Circled>, a <Circled shape="box" className="mx-1.5">box</Circled>, and{" "}
        <Circled shape="brackets" className="mx-2">
          a pair of brackets
        </Circled>{" "}
        around a phrase.
      </p>
      <p className="flex flex-wrap gap-x-6">
        <Circled tone="blue">blue felt</Circled>
        <Circled tone="red">red felt</Circled>
        <Circled tone="pencil">pencil</Circled>
        <Circled tone="red" weight="brush">
          brush pen
        </Circled>
      </p>
    </div>
  )
}
