import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SignaturePad } from "@/components/ui/signature-pad"

export const meta = {
  title: "Agreement form",
  description: "A real form: the signature is a required field that posts as a data URL. Submit it empty to see the red baseline; sign and it goes through.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  const [sent, setSent] = React.useState<string | null>(null)
  return (
    <Card className="w-full max-w-lg" tilt={false}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const sig = String(new FormData(e.currentTarget).get("signature"))
          setSent(`${sig.length.toLocaleString()} characters of image`)
        }}
      >
        <CardHeader>
          <CardTitle>Studio rental agreement</CardTitle>
          <CardDescription>Three hours, one kettle, no glitter.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-2">
            <Checkbox id="glitter" required />
            <Label htmlFor="glitter">I promise, no glitter</Label>
          </div>
          <SignaturePad name="signature" required penColor="ink-you" />
        </CardContent>
        <CardFooter className="justify-between gap-3 pt-4">
          <span className="text-sm text-muted-foreground">{sent ?? "Not sent yet"}</span>
          <Button type="submit">Sign and send</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
