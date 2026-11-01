import { SignupForm } from "@/blocks/signup-01/components/signup-01-form"
import { Desk } from "@/components/ui/desk"
import { cn } from "@/lib/utils"

export default function Signup01Page({ className, as = "main", ...props }: Omit<React.ComponentProps<typeof Desk>, "as"> & { as?: "main" | "div" }) {
  return (
    <Desk as={as} seed="signup-01" className={cn("@container/page min-h-svh w-full overflow-x-clip", className)} {...props}>
      <div className="flex min-h-[inherit] items-center justify-center p-6 pt-14 @xl/page:p-10 @xl/page:pt-14">
        <div className="w-full max-w-sm">
          <SignupForm />
        </div>
      </div>
    </Desk>
  )
}
