import { Icon } from "@/components/ui/icon"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item"

export const meta = {
  title: "A ruled list of links",
  description:
    "ruled puts a blue pencil line under every row, so the rules always match the rows. Link rows (asChild) light up under a highlighter swipe when you point at them, and take the focus ring from the keyboard.",
  layout: "stack" as const,
}

const pages = [
  { icon: "file", title: "Quarterly pages", desc: "Last opened on Tuesday, tidy." },
  { icon: "folder", title: "Receipts", desc: "Forty-one of them, all crumpled." },
  { icon: "calendar", title: "Calendar", desc: "Three things this week, one of them cake." },
] as const

export default function Example() {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <ItemGroup ruled>
        {pages.map((p) => (
          <Item key={p.title} asChild>
            <a href="#item">
              <ItemMedia variant="icon">
                <Icon name={p.icon} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{p.title}</ItemTitle>
                <ItemDescription>{p.desc}</ItemDescription>
              </ItemContent>
              <Icon name="chevron-right" />
            </a>
          </Item>
        ))}
      </ItemGroup>
      <ItemGroup>
        <Item size="sm">
          <ItemContent>
            <ItemTitle>Before the separator</ItemTitle>
          </ItemContent>
        </Item>
        <ItemSeparator variant="dashed" />
        <Item size="sm">
          <ItemContent>
            <ItemTitle>After it</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  )
}
