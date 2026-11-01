"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldContent } from "@/components/ui/field"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Page, PageDescription, PageHeader, PageTitle } from "@/components/ui/page"
import { Paper } from "@/components/ui/paper"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { SettingsBillingCardDialog, type SavedCard } from "@/blocks/settings-billing/components/settings-billing-card-dialog"
import {
  INVOICES,
  USAGE,
  detailsSchema,
  planChange,
  type DetailsValues,
  type Invoice,
  type Month,
  type PlanId,
} from "@/blocks/settings-billing/components/settings-billing-data"
import { SettingsBillingInvoices } from "@/blocks/settings-billing/components/settings-billing-invoices"
import { SettingsBillingPlan, limitOf } from "@/blocks/settings-billing/components/settings-billing-plan"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  defaultPlan?: PlanId
  today?: Month
  onSaveDetails?: (values: DetailsValues) => void | Promise<void>
  onDownload?: (invoice: Invoice) => void
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

export default function SettingsBilling({ className, defaultPlan = "studio", today, onSaveDetails, onDownload }: Props) {
  const [plan, setPlan] = React.useState<PlanId>(defaultPlan)
  const [scheduled, setScheduled] = React.useState<PlanId>()
  const [card, setCard] = React.useState<SavedCard>({ brand: "Visa", last4: "4242", expiry: "08/28" })
  const [cardSaved, setCardSaved] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [failure, setFailure] = React.useState("")
  const titleId = React.useId()

  const details = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { email: "billing@looseleaf.example", company: "Delacroix Letterpress", taxId: "PT123456789" },
    mode: "onTouched",
  })

  const edit = <T,>(change: (value: T) => void, value: T) => {
    setSaved(false)
    setFailure("")
    change(value)
  }

  return (
    <div className="w-full overflow-x-clip px-2">
      <Page as="section" width="xl" tape="top" stain seed="settings-billing" aria-labelledby={titleId} className={cn("my-6", className)}>
        <PageHeader>
          <PageTitle as="h2" id={titleId} underline="double" seed="billing-title">
            Billing
          </PageTitle>
          <PageDescription>What you pay, what you use, and every receipt we have ever handed you.</PageDescription>
        </PageHeader>

        <div className="@container/settings grid gap-8">
          <Section title="Your plan" description="Change it whenever you like. We only charge the difference.">
            <SettingsBillingPlan
              current={plan}
              scheduled={scheduled}
              onChange={(next) => {
                const kind = planChange(plan, next).kind
                if (kind === "upgrade") setPlan(next)
                setScheduled(kind === "downgrade" ? next : undefined)
              }}
            />
          </Section>

          <Separator variant="dashed" />

          <Section title="Usage" description="Counted on your current plan. Bars turn to marker when you get close.">
            <ul aria-label="Usage" className="grid gap-5">
              {USAGE.map((u) => {
                const limit = limitOf(plan, u.id)
                const share = Math.min(100, Math.round((u.used / limit) * 100))
                return (
                  <li key={u.id} className="grid gap-2">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-bold">{u.label}</span>
                      <span className="ll-num text-sm text-muted-foreground">
                        {u.used}
                        {u.unit} of {limit}
                        {u.unit}
                        {u.used > limit ? " (over)" : ""}
                      </span>
                    </div>
                    <Progress value={share} tone={share >= 90 ? "marker" : "green"} aria-label={`${u.label}: ${share}% used`} />
                  </li>
                )
              })}
            </ul>
          </Section>

          <Separator variant="dashed" />

          <Section title="Payment method" description="One card, charged on the 14th.">
            <Paper stock="slip" tilt={-0.4} seed="card-on-file" className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3" role="group" aria-label="Card on file">
              <Icon name="credit-card" size={28} />
              <div className="grid min-w-0 flex-1 leading-tight">
                <span className="font-bold">
                  {card.brand} ending in <span className="ll-num">{card.last4}</span>
                </span>
                <span className="text-sm text-muted-foreground">
                  Expires <span className="ll-num">{card.expiry}</span>
                </span>
              </div>
              <SettingsBillingCardDialog
                today={today}
                onSaved={(c) => {
                  setCard(c)
                  setCardSaved(true)
                }}
              >
                <Button variant="outline" size="sm">
                  Replace card
                </Button>
              </SettingsBillingCardDialog>
            </Paper>
            <p role="status" className="text-sm font-bold text-green">
              {cardSaved ? `Done. New charges go to the ${card.brand} ending in ${card.last4}.` : ""}
            </p>
          </Section>

          <Separator variant="dashed" />

          <Section title="Invoice details" description="Printed on every receipt. Change it and old receipts keep what they said.">
            <Form {...details}>
              <form
                noValidate
                aria-label="Invoice details"
                className="grid gap-5"
                onSubmit={details.handleSubmit(async (v) => {
                  try {
                    await onSaveDetails?.(v)
                  } catch (err) {
                    setFailure(err instanceof Error && err.message ? err.message : "The details were not saved. Nothing was lost, so try again in a moment.")
                    return
                  }
                  setFailure("")
                  details.reset(v)
                  setSaved(true)
                })}
              >
                <FormField
                  control={details.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Send invoices to</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} onChange={(e) => edit(field.onChange, e)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-5 @xl/settings:grid-cols-2">
                  <FormField
                    control={details.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem className="content-start">
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input autoComplete="organization" placeholder="Optional" {...field} onChange={(e) => edit(field.onChange, e)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={details.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem className="content-start">
                        <FormLabel>VAT number</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} onChange={(e) => edit(field.onChange, e.target.value.toUpperCase())} />
                        </FormControl>
                        <FormDescription>Two letters and the number, no spaces.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Field orientation="horizontal">
                  <Button type="submit">Save details</Button>
                  <FieldContent>
                    <p role="status" className="text-sm font-bold text-green">
                      {saved ? "Saved. New invoices will say so." : ""}
                    </p>
                    {failure ? (
                      <p role="alert" className="text-sm font-bold text-red">
                        {failure}
                      </p>
                    ) : null}
                  </FieldContent>
                </Field>
              </form>
            </Form>
          </Section>

          <Separator variant="dashed" />

          <Section title="Invoices" description="Newest first. Each is a PDF you can keep.">
            <SettingsBillingInvoices invoices={INVOICES} onDownload={onDownload} />
          </Section>
        </div>
      </Page>
    </div>
  )
}
