import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export const meta = {
  title: "Mobile navigation",
  description: "A menu page from the left with holes for a binder. The list scrolls inside the page (`overflow-y-auto` on the list, never on the sheet) and every link closes it.",
  layout: "center" as const,
  height: 220,
}

const LINKS = ["Notebooks", "Drawings", "Recipes", "Garden log", "Reading list", "Field notes", "Letters", "Postcards", "Receipts", "Archive", "Bin"]

export default function Example() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open menu">
          <Icon name="menu" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" binding="holes" stock="pad" seed="nav">
        <SheetHeader>
          <SheetTitle>Looseleaf</SheetTitle>
          <SheetDescription>Everything you have written, in one binder.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Main" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 py-3">
          {LINKS.map((label) => (
            <SheetClose key={label} asChild>
              <Button asChild variant="ghost" className="justify-start">
                <a href={`#${label.toLowerCase().replace(/ /g, "-")}`}>{label}</a>
              </Button>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
