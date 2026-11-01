import { Paper } from "@/components/ui/paper"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export const meta = {
  title: "Demo",
  description:
    "Official `resizable-demo`: a row of two panels, the second split into a column. shadcn draws its `rounded-lg border` on the group; here the group sits on a slip of paper instead (the group clips, so it cannot wear a shadow itself). Drag a seam, or focus it and use the arrow keys.",
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
        <ResizableHandle aria-label="Resize the first panel" />
        <ResizablePanel defaultSize="50%">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize="25%">
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Two</span>
              </div>
            </ResizablePanel>
            <ResizableHandle aria-label="Resize the second panel" />
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
