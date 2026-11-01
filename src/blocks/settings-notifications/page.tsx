"use client"

import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Icon } from "@/components/ui/icon"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Page, PageDescription, PageHeader, PageTitle } from "@/components/ui/page"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  CHANNELS,
  DAYS,
  DEFAULT_PREFS,
  EVENTS,
  MODES,
  TIMES,
  rowEnabled,
  validate,
  type Channel,
  type Mode,
  type Prefs,
  type Problems,
} from "@/blocks/settings-notifications/components/settings-notifications-data"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  defaultValue?: Prefs
  onSave?: (prefs: Prefs) => void | Promise<void>
  onTest?: (prefs: Prefs) => void | Promise<void>
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  const id = React.useId()
  return (
    <div role="group" aria-labelledby={id} className="grid gap-x-10 gap-y-4 @2xl/settings:grid-cols-[13rem_minmax(0,1fr)]">
      <div className="grid content-start gap-1">
        <h3 id={id} className="font-script text-[1.6rem] leading-none font-bold">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid min-w-0 gap-4">{children}</div>
    </div>
  )
}

export default function SettingsNotifications({ className, defaultValue = DEFAULT_PREFS, onSave, onTest }: Props) {
  const [prefs, setPrefs] = React.useState<Prefs>(defaultValue)
  const [problems, setProblems] = React.useState<Problems>({})
  const [status, setStatus] = React.useState<"idle" | "saved" | "tested">("idle")
  const [busy, setBusy] = React.useState(false)
  const [failure, setFailure] = React.useState("")
  const ids = React.useId()

  const change = (next: Prefs) => {
    setPrefs(next)
    setStatus("idle")
    setProblems({})
    setFailure("")
  }

  const toggle = (event: string, channel: Channel, on: boolean) => {
    const now = prefs.on[event] ?? []
    change({ ...prefs, on: { ...prefs.on, [event]: on ? [...now.filter((c) => c !== channel), channel] : now.filter((c) => c !== channel) } })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate(prefs)
    setProblems(found)
    if (found.channels || found.quiet) return
    setBusy(true)
    setFailure("")
    try {
      await onSave?.(prefs)
      setStatus("saved")
    } catch (err) {
      setFailure(err instanceof Error && err.message ? err.message : "Your choices were not saved. Nothing has changed, so try again in a moment.")
    } finally {
      setBusy(false)
    }
  }

  const muted = prefs.mode === "nothing"

  return (
    <div className="w-full overflow-x-clip px-2">
      <Page as="section" width="xl" torn="top" seed="settings-notifications" aria-labelledby={`${ids}-title`} className={cn("my-6", className)}>
        <PageHeader>
          <PageTitle as="h2" id={`${ids}-title`} underline="wavy" seed="notify-title">
            Notifications
          </PageTitle>
          <PageDescription>Decide what is worth a tap on the shoulder, and where it arrives. Everything is quiet until you say otherwise.</PageDescription>
        </PageHeader>

        <form noValidate onSubmit={save} aria-label="Notification settings" className="@container/settings grid gap-8">
          <Section title="How much" description="The biggest dial. The boxes below fine-tune it.">
            <RadioGroup value={prefs.mode} onValueChange={(v) => change({ ...prefs, mode: v as Mode })} aria-label="How much to hear about" className="gap-3">
              {MODES.map((m) => (
                <FieldLabel key={m.id} htmlFor={`${ids}-mode-${m.id}`}>
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>{m.title}</FieldTitle>
                      <FieldDescription>{m.help}</FieldDescription>
                    </FieldContent>
                    <RadioGroupItem value={m.id} id={`${ids}-mode-${m.id}`} />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
          </Section>

          <Separator variant="dashed" />

          <Section title="What goes where" description="Tick a box to send that kind of news by that route.">
            <Table aria-label="What goes where">
              <TableHeader>
                <TableRow>
                  <TableHead>News</TableHead>
                  {CHANNELS.map((c) => (
                    <TableHead key={c.id} className="w-14 px-1 text-center leading-tight whitespace-normal @xl/settings:w-24 @xl/settings:px-3">
                      {c.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {EVENTS.map((ev) => {
                  const live = rowEnabled(prefs.mode, ev.personal)
                  return (
                    <TableRow key={ev.id} className={cn(!live && "opacity-60")}>
                      <TableCell className="whitespace-normal">
                        <p className="font-bold">{ev.label}</p>
                        <p className="text-sm font-normal text-muted-foreground">{live ? ev.help : muted ? "Muted above." : "Only about you, so not sent in “Just me”."}</p>
                      </TableCell>
                      {CHANNELS.map((c) => (
                        <TableCell key={c.id} className="px-1 text-center [&:has([role=checkbox])]:pe-1 @xl/settings:px-3 @xl/settings:[&:has([role=checkbox])]:pe-3">
                          <Checkbox
                            aria-label={`${ev.label} by ${c.label.toLowerCase()}`}
                            checked={(prefs.on[ev.id] ?? []).includes(c.id)}
                            disabled={!live}
                            aria-invalid={!!problems.channels && live}
                            onCheckedChange={(v) => toggle(ev.id, c.id, v === true)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <FieldError>{problems.channels}</FieldError>
          </Section>

          <Separator variant="dashed" />

          <Section title="Quiet hours" description="Nothing buzzes, nothing pings. It all waits in the app.">
            <FieldGroup>
              <Field orientation="horizontal" data-disabled={muted || undefined}>
                <FieldContent>
                  <FieldLabel htmlFor={`${ids}-quiet`}>Hush the desk at night</FieldLabel>
                  <FieldDescription>Push and email are held back; the in-app list keeps filling.</FieldDescription>
                </FieldContent>
                <Switch id={`${ids}-quiet`} checked={prefs.quiet.on && !muted} disabled={muted} onCheckedChange={(on) => change({ ...prefs, quiet: { ...prefs.quiet, on } })} />
              </Field>
              {prefs.quiet.on && !muted ? (
                <>
                  <div className="grid gap-4 @xl/settings:grid-cols-2">
                    {(["from", "to"] as const).map((k) => (
                      <Field key={k} data-invalid={!!problems.quiet || undefined}>
                        <FieldLabel htmlFor={`${ids}-${k}`}>{k === "from" ? "From" : "Until"}</FieldLabel>
                        <NativeSelect id={`${ids}-${k}`} value={prefs.quiet[k]} aria-invalid={!!problems.quiet} onChange={(e) => change({ ...prefs, quiet: { ...prefs.quiet, [k]: e.target.value } })}>
                          {TIMES.map((t) => (
                            <NativeSelectOption key={t.value} value={t.value}>
                              {t.label}
                            </NativeSelectOption>
                          ))}
                        </NativeSelect>
                      </Field>
                    ))}
                  </div>
                  <Field data-invalid={!!problems.quiet || undefined}>
                    <FieldLabel id={`${ids}-days`}>On these days</FieldLabel>
                    <ToggleGroup
                      type="multiple"
                      variant="outline"
                      aria-labelledby={`${ids}-days`}
                      value={prefs.quiet.days}
                      onValueChange={(days) => change({ ...prefs, quiet: { ...prefs.quiet, days } })}
                      className="w-fit!"
                    >
                      {DAYS.map((d) => (
                        <ToggleGroupItem key={d.id} value={d.id} aria-label={d.label}>
                          {d.short}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    <FieldError>{problems.quiet}</FieldError>
                  </Field>
                </>
              ) : null}
            </FieldGroup>
          </Section>

          <Separator variant="dashed" />

          <Section title="Weekly summary" description="One email that says what you wrote and who read it.">
            <FieldGroup>
              <Field data-disabled={muted || undefined}>
                <FieldLabel htmlFor={`${ids}-day`}>Send it on</FieldLabel>
                <Select value={prefs.summary.day} disabled={muted} onValueChange={(day) => change({ ...prefs, summary: { ...prefs.summary, day } })}>
                  <SelectTrigger id={`${ids}-day`} className="w-full @xl/settings:w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {DAYS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field orientation="horizontal" data-disabled={muted || undefined}>
                <Checkbox id={`${ids}-tally`} checked={prefs.summary.tally} disabled={muted} onCheckedChange={(v) => change({ ...prefs, summary: { ...prefs.summary, tally: v === true } })} />
                <FieldContent>
                  <FieldLabel htmlFor={`${ids}-tally`}>Count my pages in tally marks</FieldLabel>
                  <FieldDescription>Four strokes and a slash, the way you keep score.</FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </Section>

          {failure ? (
            <Alert variant="destructive">
              <Icon name="circle-alert" />
              <AlertTitle>That did not go through</AlertTitle>
              <AlertDescription>{failure}</AlertDescription>
            </Alert>
          ) : null}

          {status === "tested" ? (
            <Alert variant="success">
              <Icon name="circle-check" />
              <AlertTitle>A test note is on its way</AlertTitle>
              <AlertDescription>It follows the choices above, so if it does not arrive, look at what is ticked.</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" aria-busy={busy}>
              {busy ? "Saving…" : "Save preferences"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                setFailure("")
                try {
                  await onTest?.(prefs)
                  setStatus("tested")
                } catch (err) {
                  setFailure(err instanceof Error && err.message ? err.message : "The test note could not be sent. Try again in a moment.")
                }
              }}
            >
              Send a test
            </Button>
            <p role="status" className="flex items-center gap-2 text-sm font-bold text-green">
              {status === "saved" ? (
                <>
                  <Icon name="circle-check" />
                  Saved. We will follow these from now on.
                </>
              ) : null}
            </p>
          </div>
        </form>
      </Page>
    </div>
  )
}
