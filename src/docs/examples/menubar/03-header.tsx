import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from "@/components/ui/menubar"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "App header (composed)",
  description: "A real use: the bar sits in an app header beside the title and an account button. Choosing a row reports what happened, and the bar stays one tab stop for keyboard users.",
  layout: "center" as const,
  height: 340,
  stage: "desk" as const,
}

export default function Example() {
  const [said, setSaid] = React.useState("Nothing chosen yet.")
  const pick = (what: string) => () => setSaid(what)

  return (
    <Paper stock="paper" seed="app-header" className="z-(--ll-z-raised) w-full max-w-2xl self-start px-5 pt-3 pb-4">
      <header className="flex items-center gap-3">
        <span className="flex items-center gap-2 font-script text-2xl leading-none font-semibold">
          <Icon name="book-open" size={22} /> Looseleaf
        </span>
        <Menubar seed="header" aria-label="Application">
          <MenubarMenu>
            <MenubarTrigger>Notebook</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onSelect={pick("New notebook")}>
                <Icon name="file-plus" /> New <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onSelect={pick("Opened")}>
                <Icon name="folder-open" /> Open… <MenubarShortcut>⌘O</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onSelect={pick("Saved")}>
                <Icon name="save" /> Save <MenubarShortcut>⌘S</MenubarShortcut>
              </MenubarItem>
              <MenubarItem variant="destructive" onSelect={pick("Moved to trash")}>
                <Icon name="trash" /> Move to trash
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Help</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onSelect={pick("Guide")}>
                <Icon name="life-buoy" /> Guide
              </MenubarItem>
              <MenubarItem onSelect={pick("Shortcuts")}>
                <Icon name="command" /> Shortcuts <MenubarShortcut>⌘/</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <Button variant="ghost" size="icon" className="ms-auto" aria-label="Account">
          <Icon name="circle-user" size={20} />
        </Button>
      </header>
      <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
        {said}
      </p>
    </Paper>
  )
}
