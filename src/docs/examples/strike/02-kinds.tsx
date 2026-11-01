import { Strike } from "@/components/ui/strike"

export const meta = {
  title: "Kinds and pens",
  description: "A single line, a double line, a cross-out over the whole phrase, and other pens.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid max-w-lg gap-4 text-[17px] leading-[1.55]">
      <p>
        <Strike>single</Strike>, <Strike kind="double">double</Strike>, and <Strike kind="cross">a cross-out over the whole phrase</Strike>.
      </p>
      <p>
        <Strike tone="ink">ink felt</Strike>, <Strike tone="blue">blue felt</Strike>, <Strike weight="brush">a brush pen</Strike>, <Strike weight="fine">a fine-liner</Strike>.
      </p>
    </div>
  )
}
