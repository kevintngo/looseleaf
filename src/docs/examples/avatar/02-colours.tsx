import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar"

export const meta = {
  title: "Color from the name",
  description:
    "Give `AvatarFallback` a `name` and it makes the initials, picks one of eight stationery colors from the name (the same person is the same color everywhere) and lets a screen reader hear the full name instead of two letters. `ring` picks the pen of the loop, and `\"none\"` draws no loop for long lists.",
  layout: "center" as const,
}

const people = ["Ada Lovelace", "Jo Okafor", "Mika Kobayashi", "Sam Reyes", "Priya Nair", "Tomas Berg", "Lena Fischer", "Omar Haddad", "Yuki Tanaka", "Ines Moreau", "Kofi Mensah", "Nora Lindqvist"]

export default function Example() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-4">
        {people.map((name) => (
          <Avatar key={name} size="lg">
            <AvatarFallback name={name} />
          </Avatar>
        ))}
      </div>
      <div className="flex items-center gap-5">
        <Avatar size="lg" ring="you">
          <AvatarFallback name="Ada Lovelace" />
          <AvatarBadge status="online" />
        </Avatar>
        <Avatar size="lg" ring="marker">
          <AvatarFallback name="Ada Lovelace" />
        </Avatar>
        <Avatar size="lg" ring="none">
          <AvatarFallback name="Ada Lovelace" />
        </Avatar>
        <span className="text-sm text-muted-foreground">ring: you, marker, none</span>
      </div>
    </div>
  )
}
