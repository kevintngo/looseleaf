import { Doodle } from "@/components/ui/doodle"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemTitle } from "@/components/ui/item"

export const meta = {
  title: "Header",
  description: "shadcn's `item-header`: ItemHeader takes the first, full-width line of a row, so a picture sits above the words. Three cards in a grid; the photographs of the original are doodles here.",
  layout: "center" as const,
}

const models = [
  {
    name: "v0-1.5-sm",
    description: "Everyday tasks and UI generation.",
    doodle: "feather",
  },
  {
    name: "v0-1.5-lg",
    description: "Advanced thinking or reasoning.",
    doodle: "light-bulb",
  },
  {
    name: "v0-2.0-mini",
    description: "Open Source model for everyone.",
    doodle: "sprout",
  },
] as const

export default function Example() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <ItemGroup className="grid grid-cols-3 gap-6">
        {models.map((model) => (
          <Item key={model.name} variant="outline">
            <ItemHeader>
              <div className="flex aspect-square w-full items-center justify-center">
                <Doodle name={model.doodle} size={64} />
              </div>
            </ItemHeader>
            <ItemContent>
              <ItemTitle>{model.name}</ItemTitle>
              <ItemDescription>{model.description}</ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}
