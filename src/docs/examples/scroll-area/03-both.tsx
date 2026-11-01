import { Paper } from "@/components/ui/paper"
import { ScrollArea } from "@/components/ui/scroll-area"

export const meta = {
  title: "Both directions",
  description: "`orientation=\"both\"` shows both marks (here `type=\"always\"`, so they stay in view); the corner where they meet stays empty. A scroll container with nothing focusable inside is reachable by keyboard in current browsers; the viewport draws a blue ring inside its edge when it has focus.",
  layout: "center" as const,
  height: 300,
}

export default function Example() {
  return (
    <Paper stock="paper" seed="grid" className="h-64 w-80">
      <ScrollArea orientation="both" type="always" className="size-full">
        <div className="grid w-[640px] grid-cols-8 gap-0 p-3 font-mono text-xs">
          {Array.from({ length: 96 }, (_, i) => (
            <span key={i} className="grid h-14 place-items-center border border-pencil-mark/50">
              {(i % 8) + 1}·{Math.floor(i / 8) + 1}
            </span>
          ))}
        </div>
      </ScrollArea>
    </Paper>
  )
}
