import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "collapsible",
  title: "Collapsible",
  category: "Layout",
  description:
    "One panel that folds away behind a trigger. Minimal by design: the panel slides, and if you ask for it, writes a margin brace beside its text. The chevron indicator turns over the same way the accordion's does.",
  status: "stable",
  upstream: "collapsible",
  parts: [
    {
      name: "Collapsible",
      description: "The Radix Collapsible root (also `group/collapsible`, for your own state-dependent classes).",
      props: [
        { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open: boolean) => void", description: "Controlled and uncontrolled state." },
        { name: "disabled", type: "boolean", default: "false", description: "The trigger stops toggling." },
      ],
    },
    { name: "CollapsibleTrigger", description: "Any button (use `asChild` with a Button). Radix sets `aria-expanded` and `aria-controls` on it. It carries `group/collapsible-trigger`, which is what the indicator inside it reads its state from, so collapsibles can nest." },
    {
      name: "CollapsibleContent",
      description: "The panel. It slides open and shut with a height animation that clips the text only while it moves, so a focus ring or ink bleed inside an open panel is never cut (upstream's animated `overflow-hidden` cuts it for good).",
      props: [{ name: "bracket", type: '"curly" | "square" | false', default: "false", description: "Draw a margin bracket beside the opened content and let the text soak in. Wraps the children in one element." }],
    },
    { name: "CollapsibleIndicator", description: "A hand-drawn chevron that turns over when the Collapsible is open. Put it inside the trigger; it takes the props of an Icon (`size`, `className`, `label`)." },
  ],
  a11y: [
    "The trigger is a button with `aria-expanded` and `aria-controls`; Enter and Space toggle it. Closed content is not rendered.",
    "Give the trigger a name: visible text, or a `sr-only` span when it is an icon button.",
    "The brace and the chevron are decoration (aria-hidden); state is told by aria-expanded.",
    "Reduced motion opens and closes the panel at once.",
  ],
  usage: `import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleIndicator, CollapsibleTrigger } from "@/components/ui/collapsible"

export function Example() {
  return (
    <Collapsible className="w-[350px]">
      <CollapsibleTrigger asChild>
        <Button variant="link">
          Show details
          <CollapsibleIndicator />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent bracket="curly">Folded away until you ask.</CollapsibleContent>
    </Collapsible>
  )
}`,
  related: ["accordion", "card", "button"],
} satisfies ComponentDoc
