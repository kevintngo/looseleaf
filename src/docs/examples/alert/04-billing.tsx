import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "In a billing card",
  description: "A real use: the alert leads the card's content, carries an action button of its own (a separate host, with its own ring and hover) and goes away once it is dealt with. It is a live region, so screen readers hear it when it appears.",
  layout: "center" as const,
  height: 420,
}

export default function Example() {
  const [failed, setFailed] = React.useState(true)
  return (
    <Card seed="billing" className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>Your plan renews on the first of the month.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {failed ? (
          <Alert variant="destructive">
            <Icon name="circle-alert" />
            <AlertTitle>Your last payment did not go through</AlertTitle>
            <AlertDescription>
              <p>The card ending 4242 was declined. We will try again in three days.</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => setFailed(false)}>
                Update card
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="success">
            <Icon name="circle-check" />
            <AlertTitle>Card updated</AlertTitle>
            <AlertDescription>The next payment will use the new card.</AlertDescription>
          </Alert>
        )}
        <p className="text-sm text-muted-foreground">Team plan, 5 seats, $250.00 a month.</p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="ghost" size="sm" onClick={() => setFailed(true)}>
          Reset the demo
        </Button>
      </CardFooter>
    </Card>
  )
}
