import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle } from "@/components/ui/attachment"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Icon } from "@/components/ui/icon"
import { Message, MessageContent } from "@/components/ui/message"
import { Sticker } from "@/components/ui/sticker"

export const meta = {
  title: "Attachment",
  description:
    "shadcn's `message-attachment`: an image attachment above the bubble that sent it (a polaroid under tape), and a PDF the reply hands back (a slip with a paper clip and a download button). The photograph is a sticker so the page needs no network.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8 py-4">
      <Message align="end">
        <MessageContent>
          <Attachment orientation="vertical">
            <AttachmentMedia variant="image">
              <Sticker name="laptop-open" size={80} label="Workspace" className="size-20" />
            </AttachmentMedia>
          </Attachment>
          <Bubble>
            <BubbleContent>Here&apos;s the image. Can you add it to the PDF? Use it for the cover page.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageContent>
          <Bubble variant="muted">
            <BubbleContent>Done. Here&apos;s the PDF with the image added as the cover page.</BubbleContent>
          </Bubble>
          <Attachment>
            <AttachmentMedia>
              <Icon name="file-text" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
              <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction type="button" title="Download" aria-label="Download" size="icon-sm" variant="secondary">
                <Icon name="download" />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <Bubble>
            <BubbleContent>Thanks. Looks good.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </div>
  )
}
