import { Badge } from "@/components/ui/badge"

export const meta = {
  title: "As a link",
  description:
    "asChild hands the badge to your own element. Hover a link badge: the filled ones lift a drop-line, the outline gets a highlighter wash, ghost swipes and link underlines. Tab to it for the felt ring.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Badge asChild>
        <a href="#badge">Docs</a>
      </Badge>
      <Badge asChild variant="secondary">
        <a href="#badge">Releases</a>
      </Badge>
      <Badge asChild variant="outline">
        <a href="#badge">#design</a>
      </Badge>
      <Badge asChild variant="ghost">
        <a href="#badge">Ghost link</a>
      </Badge>
      <Badge asChild variant="link">
        <a href="#badge">Read the changelog</a>
      </Badge>
    </div>
  )
}
