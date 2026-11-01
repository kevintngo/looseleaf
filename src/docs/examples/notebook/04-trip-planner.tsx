import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Notebook, NotebookPage, NotebookTitle } from "@/components/ui/notebook"
import { Sticker } from "@/components/ui/sticker"

export const meta = {
  title: "A packing list",
  description: "A real notebook page: one checkbox per ruled line (each row is exactly 28 px, so the boxes and words sit on the lines), and a sticker stuck to the corner.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const items = ["Passport, tickets, the good pen", "Waterproof notebook", "Two rolls of washi tape", "Tea (a lot)", "The very small pencil"]

export default function Example() {
  return (
    <Notebook as="section" binding="rings" pages={3} seed="trip" className="mx-auto min-h-[24rem] w-full max-w-md" aria-label="Packing list">
      <Sticker name="done" size={64} rotate={10} className="absolute -top-4 -right-3 z-10" />
      <NotebookPage>
        <NotebookTitle>Packing list</NotebookTitle>
        {items.map((item, i) => (
          <div key={item} className="flex h-7 items-center gap-3">
            <Checkbox id={`pack-${i}`} defaultChecked={i < 2} />
            <Label htmlFor={`pack-${i}`} className="text-[17px] leading-7 font-normal">
              {item}
            </Label>
          </div>
        ))}
      </NotebookPage>
    </Notebook>
  )
}
