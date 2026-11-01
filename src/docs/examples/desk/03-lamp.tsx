import { Desk } from "@/components/ui/desk"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "Lamp strength",
  description: "The vignette darkens toward the corners. `lamp={0}` is a flat blotter, `1` the theme's own (a whisper of shade), `2.5` a dim room.",
  layout: "full" as const,
}

export default function Example() {
  return (
    <div className="grid gap-4 p-4 sm:grid-cols-3">
      {([0, 1, 2.5] as const).map((lamp) => (
        <Desk key={lamp} lamp={lamp} className="grid h-52 place-items-center p-3">
          <Paper stock="slip" tilt={false} seed={`lamp-${lamp}`} className="px-5 py-4 text-center">
            <p className="font-script text-2xl leading-none font-bold">lamp={"{" + lamp + "}"}</p>
          </Paper>
        </Desk>
      ))}
    </div>
  )
}
