import { Kbd, KbdGroup } from "@/components/ui/kbd"

export const meta = {
  title: "Modifier keys",
  description: "shadcn's `kbd-demo`: a KbdGroup of the four Mac modifiers, and a Ctrl + B written with a plain `+` between two keys. Each cap is drawn on its own, so no two are quite alike.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex flex-col items-center gap-4">
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>⌥</Kbd>
        <Kbd>⌃</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>B</Kbd>
      </KbdGroup>
    </div>
  )
}
