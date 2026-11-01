import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export const meta = {
  title: "Settings list",
  description: "The usual settings page: a title and a line of help on the left, the switch at the end. Hovering anywhere on a row lights its switch (the row is a `group/field`).",
  layout: "stack" as const,
}

const settings = [
  ["ruled", "Show ruled lines", "Blue pencil rules behind everything you write.", true],
  ["hints", "Highlighter hints", "Underline what changed since you last looked.", true],
  ["sound", "Pencil scratch sound", "A soft scratch while you type. Off is quieter.", false],
  ["sync", "Sync to the cloud", "Locked by your administrator.", true, true],
] as const

export default function Example() {
  return (
    <div className="w-full max-w-md divide-y divide-rule-blue/60">
      {settings.map(([id, title, help, on, locked]) => (
        <div key={id} className="group/field flex items-start justify-between gap-6 py-3.5 first:pt-0">
          <div className="grid gap-1">
            <Label htmlFor={id}>{title}</Label>
            <p className="text-sm text-ink-muted">{help}</p>
          </div>
          <Switch id={id} defaultChecked={on} disabled={locked} className="mt-0.5" />
        </div>
      ))}
    </div>
  )
}
