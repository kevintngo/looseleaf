import { Paper } from "@/components/ui/paper"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export const meta = {
  title: "Vertical",
  description:
    "Official `resizable-vertical`: `orientation=\"vertical\"` stacks a header over the content with one horizontal seam. Arrow Up and Down move it from the keyboard.",
  layout: "center" as const,
  height: 300,
}

export default function Example() {
  return (
    <Paper stock="slip" tilt={false} className="w-full max-w-md md:min-w-[450px]">
      <ResizablePanelGroup orientation="vertical" className="min-h-[200px]">
        <ResizablePanel defaultSize="25%">
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Header</span>
          </div>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize the header" />
        <ResizablePanel defaultSize="75%">
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Content</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Paper>
  )
}
