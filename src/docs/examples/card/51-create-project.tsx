import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const meta = {
  title: "Create a project",
  description:
    "The shadcn demo: a card around a small form. A text field, a Select (its list opens in `position=\"popper\"` so it lines up with the trigger) and a footer with the two answers pushed apart. Deploy reports what it would do.",
  layout: "stack" as const,
  height: 460,
}

export default function Example() {
  const [status, setStatus] = React.useState("")
  return (
    <Card seed="create" className="mx-auto w-full max-w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one click.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="card-create-form"
          onSubmit={(e) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            setStatus(`Deploying "${String(data.get("name") || "untitled")}" on ${String(data.get("framework") || "no framework")}`)
          }}
        >
          <div className="grid w-full items-center gap-6">
            <div className="flex flex-col gap-3">
              <Label htmlFor="card-create-name">Name</Label>
              <Input id="card-create-name" name="name" placeholder="Name of your project" />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="card-create-framework">Framework</Label>
              <Select name="framework">
                <SelectTrigger id="card-create-framework" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="next">Next.js</SelectItem>
                  <SelectItem value="sveltekit">SvelteKit</SelectItem>
                  <SelectItem value="astro">Astro</SelectItem>
                  <SelectItem value="nuxt">Nuxt.js</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
        <p role="status" className="mt-4 min-h-6 text-sm text-muted-foreground">
          {status}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" type="button" onClick={() => setStatus("Nothing deployed.")}>
          Cancel
        </Button>
        <Button type="submit" form="card-create-form">
          Deploy
        </Button>
      </CardFooter>
    </Card>
  )
}
