"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Confetti } from "@/components/ui/confetti"
import { Mascot } from "@/components/ui/mascot"
import { Progress } from "@/components/ui/progress"
import { Stamp } from "@/components/ui/stamp"
import { Tally } from "@/components/ui/tally"
import { Onboarding01Steps, STEPS } from "@/blocks/onboarding-01/components/onboarding-01-steps"

type Onboarding01Props = {
  defaultDone?: string[]
  onDoneChange?: (done: string[]) => void
  onAction?: (id: string) => void
}

export default function Onboarding01({ defaultDone = ["name", "invite"], onDoneChange, onAction }: Onboarding01Props) {
  const titleId = React.useId()
  const [done, setDone] = React.useState<Record<string, boolean>>(() => Object.fromEntries(STEPS.map((s) => [s.id, defaultDone.includes(s.id)])))
  const [hidden, setHidden] = React.useState(false)
  const heading = React.useRef<HTMLHeadingElement>(null)
  const showAgain = React.useRef<HTMLButtonElement>(null)
  const folded = React.useRef(false)
  React.useEffect(() => {
    if (!folded.current) return
    folded.current = false
    if (hidden) showAgain.current?.focus()
    else heading.current?.focus()
  }, [hidden])
  const fold = (next: boolean) => {
    folded.current = true
    setHidden(next)
  }
  const count = STEPS.filter((s) => done[s.id]).length
  const all = count === STEPS.length

  const change = (id: string, value: boolean) => {
    const next = { ...done, [id]: value }
    setDone(next)
    onDoneChange?.(STEPS.filter((s) => next[s.id]).map((s) => s.id))
  }

  if (hidden) {
    return (
      <div className="@container flex w-full justify-center px-4 py-10">
        <Button ref={showAgain} type="button" variant="link" onClick={() => fold(false)}>
          Show the setup checklist ({count} of {STEPS.length} done)
        </Button>
      </div>
    )
  }

  return (
    <section aria-labelledby={titleId} className="@container w-full">
      <div className="px-7 py-10 @xl:px-8 @xl:py-14">
        <div className="relative mx-auto max-w-xl">
          <Card tape="top" tapeKind="washi-dots" seed="onboarding-card">
            <CardHeader>
              <CardTitle>
                <h2 id={titleId} ref={heading} tabIndex={-1} className="outline-none">
                  Let&rsquo;s get you set up
                </h2>
              </CardTitle>
              <CardDescription>Five small things. Tick them off as you go.</CardDescription>
              <CardAction>
                <Mascot pose={all ? "celebrate" : "write"} size={80} />
              </CardAction>
            </CardHeader>

            <CardContent className="grid gap-6">
              <div>
                <div className="mb-2 flex items-center gap-4">
                  <p role="status" className="text-[15px] text-ink-soft">
                    <span className="ll-num font-bold text-ink">{count}</span> of {STEPS.length} done
                  </p>
                  <Tally count={count} size="md" tone="blue" label={`${count} steps done`} />
                </div>
                <Progress value={count} max={STEPS.length} tone={all ? "green" : "marker"} aria-label="Setup progress" aria-valuetext={`${count} of ${STEPS.length} steps done`} />
              </div>
              <Onboarding01Steps done={done} onDoneChange={change} onAction={onAction} />
            </CardContent>

            <CardFooter className="justify-between gap-3">
              {all ? (
                <>
                  <Stamp text="All set" ink="green" w={124} h={46} tilt={-6} seed="onboarding-stamp" className="animate-in zoom-in-[1.6] fade-in-0 duration-(--ll-dur-pop)" />
                  <Button asChild>
                    <a href="#write">Start writing</a>
                  </Button>
                </>
              ) : (
                <Button type="button" variant="ghost" onClick={() => fold(true)}>
                  Skip for now
                </Button>
              )}
            </CardFooter>
          </Card>
          <Confetti active={all} count={80} />
        </div>
      </div>
    </section>
  )
}

export type { Onboarding01Props }
