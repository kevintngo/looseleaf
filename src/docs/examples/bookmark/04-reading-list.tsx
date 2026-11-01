import * as React from "react"

import { Bookmark } from "@/components/ui/bookmark"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const meta = {
  title: "A reading list",
  description: "A real use: save articles for later. Each card holds a Bookmark; the count follows. State lives in your app, as with any toggle.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const articles = [
  { id: "margin", title: "Why the margin is the best part", meta: "Notebook - 4 min" },
  { id: "paper", title: "On paper that has tooth", meta: "Materials - 6 min" },
  { id: "hands", title: "Nothing is drawn straight", meta: "Craft - 3 min" },
]

export default function Example() {
  const [saved, setSaved] = React.useState<Record<string, boolean>>({ paper: true })
  const count = Object.values(saved).filter(Boolean).length
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
      <p className="font-script text-2xl text-ink" aria-live="polite">
        Saved for later: {count} of {articles.length}
      </p>
      {articles.map((a, i) => (
        <Card key={a.id} stock="index-card" seed={a.id} className="relative gap-1 py-5" tilt={i % 2 ? 0.2 : -0.2}>
          <Bookmark className="absolute -top-1 end-6" tone={i === 1 ? "teal" : "tomato"} seed={a.id} pressed={!!saved[a.id]} onPressedChange={(p) => setSaved((s) => ({ ...s, [a.id]: p }))}>
            Save: {a.title}
          </Bookmark>
          <CardHeader className="pe-16">
            <CardTitle>{a.title}</CardTitle>
            <CardDescription>{a.meta}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
