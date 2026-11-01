import { LoginForm } from "@/blocks/login-01/components/login-01-form"
import { Desk } from "@/components/ui/desk"
import { cn } from "@/lib/utils"

export default function Login01Page({ className, as = "main", ...props }: Omit<React.ComponentProps<typeof Desk>, "as"> & { as?: "main" | "div" }) {
  return (
    <Desk as={as} seed="login-01" className={cn("@container/page min-h-svh w-full overflow-x-clip", className)} {...props}>
      <div className="flex min-h-[inherit] items-center justify-center p-6 pt-24 @xl/page:p-10 @xl/page:pt-24">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </Desk>
  )
}
