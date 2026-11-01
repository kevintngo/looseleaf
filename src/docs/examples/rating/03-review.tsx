import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Rating } from "@/components/ui/rating"
import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "Review card",
  description: "A real-world use: a read-only display (an image with a text alternative, so no tab stop), a form control with `name` and `required`, and a submit that reads the value from FormData.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  const [sent, setSent] = React.useState("")
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Field Notes, No. 3</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Rating readOnly value={4.5} allowHalf size="sm" />
          <span>4.5 from 212 readers</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="review"
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            const d = new FormData(e.currentTarget)
            setSent(`Thanks: ${d.get("stars")} stars`)
          }}
        >
          <Label id="your-rating">Your rating</Label>
          <Rating name="stars" required allowHalf aria-labelledby="your-rating" defaultValue={0} />
          <Label htmlFor="review-text">A few words</Label>
          <Textarea id="review-text" name="text" placeholder="The paper takes ink beautifully..." />
        </form>
      </CardContent>
      <CardFooter className="gap-3">
        <Button type="submit" form="review">
          Post review
        </Button>
        <span role="status" className="text-sm text-ink-muted">
          {sent}
        </span>
      </CardFooter>
    </Card>
  )
}
