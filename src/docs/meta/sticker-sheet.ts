import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "sticker-sheet",
  title: "Sticker sheet",
  category: "Stickers & doodles",
  description:
    "A sheet of die-cut stickers on backing paper, each in its own kiss-cut outline. Press one and it peels away, drag one and it comes off under the mouse; the outline stays behind and can take it back. For reward charts, sticker packs and anything you collect.",
  status: "new",
  parts: [
    {
      name: "StickerSheet",
      description:
        "The backing paper (a Paper) with its printing: a dashed cut margin, crop marks, an optional typed title with how many stickers are left, and the sheen of release paper. Lays its children out on a grid.",
      props: [
        { name: "stickers", type: "string[]", description: "Ids from the art library: one item each, when you need no labels or ids of your own." },
        { name: "columns / size", type: "number", default: "4 / 72", description: "Stickers per row, and the drawn size of each in px (below 80 the 64 px redraw is used). The grid keeps its column count and each cell is size + 22 px wide, so choose them for your narrowest screen (3 columns of 56 px fit a 320 px phone)." },
        { name: "title", type: "string", description: "Typed at the top of the sheet, with \"n left\" on the right. Also the group's accessible name." },
        { name: "backing", type: '"glassine" | "kraft" | "paper"', default: '"glassine"', description: "Pale blue-grey release paper with a sheen, kraft, or plain paper." },
        { name: "peeled / defaultPeeled / onPeeledChange", type: "string[]", description: "Ids of the stickers that are off the sheet. Controlled: the parent decides what is peeled." },
        { name: "onPeel", type: "(item) => void", description: "{ id, name, label, dragged, x, y }. For a drag, x and y are the pointer's client position at release: drop the sticker there (boardPoint from sticker-board turns them into canvas coordinates, and says whether the point is on the board at all). A controlled sheet that does not add the id to `peeled` declines the drag: the sticker springs back. A click or a key has no position: put it wherever you like." },
        { name: "onStick", type: "(item) => void", description: "A peeled sticker was put back on its outline." },
        { name: "restorable", type: "boolean", default: "true", description: "Whether pressing an empty outline puts the sticker back. When off, a spent outline is dimmed (aria-disabled) rather than disabled, so the key that just peeled it keeps its focus." },
        { name: "disabled / label", type: "boolean / string", description: "Freeze the sheet; the name when there is no title (default \"Sticker sheet\")." },
        { name: "stock-like props", type: "PaperProps", description: "tilt, tape, fastener, shadow, edge and the rest of Paper." },
      ],
    },
    {
      name: "StickerSheetItem",
      description: "One sticker in its outline. A button whose name says what it does now: \"Peel Rocket sticker\", then \"Put Rocket sticker back\". It lifts and turns a little on hover, curls its corner, and flies off up and to the right when peeled.",
      props: [
        { name: "name", type: "string", required: true, description: "The sticker's id in the art library." },
        { name: "id", type: "string", description: "Its key in the peeled list. Default the name; give each a different id if a name appears twice." },
        { name: "label", type: "string", description: "What it is called to a reader (default the name in words)." },
        { name: "size", type: "number", description: "Drawn size in px, overriding the sheet's." },
      ],
    },
    { name: "useStickerSheet", description: "The sheet's context (peeled, size, peel, stick) for building your own items." },
  ],
  a11y: [
    "The sheet is a named group; every sticker is a real button whose name changes with what pressing does (\"Peel Rocket sticker\" / \"Put Rocket sticker back\"). Enter and Space peel, exactly like a click.",
    "What came off is announced politely (\"Rocket peeled off.\", \"Rocket stuck back on.\"); the title shows how many are left.",
    "While a sticker is in the hand the sheet rises above the rest of the page, so it can be carried over a board that comes after it in the source.",
    "Dragging is a mouse and pen extra: touch never starts a drag (the page keeps scrolling), a tap peels. Every drag has a click or key equivalent, and releasing a drag near where it started springs the sticker back without peeling it.",
    "The kiss-cut outlines and the printing are decoration (aria-hidden, no pointer events); the focus ring is drawn round the whole slot and never depends on colour alone.",
    "Reduced motion: no flight or curl animation, the sticker is simply gone or back. Calm density: no sheen, no crop marks.",
    "Windows high contrast keeps the stickers and outlines (intrinsic art).",
  ],
  usage: `import { StickerSheet, StickerSheetItem } from "@/components/ui/sticker-sheet"

export function Example() {
  return (
    <StickerSheet title="Rewards" onPeel={({ name }) => award(name)}>
      <StickerSheetItem name="rocket" />
      <StickerSheetItem name="first-place" />
      <StickerSheetItem name="a-plus" />
    </StickerSheet>
  )
}`,
  related: ["sticker", "sticker-board", "sticker-picker", "peel-corner", "paper"],
} satisfies ComponentDoc
