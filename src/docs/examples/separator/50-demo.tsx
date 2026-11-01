import { Separator } from "@/components/ui/separator"

export const meta = {
  title: "Demo",
  description:
    "Official `separator-demo`: a heading and blurb, a horizontal rule, then three links divided by vertical rules. Both rules are pencil pulls; the vertical ones fill the height of their row.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div>
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">An open-source UI component library.</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  )
}
