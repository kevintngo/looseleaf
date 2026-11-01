import { Lettering } from "@/components/ui/lettering"
import { Paper } from "@/components/ui/paper"
import { Sticker } from "@/components/ui/sticker"

export const meta = {
  title: "A poster",
  description: "Hero lettering, a lead line and a sticker on a sheet of paper.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 320,
}

export default function Example() {
  return (
    <Paper stock="paper" tilt tape="both" seed="poster" className="relative w-full max-w-xl px-8 pt-9 pb-8">
      <Lettering as="h2" size="xl" tone="marker" wobble={0.6}>
        Paper Club
      </Lettering>
      <p className="mt-4 max-w-sm text-lg text-ink-soft">Third Thursday of the month. Bring something you wrote on the back of something else.</p>
      <Sticker name="wow" size={80} rotate={12} className="absolute end-6 bottom-4" />
    </Paper>
  )
}
