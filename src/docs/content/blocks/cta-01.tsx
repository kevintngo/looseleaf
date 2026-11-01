import Cta01 from "@/blocks/cta-01/page"
import { Desk } from "@/components/ui/desk"

export default function Cta01Preview() {
  return (
    <Desk className="min-h-[inherit]" objects={["clips"]} seed="cta-01">
      <Cta01 />
    </Desk>
  )
}
