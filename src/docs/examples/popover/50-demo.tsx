import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export const meta = {
  title: "Demo",
  description:
    "Official `popover-demo` with the same markup: a plain heading and paragraph, four label and input rows on a grid. The slip is a CSS sheet. Two small changes: the field ids are prefixed so they cannot clash with another example on the page, and the content is named for screen readers (a popover is a dialog).",
  layout: "center" as const,
  height: 380,
}

export default function Example() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Dimensions" className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Dimensions</h4>
            <p className="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="popover-demo-width">Width</Label>
              <Input id="popover-demo-width" defaultValue="100%" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="popover-demo-max-width">Max. width</Label>
              <Input id="popover-demo-max-width" defaultValue="300px" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="popover-demo-height">Height</Label>
              <Input id="popover-demo-height" defaultValue="25px" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="popover-demo-max-height">Max. height</Label>
              <Input id="popover-demo-max-height" defaultValue="none" className="col-span-2 h-8" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
