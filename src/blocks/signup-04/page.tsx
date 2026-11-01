import { SignupForm } from "@/blocks/signup-04/components/signup-04-form"
import { Desk } from "@/components/ui/desk"
import { cn } from "@/lib/utils"

export default function Signup04Page({ className, as = "main", ...props }: Omit<React.ComponentProps<typeof Desk>, "as"> & { as?: "main" | "div" }) {
  return (
    <Desk as={as} objects={["pencil"]} seed="signup-04" className={cn("@container/page min-h-svh w-full overflow-x-clip", className)} {...props}>
      <div className="flex min-h-[inherit] flex-col items-center justify-center p-6 @xl/page:p-10">
        <div className="w-full max-w-sm @3xl/page:max-w-4xl">
          <SignupForm />
        </div>
      </div>
    </Desk>
  )
}
