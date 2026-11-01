import { Doodle } from "@/components/ui/doodle"
import { Icon } from "@/components/ui/icon"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"

export const meta = {
  title: "Prints on the wall",
  description: "orientation=\"vertical\" is a photo with a white border, taped up. Put an `<img>` in the media; here a doodle stands in. A group scrolls sideways and snaps when its prints are wider than the box.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const PRINTS = [
  { name: "harbour.jpg", size: "1.8 MB", doodle: "sun", tint: "bg-sky/45" },
  { name: "sketch-04.png", size: "620 KB", doodle: "flower", tint: "bg-lemon/50" },
  { name: "mushrooms.jpg", size: "2.1 MB", doodle: "mushroom", tint: "bg-bubblegum/40" },
  { name: "night.jpg", size: "980 KB", doodle: "star", tint: "bg-grass/40" },
]

export default function Example() {
  return (
    <AttachmentGroup className="mx-auto max-w-2xl">
      {PRINTS.map((p) => (
        <Attachment key={p.name} orientation="vertical" seed={p.name}>
          <AttachmentMedia variant="image" className={p.tint}>
            <Doodle name={p.doodle} size={64} seed={p.name} />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{p.name}</AttachmentTitle>
            <AttachmentDescription>{p.size}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentTrigger aria-label={`Open ${p.name}`} />
          <AttachmentActions>
            <AttachmentAction aria-label={`Remove ${p.name}`} size="icon-xs">
              <Icon name="x" />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ))}
    </AttachmentGroup>
  )
}
