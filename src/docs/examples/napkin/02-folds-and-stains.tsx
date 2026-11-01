import { Napkin, NapkinContent, NapkinTitle } from "@/components/ui/napkin"

export const meta = {
  title: "Quarter, half, flat",
  description: "Folded in four, in half with a coffee ring, and unfolded.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 p-4">
        <Napkin fold="quarter" seed="q" className="w-52 max-w-full">
          <NapkinTitle>Quarter</NapkinTitle>
          <NapkinContent>a crease each way</NapkinContent>
        </Napkin>
        <Napkin fold="half" stain seed="h" className="w-52 max-w-full">
          <NapkinTitle>Half</NapkinTitle>
          <NapkinContent>and a cup stood here</NapkinContent>
        </Napkin>
        <Napkin fold="none" seed="f" className="w-52 max-w-full">
          <NapkinTitle>Flat</NapkinTitle>
          <NapkinContent>never folded</NapkinContent>
        </Napkin>
      </div>
    </div>
  )
}
