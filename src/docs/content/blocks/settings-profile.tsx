import SettingsProfile from "@/blocks/settings-profile/page"
import { Desk } from "@/components/ui/desk"

export default function SettingsProfilePreview() {
  return (
    <Desk className="px-3 py-4 sm:px-6" seed="settings-profile-desk">
      <SettingsProfile />
    </Desk>
  )
}
