import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/components/ui/message-scroller"

export const meta = {
  title: "Commands",
  description:
    "shadcn's `message-scroller-commands`: `useMessageScroller` gives `scrollToMessage`, `scrollToStart` and `scrollToEnd` to anything inside the provider, so a menu in the card header can drive the transcript. Choose a question and it slides to the top of the view.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 680,
}

const messages = [
  {
    id: "command-activation",
    role: "user",
    text: "We're seeing activation dip after workspace creation. Can you help me find the likely step?",
  },
  {
    id: "command-activation-reply",
    role: "assistant",
    text: "The sharpest drop is between creating the workspace and inviting the first teammate.\n\nWorkspace creation is still healthy, but the invite step is where users pause. That suggests the product is asking for collaboration before the user has enough confidence in the workspace.",
  },
  { id: "command-compare", role: "user", text: "What should I compare before we change the onboarding flow?" },
  {
    id: "command-compare-reply",
    role: "assistant",
    text: "Compare three cohorts:\n\n1. Users who choose a template before inviting teammates.\n2. Users who start from a blank workspace.\n3. Users who skip invites and return within 24 hours.\n\nIf template users invite faster, the fix is probably better first-run guidance rather than a louder invite prompt.",
  },
  { id: "command-experiment", role: "user", text: "Can you turn that into an experiment?" },
  {
    id: "command-experiment-reply",
    role: "assistant",
    text: "Yes. Create a variant that shows a short checklist after workspace creation:\n\n- Pick a template.\n- Add one project detail.\n- Invite a teammate when the workspace has context.\n\nMeasure first invite completion, 24-hour return rate, and whether teams create a second project.",
  },
  { id: "command-risk", role: "user", text: "What's the risk if we delay the invite prompt?" },
  {
    id: "command-risk-reply",
    role: "assistant",
    text: "The main risk is reducing team creation for accounts that already know who they want to invite.\n\nTo protect that path, keep the invite action visible in the header and only change the primary empty-state guidance.",
  },
] satisfies Array<{ id: string; role: "user" | "assistant"; text: string }>

const userMessages = messages.filter((message) => message.role === "user")

export default function Example() {
  return (
    <MessageScrollerProvider defaultScrollPosition="end">
      <div className="relative mx-auto flex w-full max-w-sm flex-col gap-4">
        <Card className="h-140 w-full gap-0">
          <CardHeader className="gap-1 border-b">
            <CardTitle>Commands</CardTitle>
            <CardDescription>Drive the transcript from outside.</CardDescription>
            <CardAction>
              <CommandMenu />
            </CardAction>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 overflow-hidden p-0">
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent>
                  {messages.map((message) => {
                    const mine = message.role === "user"
                    return (
                      <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={mine}>
                        <Message align={mine ? "end" : "start"}>
                          <MessageContent>
                            <Bubble variant={mine ? "muted" : "ghost"}>
                              <BubbleContent className="space-y-2">
                                {message.text.split(/\n\s*\n/).map((paragraph, index) => (
                                  <p key={index} className="whitespace-pre-wrap">
                                    {paragraph}
                                  </p>
                                ))}
                              </BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    )
                  })}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </CardContent>
        </Card>
        <div className="px-0.5 text-center text-xs text-balance text-muted-foreground">Use the controls to jump to any message in the conversation.</div>
      </div>
    </MessageScrollerProvider>
  )
}

function CommandMenu() {
  const { scrollToMessage } = useMessageScroller()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="secondary">
          Jump to...
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" className="w-64">
        <DropdownMenuLabel>Conversations</DropdownMenuLabel>
        {userMessages.map((message) => (
          <DropdownMenuItem key={message.id} onSelect={() => scrollToMessage(message.id, { align: "start", behavior: "smooth" })}>
            <span className="line-clamp-1 min-w-0">{message.text.length > 42 ? `${message.text.slice(0, 39)}...` : message.text}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
