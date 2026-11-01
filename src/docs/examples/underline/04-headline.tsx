import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Underline } from "@/components/ui/underline"

export const meta = {
  title: "Under a headline",
  description: "A double brush line under a title, a wavy pencil line under a caption: the pen grows with the type.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Card className="w-full max-w-md" tilt>
      <CardHeader>
        <CardTitle className="font-script text-4xl leading-tight">
          <Underline kind="double" weight="brush" tone="blue">
            Spring reading list
          </Underline>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 text-[17px] leading-[1.55]">
        <p>
          Three books for the <Underline kind="wavy" tone="pencil">slow weeks</Underline>: a novel, a field guide and something with pictures.
        </p>
      </CardContent>
    </Card>
  )
}
