import Error404 from "@/blocks/error-404/page"
import { Desk } from "@/components/ui/desk"

export default function Error404Preview() {
  return (
    <Desk className="min-h-[inherit]" seed="error-404">
      <Error404 onGoBack={() => {}} />
    </Desk>
  )
}
