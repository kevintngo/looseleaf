import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "message-scroller",
  title: "Message scroller",
  category: "Chat",
  description:
    "The scrolling transcript of a chat: it opens on the newest message, sticks to the bottom while a reply streams and lets go the moment you scroll up, pins your new message to the top so the reply grows beneath it, holds your place when older messages are added above, and wakes a \"jump to latest\" button when there is more below. Same parts and hooks as shadcn's message scroller, with the behavior written in, so no extra package.",
  status: "new",
  upstream: "message-scroller",
  parts: [
    {
      name: "MessageScrollerProvider",
      description: "Holds the scroll state. Everything else, and the hooks, live inside it. It renders no element.",
      props: [
        { name: "autoScroll", type: "boolean", default: "false", description: "Follow the bottom while content grows (a streaming reply), until the person scrolls up; it follows again when they come back to the bottom. It may change while mounted (`autoScroll={status === \"streaming\"}`): switched on at the bottom it starts following at once, switched off it stops." },
        { name: "defaultScrollPosition", type: '"start" | "end" | "last-anchor"', default: '"end"', description: "Where a conversation opens. `last-anchor` puts the last `scrollAnchor` message at the top of the view when the exchange after it is taller than the page." },
        { name: "scrollEdgeThreshold", type: "number", default: "8", description: "How close to an edge counts as being at it, px." },
        { name: "scrollPreviousItemPeek", type: "number", default: "64", description: "How much of the message before an anchor stays in sight above it, px." },
        { name: "scrollMargin", type: "number", default: "0", description: "Space kept above a message scrolled to, px." },
      ],
    },
    { name: "MessageScroller", description: "The root: `relative`, `flex-col`, and `data-scrollable=\"start end\"` while there is more to scroll in either direction (CSS reads it to fade the page edge)." },
    {
      name: "MessageScrollerViewport",
      description: "The scrolling element: `role=\"region\"` labeled \"Messages\" and focusable, so the keyboard can scroll it. Wheel, touch and scroll keys toward the start are read as the person taking over.",
      props: [{ name: "preserveScrollOnPrepend", type: "boolean", default: "true", description: "Hold the message you are reading still when older messages are added above it." }],
    },
    {
      name: "MessageScrollerContent",
      description: "The transcript: `role=\"log\"` (polite, additions) with a hidden spacer at the end that makes room for a pinned message on an empty page.",
      props: [{ name: "spacerClassName", type: "string", description: "Class for the spacer element." }],
    },
    {
      name: "MessageScrollerItem",
      description: "One message. Give it a `messageId` so it can be scrolled to and reported as visible. Unlike upstream it is not `content-visibility: auto`: that paint containment would cut off the tails and reaction chips that hang past a bubble. For thousands of messages render a window of them, or add `[content-visibility:auto] p-3` yourself.",
      props: [
        { name: "messageId", type: "string", description: "Stable id for `scrollToMessage` and `useMessageScrollerVisibility`." },
        { name: "scrollAnchor", type: "boolean", default: "false", description: "A message that goes to the top of the view when it arrives (your own, so the reply grows below it)." },
      ],
    },
    {
      name: "MessageScrollerButton",
      description: "The jump button: awake (`data-active=\"true\"`) when there is more to scroll in its direction, inert and hidden otherwise. It is a secondary icon Button by default; pass `render` for your own element.",
      props: [
        { name: "direction", type: '"start" | "end"', default: '"end"', description: "Which way it jumps." },
        { name: "behavior", type: "ScrollBehavior", default: '"smooth"', description: "How it scrolls." },
        { name: "render", type: "ReactElement | (props, state) => ReactElement", description: "Render another element, keeping the button's props and state." },
        { name: "variant / size", type: "ButtonProps", default: '"secondary" / "icon-sm"', description: "For the default Button." },
      ],
    },
    { name: "useMessageScroller", description: "`{ scrollToEnd, scrollToStart, scrollToMessage(id, { align, behavior, scrollMargin }) }`. Each returns whether it could. A message asked for before it exists is scrolled to when it arrives." },
    { name: "useMessageScrollerScrollable", description: "`{ start, end }`: is there more to scroll toward each edge? (`end` is false while the transcript is following the bottom.)" },
    { name: "useMessageScrollerVisibility", description: "`{ currentAnchorId, visibleMessageIds }`: the messages in view (the peek above does not count) and the last anchor scrolled past." },
  ],
  a11y: [
    "The viewport is a labeled `region` and a tab stop, so a keyboard user can scroll with the arrows, Page keys, Home and End; the transcript inside it is a `role=\"log\"`, which announces additions politely.",
    "Taking over is detected from wheel, touch and scroll keys going toward the start, and from a dragged scrollbar (a scroll the scroller did not make itself; a press on the container, not on a message, while your message is pinned): following and pinning stop immediately and never fight the reader. Scrolling toward the end while you are already there changes nothing, so a stream keeps being followed.",
    "The jump button is `inert` (not focusable, not clickable) while there is nowhere to jump, and has a visually hidden label. Pressing it hands the keyboard to the transcript, so the arrows and Page keys carry on from there instead of restarting at the top of the page.",
    "Every word a streaming reply adds is an addition to the `log`, and a screen reader would read the reply piece by piece. While it streams pass `aria-live=\"off\"` to `MessageScrollerContent` and announce the finished reply once from a separate `role=\"status\"` (the examples do); the `TypingIndicator` covers \"someone is writing\".",
    "Smooth scrolling and the button's slide are decoration: with `prefers-reduced-motion` (or a `data-motion=\"reduced\"` ancestor) the durations collapse and the jump button scrolls instantly, even though it asks for `smooth`.",
    "The focus ring of the viewport (it is a tab stop) is drawn just inside its edge, because the fade mask would cut a ring drawn outside it.",
    "The page fades at an edge only while there is more to scroll there; the fade is a CSS mask, not a color.",
  ],
  usage: `import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"

export function Transcript({ messages }: { messages: Array<{ id: string; mine: boolean; text: string }> }) {
  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller className="h-[480px]">
        <MessageScrollerViewport>
          <MessageScrollerContent>
            {messages.map((m) => (
              <MessageScrollerItem key={m.id} messageId={m.id} scrollAnchor={m.mine}>
                {m.text}
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}`,
  related: ["message", "bubble", "prompt-input", "marker", "scroll-area"],
} satisfies ComponentDoc
