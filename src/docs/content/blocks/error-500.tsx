import Error500 from "@/blocks/error-500/page"
import { Desk } from "@/components/ui/desk"

export default function Error500Preview() {
  return (
    <Desk className="min-h-[inherit]">
      <Error500 onRetry={() => {}} />
    </Desk>
  )
}
