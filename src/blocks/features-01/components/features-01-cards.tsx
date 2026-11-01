import { Button } from "@/components/ui/button"
import { Doodle } from "@/components/ui/doodle"
import { Icon } from "@/components/ui/icon"
import { IndexCard, IndexCardContent, IndexCardFooter, IndexCardHeader, IndexCardTitle } from "@/components/ui/index-card"
import { Fastener } from "@/components/ui/paper"

const FEATURES = [
  {
    id: "write",
    title: "Write together",
    doodle: "pencil",
    body: "Everyone edits the same page at once, with little name flags for cursors. No more “which version is final?”",
    link: "How writing works",
    dress: {},
  },
  {
    id: "keep",
    title: "Never lose a page",
    doodle: "book",
    body: "Every change is kept for a year. Wind a page back to last Tuesday, or lift a single paragraph out of it.",
    link: "About history",
    dress: { tape: "top" as const, tapeKind: "washi-dots" as const },
  },
  {
    id: "share",
    title: "Share the good bits",
    doodle: "paper-plane",
    body: "Send one page, a whole notebook, or a single line. People without an account can read along.",
    link: "About sharing",
    dress: { fastener: "clip" as const },
  },
]

function Features01Cards() {
  return (
    <ul role="list" className="grid list-none gap-x-8 gap-y-12 @3xl:grid-cols-3" data-slot="features-cards">
      {FEATURES.map((f, i) => (
        <li key={f.id} className="@3xl:[&:nth-child(2)]:mt-8">
          <IndexCard as="article" seed={`feature-${f.id}`} className="mx-auto" {...f.dress}>
            {f.id === "write" ? <Fastener kind="pin" seed="feature-write-pin" className="absolute -top-2 end-10 calm:hidden" /> : null}
            <IndexCardHeader>
              <IndexCardTitle>
                <h3 className="inline">{f.title}</h3>
              </IndexCardTitle>
            </IndexCardHeader>
            <IndexCardContent>
              <Doodle name={f.doodle} size={56} seed={`doodle-${f.id}`} className="float-end mt-0.5 ms-3" />
              {f.body}
            </IndexCardContent>
            <IndexCardFooter>
              <Button asChild variant="link" size="sm" className="-ms-3">
                <a href={`#${f.id}`}>
                  {f.link}
                  <Icon name="arrow-right" className="rtl:-scale-x-100" />
                </a>
              </Button>
              <span className="ll-num">no. {String(i + 1).padStart(4, "0")}</span>
            </IndexCardFooter>
          </IndexCard>
        </li>
      ))}
    </ul>
  )
}

export { Features01Cards }
