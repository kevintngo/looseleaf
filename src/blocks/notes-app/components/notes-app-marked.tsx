import * as React from "react"

import { Annotate, type AnnotateType } from "@/components/ui/annotate"
import { parseLine, type MarkKind } from "@/blocks/notes-app/components/notes-app-data"

export const MARK_LOOK: Record<MarkKind, { type: AnnotateType; color: "yellow" | "blue" | "red"; kind?: "wavy" }> = {
  highlight: { type: "highlight", color: "yellow" },
  underline: { type: "underline", color: "blue", kind: "wavy" },
  circle: { type: "circle", color: "red" },
  strike: { type: "strike-through", color: "red" },
}

export function NotesAppMarked({ body, seed }: { body: string; seed: string }) {
  return (
    <div className="text-[17px] leading-7 wrap-break-word">
      {body.split("\n").map((line, i) => (
        <div key={i} className="min-h-7">
          {parseLine(line).map((piece, j) => {
            if (!piece.mark) return <React.Fragment key={j}>{piece.text}</React.Fragment>
            const look = MARK_LOOK[piece.mark]
            return (
              <Annotate key={j} type={look.type} color={look.color} kind={look.kind} seed={`${seed}:${i}:${j}`}>
                {piece.text}
              </Annotate>
            )
          })}
        </div>
      ))}
    </div>
  )
}
