import { ResetPasswordForm } from "@/blocks/reset-password-01/components/reset-password-01-form"
import { Desk } from "@/components/ui/desk"
import { cn } from "@/lib/utils"

export default function ResetPassword01Page({ className, as = "main", ...props }: Omit<React.ComponentProps<typeof Desk>, "as"> & { as?: "main" | "div" }) {
  return (
    <Desk as={as} objects={["pencil", "pins"]} seed="reset-password-01" className={cn("@container/page min-h-svh w-full overflow-x-clip", className)} {...props}>
      <div className="flex min-h-[inherit] items-center justify-center p-6 @xl/page:p-10">
        <div className="w-full max-w-sm">
          <ResetPasswordForm />
        </div>
      </div>
    </Desk>
  )
}
