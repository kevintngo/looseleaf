import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const meta = {
  title: "Labels",
  description:
    "shadcn's `input-group-label`: a Label can be an addon, so the @ in front of a handle is a real label for the field, or a title above it (`block-start`) with a help button at the far end.",
  layout: "center" as const,
  height: 300,
}

export default function Example() {
  return (
    <TooltipProvider>
      <div className="grid w-full max-w-sm gap-4">
        <InputGroup>
          <InputGroupInput id="input-group-label-handle" placeholder="shadcn" />
          <InputGroupAddon>
            <Label htmlFor="input-group-label-handle">@</Label>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput id="input-group-label-email" placeholder="ada@looseleaf.example" />
          <InputGroupAddon align="block-start">
            <Label htmlFor="input-group-label-email" className="text-foreground">
              Email
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton variant="ghost" aria-label="Help" className="ms-auto rounded-full" size="icon-xs">
                  <Icon name="info" />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>We&apos;ll use this to send you notifications</p>
              </TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </TooltipProvider>
  )
}
