import FileExplorer from "@/blocks/file-explorer/page"
import { Desk } from "@/components/ui/desk"

export default function FileExplorerPreview() {
  return (
    <Desk>
      <FileExplorer as="div" />
    </Desk>
  )
}
