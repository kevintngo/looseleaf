"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Paper } from "@/components/ui/paper"
import { Separator } from "@/components/ui/separator"
import { Footer01Brand } from "@/blocks/footer-01/components/footer-01-brand"
import { Footer01Links } from "@/blocks/footer-01/components/footer-01-links"

const social = [
  { label: "Email us", icon: "mail", href: "mailto:hello@penmark.example" },
  { label: "Read the blog", icon: "book-open", href: "#blog" },
  { label: "Join the chat", icon: "message-circle", href: "#chat" },
  { label: "See the source", icon: "code", href: "#source" },
]

export default function Footer01() {
  return (
    <div className="@container w-full">
      <div className="px-4 pt-14 pb-6 @xl:px-8">
        <Paper as="footer" stock="kraft" edge={{ top: "torn" }} tilt={false} seed="footer-01" className="mx-auto max-w-6xl px-6 pt-12 pb-7 @xl:px-12">
          <div className="grid gap-12 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <Footer01Brand />
            <Footer01Links />
          </div>

          <Separator variant="stitched" className="my-8" />

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 text-[15px] text-ink">
            <p>&copy; 2026 Penmark. Every page checked by hand.</p>
            <ul role="list" className="flex list-none items-center gap-1" aria-label="Elsewhere">
              {social.map((s) => (
                <li key={s.label}>
                  <Button asChild variant="ghost" size="icon">
                    <a href={s.href} aria-label={s.label}>
                      <Icon name={s.icon} size={20} />
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <a href="#privacy" className="inline-block py-1 underline underline-offset-4 hover:ll-swipe">
                Privacy
              </a>
              <a href="#terms" className="inline-block py-1 underline underline-offset-4 hover:ll-swipe">
                Terms
              </a>
              <Badge tone="grass">All systems normal</Badge>
            </div>
          </div>
        </Paper>
      </div>
    </div>
  )
}
