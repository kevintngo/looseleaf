import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Text and icon buttons, size by size",
  description:
    "Each height comes with its square twin: `sm` and `icon-sm` (32 px), default and `icon` (36 px), `lg` and `icon-lg` (40 px), and our extra `xs` pair at 24 px. Put them side by side and the labels and glyphs line up on one baseline.",
  layout: "stack" as const,
}

const pairs = [
  { label: "Extra small", size: "xs", icon: "icon-xs", px: 12 },
  { label: "Small", size: "sm", icon: "icon-sm", px: 16 },
  { label: "Default", size: "default", icon: "icon", px: 16 },
  { label: "Large", size: "lg", icon: "icon-lg", px: 20 },
] as const

export default function Example() {
  return (
    <div className="flex flex-col items-start gap-8 sm:flex-row sm:flex-wrap sm:gap-x-10">
      {pairs.map((p) => (
        <div key={p.size} className="flex items-start gap-4">
          <Button variant="outline" size={p.size}>
            {p.label}
          </Button>
          <Button variant="outline" size={p.icon} aria-label={`Send, ${p.label.toLowerCase()}`}>
            <Icon name="arrow-up-right" size={p.px} />
          </Button>
        </div>
      ))}
    </div>
  )
}
