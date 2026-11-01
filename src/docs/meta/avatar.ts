import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "avatar",
  title: "Avatar",
  category: "Data display",
  description:
    "A face, circled in felt tip. The picture is circled by a hand-drawn loop; without one the initials sit on a disc of marker in a stationery colour chosen from the name. A status dot goes on the corner, and a group overlaps its faces and ends in a sketched \"+3\".",
  status: "stable",
  upstream: "avatar",
  parts: [
    {
      name: "Avatar",
      description:
        "The Radix Avatar root, a round `span`. It does not clip (the picture and the disc round themselves, always as circles: the hand-drawn loop is a circle too, so a `rounded-lg` on the root, as some sidebar templates use, does not square the face) so the loop can bleed past its box. `data-size` is read by its parts.",
      props: [
        { name: "size", type: '"sm" | "default" | "lg" | "xl"', default: '"default"', description: "24, 32, 40 or 56 px. Anything else: give it a `size-*` class." },
        { name: "ring", type: '"ink" | "you" | "marker" | "none"', default: '"ink"', description: "The pen of the loop round the face: ink fine-liner, blue felt, a marker halo (\"this one is current\"), or none, which draws nothing (long lists)." },
        { name: "seed", type: "string | number", description: "Pins the hand of the loop. Default: derived from useId()." },
      ],
    },
    { name: "AvatarImage", description: "The picture (`<img>`, round, `object-cover`). Radix shows it once it has loaded and the fallback until then, or when it fails." },
    {
      name: "AvatarFallback",
      description: "The initials disc, shown while there is no picture.",
      props: [
        { name: "name", type: "string", description: "The person's name: picks the colour, makes the initials when there are no children, and is read out by screen readers in place of the letters." },
        { name: "tone", type: '"tomato" | "tangerine" | "lemon" | "grass" | "teal" | "sky" | "grape" | "bubblegum"', description: "A colour of your own instead of the one the name picks." },
        { name: "delayMs", type: "number", description: "Radix: wait this long before showing the fallback, to avoid a flash while the picture loads." },
      ],
    },
    {
      name: "AvatarBadge",
      description: "A dot on the corner of the face. Its size follows the avatar's; an icon child shows from `default` up.",
      props: [{ name: "status", type: '"online" | "away" | "busy" | "offline" | "marker"', default: '"marker"', description: "grass, tangerine, tomato, pencil grey, or the marker of the theme. Give it text for screen readers (`<span className=\"sr-only\">online</span>`)." }],
    },
    { name: "AvatarGroup", description: "Overlaps its avatars by about a quarter of a face (a logical negative margin that follows `size`) and cuts each face out of the one under it with a 2 px ring in the card colour. When the group sits on the page or another surface, name that colour: `className=\"[--ll-avatar-group-ring:var(--background)]\"`." },
    { name: "AvatarGroupCount", description: "A sketched dashed disc for \"the rest\": text (`+3`) or an icon. It matches the size of the group's avatars." },
  ],
  a11y: [
    "The loop, the disc and the dot are aria-hidden decoration. Give the picture an `alt` (or `alt=\"\"` next to the name in text), and give AvatarFallback a `name` so the person is read out instead of two letters.",
    "Colour is never the only carrier: the initials say who, and the badge needs its own text for its meaning (online, busy). The initials are ink on a 62% marker, 5.5:1 or better on all eight colours.",
    "An avatar is not interactive. Wrap it in a Button or link yourself, and the hand-drawn loop then sits inside that control's focus ring.",
    "The same name is always the same colour on the server and in the browser (a hash of the trimmed, lower-cased name), so nothing changes at hydration.",
    "Windows high contrast removes the drawings and keeps the picture or initials.",
  ],
  usage: `import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar"

export function Example() {
  return (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src="/ada.png" alt="Ada Lovelace" />
        <AvatarFallback name="Ada Lovelace" />
        <AvatarBadge status="online" />
      </Avatar>
      <Avatar>
        <AvatarFallback name="Jo Okafor" />
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  )
}`,
  related: ["badge", "card", "table", "tooltip"],
} satisfies ComponentDoc
