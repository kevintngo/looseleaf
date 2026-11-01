import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const meta = {
  title: "Pinned, clipped, stapled",
  description: "The `fastener` slot holds a card down. Calm density hides every prop, so a dense dashboard keeps its plain sheets.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="mx-auto grid max-w-2xl gap-x-9 gap-y-14 p-6 pt-12 sm:grid-cols-2">
      {(["pin", "clip", "staple", "binder-clip"] as const).map((fastener) => (
        <Card key={fastener} fastener={fastener} seed={fastener} className="gap-2 pt-12 pb-6">
          <CardHeader>
            <CardTitle>{fastener}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">held with a {fastener.replace("-", " ")}</CardContent>
        </Card>
      ))}
    </div>
  )
}
