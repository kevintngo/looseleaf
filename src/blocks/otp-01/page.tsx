import { DEMO_CODE, OtpForm } from "@/blocks/otp-01/components/otp-01-form"
import { Desk } from "@/components/ui/desk"
import { StickyNote } from "@/components/ui/sticky-note"
import { cn } from "@/lib/utils"

export default function Otp01Page({ className, as = "main", ...props }: Omit<React.ComponentProps<typeof Desk>, "as"> & { as?: "main" | "div" }) {
  return (
    <Desk as={as} seed="otp-01" className={cn("@container/page min-h-svh w-full overflow-x-clip", className)} {...props}>
      <div className="flex min-h-[inherit] flex-col items-center justify-center gap-8 p-6 @xl/page:p-10">
        <div className="w-full max-w-sm">
          <OtpForm />
        </div>
        <StickyNote color="yellow" fastener="pin" tilt={2} seed="otp-01-note" className="min-h-0 w-52 px-4 pt-6 pb-4 text-xl">
          psst: the demo code is <span className="ll-num">{DEMO_CODE}</span>
        </StickyNote>
      </div>
    </Desk>
  )
}
