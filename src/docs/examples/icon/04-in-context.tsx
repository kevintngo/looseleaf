import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "In real UI",
  description: "Status rows and three real buttons (an icon with a label, an icon on its own, a label with a chevron): color comes from the parent, size from the usual `size-N` classes, and inside a Button the icon takes the button's own size.",
  layout: "stack" as const,
}

const STATUS = [
  { icon: "circle-check", text: "Saved to your notebook", tone: "text-green" },
  { icon: "info", text: "Drafts are kept for thirty days", tone: "text-ink-you" },
  { icon: "triangle-alert", text: "This page has unsaved changes", tone: "text-orange-text" },
  { icon: "octagon-x", text: "Could not reach the server", tone: "text-red" },
] as const

export default function Example() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4 text-ink">
      <ul className="flex flex-col gap-2">
        {STATUS.map((s) => (
          <li key={s.icon} className={`flex items-center gap-2 ${s.tone}`}>
            <Icon name={s.icon} className="size-5" />
            <span className="text-ink">{s.text}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          <Icon name="copy" />
          Copy
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="More">
          <Icon name="ellipsis" />
        </Button>
        <Button variant="ghost" size="sm">
          Options
          <Icon name="chevron-down" />
        </Button>
      </div>
    </div>
  )
}
