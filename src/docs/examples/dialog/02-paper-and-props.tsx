import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export const meta = {
  title: "Paper, edges and props",
  description: "The sheet is a Paper: any stock, any edge, held down by tape, a clip or a pin. A torn edge is drawn once, when the dialog opens.",
  layout: "center" as const,
}

function Note({ label, title, children, ...content }: { label: string; title: string; children: string } & React.ComponentProps<typeof DialogContent>) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{label}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm" {...content}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{children}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Got it</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Note label="Kraft, taped" title="Handle with care" stock="kraft" tape="top" tapeKind="clear" seed="kraft">
        Kraft stock, one strip of clear tape across the top edge.
      </Note>
      <Note label="Torn page" title="Torn from a pad" stock="pad" edge={{ bottom: "torn", top: "torn" }} fastener="clip" seed="torn">
        A pad sheet torn top and bottom, held with a paper clip. The edge is drawn when the dialog opens.
      </Note>
      <Note label="Pinned" title="Sticky business" stock="sticky-yellow" fastener="pin" tilt={1.4} seed="sticky">
        A sticky note with a push-pin through it, turned a degree and a half.
      </Note>
    </div>
  )
}
