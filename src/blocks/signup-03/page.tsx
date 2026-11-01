import { SignupForm } from "@/blocks/signup-03/components/signup-03-form"
import { Desk } from "@/components/ui/desk"
import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

export default function Signup03Page({ className, as = "main", ...props }: Omit<React.ComponentProps<typeof Desk>, "as"> & { as?: "main" | "div" }) {
  return (
    <Desk as={as} objects={["clips", "pins"]} seed="signup-03" className={cn("@container/page min-h-svh w-full overflow-x-clip", className)} {...props}>
      <div className="flex min-h-[inherit] flex-col items-center justify-center gap-6 p-6 @xl/page:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a href="#home" className="flex items-center gap-2 self-center font-script text-2xl leading-none font-bold">
            <Icon name="book-open" tone="doodle" size={24} />
            Looseleaf
          </a>
          <SignupForm />
        </div>
      </div>
    </Desk>
  )
}
