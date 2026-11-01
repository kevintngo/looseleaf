import { Arrow } from "@/components/ui/arrow"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const meta = {
  title: "With a label",
  description: "Text inside an Arrow is its label: real handwritten text, placed outside the tail on the side the arrow leaves from. Here it leaves the note at the top right and lands on the signature line.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 300,
}

export default function Example() {
  return (
    <div className="relative w-full max-w-sm pe-32">
      <Card tilt>
        <CardHeader>
          <CardTitle className="font-script text-2xl">Guest book</CardTitle>
          <CardDescription>Sign on the line</CardDescription>
        </CardHeader>
        <CardContent className="h-10 border-b border-dashed border-pencil-mark" />
      </Card>
      <Arrow direction="down-left" curve="curved" tone="blue" bend="up" className="absolute end-20 bottom-8 h-20 w-24">
        your name
      </Arrow>
    </div>
  )
}
