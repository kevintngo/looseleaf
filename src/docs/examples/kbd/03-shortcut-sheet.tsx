import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"

export const meta = {
  title: "A shortcut sheet",
  description:
    "Kbd next to the things it triggers: a search field that says how to reach it, and a cheat sheet in a card. The muted keys stay quiet; the words next to them do the talking.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const shortcuts = [
  { what: "Open the command palette", keys: ["Ctrl", "K"] },
  { what: "Save the page", keys: ["Ctrl", "S"] },
  { what: "Toggle the sidebar", keys: ["Ctrl", "B"] },
  { what: "Find in page", keys: ["Ctrl", "F"] },
  { what: "Close whatever is open", keys: ["Esc"] },
] as const

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md" seed="shortcuts">
      <CardHeader>
        <CardTitle>Keyboard shortcuts</CardTitle>
        <CardDescription>Everything you can do without lifting a hand.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="relative">
          <Input placeholder="Search shortcuts" aria-label="Search shortcuts" className="pe-14" />
          <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center">
            <Kbd>/</Kbd>
          </span>
        </div>
        <ul className="flex flex-col">
          {shortcuts.map((s, i) => (
            <li key={s.what}>
              {i > 0 && <Separator variant="dashed" className="my-2" />}
              <div className="flex items-center justify-between gap-4">
                <span className="text-[15px]">{s.what}</span>
                <KbdGroup>
                  {s.keys.map((k, j) => (
                    <span key={k} className="inline-flex items-center gap-1">
                      {j > 0 && <span className="text-sm text-muted-foreground">+</span>}
                      <Kbd>{k}</Kbd>
                    </span>
                  ))}
                </KbdGroup>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
