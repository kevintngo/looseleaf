import Checkout01 from "@/blocks/checkout-01/page"
import { Desk } from "@/components/ui/desk"

export default function Checkout01Preview() {
  return (
    <Desk objects={["coffee", "pins"]} seed="checkout-01-desk">
      <Checkout01 />
    </Desk>
  )
}
