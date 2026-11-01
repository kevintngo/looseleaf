import { ForgotPasswordForm } from "@/blocks/forgot-password-01/components/forgot-password-01-form"
import { Desk } from "@/components/ui/desk"
import { cn } from "@/lib/utils"

export default function ForgotPassword01Page({ className, as = "main", ...props }: Omit<React.ComponentProps<typeof Desk>, "as"> & { as?: "main" | "div" }) {
  return (
    <Desk as={as} objects={["coffee"]} seed="forgot-password-01" className={cn("@container/page min-h-svh w-full overflow-x-clip", className)} {...props}>
      <div className="flex min-h-[inherit] items-center justify-center p-6 @xl/page:p-10">
        <div className="w-full max-w-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </Desk>
  )
}
