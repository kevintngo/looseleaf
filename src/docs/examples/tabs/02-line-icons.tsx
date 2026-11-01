import { Icon } from "@/components/ui/icon"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const meta = {
  title: "Line tabs with icons",
  description: "`variant=\"line\"` is a hairline with the active tab underlined in blue felt, wiped in from the reading side. Icons sit at 16 px in the same weight as the label; a disabled tab is skipped by the arrow keys.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <Tabs defaultValue="profile" className="w-full max-w-md">
      <TabsList variant="line">
        <TabsTrigger value="profile">
          <Icon name="user" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="settings">
          <Icon name="settings" />
          Settings
        </TabsTrigger>
        <TabsTrigger value="alerts" disabled>
          <Icon name="bell" />
          Alerts
        </TabsTrigger>
        <TabsTrigger value="search">
          <Icon name="search" />
          Search
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="text-sm text-muted-foreground">
        Your name, your photo and the sentence people see first.
      </TabsContent>
      <TabsContent value="settings" className="text-sm text-muted-foreground">
        Language, density and how much the ink moves.
      </TabsContent>
      <TabsContent value="search" className="text-sm text-muted-foreground">
        Find a page, a note or a person.
      </TabsContent>
    </Tabs>
  )
}
