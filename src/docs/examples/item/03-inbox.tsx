import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Doodle } from "@/components/ui/doodle"
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Kbd } from "@/components/ui/kbd"

export const meta = {
  title: "An inbox",
  description:
    "Rows doing real work in a card: photographs that lie a little crooked, a status badge in the title, actions on the right, and a header and footer on the row that needs them.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const messages = [
  { doodle: "sun", from: "Mara", subject: "Sunday plans", preview: "The lake, if the weather holds, and there will be bread.", fresh: true },
  { doodle: "flower", from: "The garden club", subject: "Bulbs, finally", preview: "Two hundred tulips to plant before the ground freezes." },
  { doodle: "mushroom", from: "Ines", subject: "You will not believe it", preview: "A whole ring of them, right behind the shed." },
] as const

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-lg" seed="inbox">
      <CardHeader>
        <CardTitle>Inbox</CardTitle>
        <CardDescription>Three letters, one of them new.</CardDescription>
        <CardAction>
          <Badge tally count={3} variant="outline" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ItemGroup ruled>
          {messages.map((m) => (
            <Item key={m.subject}>
              <ItemMedia variant="image">
                <Doodle name={m.doodle} size={36} className="mx-auto mt-0.5" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {m.subject}
                  {"fresh" in m && m.fresh ? <Badge size="sm">New</Badge> : null}
                </ItemTitle>
                <ItemDescription>
                  <span className="font-bold">{m.from}</span> · {m.preview}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="ghost" size="sm">
                  Open
                </Button>
              </ItemActions>
            </Item>
          ))}
          <Item variant="muted" className="mt-4">
            <ItemHeader>
              <ItemTitle>Tip</ItemTitle>
            </ItemHeader>
            <ItemContent>
              <ItemDescription>Press a letter and it opens; press it again and it closes.</ItemDescription>
            </ItemContent>
            <ItemFooter>
              <span className="text-sm text-muted-foreground">Keep going</span>
              <Kbd>J</Kbd>
            </ItemFooter>
          </Item>
        </ItemGroup>
      </CardContent>
    </Card>
  )
}
