import LandingHero02 from "@/blocks/landing-hero-02/page"
import { Desk } from "@/components/ui/desk"

export default function LandingHero02Preview() {
  return (
    <Desk className="min-h-[inherit]" objects={["pencil", "clips"]} seed="landing-hero-02">
      <LandingHero02 />
    </Desk>
  )
}
