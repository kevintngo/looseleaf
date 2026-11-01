import DashboardAnalytics from "@/blocks/dashboard-analytics/page"
import { Desk } from "@/components/ui/desk"

export default function DashboardAnalyticsPreview() {
  return (
    <Desk className="p-3 sm:p-6">
      <DashboardAnalytics as="div" />
    </Desk>
  )
}
