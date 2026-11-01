import { Doodle } from "@/components/ui/doodle"
import { Napkin, NapkinContent, NapkinFooter, NapkinTitle } from "@/components/ui/napkin"
import { Sticker } from "@/components/ui/sticker"

export const meta = {
  title: "Ideas on a napkin",
  description: "Doodles and stickers go on a napkin as on any paper; here a star and a sticker beside the note.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Napkin fold="half" stain seed="idea" tilt={-1.5} className="min-h-64 w-80">
      <Doodle name="star" size={56} className="absolute end-6 top-3 z-10" />
      <NapkinTitle>The idea</NapkinTitle>
      <NapkinContent>a shop where everything is made of paper, even the till</NapkinContent>
      <NapkinFooter>(tell nobody)</NapkinFooter>
      <Sticker name="done" size={64} rotate={10} className="absolute -right-4 -bottom-4 z-10" />
    </Napkin>
  )
}
