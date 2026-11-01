import { FakeButton } from "@/components/ui/fake-button"

export const meta = { title: "Variants", layout: "stack" as const }

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FakeButton variant="default">Primary</FakeButton>
      <FakeButton variant="outline">Outline</FakeButton>
      <FakeButton variant="ghost" size="sm">
        Ghost
      </FakeButton>
    </div>
  )
}
