import { Skeleton } from "@/components/ui/skeleton"

export const meta = {
  title: "Demo",
  description:
    "Official `skeleton-demo`: an avatar circle beside two lines of text, shaped only by classes. Each placeholder is a pale pencil hatch inside a rough outline that redraws itself slowly (three frames, each starting at its own phase); reduced motion holds it still.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}
