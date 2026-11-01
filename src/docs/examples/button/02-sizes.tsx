import { Button } from "@/components/ui/button"

export const meta = {
  title: "Sizes",
  description: "The shadcn heights (24, 32, 36, 40) and the square icon buttons. Icon buttons need an aria-label.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button>Default</Button>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button size="icon-xs" aria-label="Add">
          +
        </Button>
        <Button size="icon-sm" variant="outline" aria-label="Add">
          +
        </Button>
        <Button size="icon" variant="secondary" aria-label="Add">
          +
        </Button>
        <Button size="icon-lg" variant="ghost" aria-label="Add">
          +
        </Button>
      </div>
    </div>
  )
}
