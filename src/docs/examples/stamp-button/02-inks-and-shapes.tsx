import { Paper } from "@/components/ui/paper"
import { StampButton, StampSurface } from "@/components/ui/stamp-button"

export const meta = {
  title: "Inks and shapes",
  description: "The tool takes the colour of the pad it will leave: green, red, blue felt, black. Any preset from the sticker sheet works, or give the words and the shape yourself.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 540,
}

export default function Example() {
  return (
    <StampSurface className="w-full max-w-xl">
      <Paper stock="paper" tilt={false} className="flex flex-col gap-6 p-6 text-ink">
        <p className="max-w-sm">Received from the post office on the 14th, signed for and put on the shelf by the window. Stamp it however you like.</p>
        <div className="mt-40 flex flex-wrap items-end gap-4">
          <StampButton stamp="stamp-paid" place={{ x: 0.2, y: 0.5 }} />
          <StampButton stamp="stamp-received" sub="Mar 14 2026" place={{ x: 0.66, y: 0.42 }} />
          <StampButton text="Filed" shape="rect" ink="ink" dashed w={140} h={52} place={{ x: 0.5, y: 0.6 }} />
          <StampButton stamp="stamp-urgent" place={{ x: 0.78, y: 0.7 }} />
        </div>
      </Paper>
    </StampSurface>
  )
}
