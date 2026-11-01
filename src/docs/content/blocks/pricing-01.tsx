import Pricing01 from "@/blocks/pricing-01/page"
import { Desk } from "@/components/ui/desk"

export default function Pricing01Preview() {
  return (
    <Desk objects={["pencil", "clips"]} seed="pricing-01-desk">
      <Pricing01 />
    </Desk>
  )
}
