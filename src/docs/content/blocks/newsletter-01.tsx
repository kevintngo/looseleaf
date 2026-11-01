import Newsletter01 from "@/blocks/newsletter-01/page"
import { Desk } from "@/components/ui/desk"

export default function Newsletter01Preview() {
  return (
    <Desk className="min-h-[inherit]" objects={["coffee"]} seed="newsletter-01">
      <Newsletter01 />
    </Desk>
  )
}
