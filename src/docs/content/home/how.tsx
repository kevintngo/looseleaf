import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/ui/code-block"
import { Icon } from "@/components/ui/icon"
import { addCommand, componentsJsonSnippet } from "../../core/install"
import { Link } from "../../core/router"
import { paths } from "../../core/router-core"
import { useSettings } from "../../core/settings"
import { DeskSection } from "./section"

const STEPS = [
  { n: 1, title: "Point the CLI at the registry", text: "One line in components.json, once per project." },
  { n: 2, title: "Add what you need", text: "The CLI copies the component, its drawing recipe and any packages into your repo." },
  { n: 3, title: "Import it like any shadcn part", text: "The files are yours to read, change and keep." },
]

const USAGE = `import { Button } from "@/components/ui/button"

export function Save() {
  return <Button>Save</Button>
}`

export function How() {
  const { packageManager } = useSettings()
  return (
    <DeskSection id="how" title="How it works" lede="A shadcn registry, so you already know the drill. Same command, same folders, a different hand.">
      <div className="grid items-start gap-x-12 gap-y-10 @3xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="grid gap-6">
          <ol role="list" className="grid gap-6">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span aria-hidden="true" className="ll-num grid size-11 shrink-0 place-items-center font-script text-4xl leading-none font-bold text-ink">
                  {s.n}
                </span>
                <div className="min-w-0">
                  <p className="font-script text-3xl leading-none font-bold text-ink">{s.title}</p>
                  <p className="mt-1 text-ink-soft">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div>
            <Button asChild variant="link" seed="how-guide" className="text-ink hover:text-ink">
              <Link to={paths.gettingStarted}>
                Read the installation guide
                <Icon name="arrow-right" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-10">
          <CodeBlock data-home="how-registry" code={componentsJsonSnippet()} language="json" filename="components.json" seed="how-registry" tape="corner" />
          <CodeBlock data-home="how-command" code={addCommand(packageManager, "button")} language="bash" filename="terminal" seed="how-command" tape="top" />
          <CodeBlock data-home="how-usage" code={USAGE} language="tsx" filename="save.tsx" seed="how-usage" tape="corner" />
        </div>
      </div>
    </DeskSection>
  )
}
