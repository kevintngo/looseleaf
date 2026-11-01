import SettingsAppearance from "@/blocks/settings-appearance/page"
import { Desk } from "@/components/ui/desk"

export default function SettingsAppearancePreview() {
  return (
    <Desk className="px-3 py-4 sm:px-6" seed="settings-appearance-desk">
      <SettingsAppearance />
    </Desk>
  )
}
