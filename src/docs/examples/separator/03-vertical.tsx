import { Separator } from "@/components/ui/separator"

export const meta = {
  title: "Vertical rules",
  description: "In a flex row give the separator a height (h-5, or self-stretch). Each vertical rule is its own drawing, so no two are quite alike.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex h-6 items-center gap-4 text-[15px]">
        <span>Sketches</span>
        <Separator orientation="vertical" />
        <span>Recipes</span>
        <Separator orientation="vertical" />
        <span>Receipts</span>
        <Separator orientation="vertical" />
        <span>Maps</span>
      </div>
      <div className="flex h-6 items-center gap-4 text-[15px]">
        <span>12 pages</span>
        <Separator orientation="vertical" variant="dotted" />
        <span>3 tabs</span>
        <Separator orientation="vertical" variant="dotted" />
        <span>1 coffee ring</span>
      </div>
      <div className="flex h-10 items-center gap-6 text-[15px]">
        <span>Draft</span>
        <Separator orientation="vertical" variant="stitched" />
        <span>Review</span>
        <Separator orientation="vertical" variant="tape" />
        <span>Done</span>
        <Separator orientation="vertical" variant="wavy" />
        <span>Filed</span>
      </div>
    </div>
  )
}
