import { Spinner } from "@/components/ui/spinner"

export const meta = {
  title: "Color",
  description:
    "Official `spinner-color`: five 24 px spinners, each in its own text colour. shadcn uses the palette's red, green, blue, yellow and purple; here they are red felt-tip, green pencil, blue biro, orange marker and grape marker (yellow highlighter is too pale to read as a line on paper).",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex items-center gap-6">
      <Spinner className="size-6 text-red" aria-label="Loading, red" />
      <Spinner className="size-6 text-green" aria-label="Loading, green" />
      <Spinner className="size-6 text-ink-you" aria-label="Loading, blue" />
      <Spinner className="size-6 text-orange-text" aria-label="Loading, orange" />
      <Spinner className="size-6 text-grape" aria-label="Loading, purple" />
    </div>
  )
}
