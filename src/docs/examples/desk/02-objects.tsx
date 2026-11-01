import { Desk } from "@/components/ui/desk"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "Things on the blotter",
  description: "`objects` lays a coffee ring, a pencil, paper clips, a ruler and push-pins behind your content. Pick some or take them all.",
  layout: "full" as const,
}

export default function Example() {
  return (
    <Desk objects seed="objects" className="min-h-[26rem] px-8 pt-16 pb-24">
      <Paper stock="paper" seed="mid" className="mx-auto max-w-md p-8">
        <p className="font-script text-3xl leading-none font-bold">A tidy desk</p>
        <p className="mt-3">Everything lying around is behind the paper, hidden on small screens, and gone in calm density.</p>
      </Paper>
    </Desk>
  )
}
