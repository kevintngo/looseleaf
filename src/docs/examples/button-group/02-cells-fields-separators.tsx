import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"

export const meta = {
  title: "Cells, fields and separators",
  description:
    "A printed cell, an input and a button in one row; two highlighter buttons split by a pencil line; a split button. Filled buttons want a separator, since two markers touching would just be one big blot.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-6">
      <ButtonGroup className="w-full" aria-label="Website">
        <ButtonGroupText asChild>
          <label htmlFor="host">https://</label>
        </ButtonGroupText>
        <Input id="host" placeholder="example.com" />
        <Button>Go</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Clipboard">
        <Button variant="secondary">
          <Icon name="copy" />
          Copy
        </Button>
        <ButtonGroupSeparator />
        <Button variant="secondary">Paste</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Save options">
        <Button>Save</Button>
        <ButtonGroupSeparator />
        <Button size="icon" aria-label="More save options">
          <Icon name="chevron-down" />
        </Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Weight">
        <Button variant="outline" size="icon" aria-label="Less">
          <Icon name="minus" />
        </Button>
        <ButtonGroupText className="ll-num min-w-14 justify-center">250</ButtonGroupText>
        <Button variant="outline" size="icon" aria-label="More">
          <Icon name="plus" />
        </Button>
        <ButtonGroupText>grams</ButtonGroupText>
      </ButtonGroup>
    </div>
  )
}
