import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Groups",
  description:
    "`AvatarGroup` overlaps faces and a paper-coloured ring cuts each one out of the last (`--ll-avatar-ring` changes the colour on a different surface). `AvatarGroupCount` is the sketched disc for everyone who did not fit; it takes text or an icon.",
  layout: "center" as const,
  height: 240,
}

const portrait = (a: string, b: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='64' height='64' fill='url(#g)'/><circle cx='32' cy='26' r='11' fill='#3a2f28' opacity='.55'/><ellipse cx='32' cy='62' rx='23' ry='19' fill='#3a2f28' opacity='.5'/></svg>`
  )}`

export default function Example() {
  return (
    <div className="grid gap-6">
      <AvatarGroup>
        <Avatar>
          <AvatarImage src={portrait("#f6c9a0", "#c98a68")} alt="Ada Lovelace" />
          <AvatarFallback name="Ada Lovelace" />
        </Avatar>
        <Avatar>
          <AvatarFallback name="Jo Okafor" />
        </Avatar>
        <Avatar>
          <AvatarImage src={portrait("#b8d4ea", "#6f97be")} alt="Mika Kobayashi" />
          <AvatarFallback name="Mika Kobayashi" />
        </Avatar>
        <Avatar>
          <AvatarFallback name="Sam Reyes" />
        </Avatar>
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>
      <AvatarGroup>
        {["Priya Nair", "Tomas Berg", "Lena Fischer"].map((n) => (
          <Avatar key={n} size="lg">
            <AvatarFallback name={n} />
          </Avatar>
        ))}
        <AvatarGroupCount>
          <Icon name="plus" />
          <span className="sr-only">Invite someone</span>
        </AvatarGroupCount>
      </AvatarGroup>
      <AvatarGroup>
        {["Omar Haddad", "Yuki Tanaka", "Ines Moreau", "Kofi Mensah"].map((n) => (
          <Avatar key={n} size="sm">
            <AvatarFallback name={n} />
          </Avatar>
        ))}
        <AvatarGroupCount>+8</AvatarGroupCount>
      </AvatarGroup>
    </div>
  )
}
