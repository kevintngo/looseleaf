import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Release notes",
  description:
    "Badges doing real work in a card: a status next to the title, the kind of each change in front of its line, and a tally of how many are left to read.",
  layout: "stack" as const,
}

const changes = [
  { kind: "New", variant: "default", text: "Pencil-drawn spinner that scribbles while it waits" },
  { kind: "Fixed", variant: "secondary", text: "Focus rings no longer clip inside scroll areas" },
  { kind: "Breaking", variant: "destructive", text: "Badge is a span again; wrap it in a link with asChild" },
  { kind: "Note", variant: "outline", text: "The hover tilt is off for reduced motion" },
] as const

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md" seed="release">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          v2.4.0
          <Badge variant="secondary">
            <Icon name="badge-check" />
            Latest
          </Badge>
        </CardTitle>
        <CardDescription>Released this morning, four changes.</CardDescription>
        <CardAction>
          <Badge tally count={4} variant="outline" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul role="list" className="flex flex-col gap-3">
          {changes.map((c) => (
            <li key={c.text} className="flex items-baseline gap-3">
              <Badge variant={c.variant} size="sm" className="min-w-16">
                {c.kind}
              </Badge>
              <span className="text-[15px] leading-snug">{c.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="border-t">
        <Button variant="link" size="sm">
          Read the full changelog
        </Button>
      </CardFooter>
    </Card>
  )
}
