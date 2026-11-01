import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const meta = {
  title: "Sticky note",
  description: "`variant=\"note\"` is a sticky note with a taped corner: a Paper, so the sheet turns a little and the text does not. Use it for asides that should not look like system messages.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 220,
}

export default function Example() {
  return (
    <Alert variant="note" seed="note" className="max-w-xs">
      <AlertTitle className="font-script text-2xl leading-none">Reminder</AlertTitle>
      <AlertDescription>Bring the good pens. The desk is mint now, so nothing will match.</AlertDescription>
    </Alert>
  )
}
