import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export const meta = {
  title: "Button",
  description:
    "Official `spinner-button`: a spinner as the first child of a disabled small button, in the default, outline and secondary variants. The button dashes itself when disabled, so the wait shows in the outline as well as in the scribble.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button disabled size="sm">
        <Spinner />
        Loading...
      </Button>
      <Button variant="outline" disabled size="sm">
        <Spinner />
        Please wait
      </Button>
      <Button variant="secondary" disabled size="sm">
        <Spinner />
        Processing
      </Button>
    </div>
  )
}
