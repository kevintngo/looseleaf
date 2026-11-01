import NotesApp from "@/blocks/notes-app/page"
import { Desk } from "@/components/ui/desk"

export default function NotesAppPreview() {
  return (
    <Desk objects={["coffee", "pencil"]} seed="notes-app-desk">
      <NotesApp />
    </Desk>
  )
}
