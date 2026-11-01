import { LoginForm } from "@/blocks/login-05/components/login-05-form"
import { Paper } from "@/components/ui/paper"
import { cn } from "@/lib/utils"

export default function Login05Page({ className, as = "main", ...props }: Omit<React.ComponentProps<typeof Paper>, "as"> & { as?: "main" | "div" }) {
  return (
    <Paper as={as} stock="paper" tilt={false} shadow="none" seed="login-05" className={cn("@container/page min-h-svh w-full", className)} {...props}>
      <div className="flex min-h-[inherit] flex-col items-center justify-center gap-6 p-6 @xl/page:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </Paper>
  )
}
