"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Onboarding01Step = {
  id: string
  title: string
  hint: React.ReactNode
  action: string
}

const STEPS: Onboarding01Step[] = [
  { id: "name", title: "Name your first notebook", hint: "Give it a cover and a name people will remember.", action: "Name it" },
  { id: "invite", title: "Invite a teammate", hint: "Notes are better with company.", action: "Invite" },
  { id: "pin", title: "Pin a page you love", hint: "Pinned pages sit at the top of every notebook.", action: "Show me" },
  { id: "draw", title: "Draw something, anything", hint: "Every page has a sketch pad. Stubby will not judge.", action: "Open sketch pad" },
  {
    id: "jump",
    title: "Try the shortcut",
    hint: (
      <>
        Press <Kbd>&#8984;</Kbd> <Kbd>K</Kbd> to jump to any page.
      </>
    ),
    action: "Try it",
  },
]

type Onboarding01StepsProps = {
  done: Record<string, boolean>
  onDoneChange: (id: string, done: boolean) => void
  onAction?: (id: string) => void
}

function Onboarding01Steps({ done, onDoneChange, onAction }: Onboarding01StepsProps) {
  const uid = React.useId()
  return (
    <ul className="grid list-none gap-5 @md:gap-4">
      {STEPS.map((step) => {
        const id = `${uid}-${step.id}`
        return (
          <li key={step.id} className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-x-3 gap-y-1 @md:grid-cols-[1.25rem_minmax(0,1fr)_auto]">
            <Checkbox id={id} aria-describedby={`${id}-hint`} className="mt-0.5 size-5" checked={!!done[step.id]} onCheckedChange={(v) => onDoneChange(step.id, v === true)} />
            <div className="min-w-0">
              <Label htmlFor={id} className={cn("text-[17px] leading-6 font-bold", done[step.id] && "text-ink-muted line-through")}>
                {step.title}
              </Label>
              <p id={`${id}-hint`} className="text-[15px] leading-6 text-ink-soft">
                {step.hint}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => onAction?.(step.id)} className="col-start-2 mt-1 justify-self-start @md:col-start-3 @md:row-start-1 @md:mt-0 @md:self-center">
              {step.action}
              <span className="sr-only">, {step.title.toLowerCase()}</span>
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

export { Onboarding01Steps, STEPS }
export type { Onboarding01Step }
