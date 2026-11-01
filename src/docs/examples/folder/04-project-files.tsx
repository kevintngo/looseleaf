import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Folder, FolderContent, FolderTab, FolderTabs } from "@/components/ui/folder"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Project files",
  description: "A real page: a project's tasks, notes and files as tabs on one folder, with a form inside the open panel. Each panel is ordinary DOM; only the open one is in the page.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 420,
}

const tasks = ["Ink the outline", "Wash the sky", "Hatch the shade", "Sign it"]

export default function Example() {
  return (
    <Folder defaultValue="tasks" className="mx-auto">
      <FolderTabs aria-label="Project files">
        <FolderTab value="tasks">Tasks</FolderTab>
        <FolderTab value="notes">Notes</FolderTab>
        <FolderTab value="files">Files</FolderTab>
      </FolderTabs>
      <FolderContent value="tasks" seed="tasks" fastener="clip">
        <fieldset className="space-y-2">
          <legend className="mb-3 font-script text-3xl leading-none font-bold">Tasks</legend>
          {tasks.map((t, i) => (
            <div key={t} className="flex items-center gap-3">
              <Checkbox id={`task-${i}`} defaultChecked={i < 2} />
              <Label htmlFor={`task-${i}`}>{t}</Label>
            </div>
          ))}
        </fieldset>
        <Button size="sm" className="mt-5">
          Add a task
        </Button>
      </FolderContent>
      <FolderContent value="notes" seed="notes">
        <p className="font-script text-3xl leading-none font-bold">Notes</p>
        <p className="mt-2">Nothing here yet. The best notes are in the margins.</p>
      </FolderContent>
      <FolderContent value="files" seed="files">
        <p className="font-script text-3xl leading-none font-bold">Files</p>
        <p className="mt-2">outline.pdf, sky.png, shade-study.png</p>
      </FolderContent>
    </Folder>
  )
}
