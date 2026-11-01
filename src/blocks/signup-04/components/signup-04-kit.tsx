import { Paper } from "@/components/ui/paper"
import { StickerSheet } from "@/components/ui/sticker-sheet"

const KIT = ["rocket", "cactus", "sun-shades", "coffee-to-go", "cat-loaf", "party-popper", "rainbow", "thumbs-up", "donut"]

function SignupKit() {
  return (
    <Paper stock="kraft" tilt={false} shadow="none" seed="signup-04-kraft" className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-4 text-center">
      <div>
        <p className="font-script text-[2.25rem] leading-none font-bold text-ink">your welcome kit</p>
        <p className="mt-1 text-sm text-ink-soft">Peel one off. It is yours to keep.</p>
      </div>
      <StickerSheet title="Welcome kit" stickers={KIT} columns={3} size={60} seed="signup-04-sheet" />
    </Paper>
  )
}

export { SignupKit }
