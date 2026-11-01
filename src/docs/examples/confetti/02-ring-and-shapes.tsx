import { Button } from "@/components/ui/button"
import { ConfettiTrigger } from "@/components/ui/confetti"

export const meta = {
  title: "Ring, streamers, one colour",
  description: "spread 360 sends a ring; shapes and colors narrow the pieces. A Valentine's burst of pink dots and stars.",
  layout: "center" as const,
  height: 260,
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <ConfettiTrigger asChild spread={360} velocity={700} count={90} shapes={["dot", "strip"]}>
        <Button variant="outline">Ring</Button>
      </ConfettiTrigger>
      <ConfettiTrigger asChild angle={60} spread={40} count={50} shapes={["curl"]} drift={120}>
        <Button variant="outline">Streamers</Button>
      </ConfettiTrigger>
      <ConfettiTrigger asChild colors={["bubblegum", "tomato"]} shapes={["dot", "star"]} count={60}>
        <Button variant="outline">Pink</Button>
      </ConfettiTrigger>
    </div>
  )
}
