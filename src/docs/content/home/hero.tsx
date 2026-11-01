import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Underline } from "@/components/ui/underline"
import { useCatalog } from "../../core/catalog-context"
import { Link } from "../../core/router"
import { paths } from "../../core/router-core"
import SignIn from "./sign-in"

export function Hero() {
  const catalog = useCatalog()
  const count = catalog.components.length
  return (
    <header data-slot="home-hero" className="grid items-center gap-x-14 gap-y-12 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,25rem)]">
      <div className="min-w-0">
        <h1 tabIndex={-1} className="font-script text-7xl leading-[0.95] font-bold tracking-tight text-ink outline-none @xl:text-8xl">
          Looseleaf
        </h1>
        <p className="mt-5 font-script text-3xl leading-tight font-bold text-ink @xl:text-4xl">
          shadcn/ui,{" "}
          <Underline tone="marker" seed="tagline">
            drawn by hand.
          </Underline>
        </p>
        <p className="mt-5 max-w-[32rem] text-lg text-ink-soft">
          {count > 0 ? `${count} components` : "Every component"} as real, accessible React that you copy into your project. Same parts and props as shadcn/ui, same Radix underneath.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-4">
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
        <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[15px] text-ink-soft">
          <span className="font-type text-sm">React 19 / Tailwind v4 / Radix / MIT</span>
          <span>
            Made by{" "}
            <a href="https://x.com/kevin_t_ngo" target="_blank" rel="noreferrer noopener" className="font-bold text-link underline decoration-2 underline-offset-4 hover:text-link-hover">
              Kevin T. Ngo<span className="sr-only"> on X (opens in a new tab)</span>
            </a>
          </span>
        </p>
      </div>
      <SignIn />
    </header>
  )
}
