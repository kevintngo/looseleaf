import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const meta = {
  title: "From loading to loaded",
  description:
    "The skeleton and the content occupy the same room, so nothing moves when the swap happens. The region says it is busy while it waits; press Reload to see it again.",
  layout: "stack" as const,
}

const notes = [
  { title: "Snail on a leaf", body: "Three tries to get the shell to spiral the right way." },
  { title: "Teapot, three ways", body: "The third one leaks. The second one is a hat." },
]

export default function Example() {
  const [loading, setLoading] = React.useState(true)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const load = React.useCallback(() => {
    setLoading(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setLoading(false), 2200)
  }, [])
  React.useEffect(() => {
    load()
    return () => clearTimeout(timer.current)
  }, [load])
  return (
    <Card className="mx-auto w-full max-w-sm" seed="loaded">
      <CardHeader>
        <CardTitle>Recent pages</CardTitle>
        <CardDescription>{loading ? "Finding your pages..." : "Two pages, newest first."}</CardDescription>
      </CardHeader>
      <CardContent aria-busy={loading}>
        <ul role="list" className="flex flex-col gap-4">
          {notes.map((n) => (
            <li key={n.title} className="flex min-h-[3.25rem] flex-col gap-1">
              {loading ? (
                <>
                  <Skeleton className="h-4 w-2/5" />
                  <Skeleton className="h-3.5 w-full" />
                </>
              ) : (
                <>
                  <span className="font-bold">{n.title}</span>
                  <span className="text-[15px] leading-snug text-muted-foreground">{n.body}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="border-t">
        <Button variant="outline" size="sm" onClick={load}>
          Reload
        </Button>
      </CardFooter>
    </Card>
  )
}
