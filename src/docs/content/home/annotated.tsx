import { Callout } from "@/components/ui/callout"
import { Circled } from "@/components/ui/circled"
import { Highlight } from "@/components/ui/highlight"
import { Paper } from "@/components/ui/paper"
import { Tally } from "@/components/ui/tally"

export default function Annotated() {
  return (
    <Paper data-home="annotated" stock="paper" rules="ruled" tape="corner" seed="home-notes" className="w-full pt-4 pr-6 pb-5 pl-14">
      <p className="font-type text-sm leading-[28px] text-pencil-text">Reading notes / Tuesday</p>
      <p className="font-script text-[2.1rem] leading-[56px] font-bold text-ink">Same parts, new hand</p>
      <p className="text-[17px] leading-[28px]">
        Looseleaf keeps shadcn&rsquo;s API and swaps the skin. Every line is <Highlight>drawn by a pen with pressure</Highlight>, every fill sits{" "}
        <Circled tone="red" animate>
          clean inside it
        </Circled>
        , and no two buttons are quite alike.
      </p>
      <div className="flex justify-end pe-2">
        <Callout direction="up-left" animate delay={500}>
          on purpose!
        </Callout>
      </div>
      <div className="flex items-center gap-3 text-sm leading-[28px] text-pencil-text">
        times I have said &ldquo;hand-drawn&rdquo; <Tally count={7} size="md" animate />
      </div>
    </Paper>
  )
}
