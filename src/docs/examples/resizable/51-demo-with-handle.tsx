import { Paper } from "@/components/ui/paper"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export const meta = {
  title: "Demo with handle",
  description:
    "Official `resizable-demo-with-handle`: the same layout with `withHandle`, which puts a small paper tab with a grip on each seam. The tab turns with the seam, so the column's seam is horizontal and its grip lies down.",
  layout: "center" as const,
  height: 300,
}

export default function Example() {
  return (
    <Paper stock="slip" tilt={false} className="w-full max-w-md md:min-w-[450px]">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="50%">
          <div className="flex h-[200px] items-center justify-center p-6">
            <span className="font-semibold">One</span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Resize the first panel" />
        <ResizablePanel defaultSize="50%">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize="25%">
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Two</span>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle aria-label="Resize the second panel" />
            <ResizablePanel defaultSize="75%">
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Three</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Paper>
  )
}
