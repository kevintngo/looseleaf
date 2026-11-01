import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Paper } from "@/components/ui/paper"
import { Toaster, toast } from "@/components/ui/sonner"

const TOASTER = "home-toaster"

export default function ToastCard() {
  const to = { toasterId: TOASTER }
  return (
    <Paper data-home="toast" stock="slip" fastener="pin" seed="home-toast" className="w-full max-w-sm px-5 pt-7 pb-5 @2xl:mx-auto">
      <p className="font-script text-3xl leading-none font-bold text-ink">Toss a toast</p>
      <p className="mt-1 text-sm text-muted-foreground">Each kind is its own paper, so the meaning is not only a colour.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => toast.success("Notebook saved", { ...to, description: "All 48 pages are safe." })}>
          Saved
        </Button>
        <Button size="sm" variant="outline" onClick={() => toast.error("Could not sync", { ...to, description: "You are offline. We will try again." })}>
          Oops
        </Button>
        <Button size="sm" variant="outline" onClick={() => toast("Page deleted", { ...to, action: { label: "Undo", onClick: () => toast.info("The page is back", to) } })}>
          Delete
        </Button>
      </div>
      {createPortal(<Toaster id={TOASTER} closeButton />, document.body)}
    </Paper>
  )
}
