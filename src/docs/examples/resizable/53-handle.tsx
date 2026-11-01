import { Paper } from "@/components/ui/paper"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export const meta = {
  title: "Handle",
  description:
    "Official `resizable-handle`: a narrow sidebar panel beside the content with the grip tab on the seam. This is the shape most apps start from; add `minSize` and `maxSize` on the panels to keep either side usable.",
  layout: "center" as const,
  height: 300,
}

export default function Example() {
  return (
    <Paper stock="slip" tilt={false} className="w-full max-w-md md:min-w-[450px]">
      <ResizablePanelGroup orientation="horizontal" className="min-h-[200px]">
        <ResizablePanel defaultSize="25%">
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Sidebar</span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Resize the sidebar" />
        <ResizablePanel defaultSize="75%">
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Content</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Paper>
  )
}
