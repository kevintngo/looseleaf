import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export const meta = {
  title: "Side",
  description:
    "Official `sheet-side`: four triggers in a two-column grid, one page per edge. Three fixes to the original: its inputs were controlled with no `onChange` (frozen), so they take `defaultValue`; its ids repeated four times, so each carries its side; and the field grid gets `px-4` to line up with the header.",
  layout: "center" as const,
  height: 200,
}

const SHEET_SIDES = ["top", "right", "bottom", "left"] as const

export default function Example() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SHEET_SIDES.map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline">{side}</Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>Make changes to your profile here. Click save when you&apos;re done.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 px-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={`sheet-side-${side}-name`} className="text-end">
                  Name
                </Label>
                <Input id={`sheet-side-${side}-name`} defaultValue="Pedro Duarte" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={`sheet-side-${side}-username`} className="text-end">
                  Username
                </Label>
                <Input id={`sheet-side-${side}-username`} defaultValue="@peduarte" className="col-span-3" />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="submit">Save changes</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  )
}
