import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const meta = {
  title: "Four groups",
  description:
    "shadcn's `input-group-demo`: a search with a result count, a URL with a prefix and a tooltip button, a prompt box with a menu and a send button, and a field with a verified badge. The badge is a drawn `badge-check` where the original has a filled circle.",
  layout: "center" as const,
  height: 480,
}

export default function Example() {
  return (
    <TooltipProvider>
      <div className="grid w-full max-w-sm gap-6">
        <InputGroup>
          <InputGroupInput placeholder="Search..." aria-label="Search" />
          <InputGroupAddon>
            <Icon name="search" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="example.com" className="ps-1!" aria-label="Website" />
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton className="rounded-full" size="icon-xs" aria-label="Info">
                  <Icon name="info" />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>This is content in a tooltip.</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupTextarea placeholder="Ask, Search or Chat..." aria-label="Prompt" />
          <InputGroupAddon align="block-end">
            <InputGroupButton variant="outline" className="rounded-full" size="icon-xs" aria-label="Add">
              <Icon name="plus" />
            </InputGroupButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton variant="ghost">Auto</InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start">
                <DropdownMenuItem>Auto</DropdownMenuItem>
                <DropdownMenuItem>Agent</DropdownMenuItem>
                <DropdownMenuItem>Manual</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <InputGroupText className="ms-auto">52% used</InputGroupText>
            <Separator orientation="vertical" className="h-4!" />
            <InputGroupButton variant="default" className="rounded-full" size="icon-xs" disabled>
              <Icon name="arrow-up" />
              <span className="sr-only">Send</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="@shadcn" aria-label="Handle" />
          <InputGroupAddon align="inline-end">
            <Icon name="badge-check" label="Verified" />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </TooltipProvider>
  )
}
