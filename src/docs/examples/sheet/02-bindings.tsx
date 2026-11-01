import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export const meta = {
  title: "Bindings",
  description: "Five ways to finish the inner edge: spiral coils, three binder holes, a perforated tear line, a torn pad edge, or nothing. Perf and torn are drawn when the page opens; the others are cheap strips.",
  layout: "center" as const,
  height: 220,
}

const BINDINGS = ["spiral", "holes", "perf", "torn", "none"] as const

export default function Example() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {BINDINGS.map((binding) => (
        <Sheet key={binding}>
          <SheetTrigger asChild>
            <Button variant="outline">{binding}</Button>
          </SheetTrigger>
          <SheetContent binding={binding} stock="pad" rules="ruled" seed={`binding-${binding}`}>
            <SheetHeader>
              <SheetTitle>Field notes</SheetTitle>
              <SheetDescription>binding=&ldquo;{binding}&rdquo; on ruled pad paper.</SheetDescription>
            </SheetHeader>
            <ul className="-mt-0.5 space-y-0 px-6 text-base/7">
              <li>Rain from six.</li>
              <li>Tea, two cups, then a third.</li>
              <li>Started the long letter to Ada.</li>
            </ul>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  )
}
