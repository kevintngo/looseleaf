import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"

export const meta = {
  title: "Stocks and fasteners",
  description: "Any stock, held down by a pin of any colour or by tape. A torn edge is drawn when the popover opens (the only case where it costs SVG).",
  layout: "center" as const,
  height: 380,
}

const NOTES = [
  { label: "Pinned slip", title: "Pinned", body: "A push-pin in stationery sky.", props: { pin: "sky" as const } },
  { label: "Taped kraft", title: "Taped", body: "Kraft paper under a strip of masking tape.", props: { stock: "kraft" as const, tape: "top" as const } },
  { label: "Torn index card", title: "Torn", body: "An index card with a torn bottom edge.", props: { stock: "index-card" as const, edge: { bottom: "torn" as const } } },
  { label: "Sticky pink", title: "Sticky", body: "Turned a degree and a half.", props: { stock: "sticky-pink" as const, tilt: 1.5, pin: "grape" as const } },
]

export default function Example() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {NOTES.map((n) => (
        <Popover key={n.label}>
          <PopoverTrigger asChild>
            <Button variant="outline">{n.label}</Button>
          </PopoverTrigger>
          <PopoverContent className="w-60" seed={n.title} {...n.props}>
            <PopoverHeader>
              <PopoverTitle>{n.title}</PopoverTitle>
              <PopoverDescription className="text-foreground/80">{n.body}</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}
