import * as React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Responsive dialog",
  description: "A dialog on wide screens and a drawer on phones, from one component. The media query is read with useSyncExternalStore, so the server renders the desktop dialog and the phone swaps in after hydration.",
  layout: "center" as const,
}

function useMediaQuery(query: string) {
  return React.useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query)
      mq.addEventListener("change", notify)
      return () => mq.removeEventListener("change", notify)
    },
    () => window.matchMedia(query).matches,
    () => true,
  )
}

function ProfileForm({ className }: { className?: string }) {
  return (
    <form className={"grid items-start gap-4 " + (className ?? "")}>
      <div className="grid gap-2">
        <Label htmlFor="rd-email">Email</Label>
        <Input type="email" id="rd-email" defaultValue="ada@analytical.engine" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="rd-username">Username</Label>
        <Input id="rd-username" defaultValue="@ada" />
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  )
}

export default function Example() {
  const [open, setOpen] = React.useState(false)
  const desktop = useMediaQuery("(min-width: 640px)")

  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Edit profile</Button>
        </DialogTrigger>
        <DialogContent tape="top" tapeKind="kraft" seed="rd" className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
          </DialogHeader>
          <ProfileForm />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DrawerTrigger>
      <DrawerContent seed="rd">
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>Make changes to your profile here. Click save when you&apos;re done.</DrawerDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
