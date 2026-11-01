import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Squiggle } from "@/components/ui/squiggle"

export const meta = {
  title: "Between sections of a card",
  description: "A real separator (decorative={false}) that draws itself on when the card scrolls into view.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Card className="w-full max-w-sm" tilt>
      <CardHeader>
        <CardTitle className="font-script text-2xl">Weekend</CardTitle>
        <CardDescription>Two plans and a maybe</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-[17px]">
        <p>Saturday: the market, then the long way home.</p>
        <Squiggle kind="scallops" tone="blue" decorative={false} animate />
        <p>Sunday: nothing, carefully.</p>
      </CardContent>
    </Card>
  )
}
