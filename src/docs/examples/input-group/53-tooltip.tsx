import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const meta = {
  title: "Tooltips",
  description:
    "shadcn's `input-group-tooltip`: help buttons that explain themselves. Two sit at the end as ghost icon buttons; in the third the note opens to the left (`side=\"left\"`), on the leading addon. The original makes the addon itself the trigger; here the button inside it is, so the tooltip is tied to the control that has focus.",
  layout: "center" as const,
  height: 300,
}

export default function Example() {
  return (
    <TooltipProvider>
      <div className="grid w-full max-w-sm gap-4">
        <InputGroup>
          <InputGroupInput placeholder="Enter password" type="password" aria-label="Password" />
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton variant="ghost" aria-label="Info" size="icon-xs">
                  <Icon name="info" />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Password must be at least 8 characters</p>
              </TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="Your email address" aria-label="Email address" />
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton variant="ghost" aria-label="Help" size="icon-xs">
                  <Icon name="circle-question-mark" />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>We&apos;ll use this to send you notifications</p>
              </TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="Enter API key" aria-label="API key" />
          <InputGroupAddon>
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton variant="ghost" aria-label="Help" size="icon-xs">
                  <Icon name="circle-question-mark" />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Click for help with API keys</p>
              </TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </TooltipProvider>
  )
}
