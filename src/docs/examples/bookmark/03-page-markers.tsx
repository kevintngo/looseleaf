import { BookmarkRibbon } from "@/components/ui/bookmark"
import { Notebook, NotebookPage, NotebookTitle } from "@/components/ui/notebook"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "Page markers",
  description: "`BookmarkRibbon` is the ribbon with no behaviour: decoration that hangs out of the top of a sheet or a notebook.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="grid gap-12 p-6 md:grid-cols-2">
      <Paper seed="marked" className="relative min-h-40 p-6">
        <BookmarkRibbon className="absolute -top-1 end-6" seed="r1" />
        <p className="font-script text-2xl leading-none font-bold">Chapter three</p>
        <p className="mt-2">where the ribbon marks the page</p>
      </Paper>
      <Notebook seed="nb" className="min-h-40">
        <BookmarkRibbon tone="teal" className="absolute -top-1 end-10" seed="r2" />
        <NotebookPage>
          <NotebookTitle>Marked</NotebookTitle>
          <p>a ribbon in the notebook</p>
        </NotebookPage>
      </Notebook>
    </div>
  )
}
