import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "UI and doodle tone",
  description: "In UI tone an icon is ink only. In doodle tone its accent wash shows, and `accent` picks another color.",
}

export default function Example() {
  return (
    <div className="flex flex-col gap-4 text-ink">
      <div className="flex items-center gap-5">
        <span className="w-16 text-sm text-pencil-text">ui</span>
        {["triangle-alert", "info", "bell", "search", "user", "calendar", "circle-check"].map((name) => (
          <Icon key={name} name={name} size={32} />
        ))}
      </div>
      <div className="flex items-center gap-5">
        <span className="w-16 text-sm text-pencil-text">doodle</span>
        {["triangle-alert", "info", "bell", "search", "user", "calendar", "circle-check"].map((name) => (
          <Icon key={name} name={name} size={32} tone="doodle" />
        ))}
      </div>
      <div className="flex items-center gap-5">
        <span className="w-16 text-sm text-pencil-text">accent</span>
        {(["tomato", "tangerine", "grass", "teal", "sky", "grape", "bubblegum"] as const).map((accent) => (
          <Icon key={accent} name="bell" size={32} tone="doodle" accent={accent} />
        ))}
      </div>
    </div>
  )
}
