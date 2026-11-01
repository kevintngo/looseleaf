import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "attachment",
  title: "Attachment",
  category: "Chat",
  description:
    "A file handed over in a conversation: a slip clipped to the message, or a print taped up. Five states (idle, uploading, processing, error, done), a pencil progress bar and a remove button. The pencil traces the slip, dashes it while it is only a promise and goes red when it fails.",
  status: "new",
  upstream: "attachment",
  parts: [
    {
      name: "Attachment",
      description: "The root and the drawing: a `Paper` slip (horizontal) or a taped photo (vertical) behind the content, with a hand-traced outline on top. A finished slip carries a paper clip, a finished print a strip of tape.",
      props: [
        { name: "state", type: '"idle" | "uploading" | "processing" | "error" | "done"', default: '"done"', description: "Idle is a dashed empty slot with no paper, error is red pencil on a red wash, uploading and processing are the same slip with a second, looser pass and a pulsing title." },
        { name: "size", type: '"default" | "sm" | "xs"', default: '"default"', description: "Padding and type size." },
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "A file chip, or a print with a caption in its white border." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
    { name: "AttachmentGroup", description: "A row of attachments that scrolls sideways and snaps; padded so the clips, the tape and the focus rings are not cut off." },
    {
      name: "AttachmentMedia",
      description: "The tile a file's icon or thumbnail sits in: a paper-shade blob and a pencil loop, red in the error state. A bare glyph is held to 16 px (24 px in a print); a `Doodle` or `Sticker` keeps the size you give it.",
      props: [{ name: "variant", type: '"icon" | "image"', default: '"icon"', description: "`image` frames a picture (`<img>`) that covers the tile; it is dimmed while the file is uploading or processing." }],
    },
    { name: "AttachmentContent", description: "The title, description and progress bar." },
    { name: "AttachmentTitle", description: "The file name, bold, truncated; it pulses while the file is uploading or processing." },
    { name: "AttachmentDescription", description: "Size, type or a message; red in the error state." },
    {
      name: "AttachmentProgress",
      description: "The pencil bar: a ruled box with a hatched fill. The fill is drawn once at full length and clipped by CSS to the value, so progress never redraws it.",
      props: [
        { name: "value", type: "number", description: "0 to `max`. Undefined makes an indeterminate bar (the hatching pulses)." },
        { name: "max", type: "number", default: "100", description: "The value that means done." },
      ],
    },
    { name: "AttachmentActions", description: "A row for actions; in a vertical attachment it sits on the top right corner of the print." },
    { name: "AttachmentAction", description: "A ghost icon Button (remove, retry, download). Takes every Button prop." },
    { name: "AttachmentTrigger", description: "A button laid over the whole attachment to make it pressable (`asChild` for a link). Give it an `aria-label`. It draws the hover wash and, on keyboard focus, the blue ring round the whole attachment." },
  ],
  a11y: [
    "AttachmentProgress is a `role=\"progressbar\"` with `aria-valuenow`/`min`/`max` (none while indeterminate). Inside an attachment it is named by the AttachmentTitle unless you give it an `aria-label` or `aria-labelledby`; on its own it needs one.",
    "An AttachmentTrigger covers the attachment and is the tab stop; the Action buttons above it (z-20) stay separately focusable. Label both: the file name is not enough for 'Remove'.",
    "The state is never only color: error is red pencil plus a red message plus (for you) a retry action; idle is dashed; done carries a clip.",
    "Sheets, outlines, clips and tape are aria-hidden and take no pointer events. Calm density hides the clip and the tape and traces a plain hairline.",
    "Error text is red on slip (4.8:1); titles are ink on slip (14:1).",
    "A finished chip carries a paper clip over its end. With no action beside it the content keeps clear of the clip (extra end padding), so a long title truncates before it, not under it.",
  ],
  usage: `import { Icon } from "@/components/ui/icon"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentProgress,
  AttachmentTitle,
} from "@/components/ui/attachment"

export function Example() {
  return (
    <Attachment state="uploading">
      <AttachmentMedia>
        <Icon name="file-code" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>tags-list.tsx</AttachmentTitle>
        <AttachmentDescription>Uploading 42 %</AttachmentDescription>
        <AttachmentProgress value={42} aria-label="Upload progress" />
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label="Cancel upload"><Icon name="x" /></AttachmentAction>
      </AttachmentActions>
    </Attachment>
  )
}`,
  related: ["prompt-input", "bubble", "message", "progress", "card"],
} satisfies ComponentDoc
