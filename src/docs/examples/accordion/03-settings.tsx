import * as React from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Account settings",
  description: "A controlled accordion in a card: the open row lives in state, a button opens the next one, and the fields inside keep their rings and hover lines.",
  layout: "center" as const,
  height: 520,
}

const steps = ["profile", "notifications", "security"] as const

export default function Example() {
  const [open, setOpen] = React.useState<string>("profile")
  const next = steps[Math.min(steps.indexOf(open as (typeof steps)[number]) + 1, steps.length - 1)]
  return (
    <Card seed="acc-settings" className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Three short pages. Open them in any order.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible value={open} onValueChange={setOpen}>
          <AccordionItem value="profile">
            <AccordionTrigger>Profile</AccordionTrigger>
            <AccordionContent className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="acc-name">Name</Label>
                <Input id="acc-name" defaultValue="Ada Lovelace" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="acc-bio">One line about you</Label>
                <Input id="acc-bio" placeholder="Mathematician, mostly" />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="notifications">
            <AccordionTrigger>Notifications</AccordionTrigger>
            <AccordionContent>We send a summary on Fridays and nothing else. Change that here whenever you like.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="security">
            <AccordionTrigger>Security</AccordionTrigger>
            <AccordionContent>Passkeys are on. Two devices are signed in.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">Open: {open || "none"}</span>
        <Button size="sm" onClick={() => setOpen(next)}>
          Next page
        </Button>
      </CardFooter>
    </Card>
  )
}
