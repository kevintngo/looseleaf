import { Page, PageContent, PageDescription, PageFooter, PageHeader, PageTitle } from "@/components/ui/page"

export const meta = {
  title: "Torn from a pad",
  description: "`torn` is a shorthand for the edge. Pair it with a slip, a highlighted title and a tape strip.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="@container w-full">
      <div className="grid gap-10 p-2 @2xl:grid-cols-2">
        <Page torn stock="slip" width="sm" tape="top" seed="pad" className="min-h-[20rem]">
          <PageHeader>
            <PageTitle underline="highlight">Order pad</PageTitle>
            <PageDescription>Top edge ragged.</PageDescription>
          </PageHeader>
          <PageContent>
            <p>2 x oat latte, one for the road.</p>
            <p>1 x croissant, warm.</p>
          </PageContent>
          <PageFooter>
            <span>no. 0042</span>
          </PageFooter>
        </Page>
        <Page torn="both" stock="paper" width="sm" fastener="clip" seed="scrap" className="min-h-[20rem]">
          <PageHeader>
            <PageTitle underline="none">A scrap</PageTitle>
            <PageDescription>Torn at both ends and clipped to something.</PageDescription>
          </PageHeader>
          <PageContent>
            <p>Not every page has to be a whole one.</p>
          </PageContent>
        </Page>
      </div>
    </div>
  )
}
