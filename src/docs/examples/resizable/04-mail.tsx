import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, usePanelRef } from "@/components/ui/resizable"

export const meta = {
  title: "Mail layout",
  description: "A real screen: an inbox that collapses to nothing (a button, and dragging it past its minimum, both do it), a message and a details column. Collapsing uses the panel's imperative API.",
  layout: "center" as const,
}

const mails = [
  ["Ada", "Tabs landed"],
  ["Jo", "Table rules, by hand"],
  ["Mika", "Redrew the ticks"],
  ["Sam", "September invoice"],
] as const

export default function Example() {
  const inbox = usePanelRef()
  const [open, setOpen] = React.useState(0)
  const [collapsed, setCollapsed] = React.useState(false)
  return (
    <Card seed="mail" className="w-full max-w-3xl py-0">
      <ResizablePanelGroup orientation="horizontal" className="h-80">
        <ResizablePanel
          id="inbox"
          panelRef={inbox}
          collapsible
          collapsedSize="0%"
          defaultSize="30%"
          minSize="20%"
          onResize={(size) => setCollapsed(size.asPercentage === 0)}
        >
          <ul inert={collapsed} className="grid gap-1 p-3 text-sm">
            <li className="mb-1 font-script text-xl font-semibold">Inbox</li>
            {mails.map(([from, subject], i) => (
              <li key={from}>
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-current={open === i ? "true" : undefined}
                  className="w-full px-2 py-1.5 text-start hover:ll-swipe focus-visible:ll-swipe aria-[current=true]:ll-swipe"
                >
                  <span className="block font-bold">{from}</span>
                  <span className="block text-muted-foreground">{subject}</span>
                </button>
              </li>
            ))}
          </ul>
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Resize the inbox" />
        <ResizablePanel id="message" defaultSize="45%" minSize="30%">
          <div className="grid gap-2 p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  const shut = inbox.current?.isCollapsed() ?? collapsed
                  if (shut) inbox.current?.expand()
                  else inbox.current?.collapse()
                  setCollapsed(!shut)
                }}
              >
                <Icon name="panel-left" />
                <span className="sr-only">{collapsed ? "Show the inbox" : "Hide the inbox"}</span>
              </Button>
              <h3 className="font-script text-2xl leading-none font-semibold">{mails[open][1]}</h3>
            </div>
            <p className="text-sm text-muted-foreground">From {mails[open][0]}. The rules are pulled once and printed by CSS, so a hundred rows cost no drawings.</p>
            <p className="text-sm text-muted-foreground">Drag the seams, or focus one and press the arrow keys. Enter puts the inbox away and brings it back.</p>
          </div>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize the details" />
        <ResizablePanel id="details" defaultSize="25%" minSize="15%">
          <div className="grid gap-1 p-4 text-sm text-muted-foreground">
            <div className="font-bold text-foreground">Details</div>
            <div>From {mails[open][0]}</div>
            <div>Received 09:41</div>
            <div>Pencil, 1 page</div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Card>
  )
}
