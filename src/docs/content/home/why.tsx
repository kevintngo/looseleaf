import { useCatalog } from "../../core/catalog-context"
import { IndexCard, IndexCardContent, IndexCardFooter, IndexCardHeader, IndexCardTitle } from "@/components/ui/index-card"
import { DeskSection } from "./section"

const REASONS = [
  {
    key: "practical",
    title: "Practical",
    flag: "tomato",
    text: "Same parts, props and data-slot names. Add one with the CLI and it lands in your repo: your code, not a dependency.",
    foot: "drop-in registry",
  },
  {
    key: "handmade",
    title: "Handmade",
    flag: "sky",
    text: "Lines have pressure. Fills are solid and sit in their outlines. Paper has tooth. Every stroke is seeded, so the server and the client draw the same hand.",
    foot: "no two alike",
  },
  {
    key: "accessible",
    title: "Accessible",
    flag: "grass",
    text: "Radix underneath: keyboard, focus rings, AA text, 24 px targets, reduced motion, forced colors. The charm is decoration; the semantics are ordinary.",
    foot: "axe-checked",
  },
  {
    key: "themeable",
    title: "Themeable",
    flag: "grape",
    text: "One set of tokens, three densities. Change --ll-marker and everything follows; switch on calm and a dense dashboard goes quiet.",
    foot: "tokens + themes",
  },
] as const

export function Why() {
  const own = useCatalog().components.filter((c) => !c.doc.upstream).length
  const lead = own > 0 ? `Every shadcn component, plus ${own} of our own.` : "Every shadcn component."
  return (
    <DeskSection id="why" title="Why Looseleaf" lede="A design system that is fun to look at is only worth shipping if it is also a good component library. Both, on purpose.">
      <ul role="list" className="grid gap-x-10 gap-y-12 @2xl:grid-cols-2">
        {REASONS.map((r, i) => (
          <li key={r.key} className="min-w-0">
            <IndexCard data-home={`why-${r.key}`} seed={`why-${r.key}`} flag={r.flag} stack={i % 2 === 0 ? 1 : 0} className="min-h-72 max-w-none">
              <IndexCardHeader>
                <IndexCardTitle role="heading" aria-level={3}>
                  {r.title}
                </IndexCardTitle>
              </IndexCardHeader>
              <IndexCardContent>
                <p>{r.key === "practical" ? `${lead} ${r.text}` : r.text}</p>
              </IndexCardContent>
              <IndexCardFooter>
                <span>{r.foot}</span>
                <span className="ll-num">{i + 1} of 4</span>
              </IndexCardFooter>
            </IndexCard>
          </li>
        ))}
      </ul>
    </DeskSection>
  )
}
