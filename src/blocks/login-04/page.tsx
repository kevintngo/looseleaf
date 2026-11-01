import { LoginForm } from "@/blocks/login-04/components/login-04-form"
import { Desk } from "@/components/ui/desk"
import { cn } from "@/lib/utils"

export default function Login04Page({ className, as = "main", ...props }: Omit<React.ComponentProps<typeof Desk>, "as"> & { as?: "main" | "div" }) {
  return (
    <Desk as={as} objects={["ruler", "clips"]} seed="login-04" className={cn("@container/page min-h-svh w-full overflow-x-clip", className)} {...props}>
      <div className="flex min-h-[inherit] flex-col items-center justify-center p-6 @xl/page:p-10">
        <div className="w-full max-w-sm @3xl/page:max-w-4xl">
          <LoginForm />
        </div>
      </div>
    </Desk>
  )
}
