import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group"

export const meta = {
  title: "Textarea with header and footer",
  description:
    "shadcn's `input-group-textarea`: a code box with a file name and two icon buttons above (`block-start` plus `border-b`) and a cursor position and a Run button below. The corner-down-left glyph is not drawn yet, so Run wears a play icon.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <InputGroup>
        <InputGroupTextarea id="input-group-textarea-code" placeholder="console.log('Hello, world!');" className="min-h-[200px]" aria-label="Code" />
        <InputGroupAddon align="block-end" className="border-t">
          <InputGroupText>Line 1, Column 1</InputGroupText>
          <InputGroupButton size="sm" className="ms-auto" variant="default">
            Run <Icon name="play" />
          </InputGroupButton>
        </InputGroupAddon>
        <InputGroupAddon align="block-start" className="border-b">
          <InputGroupText className="font-mono font-medium">
            <Icon name="file-code" />
            script.js
          </InputGroupText>
          <InputGroupButton className="ms-auto" size="icon-xs" aria-label="Refresh">
            <Icon name="rotate-cw" />
          </InputGroupButton>
          <InputGroupButton variant="ghost" size="icon-xs" aria-label="Copy">
            <Icon name="copy" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
