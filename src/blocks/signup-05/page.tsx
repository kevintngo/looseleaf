import { SignupForm } from "@/blocks/signup-05/components/signup-05-form"
import { Desk } from "@/components/ui/desk"
import { Paper } from "@/components/ui/paper"
import { cn } from "@/lib/utils"

export default function Signup05Page({ className, as = "main", ...props }: Omit<React.ComponentProps<typeof Desk>, "as"> & { as?: "main" | "div" }) {
  return (
    <Desk as={as} seed="signup-05" className={cn("@container/page min-h-svh w-full overflow-clip", className)} {...props}>
      <div className="flex min-h-[inherit] justify-center px-4 pt-10 @xl/page:px-10">
        <Paper
          stock="pad"
          rules="none"
          edge={{ top: "torn" }}
          tilt={false}
          seed="signup-05-sheet"
          className="mx-auto -mb-4 flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-12 @xl/page:px-12"
        >
          <div className="w-full max-w-sm">
            <SignupForm />
          </div>
        </Paper>
      </div>
    </Desk>
  )
}
