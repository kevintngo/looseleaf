import { cn } from "@/lib/utils"

export function Hint({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("font-script text-sm text-pencil", className)}>{children}</p>
}
