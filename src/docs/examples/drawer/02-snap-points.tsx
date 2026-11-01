import * as React from "react"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"

export const meta = {
  title: "Snap points",
  description: "Give the slip resting heights: it stops a third, two thirds or all the way up, and remembers where it is. The list only scrolls at the top snap point so a drag never fights a scroll.",
  layout: "center" as const,
}

const SNAPS = [0.35, 0.7, 1]
const ITEMS = ["Buy oat milk", "Water the ferns", "Write to Ada", "Return the library book", "Sharpen pencils", "Fix the bike light", "Bake the second loaf", "Book the dentist", "Call mum", "Plan the trip", "Renew the passport", "Order stamps"]

export default function Example() {
  const [snap, setSnap] = React.useState<number | string | null>(SNAPS[0])
  return (
    <Drawer snapPoints={SNAPS} activeSnapPoint={snap} setActiveSnapPoint={setSnap} fadeFromIndex={0}>
      <DrawerTrigger asChild>
        <Button variant="outline">To-do slip</Button>
      </DrawerTrigger>
      <DrawerContent seed="snaps" className="h-full max-h-[97%]">
        <div className="mx-auto flex min-h-0 w-full max-w-sm flex-1 flex-col">
          <DrawerHeader>
            <DrawerTitle>Today</DrawerTitle>
            <DrawerDescription>Snapped at {Math.round(Number(snap) * 100)}% of the screen.</DrawerDescription>
          </DrawerHeader>
          <ul tabIndex={snap === 1 ? 0 : undefined} aria-label="To-do list" className={"flex-1 space-y-1 px-4 pb-4 outline-hidden focus-visible:outline-2 focus-visible:outline-ring " + (snap === 1 ? "overflow-y-auto" : "overflow-hidden")}>
            {ITEMS.map((t, i) => (
              <li key={t} className="flex items-baseline gap-3 border-b border-dashed border-pencil-mark/50 py-1.5">
                <span className="ll-num w-5 text-right text-sm text-muted-foreground">{i + 1}</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
