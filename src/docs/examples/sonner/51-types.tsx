import { Button } from "@/components/ui/button"
import { Toaster, toast } from "@/components/ui/sonner"

export const meta = {
  title: "Types",
  description:
    "Official `sonner-types`: default, success, info, warning, error and a promise that goes from loading to success after two seconds. Each type is a different stock of paper (guest check, blue, yellow and pink stickies), so meaning never rests on colour alone.",
  layout: "center" as const,
}

const ID = "sonner-types-official"

export default function Example() {
  const t = { toasterId: ID }
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => toast("Event has been created", t)}>
          Default
        </Button>
        <Button variant="outline" onClick={() => toast.success("Event has been created", t)}>
          Success
        </Button>
        <Button variant="outline" onClick={() => toast.info("Be at the area 10 minutes before the event time", t)}>
          Info
        </Button>
        <Button variant="outline" onClick={() => toast.warning("Event start time cannot be earlier than 8am", t)}>
          Warning
        </Button>
        <Button variant="outline" onClick={() => toast.error("Event has not been created", t)}>
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.promise<{ name: string }>(() => new Promise((resolve) => setTimeout(() => resolve({ name: "Event" }), 2000)), {
              ...t,
              loading: "Loading...",
              success: (data) => `${data.name} has been created`,
              error: "Error",
            })
          }}
        >
          Promise
        </Button>
      </div>
      <Toaster id={ID} />
    </>
  )
}
