import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Doodle } from "@/components/ui/doodle"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "A Polaroid",
  description:
    "A square picture in a photo-stock Paper with the wide white border at the bottom and a line of handwriting. Two strips of washi hold it to the desk; the caption stays upright while the print lies a little crooked.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 340,
}

const WINDOW = "shadow-[inset_0_2px_4px_rgb(var(--ll-shade)/0.26),inset_0_0_0_1px_rgb(var(--ll-shade)/0.12)]"

export default function Example() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-10 p-6">
      <Paper stock="photo" rules="none" tape="both" tapeKind="washi-stripes" seed="polaroid-a" className="w-56 p-3 pb-4">
        <AspectRatio ratio={1} className={`grid place-items-center overflow-hidden bg-sky/35 ${WINDOW}`}>
          <Doodle name="sun" size={88} />
        </AspectRatio>
        <p className="mt-3 text-center font-script text-2xl leading-none font-bold">the lake, June</p>
      </Paper>
      <Paper stock="photo" rules="none" fastener="pin" seed="polaroid-b" className="w-56 p-3 pt-5 pb-4">
        <AspectRatio ratio={1} className={`grid place-items-center overflow-hidden bg-lemon/40 ${WINDOW}`}>
          <Doodle name="flower" size={88} />
        </AspectRatio>
        <p className="mt-3 text-center font-script text-2xl leading-none font-bold">first tulip</p>
      </Paper>
    </div>
  )
}
