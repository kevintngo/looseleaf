import { lazy } from "react"
import { Mascot } from "@/components/ui/mascot"
import { Paper } from "@/components/ui/paper"
import { LazyOnView } from "./home/lazy-on-view"
import type { DecoItem } from "./home/deco"

const Deco = lazy(() => import("./home/deco"))

const STICKERS: readonly DecoItem[] = [
  { kind: "sticker", name: "rainbow", size: 84, rotate: -9, className: "top-0 left-0" },
  { kind: "sticker", name: "party-popper", size: 72, rotate: -6, className: "top-36 right-4 @sm:right-16" },
  { kind: "sticker", name: "rocket", size: 100, rotate: 14, className: "right-3 bottom-2" },
]

export default function HomeHeroArt() {
  return (
    <div data-slot="home-hero-art" className="@container relative mx-auto h-80 w-full max-w-md">
      <Paper stock="sticky-yellow" fastener="pin" seed="hero-note" className="absolute top-1 right-3 w-52 px-4 pt-5 pb-4">
        <p className="font-script text-[1.7rem] leading-[1.1] font-bold text-ink">psst: the desk below works. poke it.</p>
      </Paper>
      <Mascot pose="wave" size={124} seed="hero-stubby" className="absolute bottom-0 left-8 h-auto w-44 [--ll-blend:normal] @sm:w-60" />
      <LazyOnView height={0} slip={false} delay={500} className="contents">
        <Deco items={STICKERS} />
      </LazyOnView>
    </div>
  )
}
