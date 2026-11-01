import Onboarding01 from "@/blocks/onboarding-01/page"
import { Desk } from "@/components/ui/desk"

export default function Onboarding01Preview() {
  return (
    <Desk className="min-h-[inherit]" objects={["pencil"]} seed="onboarding-01">
      <Onboarding01 />
    </Desk>
  )
}
