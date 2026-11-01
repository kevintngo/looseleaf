"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORIES, type Category, type Transaction } from "@/blocks/dashboard-finance/components/dashboard-finance-data"

type Errors = { description?: string; amount?: string }

export function parseAmount(text: string): number | null {
  const t = text.replace(/[$\s]/g, "")
  if (!/^[\d.,]+$/.test(t)) return null
  const n = Number(t.includes(".") ? t.replace(/,/g, "") : t.replace(",", "."))
  return t !== "" && Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null
}

export function AddTransaction({ date, onAdd }: { date: string; onAdd: (t: Omit<Transaction, "id">) => void }) {
  const uid = React.useId()
  const id = (name: string) => `${uid}-${name}`
  const [open, setOpen] = React.useState(false)
  const [description, setDescription] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [kind, setKind] = React.useState<"out" | "in">("out")
  const [category, setCategory] = React.useState<Category>("Groceries")
  const [errors, setErrors] = React.useState<Errors>({})

  const reset = () => {
    setDescription("")
    setAmount("")
    setKind("out")
    setCategory("Groceries")
    setErrors({})
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const cents = parseAmount(amount)
    const next: Errors = {}
    if (!description.trim()) next.description = "Give it a name so you can find it later."
    if (cents === null) next.amount = "Write an amount above zero, like 12.50."
    setErrors(next)
    if (next.description || cents === null) {
      document.getElementById(id(next.description ? "description" : "amount"))?.focus()
      return
    }
    onAdd({ date, description: description.trim(), account: "Checking", category: kind === "in" ? "Income" : category, cents: kind === "in" ? cents : -cents, status: "pending" })
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) reset()
        setOpen(next)
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Icon name="plus" />
          Add transaction
        </Button>
      </DialogTrigger>
      <DialogContent tape="both" tapeKind="washi-dots">
        <DialogHeader>
          <DialogTitle>Add a transaction</DialogTitle>
          <DialogDescription>It goes in as pending until the bank agrees.</DialogDescription>
        </DialogHeader>
        <form id={id("form")} onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Field data-invalid={errors.description ? "true" : undefined}>
            <FieldLabel htmlFor={id("description")}>What was it?</FieldLabel>
            <Input
              id={id("description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={errors.description ? id("description-error") : undefined}
              placeholder="Ramen night"
            />
            <FieldError id={id("description-error")}>{errors.description}</FieldError>
          </Field>
          <Field data-invalid={errors.amount ? "true" : undefined}>
            <FieldLabel htmlFor={id("amount")}>How much?</FieldLabel>
            <Input
              id={id("amount")}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-invalid={errors.amount ? true : undefined}
              aria-describedby={errors.amount ? id("amount-error") : undefined}
              placeholder="12.50"
            />
            <FieldError id={id("amount-error")}>{errors.amount}</FieldError>
          </Field>
          <RadioGroup value={kind} onValueChange={(v) => setKind(v as "out" | "in")} orientation="horizontal" aria-label="Money in or out">
            <div className="flex items-center gap-2">
              <RadioGroupItem id={id("out")} value="out" />
              <Label htmlFor={id("out")}>Money out</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id={id("in")} value="in" />
              <Label htmlFor={id("in")}>Money in</Label>
            </div>
          </RadioGroup>
          {kind === "out" ? (
            <Field>
              <FieldLabel htmlFor={id("category")}>Which pot?</FieldLabel>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger id={id("category")} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c !== "Income").map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form={id("form")}>
            Add it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
