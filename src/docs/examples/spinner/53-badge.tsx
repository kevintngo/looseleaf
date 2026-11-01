import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

export const meta = {
  title: "Badge",
  description:
    "Official `spinner-badge`: Syncing, Updating and Processing badges in the default, secondary and outline variants, each with a spinner in front of the word.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex items-center gap-4">
      <Badge>
        <Spinner />
        Syncing
      </Badge>
      <Badge variant="secondary">
        <Spinner />
        Updating
      </Badge>
      <Badge variant="outline">
        <Spinner />
        Processing
      </Badge>
    </div>
  )
}
