import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "prompt-input",
  title: "Prompt input",
  category: "Chat",
  description:
    "The composer of a chat: a napkin strip with a writing line, an auto-growing textarea, room for attachments and a paper-plane send button that flies off when the message goes. Enter sends, Shift+Enter breaks the line, IME composition is left alone, and while a reply streams the button becomes a stop button. Slots for slash commands and @mentions, with no data of their own.",
  status: "new",
  parts: [
    {
      name: "PromptInput",
      description: "The form and the state: text (controlled or not), status, submit, stop, and the trigger word under the caret. It is a `Paper` (default stock `napkin`, crimped edge), so any Paper prop works.",
      props: [
        { name: "onSubmit", type: "(value: string, event: FormEvent) => void", description: "Called on Enter (or Ctrl/Cmd+Enter) and on the submit button. Not called when the text is empty, the chat is busy or the composer is disabled." },
        { name: "value / defaultValue / onValueChange", type: "string", description: "Controlled or uncontrolled text. An uncontrolled composer clears after a send (`clearOnSubmit`); a controlled one clears itself in `onSubmit`." },
        { name: "status", type: '"ready" | "submitted" | "streaming" | "error"', default: '"ready"', description: "`submitted` and `streaming` turn the send button into a stop button and block sending. Matches the status of common chat hooks." },
        { name: "onStop", type: "() => void", description: "Called by the stop button." },
        { name: "disabled", type: "boolean", default: "false", description: "Nothing can be typed or sent; the writing line goes dashed." },
        { name: "allowEmpty", type: "boolean", default: "false", description: "Allow an empty message (attachments only)." },
        { name: "lockWhileStreaming", type: "boolean", default: "false", description: "Make the text read-only while the reply streams. By default you can type the next message; sending waits." },
        { name: "submitOn", type: '"enter" | "mod-enter"', default: '"enter"', description: "`mod-enter` sends on Ctrl/Cmd+Enter and Enter is a new line." },
        { name: "triggers", type: '(string | { char: string; atStart?: boolean })[]', description: "Characters that open a suggestion list at the start of a word: `\"@\"`, or `{ char: \"/\", atStart: true }` for commands only at the start of the message." },
        { name: "onTriggerChange", type: "(trigger | null) => void", description: "Called when the word under the caret starts or stops being a trigger word." },
      ],
    },
    { name: "PromptInputAttachments", description: "A wrapping row above the text for attachment chips. Hidden while empty." },
    { name: "PromptInputBody", description: "The writing area. It draws the pencil line under the text and, while the textarea has focus, the same line again in blue felt." },
    {
      name: "PromptInputTextarea",
      description: "The textarea, set in the script font in blue felt (your hand). It grows with its text (`field-sizing`, with a script fallback for Firefox) up to `maxRows`, then scrolls. It carries `aria-controls` and `aria-activedescendant` while a suggestion list is open.",
      props: [
        { name: "minRows / maxRows", type: "number", default: "1 / 8", description: "Rows before it grows and the most it grows to." },
        { name: "placeholder", type: "string", default: '"what are we making?"', description: "" },
        { name: "name", type: "string", default: '"message"', description: "The form field name, so `new FormData(form)` works." },
      ],
    },
    { name: "PromptInputFooter", description: "The bottom row: tools on one side, the send button on the other." },
    { name: "PromptInputTools", description: "A group of tool buttons." },
    { name: "PromptInputButton", description: "A ghost `Button` (type button) for attach, voice, model. Give an icon-only one an `aria-label`." },
    { name: "PromptInputHint", description: "A line of quiet small print." },
    { name: "PromptInputSubmit", description: "Send, and stop. A paper plane that flies off on every send; a `type=\"button\"` stop button while busy. Disabled and pencilled-in while the text is empty." },
    {
      name: "PromptInputSuggestions",
      description: "A slip above the composer, open while the caret is in a trigger word. A `role=\"listbox\"`; it takes no focus (the caret stays in the textarea) and is driven from the textarea: Arrow keys move, Enter or Tab pick, Escape closes it for that word.",
      props: [
        { name: "trigger", type: "string", description: "Only open for this trigger character, so `/` and `@` can each have a list." },
        { name: "open", type: "boolean", description: "Force it open or shut, for example `open={items.length > 0}`: a listbox without options is not valid." },
      ],
    },
    {
      name: "PromptInputSuggestion",
      description: "One `role=\"option\"`. Highlighted with a highlighter swipe when active (hover or keyboard).",
      props: [
        { name: "onSelect", type: "() => void", description: "Runs on click, Enter or Tab. The usual body is `replaceTrigger(\"/summarize\")` from `usePromptInput()`." },
        { name: "disabled", type: "boolean", description: "Skipped by the arrow keys." },
      ],
    },
    { name: "usePromptInput", description: "The composer's state and actions inside it: `value`, `setValue`, `status`, `submit()`, `stop()`, `focus()`, `trigger` ({ char, query, from, to } or null), `replaceTrigger(text)`, `dismissTrigger()`." },
  ],
  a11y: [
    "Enter and Shift+Enter behave like every chat box; neither fires while an IME composition is open (`isComposing`, the composition events and the Safari keyCode 229 quirk are all checked).",
    "The textarea is named \"Message\" unless you label it (`aria-label`, `aria-labelledby`, or an `id` for a `<label htmlFor>`): a placeholder is not a name. While a suggestion list is open it exposes `aria-controls` and `aria-activedescendant`; the list is a `listbox` of `option`s with `aria-selected`.",
    "The submit button is named 'Send message' and, while busy, 'Stop generating' (and then it is a real `type=\"button\"`). The form is deliberately not `aria-busy` (some screen readers would skip the textarea and the Stop button); it carries `data-status`. If the keyboard is on Stop when the reply ends, the focus moves back to the writing line.",
    "Status and errors are yours to announce (a live region in the chat); the composer keeps focus in the textarea after a send.",
    "The paper plane's flight is decoration: with reduced motion the animation ends on the plane at rest. Ink on the napkin is 14:1, the placeholder is graphite (5.9:1).",
  ],
  usage: `import { Icon } from "@/components/ui/icon"
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ui/prompt-input"

export function Composer({ send, stop, status }: { send: (text: string) => void; stop: () => void; status: "ready" | "streaming" }) {
  return (
    <PromptInput onSubmit={(text) => send(text)} onStop={stop} status={status}>
      <PromptInputBody>
        <PromptInputTextarea aria-label="Message" />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputButton size="icon-sm" aria-label="Attach a file"><Icon name="paperclip" /></PromptInputButton>
        </PromptInputTools>
        <PromptInputSubmit />
      </PromptInputFooter>
    </PromptInput>
  )
}`,
  related: ["message-scroller", "attachment", "bubble", "textarea", "button"],
} satisfies ComponentDoc
