"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/ui/code-block"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field"
import { Icon } from "@/components/ui/icon"
import { Page, PageDescription, PageHeader, PageTitle } from "@/components/ui/page"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  DEFAULT_APPEARANCE,
  DENSITIES,
  MOTIONS,
  PAPERS,
  THEMES,
  providerSnippet,
  type Appearance,
  type Density,
  type Direction,
  type Motion,
  type PaperChoice,
} from "@/blocks/settings-appearance/components/settings-appearance-options"
import { SettingsAppearancePreview } from "@/blocks/settings-appearance/components/settings-appearance-preview"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  value?: Appearance
  defaultValue?: Appearance
  onValueChange?: (value: Appearance) => void
}

export default function SettingsAppearance({ className, value, defaultValue = DEFAULT_APPEARANCE, onValueChange }: Props) {
  const [inner, setInner] = React.useState<Appearance>(defaultValue)
  const a = value ?? inner
  const ids = React.useId()
  const set = (patch: Partial<Appearance>) => {
    const next = { ...a, ...patch }
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }
  const isDefault = JSON.stringify(a) === JSON.stringify(DEFAULT_APPEARANCE)

  return (
    <div className="w-full overflow-x-clip px-2">
      <Page as="section" width="xl" holes="top" seed="settings-appearance" aria-labelledby={`${ids}-title`} className={cn("my-6", className)}>
        <PageHeader>
          <PageTitle as="h2" id={`${ids}-title`} underline="highlight" seed="appearance-title">
            Appearance
          </PageTitle>
          <PageDescription>How the desk feels. Choices apply to the preview straight away; the code below is what to give your own provider.</PageDescription>
        </PageHeader>

        <div className="@container/appearance">
          <div className="grid items-start gap-10 @4xl/appearance:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="@container/opts">
              <FieldGroup className="gap-8">
                <FieldSet>
                  <FieldLegend>Theme</FieldLegend>
                  <RadioGroup value={a.theme} onValueChange={(theme) => set({ theme })} aria-label="Theme" className="gap-3 @xl/opts:grid-cols-3">
                    {THEMES.map((t) => (
                      <FieldLabel key={t.id} htmlFor={`${ids}-theme-${t.id}`}>
                        <Field orientation="horizontal" data-disabled={t.ready ? undefined : true}>
                          <FieldContent>
                            <FieldTitle className="flex-wrap">
                              {t.name}
                              {t.ready ? null : (
                                <Badge size="sm" variant="outline">
                                  soon
                                </Badge>
                              )}
                            </FieldTitle>
                            <FieldDescription>{t.help}</FieldDescription>
                          </FieldContent>
                          <RadioGroupItem value={t.id} id={`${ids}-theme-${t.id}`} disabled={!t.ready} />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Density</FieldLegend>
                  <RadioGroup value={a.density} onValueChange={(v) => set({ density: v as Density })} aria-label="Density" className="gap-3">
                    {DENSITIES.map((d) => (
                      <FieldLabel key={d.id} htmlFor={`${ids}-density-${d.id}`}>
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>{d.name}</FieldTitle>
                            <FieldDescription>{d.help}</FieldDescription>
                          </FieldContent>
                          <RadioGroupItem value={d.id} id={`${ids}-density-${d.id}`} />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Motion</FieldLegend>
                  <RadioGroup value={a.motion} onValueChange={(v) => set({ motion: v as Motion })} aria-label="Motion" className="gap-3 @lg/opts:grid-cols-2">
                    {MOTIONS.map((m) => (
                      <FieldLabel key={m.id} htmlFor={`${ids}-motion-${m.id}`}>
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>{m.name}</FieldTitle>
                            <FieldDescription>{m.help}</FieldDescription>
                          </FieldContent>
                          <RadioGroupItem value={m.id} id={`${ids}-motion-${m.id}`} />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                </FieldSet>

                <Separator variant="dashed" />

                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor={`${ids}-fine`}>Fine ink</FieldLabel>
                    <FieldDescription>Draws with more strokes. Lovely on a big screen, heavier on a small phone.</FieldDescription>
                  </FieldContent>
                  <Switch id={`${ids}-fine`} checked={a.fine} onCheckedChange={(fine) => set({ fine })} />
                </Field>

                <Field>
                  <FieldLabel id={`${ids}-paper`}>Paper for the preview</FieldLabel>
                  <ToggleGroup type="single" variant="outline" aria-labelledby={`${ids}-paper`} value={a.paper} onValueChange={(v) => v && set({ paper: v as PaperChoice })} className="w-fit! flex-wrap">
                    {PAPERS.map((p) => (
                      <ToggleGroupItem key={p.id} value={p.id}>
                        {p.name}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Field>

                <Field>
                  <FieldLabel id={`${ids}-dir`}>Reading direction</FieldLabel>
                  <ToggleGroup type="single" variant="outline" aria-labelledby={`${ids}-dir`} value={a.dir} onValueChange={(v) => v && set({ dir: v as Direction })} className="w-fit!">
                    <ToggleGroupItem value="ltr">Left to right</ToggleGroupItem>
                    <ToggleGroupItem value="rtl">Right to left</ToggleGroupItem>
                  </ToggleGroup>
                  <FieldDescription>Margins, tabs and arrows turn round; the handwriting does not.</FieldDescription>
                </Field>

                <div>
                  <Button type="button" variant="outline" onClick={() => set(DEFAULT_APPEARANCE)} aria-disabled={isDefault}>
                    <Icon name="rotate-cw" />
                    Back to the defaults
                  </Button>
                </div>
              </FieldGroup>
            </div>

            <div className="grid gap-6 @4xl/appearance:sticky @4xl/appearance:top-6">
              <SettingsAppearancePreview appearance={a} />
              <div className="grid gap-2">
                <p className="font-script text-2xl leading-none font-semibold">Your provider</p>
                <CodeBlock code={providerSnippet(a)} language="tsx" filename="root.tsx" wrap seed="appearance-snippet" />
              </div>
            </div>
          </div>
        </div>
      </Page>
    </div>
  )
}
