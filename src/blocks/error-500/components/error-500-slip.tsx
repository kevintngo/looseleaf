"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Receipt, ReceiptBarcode, ReceiptFooter, ReceiptHeader, ReceiptLine, ReceiptLines, ReceiptTotal } from "@/components/ui/receipt"

type Error500SlipProps = {
  reference: string
  request: string
  time: string
}

type CopyState = "idle" | "copied" | "failed"

function Error500Slip({ reference, request, time }: Error500SlipProps) {
  const [copy, setCopy] = React.useState<CopyState>("idle")

  React.useEffect(() => {
    if (copy === "idle") return
    const t = setTimeout(() => setCopy("idle"), 2600)
    return () => clearTimeout(t)
  }, [copy])

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference)
      setCopy("copied")
    } catch {
      setCopy("failed")
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Receipt role="group" aria-label="Details for support" seed="error-500-slip" className="w-72 max-w-full text-start text-sm">
        <ReceiptHeader>
          <p>Incident slip</p>
          <p>keep this for support</p>
        </ReceiptHeader>
        <ReceiptLines>
          <ReceiptLine price="500">Status</ReceiptLine>
          <ReceiptLine price={time}>Time</ReceiptLine>
          <ReceiptLine price={request}>Asked for</ReceiptLine>
        </ReceiptLines>
        <ReceiptTotal label="REF" circled seed="error-500-ref">
          {reference}
        </ReceiptTotal>
        <ReceiptBarcode value={reference.replace(/[^0-9a-z]/gi, "").toUpperCase()} />
        <ReceiptFooter>We are on it.</ReceiptFooter>
      </Receipt>
      <Button type="button" variant="outline" size="sm" onClick={copyReference}>
        <Icon name={copy === "copied" ? "check" : "copy"} />
        {copy === "copied" ? "Copied" : "Copy reference"}
      </Button>
      <p role="status" className="min-h-5 text-sm text-ink-muted">
        {copy === "copied" ? `Reference ${reference} copied.` : copy === "failed" ? "Could not copy. Select the reference on the slip instead." : ""}
      </p>
    </div>
  )
}

export { Error500Slip }
