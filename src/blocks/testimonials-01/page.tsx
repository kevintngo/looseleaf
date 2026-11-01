"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Lettering } from "@/components/ui/lettering"
import { Rating } from "@/components/ui/rating"
import { Testimonials01Wall } from "@/blocks/testimonials-01/components/testimonials-01-wall"

export default function Testimonials01() {
  const titleId = React.useId()
  return (
    <section aria-labelledby={titleId} className="@container w-full">
      <div className="px-8 py-14 @xl:py-20">
        <div className="mx-auto max-w-6xl">
          <header className="mx-auto flex max-w-2xl flex-col items-center text-center [--ll-blend:normal]">
            <Lettering as="h2" id={titleId} size="lg" tone="tangerine" wobble={0.4} seed="testimonials-title">
              Kind words, pinned up
            </Lettering>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <Rating readOnly value={5} aria-label="Rated 4.9 out of 5" />
              <p className="text-lg text-ink-soft">
                <span className="ll-num font-bold text-ink">4.9</span> average from 2,300 reviews
              </p>
            </div>
          </header>

          <div className="mt-14 @xl:mt-16">
            <Testimonials01Wall />
          </div>

          <p className="mt-14 text-center [--ll-blend:normal]">
            <Button asChild variant="outline">
              <a href="#reviews">
                Read all the reviews
                <Icon name="arrow-right" className="rtl:-scale-x-100" />
              </a>
            </Button>
          </p>
        </div>
      </div>
    </section>
  )
}
