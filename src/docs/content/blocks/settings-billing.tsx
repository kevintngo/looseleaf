import SettingsBilling from "@/blocks/settings-billing/page"
import { Desk } from "@/components/ui/desk"

export default function SettingsBillingPreview() {
  return (
    <Desk className="px-3 py-4 sm:px-6" seed="settings-billing-desk">
      <SettingsBilling />
    </Desk>
  )
}
