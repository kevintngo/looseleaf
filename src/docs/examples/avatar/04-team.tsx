import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const meta = {
  title: "Team card",
  description: "A people list in a card: face, name, role, and a presence dot. Each face is a separate small drawing (the list is short); a list of hundreds would use `ring=\"none\"`.",
  layout: "center" as const,
  height: 460,
}

const team = [
  { name: "Ada Lovelace", role: "Designer", status: "online" },
  { name: "Jo Okafor", role: "Engineer", status: "busy" },
  { name: "Mika Kobayashi", role: "Writer", status: "away" },
  { name: "Sam Reyes", role: "Support", status: "offline" },
] as const

export default function Example() {
  return (
    <Card seed="team" className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>On the team</CardTitle>
        <CardDescription>4 people, 2 of them at their desks.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Invite
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-4">
        {team.map((p) => (
          <div key={p.name} className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback name={p.name} />
              <AvatarBadge status={p.status}>
                <span className="sr-only">{p.status}</span>
              </AvatarBadge>
            </Avatar>
            <div className="grid leading-tight">
              <span className="font-bold">{p.name}</span>
              <span className="text-sm text-muted-foreground">{p.role}</span>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3 pt-1">
          <AvatarGroup>
            {["Priya Nair", "Tomas Berg", "Lena Fischer"].map((n) => (
              <Avatar key={n} size="sm">
                <AvatarFallback name={n} />
              </Avatar>
            ))}
            <AvatarGroupCount>+5</AvatarGroupCount>
          </AvatarGroup>
          <span className="text-sm text-muted-foreground">also watching</span>
        </div>
      </CardContent>
    </Card>
  )
}
