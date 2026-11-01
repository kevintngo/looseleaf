import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const meta = {
  title: "A card that has not arrived",
  description: "The skeleton of a profile card placed inside the real Card, so the page does not jump when the words come in.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
      {[0, 1].map((i) => (
        <Card key={i} seed={`sk-${i}`} aria-busy="true">
          <CardHeader className="flex-row items-center gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
