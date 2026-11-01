import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"

export const meta = {
  title: "Promise",
  description: "toast.promise follows a request: one slip that starts as a loader, then turns into a success (or an error) paper when the promise settles. Pass a function for the message to use the result.",
  layout: "center" as const,
}

const ID = "sonner-promise"

const save = (ok: boolean) =>
  new Promise<{ name: string }>((resolve, reject) => setTimeout(() => (ok ? resolve({ name: "Field notes" }) : reject(new Error("offline"))), 1800))

export default function Example() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button
        onClick={() =>
          toast.promise(save(true), {
            toasterId: ID,
            loading: "Saving notebook…",
            success: (data) => `${data.name} saved`,
            error: "Could not save",
          })
        }
      >
        Save (succeeds)
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(save(false), {
            toasterId: ID,
            loading: "Saving notebook…",
            success: "Saved",
            error: (e: Error) => `Could not save: ${e.message}`,
          })
        }
      >
        Save (fails)
      </Button>
      <Toaster id={ID} />
    </div>
  )
}
