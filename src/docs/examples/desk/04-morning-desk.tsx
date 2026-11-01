import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Desk } from "@/components/ui/desk"
import { Page, PageContent, PageDescription, PageHeader, PageTitle } from "@/components/ui/page"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "A morning at the desk",
  description: "A whole workspace: a punched page, an index card taped up and two sticky notes, with the pencil and the coffee ring behind them.",
  layout: "full" as const,
}

export default function Example() {
  return (
    <Desk as="section" aria-label="Workspace" objects={["coffee", "pencil", "clips"]} seed="morning" className="min-h-[34rem] px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-wrap items-start justify-center gap-10">
        <Page holes reinforced width="sm" seed="morning-page" className="min-h-[22rem] flex-1 basis-72">
          <PageHeader>
            <PageTitle underline="highlight">Monday</PageTitle>
            <PageDescription>Three things, in this order.</PageDescription>
          </PageHeader>
          <PageContent>
            <ol className="list-decimal space-y-1 ps-5">
              <li>Ink the outline</li>
              <li>Answer Marguerite</li>
              <li>Tea</li>
            </ol>
          </PageContent>
        </Page>
        <div className="flex basis-64 flex-col gap-8">
          <Card stock="index-card" tape="top" seed="morning-card" className="gap-3 py-4">
            <CardHeader>
              <CardTitle>Reminder</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">Post the parcel before the office shuts.</CardContent>
            <CardFooter>
              <Button size="sm" variant="secondary">
                Done
              </Button>
            </CardFooter>
          </Card>
          <div className="flex gap-5">
            <Paper stock="sticky-yellow" seed="s1" className="size-28 p-3">
              <p className="font-script text-2xl leading-none font-bold">call mum</p>
            </Paper>
            <Paper stock="sticky-pink" seed="s2" className="size-28 p-3">
              <p className="font-script text-2xl leading-none font-bold">pens!!</p>
            </Paper>
          </div>
        </div>
      </div>
    </Desk>
  )
}
