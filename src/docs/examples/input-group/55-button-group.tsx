import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group"
import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Inside a button group",
  description:
    "shadcn's `input-group-button-group`: an InputGroup as the middle of a ButtonGroup, with `https://` and `.com` as text cells on either side. The first cell is a Label (`asChild`), so it focuses the field.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <ButtonGroup>
        <ButtonGroupText asChild>
          <Label htmlFor="input-group-bg-url">https://</Label>
        </ButtonGroupText>
        <InputGroup>
          <InputGroupInput id="input-group-bg-url" />
          <InputGroupAddon align="inline-end">
            <Icon name="link" />
          </InputGroupAddon>
        </InputGroup>
        <ButtonGroupText>.com</ButtonGroupText>
      </ButtonGroup>
    </div>
  )
}
