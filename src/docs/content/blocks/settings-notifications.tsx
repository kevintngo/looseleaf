import SettingsNotifications from "@/blocks/settings-notifications/page"
import { Desk } from "@/components/ui/desk"

export default function SettingsNotificationsPreview() {
  return (
    <Desk className="px-3 py-4 sm:px-6" seed="settings-notifications-desk">
      <SettingsNotifications />
    </Desk>
  )
}
