import { Paper } from "@/components/ui/paper"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export const meta = {
  title: "Vertical, without a tab",
  description: "`orientation=\"vertical\"` stacks the panels and turns the seam; without `withHandle` the seam is only stitches. The middle panel has a minimum and a maximum, so the seams stop where the limits are.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <Paper stock="slip" tilt={false} seed="vertical" className="w-full max-w-sm">
      <ResizablePanelGroup orientation="vertical" className="h-72">
        <ResizablePanel defaultSize="20%" minSize="10%">
          <div className="flex h-full items-center px-4 font-bold">Header</div>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize the header" />
        <ResizablePanel defaultSize="55%" minSize="30%" maxSize="70%">
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">The middle keeps between 30% and 70%.</div>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize the footer" />
        <ResizablePanel defaultSize="25%" minSize="10%">
          <div className="flex h-full items-center px-4 text-sm text-muted-foreground">Footer</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Paper>
  )
}
