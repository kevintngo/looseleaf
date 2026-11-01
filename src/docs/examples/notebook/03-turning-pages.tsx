import { Notebook, NotebookPage, NotebookTitle, NotebookTurn } from "@/components/ui/notebook"

export const meta = {
  title: "Turning pages",
  description: "`curl` folds the corner and `NotebookTurn` is the button over it. Pages are named with `value`; only the current one is shown, and a turned page unfolds from the dog-ear (a clip-path wipe, no 3D).",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Notebook as="section" curl defaultValue="mon" seed="week" className="mx-auto min-h-[22rem] w-full max-w-md" aria-label="The week">
      <NotebookPage value="mon">
        <NotebookTitle>Monday</NotebookTitle>
        <p>Rain on the window.</p>
        <p>Tea, then the outline.</p>
      </NotebookPage>
      <NotebookPage value="tue">
        <NotebookTitle>Tuesday</NotebookTitle>
        <p>Wash the sky, wait.</p>
        <p>Post the parcel by five.</p>
      </NotebookPage>
      <NotebookPage value="wed">
        <NotebookTitle>Wednesday</NotebookTitle>
        <p>Hatch the shade.</p>
        <p>Nothing else. Nothing.</p>
      </NotebookPage>
      <NotebookTurn to="tue">Next page</NotebookTurn>
    </Notebook>
  )
}
