import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"

export const meta = {
  title: "Empty",
  description:
    "Official `spinner-empty`: an Empty state whose icon slip holds a spinner, with a title, a sentence and a Cancel button. For a whole page or panel that is waiting, `variant=\"write\"` on the Spinner has Stubby writing instead.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Processing your request</EmptyTitle>
        <EmptyDescription>Please wait while we process your request. Do not refresh the page.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm">
          Cancel
        </Button>
      </EmptyContent>
    </Empty>
  )
}
