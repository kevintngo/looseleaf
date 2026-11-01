import { Highlight } from "@/components/ui/highlight"

export const meta = {
  title: "Tones and weights",
  description: "Yellow is the highlighter. Pink, green, blue, orange, lilac and teal are the stationery accents held as translucent markers.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid max-w-lg gap-3 text-[17px] leading-[1.55]">
      <p>
        <Highlight>yellow</Highlight>, <Highlight tone="pink">pink</Highlight>, <Highlight tone="green">green</Highlight>, <Highlight tone="blue">blue</Highlight>,{" "}
        <Highlight tone="orange">orange</Highlight>, <Highlight tone="lilac">lilac</Highlight> and <Highlight tone="teal">teal</Highlight>.
      </p>
      <p>
        A <Highlight weight="light">light hand</Highlight>, a <Highlight>regular one</Highlight>, and a <Highlight weight="heavy">heavy chisel tip</Highlight>.
      </p>
      <p>
        Or run it <Highlight cover="under" tone="green">under the line</Highlight> and <Highlight cover="under" tone="pink">let the words breathe</Highlight>.
      </p>
    </div>
  )
}
