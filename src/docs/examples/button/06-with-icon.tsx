import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "With an icon",
  description: "Icons sit before or after the label. Button tightens its padding when it sees one, sizes the pencilled icon to 16 px (12 px in xs) and keeps the drawing behind both.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button>
        <Icon name="plus" /> New note
      </Button>
      <Button variant="outline">
        <Icon name="search" /> Search
      </Button>
      <Button variant="secondary">
        Next <Icon name="arrow-right" />
      </Button>
      <Button variant="outline" size="lg">
        <Icon name="trash" /> Discard
      </Button>
      <Button variant="ghost" size="sm">
        <Icon name="copy" /> Copy link
      </Button>
      <Button variant="outline" size="xs">
        <Icon name="pencil" size={12} /> Edit
      </Button>
      <Button variant="link">
        Read more <Icon name="arrow-up-right" />
      </Button>
    </div>
  )
}
