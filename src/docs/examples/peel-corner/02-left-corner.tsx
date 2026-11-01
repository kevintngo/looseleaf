import { PeelCorner, PeelCornerPage, PeelCornerUnder } from "@/components/ui/peel-corner"

export const meta = {
  title: "Left corner, kraft page",
  description: "corner=\"bottom-left\" mirrors everything (use it for right-to-left pages); back=\"kraft\" makes the flap the same stock as the page.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 300,
}

export default function Example() {
  return (
    <PeelCorner corner="bottom-left" back="kraft" size={100} className="w-72">
      <PeelCornerPage stock="kraft" className="h-48">
        <p className="font-script text-3xl leading-none">Field notes</p>
        <p className="mt-2 text-sm">Volume 4. Do not read the last page.</p>
      </PeelCornerPage>
      <PeelCornerUnder stock="index-card">
        <p className="font-script text-2xl leading-none">P.S. I told you.</p>
      </PeelCornerUnder>
    </PeelCorner>
  )
}
