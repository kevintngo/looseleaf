import { cn } from "@/lib/utils"

const LOGOS = [
  { name: "Oatmeal & Co.", className: "font-script text-3xl font-bold" },
  { name: "KILN", className: "font-type text-xl tracking-[0.35em]" },
  { name: "paperwork bros", className: "font-hand text-xl font-bold lowercase" },
  { name: "Northwind Ink", className: "font-script text-3xl font-bold italic" },
  { name: "The Tea Room", className: "font-type text-lg tracking-wide" },
  { name: "Brindle", className: "font-script text-3xl font-normal" },
  { name: "LOOM & LANTERN", className: "font-mono text-sm font-semibold tracking-[0.25em]" },
  { name: "salt studio", className: "font-hand text-xl font-normal lowercase" },
] as const

type Logo = (typeof LOGOS)[number]

function Logos01Name({ logo, className }: { logo: Logo; className?: string }) {
  return <span className={cn("whitespace-nowrap", logo.className, className)}>{logo.name}</span>
}

export { LOGOS, Logos01Name }
export type { Logo }
