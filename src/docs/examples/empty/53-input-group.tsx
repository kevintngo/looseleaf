import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"

export const meta = {
  title: "Input group",
  description: "shadcn's `empty-input-group`: a 404 with no media at all, a search field with a magnifier and a `/` keycap, and a support link under it.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>404 - Not Found</EmptyTitle>
        <EmptyDescription>The page you&apos;re looking for doesn&apos;t exist. Try searching for what you need below.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <InputGroup className="sm:w-3/4">
          <InputGroupInput placeholder="Try searching for pages..." aria-label="Search pages" />
          <InputGroupAddon>
            <Icon name="search" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Kbd>/</Kbd>
          </InputGroupAddon>
        </InputGroup>
        <EmptyDescription>
          Need help? <a href="#contact-support">Contact support</a>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  )
}
