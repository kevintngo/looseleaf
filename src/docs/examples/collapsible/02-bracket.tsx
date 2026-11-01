import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleIndicator, CollapsibleTrigger } from "@/components/ui/collapsible"

export const meta = {
  title: "Margin bracket and indicator",
  description: "`bracket` writes a brace beside the opened text and lets it soak in; `CollapsibleIndicator` is the same chevron as the accordion's and turns over with the panel.",
  layout: "center" as const,
  height: 260,
}

export default function Example() {
  return (
    <Collapsible defaultOpen className="w-full max-w-sm">
      <CollapsibleTrigger asChild>
        <Button variant="link" className="px-0">
          What is in the box?
          <CollapsibleIndicator />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent bracket="curly" className="pt-2 text-sm text-muted-foreground">
        <p>One pencil stub, sharpened crooked. Three felt tips that still work. A yellow highlighter, half dry.</p>
        <p className="mt-2">A ruler with a chip out of the end.</p>
      </CollapsibleContent>
    </Collapsible>
  )
}
