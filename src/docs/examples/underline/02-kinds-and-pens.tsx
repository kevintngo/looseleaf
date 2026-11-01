import { Underline } from "@/components/ui/underline"

export const meta = {
  title: "Kinds and pens",
  description: "Single, double, wavy and scribbled lines; felt, blue felt, red felt, pencil and marker; fine, regular and brush.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid max-w-lg gap-4 text-[17px] leading-[1.55]">
      <p>
        <Underline>single</Underline>, <Underline kind="double">double</Underline>, <Underline kind="wavy" tone="blue">wavy</Underline>, and a{" "}
        <Underline kind="scribble" tone="red">quick scribble</Underline>.
      </p>
      <p>
        <Underline tone="blue">blue felt</Underline>, <Underline tone="red">red felt</Underline>, <Underline tone="green">green felt</Underline>,{" "}
        <Underline tone="pencil">soft pencil</Underline> and <Underline tone="marker">marker</Underline>.
      </p>
      <p>
        <Underline weight="fine">fine-liner</Underline>, <Underline>felt tip</Underline>, <Underline weight="brush" tone="blue">brush pen</Underline>.
      </p>
    </div>
  )
}
