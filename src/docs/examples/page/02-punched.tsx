import { Page, PageContent, PageDescription, PageHeader, PageTitle } from "@/components/ui/page"

export const meta = {
  title: "Punched, ringed, stained",
  description: "`holes` punches three holes down the start edge (or two across the top); the desk shows through. `reinforced` adds gummed rings, `stain` a coffee ring.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="@container w-full">
      <div className="grid gap-10 p-2 @2xl:grid-cols-2">
        <Page holes reinforced stain seed="binder" width="sm" className="min-h-[26rem]">
          <PageHeader>
            <PageTitle underline="double">For the binder</PageTitle>
            <PageDescription>Three holes, gummed rings, one coffee.</PageDescription>
          </PageHeader>
          <PageContent>
            <p>The rings are stuck on by hand and never quite concentric. The stain is faint on purpose.</p>
          </PageContent>
        </Page>
        <Page holes="top" stock="graph" seed="legal" width="sm" className="min-h-[26rem]">
          <PageHeader>
            <PageTitle underline="wavy">Filed at the top</PageTitle>
            <PageDescription>Two holes, a hand apart, like legal paper.</PageDescription>
          </PageHeader>
          <PageContent>
            <p>The start padding grows with the punch, so the text never touches it.</p>
          </PageContent>
        </Page>
      </div>
    </div>
  )
}
