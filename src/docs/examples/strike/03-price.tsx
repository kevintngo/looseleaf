import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Strike } from "@/components/ui/strike"

export const meta = {
  title: "A price that dropped",
  description: "The old price stays in the text (and in the accessibility tree as <s>), so nothing is lost to a screen reader; the card says what changed.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Card className="w-full max-w-xs" stock="index-card" tilt>
      <CardHeader>
        <CardTitle className="font-script text-2xl">Field notebook</CardTitle>
        <CardDescription>Dot grid, stitched spine</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1">
        <p className="ll-num font-script text-4xl">
          <Strike weight="brush" className="text-muted-foreground">$24</Strike> <span className="text-red">$16</span>
        </p>
        <p className="text-sm text-muted-foreground">Was $24. Now $16 until Sunday.</p>
      </CardContent>
    </Card>
  )
}
