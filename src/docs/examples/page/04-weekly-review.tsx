import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Page, PageContent, PageDescription, PageFooter, PageHeader, PageTitle } from "@/components/ui/page"
import { Sticker } from "@/components/ui/sticker"
import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "A weekly review",
  description: "A real page: three-hole punched, a form on it, a sticker stuck to the corner. Everything on the sheet is ordinary, accessible DOM.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const done = ["Ink the outline", "Wash the sky, then wait", "Hatch the shade"]

export default function Example() {
  return (
    <Page as="article" holes reinforced seed="review" width="md" aria-labelledby="review-title">
      <Sticker name="done" size={72} rotate={8} className="absolute -top-5 -right-3 z-10" />
      <PageHeader>
        <PageTitle id="review-title">Weekly review</PageTitle>
        <PageDescription>What got finished, what did not, and one thing to try on Monday.</PageDescription>
      </PageHeader>
      <PageContent>
        <fieldset className="space-y-2">
          <legend className="mb-2 font-bold">Finished</legend>
          {done.map((item, i) => (
            <div key={item} className="flex items-center gap-3">
              <Checkbox id={`review-${i}`} defaultChecked={i < 2} />
              <Label htmlFor={`review-${i}`}>{item}</Label>
            </div>
          ))}
        </fieldset>
        <div className="space-y-2">
          <Label htmlFor="review-note">One thing for Monday</Label>
          <Textarea id="review-note" ruled placeholder="Start with the sky." />
        </div>
      </PageContent>
      <PageFooter>
        <span className="ll-num">week 39</span>
        <Button>File it</Button>
      </PageFooter>
    </Page>
  )
}
