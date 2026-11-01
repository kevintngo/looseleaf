"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Mascot } from "@/components/ui/mascot"
import { Page, PageDescription, PageHeader, PageTitle } from "@/components/ui/page"
import { Receipt, ReceiptFooter, ReceiptHeader, ReceiptLine, ReceiptLines, ReceiptTotal } from "@/components/ui/receipt"
import { Stamp } from "@/components/ui/stamp"
import { Checkout01Form } from "@/blocks/checkout-01/components/checkout-01-form"
import { Checkout01Summary } from "@/blocks/checkout-01/components/checkout-01-summary"
import {
  DEFAULT_QTY,
  DEFAULT_VALUES,
  METHODS,
  PRODUCTS,
  currentMonth,
  makeCheckoutSchema,
  money,
  totals as totalsOf,
  type CheckoutValues,
  type Month,
  type MethodId,
  type Totals,
} from "@/blocks/checkout-01/components/checkout-01-data"
import { cn } from "@/lib/utils"

export type PlacedOrder = { number: string; email: string; name: string; qty: number[]; totals: Totals; code: string | null }

type Props = {
  className?: string
  defaultQty?: number[]
  orderNumber?: string
  today?: Month
  onPlace?: (order: PlacedOrder, values: CheckoutValues) => void | Promise<void>
}

export default function Checkout01({ className, defaultQty = DEFAULT_QTY, orderNumber = "0042 1187", today, onPlace }: Props) {
  const formId = React.useId()
  const [qty, setQty] = React.useState<number[]>(defaultQty)
  const [code, setCode] = React.useState<string | null>(null)
  const [placing, setPlacing] = React.useState(false)
  const [placed, setPlaced] = React.useState<PlacedOrder | null>(null)
  const [failure, setFailure] = React.useState("")
  const done = React.useRef<HTMLHeadingElement>(null)

  const form = useForm<CheckoutValues>({
    resolver: (values, context, options) => zodResolver(makeCheckoutSchema(today ?? currentMonth()))(values, context, options),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  })
  const method = form.watch("method") as MethodId
  const totals = totalsOf(qty, method, code)
  const shipping = Object.fromEntries(METHODS.map((m) => [m.id, totalsOf(qty, m.id, code).shipping])) as Record<MethodId, number>

  React.useEffect(() => {
    if (placed) done.current?.focus()
  }, [placed])

  const submit = form.handleSubmit(async (values) => {
    const order: PlacedOrder = { number: orderNumber, email: values.email, name: values.name, qty, totals, code }
    setPlacing(true)
    setFailure("")
    try {
      await onPlace?.(order, values)
      setPlaced(order)
    } catch (err) {
      setFailure(err instanceof Error && err.message ? err.message : "Something went wrong on our side.")
    } finally {
      setPlacing(false)
    }
  })

  if (placed) {
    return (
      <section aria-labelledby={`${formId}-done`} className={cn("mx-auto grid w-full max-w-3xl justify-items-center gap-6 px-4 py-12 text-center sm:px-8", className)}>
        <Mascot pose="celebrate" size={132} seed="checkout-done" />
        <div className="grid gap-2">
          <h2 id={`${formId}-done`} ref={done} tabIndex={-1} className="font-script text-5xl leading-none font-bold outline-none">
            Thank you, {placed.name.trim().split(/\s+/)[0]}
          </h2>
          <p className="text-lg text-muted-foreground">
            Order <span className="ll-num font-bold text-foreground">{placed.number}</span> is paid. The receipt is on its way to {placed.email}.
          </p>
        </div>
        <div className="relative">
          <Receipt as="article" seed="checkout-paid" aria-label="Receipt of your order">
            <ReceiptHeader>
              <span>Looseleaf shop</span>
              <span>Order {placed.number}</span>
            </ReceiptHeader>
            <ReceiptLines>
              {PRODUCTS.map((p, i) =>
                placed.qty[i] ? (
                  <ReceiptLine key={p.id} qty={placed.qty[i]} price={money(p.cents * placed.qty[i]!)}>
                    {p.name}
                  </ReceiptLine>
                ) : null
              )}
            </ReceiptLines>
            <ReceiptTotal circled>{money(placed.totals.total)}</ReceiptTotal>
            <ReceiptFooter>paid by card - thank you</ReceiptFooter>
          </Receipt>
          <Stamp name="stamp-paid" className="absolute -end-6 -top-4 sm:-end-12" seed="paid" />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setPlaced(null)
            setQty(defaultQty)
            setCode(null)
            form.reset()
          }}
        >
          Keep shopping
        </Button>
      </section>
    )
  }

  return (
    <div className={cn("@container/checkout mx-auto w-full max-w-6xl px-4 py-10 sm:px-8", className)}>
      <div className="grid items-start gap-10 @4xl/checkout:grid-cols-[minmax(0,1fr)_24rem]">
        <Page as="section" width="full" tape="top" seed="checkout-form" aria-labelledby={`${formId}-title`}>
          <PageHeader>
            <PageTitle as="h2" id={`${formId}-title`} underline="wavy" seed="checkout-title">
              Checkout
            </PageTitle>
            <PageDescription>Three short steps and it is on its way. We ask for nothing we do not need.</PageDescription>
          </PageHeader>
          {failure ? (
            <Alert variant="destructive">
              <Icon name="circle-alert" />
              <AlertTitle>The order was not placed</AlertTitle>
              <AlertDescription>{failure} You have not been charged. Try again, or use another card.</AlertDescription>
            </Alert>
          ) : null}
          <Checkout01Form form={form} id={formId} onSubmit={submit} shipping={shipping} />
        </Page>
        <div className="@4xl/checkout:sticky @4xl/checkout:top-6">
          <Checkout01Summary
            qty={qty}
            onQty={(i, v) => setQty((all) => all.map((n, k) => (k === i ? v : n)))}
            code={code}
            onCode={setCode}
            totals={totals}
            formId={formId}
            orderNumber={orderNumber}
            placing={placing}
          />
        </div>
      </div>
    </div>
  )
}
