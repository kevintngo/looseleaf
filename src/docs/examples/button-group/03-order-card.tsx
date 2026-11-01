import * as React from "react"

import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "A sourdough order",
  description:
    "The group doing a job: a quantity stepper whose number is a printed cell, a size chooser that is a row of buttons, and a primary action to finish. The status line says what the stepper did.",
  layout: "stack" as const,
}

const sizes = ["Small", "Loaf", "Big"] as const

export default function Example() {
  const [qty, setQty] = React.useState(2)
  const [size, setSize] = React.useState<(typeof sizes)[number]>("Loaf")
  return (
    <Card className="mx-auto w-full max-w-sm" seed="order">
      <CardHeader>
        <CardTitle>Sourdough</CardTitle>
        <CardDescription>Baked this morning, gone by noon.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ButtonGroup aria-label="Size">
          {sizes.map((s) => (
            <Button key={s} variant={s === size ? "secondary" : "outline"} aria-pressed={s === size} onClick={() => setSize(s)}>
              {s}
            </Button>
          ))}
        </ButtonGroup>
        <div className="flex items-center gap-3">
          <ButtonGroup aria-label="Quantity">
            <Button variant="outline" size="icon" aria-label="One fewer" disabled={qty <= 1} onClick={() => setQty(qty - 1)}>
              <Icon name="minus" />
            </Button>
            <ButtonGroupText className="ll-num min-w-12 justify-center" aria-live="polite">
              {qty}
            </ButtonGroupText>
            <Button variant="outline" size="icon" aria-label="One more" disabled={qty >= 6} onClick={() => setQty(qty + 1)}>
              <Icon name="plus" />
            </Button>
          </ButtonGroup>
          <span className="text-sm text-muted-foreground">
            {qty} × {size.toLowerCase()}
          </span>
        </div>
      </CardContent>
      <CardFooter className="border-t">
        <Button className="w-full">Add {qty} to the basket</Button>
      </CardFooter>
    </Card>
  )
}
