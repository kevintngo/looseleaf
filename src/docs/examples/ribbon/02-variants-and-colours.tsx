import { Ribbon } from "@/components/ui/ribbon"

export const meta = {
  title: "Variants and colors",
  description: "Banner (folded tails), swallow (a V notch at both ends) and flag (square at the start). The colors are the ones ink stays readable on; `paper` is a plain white ribbon.",
  layout: "center" as const,
}

const TONES = ["marker", "hi", "tangerine", "lemon", "grass", "teal", "sky", "bubblegum", "paper"] as const

export default function Example() {
  return (
    <div className="flex max-w-xl flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Ribbon variant="banner">Banner</Ribbon>
        <Ribbon variant="swallow" tone="lemon">
          Swallow
        </Ribbon>
        <Ribbon variant="flag" tone="tangerine">
          Flag
        </Ribbon>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {TONES.map((tone) => (
          <Ribbon key={tone} tone={tone} size="sm">
            {tone}
          </Ribbon>
        ))}
      </div>
    </div>
  )
}
