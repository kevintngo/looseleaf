import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"

export const meta = {
  title: "Share link (composed)",
  description: "A real use: a share popover with a read-only link and a copy button that confirms. Focus goes to the field, the link is selected on focus, Escape returns you to the trigger.",
  layout: "center" as const,
  height: 300,
}

const LINK = "https://kevintngo.github.io/looseleaf/n/field-notes"

export default function Example() {
  const [copied, setCopied] = React.useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(LINK)
    } catch {
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Popover onOpenChange={() => setCopied(false)}>
      <PopoverTrigger asChild>
        <Button className="self-start">
          <Icon name="copy" /> Share
        </Button>
      </PopoverTrigger>
      <PopoverContent arrow tape="top" seed="share" align="start" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Share this notebook</PopoverTitle>
          <PopoverDescription>Anyone with the link can read it.</PopoverDescription>
        </PopoverHeader>
        <div className="mt-3 grid gap-2">
          <Label htmlFor="share-link" className="sr-only">
            Link
          </Label>
          <div className="flex gap-2">
            <Input id="share-link" readOnly defaultValue={LINK} onFocus={(e) => e.currentTarget.select()} />
            <Button variant="secondary" onClick={copy} aria-live="polite">
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
