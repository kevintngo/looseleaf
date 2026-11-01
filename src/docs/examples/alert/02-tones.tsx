import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Tones and patterns",
  description:
    "`info`, `success` and `warning` are additions. Each has its own pattern in the margin: a double blue pencil rule, a strip of green marker, a panel of highlighter. Without an icon there is no circle, and without a title the description is one plain line.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-xl items-start gap-5">
      <Alert variant="info">
        <Icon name="info" />
        <AlertTitle>New in this version</AlertTitle>
        <AlertDescription>Tabs can now stand up on their side, like binder dividers.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <Icon name="circle-check" />
        <AlertTitle>Saved</AlertTitle>
        <AlertDescription>Your changes are on the page. Nothing else to do.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <Icon name="triangle-alert" />
        <AlertTitle>Careful with the highlighter</AlertTitle>
        <AlertDescription>Two coats will bleed through to the next page.</AlertDescription>
      </Alert>
      <Alert variant="info">
        <AlertDescription>No icon and no title: just the box, the rule and one line.</AlertDescription>
      </Alert>
    </div>
  )
}
