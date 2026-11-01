import ProfilePage from "@/blocks/profile-page/page"
import { Desk } from "@/components/ui/desk"

export default function ProfilePagePreview() {
  return (
    <Desk objects={["coffee", "clips", "pencil"]} seed="profile-page-desk">
      <ProfilePage />
    </Desk>
  )
}
