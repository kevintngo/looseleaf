"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { SidebarInput } from "@/components/ui/sidebar"

export function SidebarOptInForm({ onSubmit }: { onSubmit?: (email: string) => void }) {
  const id = React.useId()
  const [sent, setSent] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  return (
    <Card className="gap-2 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-xl">Get the postcard</CardTitle>
        <CardDescription>A short note on new pens and papers, every other Friday. Only ink, no spam.</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        {sent ? (
          <p role="status" className="font-hand text-sm text-green">
            Thank you! Watch your mailbox on Friday.
          </p>
        ) : (
          <form
            className="grid gap-2.5"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              const value = new FormData(event.currentTarget).get("email")
              const email = typeof value === "string" ? value.trim() : ""
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setError("That does not look like an email address yet.")
                return
              }
              setError(null)
              onSubmit?.(email)
              setSent(true)
            }}
          >
            <Label htmlFor={id} className="sr-only">
              Email address
            </Label>
            <SidebarInput
              id={id}
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={() => error && setError(null)}
            />
            {error ? (
              <p id={`${id}-error`} role="alert" className="font-hand text-sm text-red">
                {error}
              </p>
            ) : null}
            <Button size="sm" className="w-full" type="submit">
              Subscribe
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
