import Page from "@/blocks/dashboard-01/page"
import { Desk } from "@/components/ui/desk"

export default function Dashboard01Preview() {
  return (
    <Desk className="h-[780px] w-full overflow-hidden [transform:translateZ(0)]">
      <Page contained />
    </Desk>
  )
}
