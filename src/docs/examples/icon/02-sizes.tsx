import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Redrawn, not scaled",
  description: "Each size is its own drawing: 12 px is one confident stroke, 16 px is heavier and simpler than 24, 48 px gets its extras.",
}

const SIZES = [12, 16, 20, 24, 32, 48]

export default function Example() {
  return (
    <div className="flex flex-col gap-5 text-ink">
      {["check", "search", "triangle-alert", "settings"].map((name) => (
        <div key={name} className="flex items-end gap-6">
          {SIZES.map((size) => (
            <figure key={size} className="flex flex-col items-center gap-1">
              <Icon name={name} size={size} />
              <figcaption className="text-sm text-pencil-text">{size}</figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  )
}
