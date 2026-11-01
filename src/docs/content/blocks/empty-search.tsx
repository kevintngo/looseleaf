import EmptySearch from "@/blocks/empty-search/page"
import { Desk } from "@/components/ui/desk"

export default function EmptySearchPreview() {
  return (
    <Desk className="min-h-[inherit]" objects={["pencil"]} seed="empty-search">
      <EmptySearch />
    </Desk>
  )
}
