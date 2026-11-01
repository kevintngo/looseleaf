import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Session expired",
  description:
    "The smallest destructive alert: an icon, the word Error and one plain sentence. Below it, the same message with the way out built in. Alerts are live regions, so the second one is announced when it appears.",
  layout: "stack" as const,
}

export default function Example() {
  const [again, setAgain] = React.useState(false)
  return (
    <div className="grid w-full max-w-xl items-start gap-5">
      <Alert variant="destructive">
        <Icon name="circle-alert" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
      </Alert>
      {again ? (
        <Alert variant="success">
          <Icon name="circle-check" />
          <AlertTitle>Signed in</AlertTitle>
          <AlertDescription>Welcome back. Your drafts are where you left them.</AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <Icon name="circle-alert" />
          <AlertTitle>You were signed out</AlertTitle>
          <AlertDescription>
            <p>It has been a while since your last visit.</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => setAgain(true)}>
              Log in again
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
