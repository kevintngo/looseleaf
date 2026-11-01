"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Lettering } from "@/components/ui/lettering"
import { Paper } from "@/components/ui/paper"
import { Error500Scene } from "@/blocks/error-500/components/error-500-scene"
import { Error500Slip } from "@/blocks/error-500/components/error-500-slip"

type Error500Props = {
  reference?: string
  request?: string
  time?: string
  onRetry?: () => void
}

export default function Error500({ reference = "7F3A-91C2", request = "/notebooks/48", time = "09:41 UTC", onRetry = () => window.location.reload() }: Error500Props) {
  const titleId = React.useId()
  return (
    <section aria-labelledby={titleId} className="@container w-full">
      <div className="px-8 py-10 @xl:py-14">
        <Paper stock="paper" tilt={false} tape="both" tapeKind="washi-stripes" seed="error-500" className="mx-auto max-w-3xl px-6 py-12 text-center @xl:px-12">
          <Error500Scene />

          <p className="mt-10 font-type text-sm text-pencil-text">Error 500 &middot; Server error</p>
          <Lettering as="h1" id={titleId} size="md" tone="tomato" wobble={0.4} seed="error-500-title" className="mt-3">
            Something broke on our side
          </Lettering>
          <p className="mx-auto mt-4 max-w-md text-lg/7 text-ink-soft">It is not you, and nothing you wrote is lost. We have been told, and somebody is already sharpening a pencil.</p>

          <div className="mt-8">
            <Error500Slip reference={reference} request={request} time={time} />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
            <Button type="button" size="lg" onClick={onRetry}>
              <Icon name="rotate-cw" />
              Try again
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#home">Go home</a>
            </Button>
            <Button asChild size="lg" variant="link">
              <a href="#status">
                Check the status page
                <Icon name="arrow-up-right" className="rtl:-scale-x-100" />
              </a>
            </Button>
          </div>
        </Paper>
      </div>
    </section>
  )
}

export type { Error500Props }
