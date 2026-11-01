import { Button } from "@/components/ui/button"
import { Toaster, toast } from "@/components/ui/sonner"

export const meta = {
  title: "Demo",
  description:
    "Official `sonner-demo`: one button, one toast with a description and an Undo action. The slip is tossed onto the desk; Undo is a highlighted word, not a filled button. Official code mounts `<Toaster />` once at the app root; here the example mounts its own so it works on its own.",
  layout: "center" as const,
}

const ID = "sonner-demo"

export default function Example() {
  return (
    <>
      <Button
        variant="outline"
        onClick={() =>
          toast("Event has been created", {
            toasterId: ID,
            description: "Sunday, December 03, 2023 at 9:00 AM",
            action: {
              label: "Undo",
              onClick: () => toast("Event removed", { toasterId: ID }),
            },
          })
        }
      >
        Show Toast
      </Button>
      <Toaster id={ID} />
    </>
  )
}
