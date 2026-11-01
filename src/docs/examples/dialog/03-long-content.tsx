import { Button } from "@/components/ui/button"
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export const meta = {
  title: "Long content",
  description: "The sheet never scrolls (its shadow and tape would be clipped): put tall content in DialogBody, and the header and footer stay put. Very tall dialogs scroll under the lamp.",
  layout: "center" as const,
}

const clauses = [
  "You may keep this notebook as long as you like, and write in it in any colour.",
  "Pages torn out belong to whoever holds them; margins belong to the reader.",
  "Doodles are protected speech. Coffee rings are an acceptable form of signature.",
  "If you find a pencil stub in the binding, it is yours, and it was always yours.",
  "We will never sell your handwriting. We could not read it either.",
  "By turning the page you agree to turn the next one, if there is a next one.",
  "Erasers are provided as a courtesy and may be worn down to nothing without notice.",
  "A drawing of a cat counts as a drawing of any cat, and the cat may object.",
  "Ink that bleeds through belongs to the page behind it.",
  "If the notebook is lost, it is not lost: it is simply somewhere else, being written in.",
]

export default function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Terms of the notebook</Button>
      </DialogTrigger>
      <DialogContent seed="terms" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Terms of the notebook</DialogTitle>
          <DialogDescription>Read to the end, or at least to the margin.</DialogDescription>
        </DialogHeader>
        <DialogBody className="max-h-56 space-y-3">
          {clauses.map((c, i) => (
            <p key={i}>
              <span className="font-bold">{i + 1}. </span>
              {c}
            </p>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Decline</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>I agree</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
