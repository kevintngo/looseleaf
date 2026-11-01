import { Kbd, KbdGroup } from "@/components/ui/kbd"

export const meta = {
  title: "Group in a sentence",
  description: "shadcn's `kbd-group`: a KbdGroup sits inline in running text. Each Kbd here holds a whole chord (\"Ctrl + B\") as one cap; compare with the separate keys in the first example.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">
        Use{" "}
        <KbdGroup>
          <Kbd>Ctrl + B</Kbd>
          <Kbd>Ctrl + K</Kbd>
        </KbdGroup>{" "}
        to open the command palette
      </p>
    </div>
  )
}
