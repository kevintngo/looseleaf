import { Icon } from "@/components/ui/icon"
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHint,
  PromptInputSubmit,
  PromptInputSuggestion,
  PromptInputSuggestions,
  PromptInputTextarea,
  usePromptInput,
} from "@/components/ui/prompt-input"

export const meta = {
  title: "Slash commands and @mentions",
  description: "The composer knows no data. `triggers` says which characters open a list, `usePromptInput().trigger` gives the word being typed, and you render the choices. Arrows move, Enter or Tab pick, Escape closes.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 420,
}

const COMMANDS = [
  { name: "summarize", hint: "Sum up the thread" },
  { name: "draw", hint: "Sketch a diagram" },
  { name: "clear", hint: "Start a fresh page" },
]
const PEOPLE = ["Ada", "Lin", "Stubby", "Grace"]

function Lists() {
  const { trigger, replaceTrigger } = usePromptInput()
  const q = (trigger?.query ?? "").toLowerCase()
  const commands = trigger?.char === "/" ? COMMANDS.filter((c) => c.name.startsWith(q)) : []
  const people = trigger?.char === "@" ? PEOPLE.filter((p) => p.toLowerCase().startsWith(q)) : []
  return (
    <>
      <PromptInputSuggestions trigger="/" aria-label="Commands" open={commands.length > 0}>
        {commands.map((c) => (
          <PromptInputSuggestion key={c.name} onSelect={() => replaceTrigger(`/${c.name}`)}>
            <Icon name="slash" size={14} />
            <span className="font-bold">{c.name}</span>
            <span className="text-muted-foreground">{c.hint}</span>
          </PromptInputSuggestion>
        ))}
      </PromptInputSuggestions>
      <PromptInputSuggestions trigger="@" aria-label="People" open={people.length > 0}>
        {people.map((p) => (
          <PromptInputSuggestion key={p} onSelect={() => replaceTrigger(`@${p}`)}>
            <Icon name="user" size={14} />
            <span className="font-bold">{p}</span>
          </PromptInputSuggestion>
        ))}
      </PromptInputSuggestions>
    </>
  )
}

export default function Example() {
  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col justify-end px-2 pt-40 pb-3">
      <PromptInput seed="mentions" triggers={[{ char: "/", atStart: true }, "@"]} defaultValue="Thanks @">
        <Lists />
        <PromptInputBody>
          <PromptInputTextarea aria-label="Message" />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputHint>Type / for commands, @ for people</PromptInputHint>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}
