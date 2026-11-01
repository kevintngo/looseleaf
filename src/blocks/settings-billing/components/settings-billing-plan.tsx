"use client"

import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Icon } from "@/components/ui/icon"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Ticket, TicketBody, TicketDescription, TicketNumber, TicketStub, TicketTitle } from "@/components/ui/ticket"
import { DAYS_LEFT, PLANS, RENEWS, USAGE, money, planChange, type PlanId } from "@/blocks/settings-billing/components/settings-billing-data"

export const limitOf = (plan: PlanId, key: (typeof USAGE)[number]["id"]): number => {
  const p = PLANS.find((x) => x.id === plan)!
  return key === "notebooks" ? p.notebooks : key === "storage" ? p.storageGb : p.seats
}

export function SettingsBillingPlan({ current, scheduled, onChange }: { current: PlanId; scheduled?: PlanId; onChange: (plan: PlanId) => void }) {
  const [picked, setPicked] = React.useState<PlanId>(current)
  const [done, setDone] = React.useState("")
  const uid = React.useId()
  const plan = PLANS.find((p) => p.id === current)!
  const next = scheduled ? PLANS.find((p) => p.id === scheduled) : undefined
  const target = PLANS.find((p) => p.id === picked)!
  const change = planChange(current, picked)
  const over = USAGE.filter((u) => u.used > limitOf(picked, u.id)).map((u) => `${u.label.toLowerCase()} (${u.used}${u.unit} of ${limitOf(picked, u.id)}${u.unit})`)

  return (
    <div className="grid gap-6">
      <div role="group" aria-label={`Your plan: ${plan.name}`}>
        <Ticket stock="kraft" seed="plan-ticket" size={[420, 124]} className="w-full max-w-md">
          <TicketBody>
            <TicketTitle>{plan.name} plan</TicketTitle>
            <TicketDescription>
              <span className="whitespace-nowrap">{money(plan.cents)} a month ·</span> <span className="whitespace-nowrap">renews {RENEWS}</span>
            </TicketDescription>
            <TicketNumber>No. 0042</TicketNumber>
          </TicketBody>
          <TicketStub>
            <span className="font-type text-xs">Admit</span>
            <span className="font-script text-4xl leading-none font-bold">1</span>
          </TicketStub>
        </Ticket>
      </div>

      {next ? (
        <p className="flex flex-wrap items-center gap-x-3 text-sm">
          <span>
            Moving to <b>{next.name}</b> on {RENEWS}.
          </span>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => {
              onChange(current)
              setPicked(current)
              setDone(`Staying on ${plan.name}.`)
            }}
          >
            Keep {plan.name}
          </Button>
        </p>
      ) : null}

      <RadioGroup
        value={picked}
        onValueChange={(v) => {
          setPicked(v as PlanId)
          setDone("")
        }}
        aria-label="Plan"
        className="gap-3 @4xl/settings:grid-cols-3"
      >
        {PLANS.map((p) => (
          <FieldLabel key={p.id} htmlFor={`${uid}-plan-${p.id}`}>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle className="flex-wrap">
                  {p.name}
                  {p.id === current ? (
                    <Badge size="sm" variant="secondary">
                      Current
                    </Badge>
                  ) : null}
                </FieldTitle>
                <FieldDescription>
                  <span className="ll-num font-bold text-foreground">{p.cents ? `${money(p.cents)} a month` : "Free"}</span>
                  <br />
                  {p.blurb}
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem value={p.id} id={`${uid}-plan-${p.id}`} />
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>

      {change.kind === "upgrade" ? (
        <Alert variant="info">
          <Icon name="info" />
          <AlertTitle>Move up to {target.name}</AlertTitle>
          <AlertDescription>
            From {RENEWS} you will pay {money(change.monthly)} a month. Today we charge {money(change.today)} for the {DAYS_LEFT} days left in this month, and nothing more.
          </AlertDescription>
        </Alert>
      ) : null}
      {change.kind === "downgrade" ? (
        <Alert variant="warning">
          <Icon name="triangle-alert" />
          <AlertTitle>Move down to {target.name}</AlertTitle>
          <AlertDescription>
            You keep {plan.name} until {RENEWS}, then pay {change.monthly ? `${money(change.monthly)} a month` : "nothing"}. Nothing is charged today.
            {over.length ? ` You use more than ${target.name} holds: ${over.join(", ")}. The extra stays readable but cannot be edited.` : ""}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={change.kind === "same"}
          onClick={() => {
            onChange(picked)
            setDone(change.kind === "upgrade" ? `You are on ${target.name} now.` : `Done. ${target.name} starts on ${RENEWS}.`)
            if (change.kind === "upgrade") setPicked(picked)
          }}
        >
          {change.kind === "same" ? "Pick another plan" : `Switch to ${target.name}`}
        </Button>
        <p role="status" className="text-sm font-bold text-green">
          {done}
        </p>
      </div>
    </div>
  )
}
