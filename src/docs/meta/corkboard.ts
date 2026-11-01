import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "corkboard",
  title: "Corkboard",
  category: "Interactive",
  description:
    "A wooden-framed corkboard with notes you can pick up. Drag them with a pointer, or focus one and use the arrow keys to move it and R to turn it. Positions are plain JSON you can store and restore.",
  status: "new",
  parts: [
    {
      name: "Corkboard",
      description:
        "The board: a frame of marker and felt round a cork made from one seeded speckle tile (an SVG pattern, so a big board costs no more cork than a small one). It is a positioned box; give it a height and put notes in it.",
      props: [
        { name: "value / defaultValue", type: "Record<string, { x?, y?, r?, z? }>", description: "Positions by note id: x and y in px from the top-left of the cork, r the turn in degrees, z the stacking order. Only notes that were moved, turned or raised are in it." },
        { name: "onValueChange", type: "(value) => void", description: "Called when a drag ends, and on every key move, turn or raise." },
        { name: "label", type: "string", default: '"Corkboard"', description: "Accessible name of the group." },
        { name: "disabled", type: "boolean", default: "false", description: "Nothing can be picked up or moved; notes leave the tab order." },
        { name: "seed", type: "string | number", description: "Pins the hand of the frame and the cork." },
      ],
    },
    {
      name: "CorkboardNote",
      description:
        "A piece of paper on the board (a Paper: sticky note by default, any stock works) held by a push-pin or a strip of tape. Lifting it (dragging) raises the pin and lengthens the shadow; dropping it pops the pin back in.",
      props: [
        { name: "id", type: "string", required: true, description: "Unique id; the key in the board's value." },
        { name: "x / y", type: "number", default: "16", description: "Where it starts, px from the top-left of the cork." },
        { name: "rotate", type: "number", description: "How it starts turned, degrees. Default a small seeded angle (flat in calm density)." },
        { name: "stock", type: "StockName", default: '"sticky-yellow"', description: "What it is made of: sticky-*, index-card, photo, kraft…" },
        { name: "pinned / pinColor", type: "boolean / PaintKey", default: "true", description: "A pin, or a strip of tape when false. The pin color is seeded from the id unless given." },
        { name: "label", type: "string", description: "Accessible name (default the id), also used in announcements." },
        { name: "paperProps", type: "PaperProps", description: "Anything else the sheet takes." },
        { name: "bare", type: "boolean", default: "false", description: "No sheet of its own: the children are the paper (a StickyNote, a Polaroid, a Ticket). The note still moves, turns, raises and is pinned." },
      ],
    },
  ],
  a11y: [
    "The board is a named group; every note is a focusable group with aria-roledescription \"note\", described by one line of instructions.",
    "Arrow keys move the focused note by 8 px (Shift 32 px), R turns it 4 degrees clockwise (Shift+R back, limited to 24), Enter or Space brings it to the front. Notes stay inside the cork.",
    "Where a note ended up is announced politely, once, after the last key press (\"Call mum at 56, 30.\").",
    "Pointer: notes are picked up anywhere except on links, buttons, inputs and elements marked data-corkboard-nodrag, so a note can hold controls. Escape while dragging with the keyboard focus on the note puts it back.",
    "The focus ring is drawn round the note; it never depends on color alone. Windows high contrast gives the note a real outline.",
    "Reduced motion: no lift animation, the pin does not pop. Calm density: notes lie flat and the pins are left out.",
    "Resizing: a layout saved on a wide board is drawn inside a narrower one (a note is pulled back in as the cork changes size), while the stored positions are left alone, so widening the board again puts everything where it was saved.",
    "Every note is a tab stop, so a board of fifty notes is fifty Tab presses: keep boards to a handful of notes, or put the board behind a skip link. Touch: a note is touch-action none (a drag on it never scrolls the page), the cork around the notes still scrolls.",
  ],
  usage: `import { Corkboard, CorkboardNote } from "@/components/ui/corkboard"

export function Example() {
  return (
    <Corkboard className="h-96" onValueChange={(positions) => save(positions)}>
      <CorkboardNote id="mum" x={24} y={28}>Call mum</CorkboardNote>
      <CorkboardNote id="ink" x={220} y={90} stock="sticky-pink" pinned={false}>Buy ink</CorkboardNote>
    </Corkboard>
  )
}`,
  related: ["paper", "tape", "sketchpad", "flip-card"],
} satisfies ComponentDoc
