import { Annotate } from "@/components/ui/annotate"

export const meta = {
  title: "Colours and weights",
  description: "A highlighter takes a tone; every other mark takes a pen. Fine-liner, felt tip or brush.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid max-w-lg gap-5 text-[17px] leading-[2]">
      <p className="flex flex-wrap gap-x-5 gap-y-2">
        <Annotate type="highlight" color="yellow">yellow</Annotate>
        <Annotate type="highlight" color="pink">pink</Annotate>
        <Annotate type="highlight" color="green">green</Annotate>
        <Annotate type="highlight" color="blue">blue</Annotate>
        <Annotate type="highlight" color="orange">orange</Annotate>
        <Annotate type="highlight" color="lilac">lilac</Annotate>
        <Annotate type="highlight" color="teal">teal</Annotate>
      </p>
      <p className="flex flex-wrap gap-x-6 gap-y-3 ps-1">
        <Annotate type="circle" color="ink">ink</Annotate>
        <Annotate type="circle" color="blue">blue</Annotate>
        <Annotate type="circle" color="red">red</Annotate>
        <Annotate type="circle" color="green">green</Annotate>
        <Annotate type="circle" color="pencil">pencil</Annotate>
        <Annotate type="circle" color="red" weight="brush">brush</Annotate>
      </p>
    </div>
  )
}
