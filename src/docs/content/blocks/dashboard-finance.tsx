import DashboardFinance from "@/blocks/dashboard-finance/page"
import { Desk } from "@/components/ui/desk"

export default function DashboardFinancePreview() {
  return (
    <Desk className="p-3 sm:p-6">
      <DashboardFinance as="div" />
    </Desk>
  )
}
