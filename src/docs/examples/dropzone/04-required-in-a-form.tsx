import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dropzone } from "@/components/ui/dropzone"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Required, in a form",
  description: "The zone is a plain form field: name puts the files in FormData, required stops the submit until one is chosen (the browser points at the input), and invalid draws the red stitches. Submit empty, then with a file.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 600,
}

export default function Example() {
  const [result, setResult] = React.useState<string | null>(null)
  const [touched, setTouched] = React.useState(false)
  const [count, setCount] = React.useState(0)
  return (
    <Card seed="claim" tape="corner" className="w-full max-w-lg">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          setTouched(true)
          const data = new FormData(e.currentTarget)
          const receipts = data.getAll("receipts").filter((f): f is File => f instanceof File && f.size > 0)
          if (count === 0) return setResult(null)
          setResult(`${data.get("who") || "Someone"} sent ${count} receipt${count === 1 ? "" : "s"}${receipts.length ? "" : " (held by the zone)"}.`)
        }}
      >
        <CardHeader>
          <CardTitle>Expense claim</CardTitle>
          <CardDescription>Attach at least one receipt.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="who">Your name</Label>
            <Input id="who" name="who" placeholder="Ada Lovelace" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="receipts">Receipts</Label>
            <Dropzone
              id="receipts"
              name="receipts"
              required
              accept="image/*,.pdf"
              maxFiles={5}
              invalid={touched && count === 0}
              onFilesChange={(f) => setCount(f.length)}
            />
            {touched && count === 0 && (
              <p role="alert" className="font-hand text-sm text-red">
                Please attach a receipt.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t">
          <p className="font-hand text-sm text-ink-muted" aria-live="polite">
            {result ?? "Not sent."}
          </p>
          <Button type="submit">Send claim</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
