import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

export const meta = {
  title: "Icons",
  description: "shadcn's `input-group-icon`: icons as addons, at the start, at the end, or two together. They are drawn glyphs, not fonts, so each one is a slightly different line.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupInput placeholder="Search..." aria-label="Search" />
        <InputGroupAddon>
          <Icon name="search" />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput type="email" placeholder="Enter your email" aria-label="Email" />
        <InputGroupAddon>
          <Icon name="mail" />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Card number" aria-label="Card number" />
        <InputGroupAddon>
          <Icon name="credit-card" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Icon name="check" />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Card number" aria-label="Card number, second" />
        <InputGroupAddon align="inline-end">
          <Icon name="star" />
          <Icon name="info" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
