import { Sticker } from "@/components/ui/sticker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { stickerBatches } from "@/lib/ink/art/stickers"

export const meta = {
  title: "Every sticker drawn so far",
  description: "One shelf per batch, and it grows by itself as new batches land. Only the open shelf is on the page, so a gallery of nearly ninety stickers stays light.",
  layout: "stack" as const,
}

const SHELVES = [
  ["statusPointers", "Status"],
  ["spaceWeather", "Space"],
  ["foodDrink", "Food"],
  ["officeDesk", "Office"],
  ["natureAnimals", "Nature"],
  ["facesCelebrate", "Faces"],
  ["badgesStamps", "Badges"],
] as const

export default function Example() {
  return (
    <Tabs defaultValue={SHELVES[0][0]} className="w-full">
      <TabsList className="w-full">
        {SHELVES.map(([key, label]) => (
          <TabsTrigger key={key} value={key} className="px-2">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {SHELVES.map(([key, label]) => (
        <TabsContent key={key} value={key}>
          <ul role="list" aria-label={`${label} stickers`} className="grid w-full grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-4 pt-2">
            {Object.keys(stickerBatches[key])
              .filter((name) => !name.startsWith("stamp-"))
              .map((name) => (
                <li key={name} className="flex flex-col items-center gap-1">
                  <Sticker name={name} size={80} />
                  <span className="text-sm text-pencil-text">{name}</span>
                </li>
              ))}
          </ul>
        </TabsContent>
      ))}
    </Tabs>
  )
}
