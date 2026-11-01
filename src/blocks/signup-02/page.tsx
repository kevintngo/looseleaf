import { SignupForm } from "@/blocks/signup-02/components/signup-02-form"
import { SignupTicket } from "@/blocks/signup-02/components/signup-02-ticket"
import { Desk } from "@/components/ui/desk"
import { Icon } from "@/components/ui/icon"
import { Paper } from "@/components/ui/paper"
import { cn } from "@/lib/utils"

export default function Signup02Page({ className, as: Root = "main", ...props }: React.ComponentProps<"div"> & { as?: "main" | "div" }) {
  return (
    <Root className={cn("@container/page min-h-svh w-full", className)} {...props}>
      <div className="grid min-h-[inherit] @3xl/page:grid-cols-2">
        <Paper stock="paper" tilt={false} shadow="none" seed="signup-02" className="flex flex-col gap-4 p-6 @xl/page:p-10">
          <div className="flex justify-center gap-2 @3xl/page:justify-start">
            <a href="#home" className="flex items-center gap-2 font-script text-2xl leading-none font-bold">
              <Icon name="book-open" tone="doodle" size={24} />
              Looseleaf
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <SignupForm />
            </div>
          </div>
        </Paper>
        <Desk aria-hidden="true" seed="signup-02-desk" className="hidden items-center justify-center overflow-hidden @3xl/page:flex">
          <SignupTicket />
        </Desk>
      </div>
    </Root>
  )
}
