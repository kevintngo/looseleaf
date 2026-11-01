import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "bookmark",
  title: "Bookmark",
  category: "Paper",
  description:
    "A ribbon bookmark you can press. Unpressed, a dashed pencil ghost of a ribbon marks the place; pressed, the woven, edge-stitched cloth ribbon hangs there in its colour and casts a short shadow. It is a Toggle underneath, so `aria-pressed`, Space and Enter come for free. `BookmarkRibbon` is the same ribbon as a page marker with no behaviour.",
  status: "new",
  parts: [
    {
      name: "Bookmark",
      description: "A Radix Toggle (a `button`) 2 rem wide and 3 rem high, with a hit area 6 px larger all round. It takes every Toggle prop. Its content is its accessible name (default \"Bookmark\"), visually hidden.",
      props: [
        { name: "tone", type: "Accent", default: '"tomato"', description: "The ribbon's colour: tomato, tangerine, lemon, grass, teal, sky, grape or bubblegum." },
        { name: "pressed / defaultPressed / onPressedChange", type: "boolean / boolean / (pressed: boolean) => void", description: "As Toggle: controlled or not." },
        { name: "disabled", type: "boolean", description: "A pale ghost that cannot be pressed." },
        { name: "tilt / seed / size", type: "boolean | number / string | number / [w, h]", description: "A seeded turn under 1.4 degrees (flat in calm density); pins the hand; the box in px for server-rendered drawings." },
      ],
    },
    {
      name: "BookmarkRibbon",
      description: "The ribbon alone, hanging: an aria-hidden, pointer-events-none `div` for a page marker. Place it with `absolute -top-1 end-6` on a sheet.",
      props: [{ name: "tone", type: "Accent", default: '"tomato"', description: "The ribbon's colour." }],
    },
  ],
  a11y: [
    "Bookmark is a real toggle button: it announces \"pressed\" or \"not pressed\", it is reached by Tab and pressed with Space or Enter. Give it a name that says what it saves (\"Save this article\"); the name does not change with the state, `aria-pressed` does.",
    "The ribbon, its stitching and its ghost are aria-hidden decoration, so the state is never carried by colour alone: `aria-pressed` and the ghost-versus-ribbon shape (dashed outline versus a filled tail) both tell it. Focus shows the standard focus ring around the box.",
    "The hit area is 44 x 60 px with its extension (24 px minimum). Windows high contrast replaces the drawing with a button outline, and a pressed bookmark fills with the system highlight colour so the state is still visible; `aria-pressed` follows either way.",
  ],
  usage: `import { Bookmark, BookmarkRibbon } from "@/components/ui/bookmark"

<Card className="relative">
  <Bookmark className="absolute -top-1 end-6" defaultPressed onPressedChange={save}>
    Save this article
  </Bookmark>
  …
</Card>

<Paper className="relative"><BookmarkRibbon tone="grape" className="absolute -top-1 end-8" /></Paper>`,
  related: ["toggle", "notebook", "label-tag", "card"],
} satisfies ComponentDoc
