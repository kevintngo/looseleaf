"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Lettering } from "@/components/ui/lettering"
import { Ribbon } from "@/components/ui/ribbon"
import { LandingHero02Window } from "@/blocks/landing-hero-02/components/landing-hero-02-window"

export default function LandingHero02() {
  const titleId = React.useId()
  return (
    <section aria-labelledby={titleId} className="@container relative w-full overflow-x-clip">
      <div className="relative px-8 pt-10 pb-16 @xl:pt-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center [--ll-blend:normal]">
          <Ribbon variant="banner" tone="tangerine" seed="hero-2-ribbon">
            Version 2 is here
          </Ribbon>
          <Lettering as="h1" id={titleId} size="xl" tone="teal" duotone="bubblegum" wobble={0.4} seed="hero-2-title" className="mt-6">
            Your whole week, on one page.
          </Lettering>
          <p className="mt-6 max-w-2xl text-xl/8 text-balance text-ink-soft @xl:text-[22px]/9">
            Tasks, notes and the odd doodle, kept together where the whole team can see them. Nothing to configure, and it&rsquo;s a pleasure to tick things off.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
            <Button asChild size="lg">
              <a href="#start">
                Try it free
                <Icon name="arrow-right" className="rtl:-scale-x-100" />
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#demo">Book a demo</a>
            </Button>
          </div>
          <p className="mt-4 text-[15px] text-ink-muted">14 days of everything. Then free for small teams, for good.</p>
        </div>

        <LandingHero02Window className="mt-28 @xl:mt-32" />
      </div>
    </section>
  )
}
