import { Stamp } from "@/components/ui/stamp"

export const meta = {
  title: "Shapes and inks",
  description: "A box, a ring with rim text, a twelve-point seal, and big diagonal letters. Pad inks are red, blue felt, green or ink, never a stationery accent.",
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Stamp text="Received" sub="Mar 14 2026" ink="ink-you" h={72} />
      <Stamp text="Members" shape="round" ring="MEMBERS - EST 2026 -" ink="ink-you" size={96} />
      <Stamp text="New" shape="burst" sub="issue" ink="ink" size={96} />
      <Stamp text="Void" shape="void" ink="red" w={160} h={64} />
    </div>
  )
}
