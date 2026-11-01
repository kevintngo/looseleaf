import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble"
import { Mascot } from "@/components/ui/mascot"
import { Message, MessageAvatar, MessageContent, MessageGroup, MessageHeader } from "@/components/ui/message"
import { Paper } from "@/components/ui/paper"

export default function ChatCard() {
  return (
    <Paper data-home="chat" stock="graph" tape="both" tapeKind="masking" seed="home-chat" className="w-full px-4 pt-7 pb-5">
      <MessageGroup role="group" className="gap-5" aria-label="A conversation with Stubby">
        <Message align="end">
          <MessageContent>
            <MessageHeader className="justify-end">Ada</MessageHeader>
            <Bubble variant="default">
              <BubbleContent seed="home-chat-1">Can I keep my shadcn imports?</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message>
          <MessageAvatar>
            <Mascot pose="idle" size={40} seed="home-chat-stubby" />
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Stubby</MessageHeader>
            <BubbleGroup>
              <Bubble variant="muted">
                <BubbleContent seed="home-chat-2">Yes. Same parts, same props, same Radix.</BubbleContent>
              </Bubble>
              <Bubble variant="muted">
                <BubbleContent seed="home-chat-3">Swap the file, keep your JSX.</BubbleContent>
              </Bubble>
            </BubbleGroup>
          </MessageContent>
        </Message>
      </MessageGroup>
    </Paper>
  )
}
