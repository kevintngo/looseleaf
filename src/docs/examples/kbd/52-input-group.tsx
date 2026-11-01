import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"

export const meta = {
  title: "In an input group",
  description: "shadcn's `kbd-input-group`: a search box with the shortcut that focuses it written at the end. Two keycaps in one inline-end addon.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-6">
      <InputGroup>
        <InputGroupInput placeholder="Search..." aria-label="Search" />
        <InputGroupAddon>
          <Icon name="search" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
