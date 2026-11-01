import { Folder, FolderContent, FolderTab, FolderTabs } from "@/components/ui/folder"

export const meta = {
  title: "Manila, yellow, white",
  description: "The folder is whatever its stock is: manila, a legal-pad yellow or white card. A folder with one tab is just a labelled folder.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="grid w-full gap-12 p-2">
      <Folder stock="sticky-yellow" defaultValue="one" className="max-w-xs">
        <FolderTabs aria-label="Recipes">
          <FolderTab value="one">Recipes</FolderTab>
        </FolderTabs>
        <FolderContent value="one" seed="y" tape="top">
          <p>A folder with one tab is just a labelled folder.</p>
        </FolderContent>
      </Folder>
      <Folder stock="paper" defaultValue="c">
        <FolderTabs aria-label="Photos">
          <FolderTab value="a">Sketches</FolderTab>
          <FolderTab value="b">Notes</FolderTab>
          <FolderTab value="c">Photos</FolderTab>
        </FolderTabs>
        <FolderContent value="a" seed="a">
          <p>Sketches</p>
        </FolderContent>
        <FolderContent value="b" seed="b">
          <p>Notes</p>
        </FolderContent>
        <FolderContent value="c" seed="c">
          <p>White card, three tabs, the last one open.</p>
        </FolderContent>
      </Folder>
    </div>
  )
}
