import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"

export const meta = {
  title: "In a button",
  description: "shadcn's `kbd-button`: a keycap at the end of a button's label. The button takes a little less padding on that side (`pe-2`) so the cap sits close to the edge.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="outline" size="sm" className="pe-2">
        Accept <Kbd>⏎</Kbd>
      </Button>
      <Button variant="outline" size="sm" className="pe-2">
        Cancel <Kbd>Esc</Kbd>
      </Button>
    </div>
  )
}
