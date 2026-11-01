import * as React from "react"

import { Button } from "@/components/ui/button"
import { Folder, FolderContent, FolderTab, FolderTabs } from "@/components/ui/folder"

export const meta = {
  title: "Controlled",
  description: "The open tab is your state: `value` and `onValueChange`, as on Tabs. Here a button jumps to the next one.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const months = ["Sep", "Oct", "Nov"]

export default function Example() {
  const [value, setValue] = React.useState("Sep")
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Folder value={value} onValueChange={setValue}>
        <FolderTabs aria-label="Months">
          {months.map((m) => (
            <FolderTab key={m} value={m}>
              {m}
            </FolderTab>
          ))}
        </FolderTabs>
        {months.map((m) => (
          <FolderContent key={m} value={m} seed={m}>
            <p className="font-script text-3xl leading-none font-bold">{m}</p>
            <p className="mt-2">Notes for {m}.</p>
          </FolderContent>
        ))}
      </Folder>
      <Button variant="secondary" className="self-start" onClick={() => setValue(months[(months.indexOf(value) + 1) % months.length])}>
        Next month
      </Button>
    </div>
  )
}
