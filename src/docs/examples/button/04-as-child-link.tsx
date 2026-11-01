import { Button } from "@/components/ui/button"

export const meta = {
  title: "As a link",
  description: "asChild draws the button on your own element. The drawing lands inside the anchor; a disabled link is announced as disabled and cannot be followed.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button asChild>
        <a href="https://example.com/notebook" target="_blank" rel="noreferrer">
          Open the notebook
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href="https://example.com/pricing" target="_blank" rel="noreferrer">
          Pricing
        </a>
      </Button>
      <Button asChild variant="link">
        <a href="https://example.com/docs" target="_blank" rel="noreferrer">
          Read the docs
        </a>
      </Button>
      <Button asChild disabled variant="secondary">
        <a href="https://example.com/soon">Coming soon</a>
      </Button>
    </div>
  )
}
