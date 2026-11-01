import Testimonials01 from "@/blocks/testimonials-01/page"
import { Desk } from "@/components/ui/desk"

export default function Testimonials01Preview() {
  return (
    <Desk className="min-h-[inherit]" objects={["pins"]} seed="testimonials-01">
      <Testimonials01 />
    </Desk>
  )
}
