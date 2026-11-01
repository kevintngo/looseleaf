import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"

export const meta = {
  title: "Directions",
  description: "Pull a slip in from any edge. Only the bottom slip is torn and taped (that is where the grab tab belongs); the others are plain slips you drag toward their edge.",
  layout: "center" as const,
}

const DIRECTIONS = ["bottom", "top", "left", "right"] as const

export default function Example() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {DIRECTIONS.map((direction) => (
        <Drawer key={direction} direction={direction}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="capitalize">
              {direction}
            </Button>
          </DrawerTrigger>
          <DrawerContent seed={`dir-${direction}`}>
            <DrawerHeader>
              <DrawerTitle>From the {direction}</DrawerTitle>
              <DrawerDescription>Drag it back toward the {direction} edge to put it away.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className="mx-auto w-full max-w-xs">
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  )
}
