"use client"

import * as React from "react"

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Annotate } from "@/components/ui/annotate"
import { Icon } from "@/components/ui/icon"
import { Lettering } from "@/components/ui/lettering"
import { Paper } from "@/components/ui/paper"
import { Rating } from "@/components/ui/rating"
import { LandingHero01Collage } from "@/blocks/landing-hero-01/components/landing-hero-01-collage"
import { LandingHero01Nav } from "@/blocks/landing-hero-01/components/landing-hero-01-nav"

const people = ["Ada Lovelace", "Jo Okafor", "Mika Kobayashi", "Sam Reyes"]

export default function LandingHero01() {
  const titleId = React.useId()
  return (
    <div className="@container relative w-full overflow-x-clip">
      <div className="p-8">
        <Paper
          as="section"
          aria-labelledby={titleId}
          stock="paper"
          tilt={false}
          tape="both"
          tapeKind="washi-dots"
          seed="landing-hero-01"
          className="mx-auto w-full max-w-6xl px-5 pb-14 @xl:px-10 @xl:pb-16"
        >
          <LandingHero01Nav />

          <div className="mt-10 grid items-center gap-12 @5xl:mt-14 @5xl:grid-cols-[minmax(0,1fr)_26rem] @5xl:gap-12">
            <div className="min-w-0">
              <p className="font-type text-sm text-pencil-text">Notes and tasks for small teams</p>
              <Lettering as="h1" id={titleId} size="xl" tone="marker" wobble={0.5} seed="hero-title" className="mt-3">
                Write it down.
              </Lettering>
              <p className="mt-5 max-w-xl text-xl/8 text-balance text-ink-soft @xl:text-[22px]/9">
                Penmark keeps your team&rsquo;s notes, tasks and half-formed ideas on{" "}
                <Annotate type="underline" kind="wavy" color="blue" animate delay={600} seed="hero-underline">
                  one calm page
                </Annotate>
                , so the good stuff gets{" "}
                <Annotate type="highlight" color="yellow" animate delay={1100} seed="hero-highlight">
                  found
                </Annotate>
                , not lost.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
                <Button asChild size="lg">
                  <a href="#start">
                    Start a notebook
                    <Icon name="arrow-right" className="rtl:-scale-x-100" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#tour">
                    <Icon name="circle-play" />
                    Watch the tour
                  </a>
                </Button>
              </div>
              <p className="mt-4 text-[15px] text-ink-muted">
                <Annotate type="circle" color="red" animate delay={1600} seed="hero-free" className="mx-1">
                  Free
                </Annotate>{" "}
                for teams of five. No card, no catch.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
                <AvatarGroup className="[--ll-avatar-group-ring:var(--ll-paper)] [&>*+*]:-ms-0.5">
                  {people.map((name) => (
                    <Avatar key={name}>
                      <AvatarFallback name={name} />
                    </Avatar>
                  ))}
                  <AvatarGroupCount>+4k</AvatarGroupCount>
                </AvatarGroup>
                <div>
                  <Rating readOnly value={4.5} allowHalf size="sm" aria-label="Rated 4.5 out of 5 by our customers" />
                  <p className="text-sm text-ink-muted">Loved by 4,200 small teams</p>
                </div>
              </div>
            </div>

            <LandingHero01Collage />
          </div>
        </Paper>
      </div>
    </div>
  )
}
