"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Receipt, ReceiptFooter, ReceiptHeader, ReceiptLine, ReceiptLines, ReceiptTotal } from "@/components/ui/receipt"
import type { Invoice } from "@/blocks/settings-billing/components/settings-billing-data"

export function SettingsBillingInvoices({ invoices, onDownload }: { invoices: Invoice[]; onDownload?: (invoice: Invoice) => void }) {
  const [all, setAll] = React.useState(false)
  const shown = all ? invoices : invoices.slice(0, 3)
  return (
    <div className="grid gap-6">
      <ul aria-label="Invoices" className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),18rem))] gap-x-6 gap-y-10">
        {shown.map((inv, i) => (
          <li key={inv.number} className="grid w-full content-between justify-items-center gap-3">
            <Receipt as="article" seed={`invoice-${inv.number}`} aria-label={`Invoice ${inv.number}`} ends={i % 2 ? "perf" : "zig"} className="w-full max-w-72">
              <ReceiptHeader>
                <span>Looseleaf</span>
                <span>Invoice {inv.number}</span>
                <span>{inv.date}</span>
              </ReceiptHeader>
              <ReceiptLines>
                {inv.lines.map((l) => (
                  <ReceiptLine key={l.name} price={l.price}>
                    {l.name}
                  </ReceiptLine>
                ))}
              </ReceiptLines>
              <ReceiptTotal circled={i === 0}>{inv.total}</ReceiptTotal>
              <ReceiptFooter>paid by {inv.paidWith} - thank you</ReceiptFooter>
            </Receipt>
            <Button variant="outline" size="sm" onClick={() => onDownload?.(inv)} aria-label={`Download invoice ${inv.number}`}>
              <Icon name="download" />
              Download PDF
            </Button>
          </li>
        ))}
      </ul>
      {invoices.length > 3 ? (
        <Button variant="link" className="justify-self-start" aria-expanded={all} onClick={() => setAll((v) => !v)}>
          {all ? "Show fewer invoices" : `Show ${invoices.length - 3} older invoices`}
        </Button>
      ) : null}
    </div>
  )
}
