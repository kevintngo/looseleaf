import { AspectRatio } from "@/components/ui/aspect-ratio"

export const meta = {
  title: "A real image, cropped to fit",
  description:
    "The shadcn demo: a 16:9 box with an <img> inside it, `object-cover` so the picture fills the box and is cropped, never squashed. The same picture in a square shows what gets cut. Swap the data URI for your own photograph.",
  layout: "stack" as const,
}

const line = (width: number) => `stroke='#2a2420' stroke-width='${width}' stroke-linecap='round' stroke-linejoin='round'`
const landscape = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90' preserveAspectRatio='xMidYMid slice'>` +
    `<defs><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#bfdcec'/><stop offset='1' stop-color='#f7e7c6'/></linearGradient></defs>` +
    `<rect width='160' height='90' fill='url(#s)'/>` +
    `<path d='M20 24 q3 -6 9 -3 q5 -5 10 0 q6 0 5 5 q-12 2 -24 -2z' fill='#fffdf6' fill-opacity='.8' ${line(0.9)}/>` +
    `<path d='M108 15.5 q9.5 -2 11.5 6.5 q1.5 9 -7.5 11 q-10 1.5 -12 -7 q-1.5 -8.5 8 -10.5z' fill='#f3b84b' ${line(0.9)}/>` +
    `<path d='M-4 66 Q22 40 48 58 T104 52 T164 62 V92 H-4Z' fill='#8fb58a' ${line(0.9)}/>` +
    `<path d='M-4 78 Q30 58 64 74 T128 70 T164 76 V92 H-4Z' fill='#5f8f66' ${line(0.9)}/>` +
    `<path d='M70 92 Q78 78 84 70 Q92 62 100 60' fill='none' stroke='#f5ecd8' stroke-width='3.2' stroke-linecap='round'/>` +
    `<path d='M20 68 l1 -4 m2 4 l2 -3 M132 60 l1 -4 m2 4 l1.5 -3 M44 82 l1 -3.5 m2.5 3.5 l1.5 -3' fill='none' ${line(0.8)}/>` +
    `</svg>`
)}`

export default function Example() {
  return (
    <div className="grid w-full max-w-2xl items-start gap-6 sm:grid-cols-[2fr_1fr]">
      <figure className="grid gap-2">
        <AspectRatio ratio={16 / 9} className="overflow-hidden bg-muted">
          <img src={landscape} alt="A pale sun over two green hills and a path" className="size-full object-cover" />
        </AspectRatio>
        <figcaption className="text-sm text-muted-foreground">16 / 9, the whole picture</figcaption>
      </figure>
      <figure className="grid gap-2">
        <AspectRatio ratio={1} className="overflow-hidden bg-muted">
          <img src={landscape} alt="The same landscape cropped to a square" className="size-full object-cover" />
        </AspectRatio>
        <figcaption className="text-sm text-muted-foreground">Square, cropped</figcaption>
      </figure>
    </div>
  )
}
