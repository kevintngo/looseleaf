"use client"

import * as React from "react"

import { Marquee, MarqueeItem } from "@/components/ui/marquee"
import { LOGOS, Logos01Name } from "@/blocks/logos-01/components/logos-01-names"

const ROW_A = LOGOS.slice(0, 4)
const ROW_B = LOGOS.slice(4)

export default function Logos01() {
  const titleId = React.useId()
  const [paused, setPaused] = React.useState(false)
  return (
    <section aria-labelledby={titleId} className="@container w-full">
      <div className="px-4 py-14 @xl:px-8 @xl:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 id={titleId} className="text-center font-type text-sm tracking-[0.18em] text-ink-soft uppercase">
            Kept on desks at
          </h2>

          <div className="mt-8 grid gap-3 motion-reduce:hidden [[data-motion=reduced]_&]:hidden">
            <Marquee label="Teams that use Penmark" tape="washi-stripes" color="tangerine" speed={46} paused={paused} onPausedChange={setPaused} seed="logos-a">
              {ROW_A.map((logo) => (
                <MarqueeItem key={logo.name}>
                  <Logos01Name logo={logo} />
                </MarqueeItem>
              ))}
            </Marquee>
            <Marquee label="More teams that use Penmark" tape="washi-gingham" color="sky" direction="end" speed={38} paused={paused} controls={false} seed="logos-b">
              {ROW_B.map((logo) => (
                <MarqueeItem key={logo.name}>
                  <Logos01Name logo={logo} />
                </MarqueeItem>
              ))}
            </Marquee>
          </div>

          <ul
            aria-label="Teams that use Penmark"
            className="mt-8 hidden list-none flex-wrap items-center justify-center gap-x-10 gap-y-4 text-ink motion-reduce:flex [[data-motion=reduced]_&]:flex"
          >
            {LOGOS.map((logo) => (
              <li key={logo.name}>
                <Logos01Name logo={logo} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
