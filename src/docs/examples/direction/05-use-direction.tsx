import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DirectionProvider, useDirection } from "@/components/ui/direction"
import { Icon } from "@/components/ui/icon"
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"

export const meta = {
  title: "useDirection and islands",
  description:
    "Your own widgets can read the direction too. This pager decides which arrow key goes forward from useDirection(), and its arrow drawings flip themselves. The English block is a left-to-right island inside the Hebrew page: it has its own provider, and its popover opens left to right.",
  layout: "center" as const,
  height: 460,
}

function Pager({ pages, label }: { pages: number; label: string }) {
  const dir = useDirection()
  const [page, setPage] = React.useState(1)
  const go = (by: number) => setPage((p) => Math.min(pages, Math.max(1, p + by)))
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-2"
      onKeyDown={(e) => {
        const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight"
        const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft"
        if (e.key === forward) go(1)
        else if (e.key === back) go(-1)
        else return
        e.preventDefault()
      }}
    >
      <Button variant="outline" size="icon-sm" disabled={page === 1} onClick={() => go(-1)} aria-label={dir === "rtl" ? "הקודם" : "Previous"}>
        <Icon name="arrow-left" />
      </Button>
      <span className="ll-num min-w-16 text-center text-sm">
        {page} / {pages}
      </span>
      <Button variant="outline" size="icon-sm" disabled={page === pages} onClick={() => go(1)} aria-label={dir === "rtl" ? "הבא" : "Next"}>
        <Icon name="arrow-right" />
      </Button>
    </div>
  )
}

export default function Example() {
  return (
    <DirectionProvider direction="rtl">
      <Card lang="he" seed="direction-island" className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ציטוט מהמחברת</CardTitle>
          <CardDescription>הכותרת בעברית והציטוט באנגלית. לחצו על חץ כדי לדפדף.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <Pager pages={5} label="דפי המחברת" />
          <DirectionProvider direction="ltr" lang="en" className="grid gap-3 border-s-2 border-dashed border-pencil-mark ps-3">
            <blockquote className="font-script text-xl">Draw the thing you can see, then the thing you meant.</blockquote>
            <div className="flex items-center gap-3">
              <Pager pages={3} label="Quote pages" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="About this quote">
                    <Icon name="info" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60" seed="direction-island-popover" aria-label="About this quote">
                  <PopoverTitle>Left to right</PopoverTitle>
                  <PopoverDescription>This slip opens outside the island, so it is told its direction and carries dir="ltr" itself.</PopoverDescription>
                </PopoverContent>
              </Popover>
            </div>
          </DirectionProvider>
        </CardContent>
      </Card>
    </DirectionProvider>
  )
}
