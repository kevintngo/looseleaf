import * as React from "react"

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "Format menu that acts",
  description: "Controlled rows change the page under the bar: bold and italic are ticked rows, the paper is a radio group. Every state lives in your component; the menus just report it.",
  layout: "center" as const,
  height: 420,
  stage: "desk" as const,
}

export default function Example() {
  const [bold, setBold] = React.useState(false)
  const [italic, setItalic] = React.useState(false)
  const [paper, setPaper] = React.useState<"ruled" | "graph" | "none">("ruled")

  return (
    <div className="grid w-full max-w-md gap-4">
      <Menubar seed="editor" className="w-full">
        <MenubarMenu>
          <MenubarTrigger>Format</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Text</MenubarLabel>
            <MenubarCheckboxItem checked={bold} onCheckedChange={setBold}>
              Bold <MenubarShortcut>⌘B</MenubarShortcut>
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={italic} onCheckedChange={setItalic}>
              Italic <MenubarShortcut>⌘I</MenubarShortcut>
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Paper</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value={paper} onValueChange={(v) => setPaper(v as typeof paper)}>
              <MenubarRadioItem value="ruled">Ruled</MenubarRadioItem>
              <MenubarRadioItem value="graph">Graph</MenubarRadioItem>
              <MenubarRadioItem value="none">Plain</MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarSeparator />
            <MenubarLabel>Shown under your writing</MenubarLabel>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <Paper stock={paper === "graph" ? "graph" : "paper"} rules={paper} seed="editor-page" className={`min-h-40 p-6 ${paper === "ruled" ? "pt-4 ps-14" : ""}`}>
        <p className={`font-hand text-lg ${bold ? "font-bold" : ""} ${italic ? "italic" : ""}`}>Things to buy: ink, a good eraser, tape.</p>
      </Paper>
    </div>
  )
}
