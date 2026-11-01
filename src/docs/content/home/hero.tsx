import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Lettering } from "@/components/ui/lettering"
import { Underline } from "@/components/ui/underline"
import { useCatalog } from "../../core/catalog-context"
import { Link } from "../../core/router"
import { paths } from "../../core/router-core"
import HomeHeroArt from "../home-hero"

export function Hero() {
  const catalog = useCatalog()
  const count = catalog.components.length
  return (
    <header data-slot="home-hero" className="grid items-center gap-x-8 gap-y-6 @3xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="min-w-0">
        <p className="font-type text-sm text-ink-soft">A paper-and-felt-tip component library</p>
        <Lettering as="h1" size="hero" tone="marker" wobble={0.5} seed="looseleaf" tabIndex={-1} className="mt-2 outline-none sm:text-8xl @5xl:text-9xl">
          Looseleaf
        </Lettering>
        <p className="mt-3 font-script text-4xl leading-tight font-bold text-ink @xl:text-5xl">
          shadcn/ui,{" "}
          <Underline kind="wavy" tone="marker" seed="tagline">
            drawn by hand.
          </Underline>
        </p>
        <p className="mt-5 max-w-[34rem] text-lg text-ink-soft">
          {count > 0 ? `${count} components` : "Every component"} as real, accessible React that you copy into your project. Same parts and props as shadcn/ui, same Radix underneath. A notebook for a skin.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button asChild size="lg" seed="cta-start">
            <Link to={paths.gettingStarted}>
              Get started
              <Icon name="arrow-right" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" seed="cta-browse">
            <Link to={paths.components()}>Browse components</Link>
          </Button>
        </div>
        <p className="mt-5 font-type text-sm text-ink-soft">React 19 / Tailwind v4 / Radix / MIT</p>
        <p className="mt-2 text-[15px] text-ink-soft">
          Made by{" "}
          <a href="https://x.com/kevin_t_ngo" target="_blank" rel="noreferrer noopener" className="font-bold text-link underline decoration-2 underline-offset-4 hover:text-link-hover">
            Kevin T. Ngo<span className="sr-only"> on X (opens in a new tab)</span>
          </a>
        </p>
      </div>
      <HomeHeroArt />
    </header>
  )
}
