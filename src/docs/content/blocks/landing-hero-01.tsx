import LandingHero01 from "@/blocks/landing-hero-01/page"
import { Desk } from "@/components/ui/desk"

export default function LandingHero01Preview() {
  return (
    <Desk className="min-h-[inherit]" objects={["pencil"]} seed="landing-hero-01">
      <LandingHero01 />
    </Desk>
  )
}
