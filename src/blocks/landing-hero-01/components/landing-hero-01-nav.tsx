import { Button } from "@/components/ui/button"
import { Mascot } from "@/components/ui/mascot"

const links = ["Product", "Pricing", "Notes", "Changelog"]

function LandingHero01Nav() {
  return (
    <header className="flex items-center justify-between gap-4 pt-6">
      <a href="#top" className="flex items-center gap-2 font-script text-3xl leading-none font-bold text-ink">
        <Mascot pose="idle" size={32} />
        penmark
      </a>
      <nav aria-label="Main" className="hidden items-center gap-3 text-base text-ink @2xl:flex">
        {links.map((l) => (
          <a key={l} href={`#${l.toLowerCase()}`} className="px-3 py-1 hover:ll-swipe">
            {l}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="hidden @md:inline-flex">
          <a href="#sign-in">Sign in</a>
        </Button>
        <Button asChild size="sm">
          <a href="#start">Get started</a>
        </Button>
      </div>
    </header>
  )
}

export { LandingHero01Nav }
