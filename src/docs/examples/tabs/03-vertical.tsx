import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const meta = {
  title: "Binder tabs",
  description: "`orientation=\"vertical\"`: tabs down a spine like binder dividers, the active one filled and open towards its page. ArrowUp and ArrowDown move between them.",
  layout: "center" as const,
  height: 240,
}

const sections = [
  ["general", "General", "Name the notebook and choose who can see it."],
  ["notifications", "Notifications", "Choose what lands in your inbox, and when."],
  ["billing", "Billing", "Your plan, your invoices and the card on file."],
  ["danger", "Danger zone", "Archive or delete the notebook. There is no undo."],
] as const

export default function Example() {
  return (
    <Tabs defaultValue="notifications" orientation="vertical" className="w-full max-w-lg">
      <TabsList className="w-40">
        {sections.map(([value, title]) => (
          <TabsTrigger key={value} value={value}>
            {title}
          </TabsTrigger>
        ))}
      </TabsList>
      {sections.map(([value, title, text]) => (
        <TabsContent key={value} value={value} className="ps-3 pt-1">
          <h3 className="font-script text-2xl leading-none font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{text}</p>
        </TabsContent>
      ))}
    </Tabs>
  )
}
