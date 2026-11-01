import Features01 from "@/blocks/features-01/page"
import { Desk } from "@/components/ui/desk"

export default function Features01Preview() {
  return (
    <Desk className="min-h-[inherit]">
      <Features01 />
      <Features01 variant="bento" title="Or pin it all to a corkboard" lead="The same section, five things on cork." />
    </Desk>
  )
}
