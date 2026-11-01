import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Highlight } from "@/components/ui/highlight"

export const meta = {
  title: "Reading notes",
  description: "Highlights inside a card: the swipe sits on the paper, behind the words, and the card's tilt never touches the text.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Card className="w-full max-w-md" tape="top" tilt>
      <CardHeader>
        <CardTitle className="font-script text-2xl">Notes on Walden, ch. 2</CardTitle>
        <CardDescription>Read on the train, 14 March</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-[17px] leading-[1.55]">
        <p>
          &ldquo;I went to the woods because I wished to live deliberately,&rdquo; and then, a page later, <Highlight>to front only the essential facts of life</Highlight>.
        </p>
        <p>
          The part I keep coming back to is <Highlight tone="green">simplicity, simplicity, simplicity</Highlight>: he says it three times, as if the first two were not enough.
        </p>
        <p>
          <Highlight tone="pink" weight="light">Ask Sam what she thinks about the pond.</Highlight>
        </p>
      </CardContent>
    </Card>
  )
}
