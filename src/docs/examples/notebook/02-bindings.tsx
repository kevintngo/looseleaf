import { Notebook, NotebookPage, NotebookTitle } from "@/components/ui/notebook"

export const meta = {
  title: "Four bindings",
  description: "A wire spiral, binder rings, a stab-stitched spine in tomato thread, and a reporter's pad bound on top. Each is a different drawing; the holes are punched through and the desk shows in them.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="@container w-full">
      <div className="grid gap-x-10 gap-y-12 p-2 @2xl:grid-cols-2">
        <Notebook binding="spiral" pages={2} seed="spiral" className="min-h-64">
          <NotebookPage>
            <NotebookTitle>Spiral</NotebookTitle>
            <p>a coil for every hole</p>
          </NotebookPage>
        </Notebook>
        <Notebook binding="rings" pages={3} seed="rings" className="min-h-64">
          <NotebookPage>
            <NotebookTitle>Rings</NotebookTitle>
            <p>rings on a steel strip</p>
          </NotebookPage>
        </Notebook>
        <Notebook binding="stitched" tone="tomato" pages={1} seed="stitched" className="min-h-64">
          <NotebookPage>
            <NotebookTitle>Stitched</NotebookTitle>
            <p>a running thread</p>
          </NotebookPage>
        </Notebook>
        <Notebook binding="spiral" side="top" tone="sky" seed="top" className="min-h-64">
          <NotebookPage>
            <NotebookTitle>Reporter pad</NotebookTitle>
            <p>call the printer before ten</p>
          </NotebookPage>
        </Notebook>
      </div>
    </div>
  )
}
