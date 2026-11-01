import { Receipt, ReceiptBarcode, ReceiptFooter, ReceiptHeader, ReceiptLine, ReceiptLines, ReceiptTotal } from "@/components/ui/receipt"
import { ACCOUNTS, money, shortDate, TODAY } from "@/blocks/dashboard-finance/components/dashboard-finance-data"

export function Balances() {
  const total = ACCOUNTS.reduce((sum, a) => sum + a.cents, 0)
  return (
    <section aria-labelledby="finance-balances" className="flex justify-center">
      <Receipt fastener="clip" seed="finance-balances">
        <ReceiptHeader>
          <h2 id="finance-balances">Balances</h2>
          <div>Marigold household</div>
          <div>{shortDate(TODAY)}, 2026</div>
        </ReceiptHeader>
        <ReceiptLines>
          {ACCOUNTS.map((a) => (
            <ReceiptLine key={a.name} price={a.cents < 0 ? <span className="text-red">{money(a.cents)}</span> : money(a.cents)}>
              {a.name}
            </ReceiptLine>
          ))}
        </ReceiptLines>
        <ReceiptTotal label="Net worth" circled seed="finance-total">
          {money(total)}
        </ReceiptTotal>
        <ReceiptBarcode value="0042 1187 0925" />
        <ReceiptFooter>Checked this morning. Thank you, come again.</ReceiptFooter>
      </Receipt>
    </section>
  )
}
