import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Outline",
  description: "shadcn's `empty-outline`: `border border-dashed` on the root. Here the border is the sketched placeholder frame: a dashed line drawn round the space, as if the thing were to be pasted in.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <Empty className="w-full max-w-xl border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon name="cloud" />
        </EmptyMedia>
        <EmptyTitle>Cloud Storage Empty</EmptyTitle>
        <EmptyDescription>Upload files to your cloud storage to access them anywhere.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm">
          Upload Files
        </Button>
      </EmptyContent>
    </Empty>
  )
}
