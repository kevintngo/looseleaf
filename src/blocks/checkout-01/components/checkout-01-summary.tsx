"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Paper } from "@/components/ui/paper"
import { Receipt, ReceiptBarcode, ReceiptDivider, ReceiptFooter, ReceiptHeader, ReceiptLine, ReceiptLines, ReceiptTotal } from "@/components/ui/receipt"
import { Stepper, StepperDecrement, StepperIncrement, StepperInput } from "@/components/ui/stepper"
import { StickyNote, StickyNoteContent } from "@/components/ui/sticky-note"
import { FREE_SHIPPING_FROM, PRODUCTS, PROMOS, VAT, money, type Totals } from "@/blocks/checkout-01/components/checkout-01-data"

type Props = {
  qty: number[]
  onQty: (index: number, value: number) => void
  code: string | null
  onCode: (code: string | null) => void
  totals: Totals
  formId: string
  orderNumber: string
  placing?: boolean
}

export function Checkout01Summary({ qty, onQty, code, onCode, totals, formId, orderNumber, placing }: Props) {
  const [draft, setDraft] = React.useState("")
  const [error, setError] = React.useState("")
  const promoId = React.useId()
  const promoInput = React.useRef<HTMLInputElement>(null)
  const promoRemove = React.useRef<HTMLButtonElement>(null)
  const swapped = React.useRef(false)
  React.useEffect(() => {
    if (!swapped.current) return
    swapped.current = false
    if (code) promoRemove.current?.focus()
    else promoInput.current?.focus()
  }, [code])
  const empty = qty.every((n) => n === 0)
  const promo = code ? PROMOS[code] : undefined

  const apply = (e: React.FormEvent) => {
    e.preventDefault()
    const c = draft.trim().toUpperCase()
    if (!c) return setError("Type a code first.")
    if (!PROMOS[c]) return setError("That code is not on our list. Check the spelling.")
    setError("")
    setDraft("")
    swapped.current = true
    onCode(c)
  }

  return (
    <div className="grid gap-6">
      <Paper as="section" stock="paper" tilt={0.3} seed="basket" aria-labelledby={`${formId}-basket`} className="grid gap-4 p-5">
        <h3 id={`${formId}-basket`} className="font-script text-3xl leading-none font-semibold">
          Your basket
        </h3>
        <ul aria-label="Basket" className="grid gap-4">
          {PRODUCTS.map((p, i) => (
            <li key={p.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p id={`${formId}-p-${p.id}`} className="font-bold">
                  {p.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {p.note} · <span className="ll-num">€{money(p.cents)}</span>
                </p>
              </div>
              <Stepper value={qty[i]} onValueChange={(v) => onQty(i, v ?? 0)} min={0} max={9} aria-labelledby={`${formId}-p-${p.id}`}>
                <StepperDecrement aria-label={`One less: ${p.name}`} />
                <StepperInput />
                <StepperIncrement aria-label={`One more: ${p.name}`} />
              </Stepper>
            </li>
          ))}
        </ul>

        <form onSubmit={apply} noValidate className="grid gap-2" aria-label="Promo code">
          <Label htmlFor={promoId}>Promo code</Label>
          {code ? (
            <p className="flex flex-wrap items-center gap-x-3 text-sm">
              <span>
                <b className="font-type">{code}</b> applied: {promo?.label}.
              </span>
              <Button
                ref={promoRemove}
                type="button"
                variant="link"
                size="sm"
                onClick={() => {
                  swapped.current = true
                  onCode(null)
                }}
              >
                Remove
              </Button>
            </p>
          ) : (
            <>
              <div className="flex gap-2">
                <Input ref={promoInput} id={promoId} placeholder="PAPER10" autoComplete="off" value={draft} aria-invalid={!!error} aria-describedby={error ? `${promoId}-err` : undefined} onChange={(e) => {
                    setDraft(e.target.value)
                    setError("")
                  }} />
                <Button type="submit" variant="outline">
                  Apply
                </Button>
              </div>
              <FieldError id={`${promoId}-err`}>{error}</FieldError>
            </>
          )}
        </form>
      </Paper>

      {empty ? (
        <Paper as="div" stock="slip" tilt={-0.3} seed="empty-basket">
          <Empty seed="basket-empty" className="p-4 md:p-6">
            <EmptyHeader>
              <EmptyMedia pose="shrug" size={96} />
              <EmptyTitle>Nothing in the basket</EmptyTitle>
              <EmptyDescription>Add a notebook with the plus and the receipt starts writing itself.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Paper>
      ) : (
        <Receipt as="article" seed="checkout-receipt" aria-label="Your order" className="mx-auto">
          <ReceiptHeader>
            <span>Looseleaf shop</span>
            <span>Order {orderNumber}</span>
          </ReceiptHeader>
          <ReceiptLines>
            {PRODUCTS.map((p, i) =>
              qty[i] ? (
                <ReceiptLine key={p.id} qty={qty[i]} price={money(p.cents * qty[i]!)}>
                  {p.name}
                </ReceiptLine>
              ) : null
            )}
          </ReceiptLines>
          <ReceiptLines>
            <ReceiptLine price={money(totals.subtotal)}>subtotal</ReceiptLine>
            {totals.discount ? <ReceiptLine price={`-${money(totals.discount)}`}>code {code}</ReceiptLine> : null}
            <ReceiptLine price={totals.shipping ? money(totals.shipping) : "free"}>delivery</ReceiptLine>
            <ReceiptLine price={money(totals.vat)}>of which VAT {VAT}%</ReceiptLine>
          </ReceiptLines>
          <ReceiptTotal circled>{money(totals.total)}</ReceiptTotal>
          <ReceiptDivider />
          <ReceiptBarcode value={orderNumber} />
          <ReceiptFooter>prices in euro, VAT included</ReceiptFooter>
        </Receipt>
      )}

      <p role="status" className="sr-only">
        {empty ? "The basket is empty." : `Total €${money(totals.total)}.`}
      </p>

      <Button type="submit" form={formId} size="lg" className="w-full" disabled={empty} aria-busy={placing}>
        {placing ? "Placing your order…" : `Pay €${money(totals.total)}`}
      </Button>

      <StickyNote color="yellow" fastener="pin" tilt={2} seed="checkout-hint" className="mx-auto mt-3 min-h-0 w-full max-w-56 pb-4">
        <StickyNoteContent className="text-lg leading-snug">
          psst: free delivery over {money(FREE_SHIPPING_FROM)}, and <b className="font-type text-base">PAPER10</b> takes a tenth off the paper.
        </StickyNoteContent>
      </StickyNote>
    </div>
  )
}
