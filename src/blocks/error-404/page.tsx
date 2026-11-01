"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { Lettering } from "@/components/ui/lettering"
import { Paper } from "@/components/ui/paper"
import { Error404Scene } from "@/blocks/error-404/components/error-404-scene"

type Error404Props = {
  onSearch?: (query: string) => void
  onGoBack?: () => void
}

export default function Error404({ onSearch, onGoBack = () => window.history.back() }: Error404Props) {
  const titleId = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return
      e.preventDefault()
      inputRef.current?.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  return (
    <section aria-labelledby={titleId} className="@container w-full">
      <div className="px-8 py-10 @xl:py-14">
        <Paper stock="paper" tilt={false} tape="both" tapeKind="masking" seed="error-404" className="mx-auto max-w-3xl px-6 py-12 text-center @xl:px-12">
          <Error404Scene />

          <p className="mt-10 font-type text-sm text-pencil-text">Error 404 &middot; Page not found</p>
          <Lettering as="h1" id={titleId} size="md" tone="marker" wobble={0.4} seed="error-404-title" className="mt-3">
            This page wandered off
          </Lettering>
          <p className="mx-auto mt-4 max-w-md text-lg/7 text-ink-soft">We looked under the desk, behind the stapler and in the recycling. Nothing. The link may be old, or mistyped.</p>

          <form
            role="search"
            className="mx-auto mt-8 max-w-md"
            onSubmit={(e) => {
              e.preventDefault()
              onSearch?.(query.trim())
            }}
          >
            <InputGroup>
              <InputGroupAddon>
                <Icon name="search" />
              </InputGroupAddon>
              <InputGroupInput ref={inputRef} type="search" name="q" className="text-start" aria-label="Search the site" placeholder="Try searching for pages…" value={query} onChange={(e) => setQuery(e.target.value)} />
              <InputGroupAddon align="inline-end" className="max-sm:hidden">
                <Kbd aria-hidden="true">/</Kbd>
              </InputGroupAddon>
            </InputGroup>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
            <Button asChild size="lg">
              <a href="#home">
                <Icon name="house" />
                Take me home
              </a>
            </Button>
            <Button type="button" size="lg" variant="outline" onClick={onGoBack}>
              <Icon name="arrow-left" className="rtl:-scale-x-100" />
              Go back
            </Button>
          </div>

          <p className="mt-8 text-[15px] text-ink-muted">
            Still lost?{" "}
            <a href="#contact" className="text-link underline underline-offset-4 hover:text-link-hover">
              Tell us what you were looking for
            </a>
            .
          </p>
        </Paper>
      </div>
    </section>
  )
}

export type { Error404Props }
