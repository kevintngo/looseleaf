"use client"

import * as React from "react"

import { Lettering } from "@/components/ui/lettering"
import { Features01Bento } from "@/blocks/features-01/components/features-01-bento"
import { Features01Cards } from "@/blocks/features-01/components/features-01-cards"

type Features01Props = {
  variant?: "cards" | "bento"
  title?: string
  lead?: string
}

export default function Features01({ variant = "cards", title = "Everything a good notebook does", lead = "Three things we sweated over, and a few we quietly love." }: Features01Props) {
  const titleId = React.useId()
  return (
    <section aria-labelledby={titleId} className="@container w-full" data-variant={variant}>
      <div className="px-4 py-14 @xl:px-8 @xl:py-20">
        <div className="mx-auto max-w-6xl">
          <header className="mx-auto max-w-2xl text-center">
            <p className="font-type text-sm text-ink-soft">What&rsquo;s inside</p>
            <Lettering as="h2" id={titleId} size="lg" tone="sky" wobble={0.4} seed={`features-${variant}`} className="mt-3">
              {title}
            </Lettering>
            <p className="mt-4 text-xl/8 text-ink-soft">{lead}</p>
          </header>
          <div className="mt-14 @xl:mt-16">{variant === "bento" ? <Features01Bento /> : <Features01Cards />}</div>
        </div>
      </div>
    </section>
  )
}

export type { Features01Props }
