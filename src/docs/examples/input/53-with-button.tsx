import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const meta = {
  title: "With button",
  description: "shadcn's `input-with-button`: an Input and an outline Button side by side in a flex row. Two separate drawings that line up, not one shared box (InputGroup does that).",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <Input type="email" placeholder="Email" aria-label="Email" />
      <Button type="submit" variant="outline">
        Subscribe
      </Button>
    </div>
  )
}
