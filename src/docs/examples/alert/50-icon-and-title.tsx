import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Icon, title, description: any combination",
  description:
    "The shadcn demo. An alert needs no description (icon and a title on one line) and no title (icon and a sentence), and a success message can say everything in three parts. The icon is circled in the alert's own pen.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-xl items-start gap-5">
      <Alert variant="success">
        <Icon name="circle-check" />
        <AlertTitle>Success! Your changes have been saved</AlertTitle>
        <AlertDescription>This is an alert with icon, title and description.</AlertDescription>
      </Alert>
      <Alert>
        <Icon name="sparkles" />
        <AlertTitle>This alert has a title and an icon. No description.</AlertTitle>
      </Alert>
      <Alert variant="info">
        <Icon name="lightbulb" />
        <AlertDescription>An icon and one sentence, with no title: a quiet tip.</AlertDescription>
      </Alert>
    </div>
  )
}
