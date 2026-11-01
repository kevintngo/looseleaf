import Faq01 from "@/blocks/faq-01/page"
import { Desk } from "@/components/ui/desk"

export default function Faq01Preview() {
  return (
    <Desk className="min-h-[inherit]" objects={["pencil"]} seed="faq-01">
      <Faq01 />
    </Desk>
  )
}
