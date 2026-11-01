import { Asterisk } from "@/components/ui/asterisk"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const meta = {
  title: "A price with a footnote",
  description: "The mark is a link (with a name) to the footnote at the foot of the card, sized to the 36 px price it follows.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Card className="w-full max-w-xs" stock="index-card" tilt>
      <CardHeader>
        <CardTitle className="font-script text-2xl">Studio plan</CardTitle>
        <CardDescription>Everything, for one desk</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <p className="ll-num font-script text-5xl">
          $16
          <Asterisk label="Footnote 1" href="#price-note" className="text-5xl" />
          <span className="ms-2 font-hand text-base text-muted-foreground">per month</span>
        </p>
        <p id="price-note" className="text-sm text-muted-foreground">
          * Introductory price for the first twelve months.
        </p>
      </CardContent>
    </Card>
  )
}
