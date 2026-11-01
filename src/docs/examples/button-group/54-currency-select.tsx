import * as React from "react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const meta = {
  title: "A select, a field and a send button",
  description:
    "A Select trigger, an Input and a Button share seams like any other children, in two groups side by side. The trigger shows only the symbol; the list beneath explains each one. Try changing the currency and sending.",
  layout: "stack" as const,
  height: 340,
}

const CURRENCIES = [
  { value: "$", label: "US Dollar" },
  { value: "€", label: "Euro" },
  { value: "£", label: "British Pound" },
]

export default function Example() {
  const [currency, setCurrency] = React.useState("$")
  const [amount, setAmount] = React.useState("10.00")
  const [sent, setSent] = React.useState("")
  return (
    <div className="grid justify-items-start gap-4">
      <ButtonGroup aria-label="Send money">
        <ButtonGroup>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="font-mono" aria-label="Currency">
              <SelectValue>{currency}</SelectValue>
            </SelectTrigger>
            <SelectContent className="min-w-40">
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.value} <span className="text-muted-foreground">{c.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="10.00" inputMode="decimal" pattern="[0-9.]*" aria-label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </ButtonGroup>
        <ButtonGroup>
          <Button aria-label="Send" size="icon" variant="outline" onClick={() => setSent(`Sent ${currency}${amount || "0"}`)}>
            <Icon name="arrow-right" />
          </Button>
        </ButtonGroup>
      </ButtonGroup>
      <p role="status" className="min-h-6 text-sm text-muted-foreground">
        {sent}
      </p>
    </div>
  )
}
