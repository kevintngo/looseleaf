import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "Ruled paper",
  description: "ruled draws pencil lines on the baselines of the text. The rules are re-pulled as the box grows, so they always end where the paper does.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="w-full max-w-md">
      <Textarea ruled aria-label="Diary" defaultValue={"Dear diary,\ntoday I drew a box\nand it was mine."} />
    </div>
  )
}
