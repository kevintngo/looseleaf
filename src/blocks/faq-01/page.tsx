"use client"

import * as React from "react"

import { Lettering } from "@/components/ui/lettering"
import { Faq01Help } from "@/blocks/faq-01/components/faq-01-help"
import { Faq01Sheet } from "@/blocks/faq-01/components/faq-01-sheet"

export default function Faq01() {
  const titleId = React.useId()
  return (
    <section aria-labelledby={titleId} className="@container w-full">
      <div className="px-8 py-14 @xl:py-20">
        <div className="mx-auto grid max-w-5xl gap-x-12 gap-y-10 @3xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] @3xl:items-start">
          <header className="@3xl:col-start-1 @3xl:row-start-1">
            <Lettering as="h2" id={titleId} size="lg" tone="grass" wobble={0.4} seed="faq-title">
              Questions, answered
            </Lettering>
            <p className="mt-4 text-xl/8 text-ink-soft">The ones we get every week, in our own words.</p>
          </header>
          <div className="@3xl:col-start-2 @3xl:row-span-2 @3xl:row-start-1">
            <Faq01Sheet />
          </div>
          <div className="@3xl:col-start-1 @3xl:row-start-2">
            <Faq01Help />
          </div>
        </div>
      </div>
    </section>
  )
}
