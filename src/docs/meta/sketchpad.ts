import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "sketchpad",
  title: "Sketchpad",
  category: "Interactive",
  description:
    "A real drawing surface. Pointer, touch, pen pressure or the keyboard put strokes on paper, and every stroke is rendered by the interface's own pen (variable-width ribbons, pooled ends, felt / graphite / marker grain), so what people draw looks like the rest of the page. Undo, redo, export as svg, replay.",
  status: "new",
  parts: [
    {
      name: "Sketchpad",
      description:
        "The root: it owns the strokes, the pen in hand, the history and the export handle, and lays out a toolbar and a canvas when you give it no children. Strokes are plain JSON, stored in canvas units, so a saved drawing looks identical everywhere.",
      props: [
        { name: "value / defaultValue", type: "SketchStroke[]", description: "The drawing: { id, tool, color, size, pts: [x, y, pressure?][] }. Controlled or uncontrolled. Strokes without an id are given one." },
        { name: "onValueChange", type: "(strokes: SketchStroke[]) => void", description: "Called after every stroke, erase, undo, redo and clear." },
        { name: "tool / defaultTool / onToolChange", type: '"felt" | "brush" | "pencil" | "marker" | "highlighter" | "eraser"', default: '"felt"', description: "The pen in hand. The eraser removes whole strokes it touches." },
        { name: "tools", type: "SketchTool[]", default: '["felt","pencil","marker","highlighter","eraser"]', description: "Which tools the toolbar shows and the keyboard offers." },
        { name: "color / defaultColor / onColorChange", type: "SketchColor", default: '"ink"', description: "One of the theme's pens and accents: ink, ink-you, red, green, marker, tangerine, hi, teal, grape, bubblegum. Choosing the highlighter over a dark ink switches to yellow." },
        { name: "size / defaultSize / onSizeChange", type: "number", default: "1", description: "Width multiplier of the tool's own nominal line. Presets: 0.6 fine, 1 medium, 1.9 bold." },
        { name: "width / height", type: "number", default: "640 / 400", description: "The canvas's logical size. Strokes live in these units and the canvas scales to its container." },
        { name: "readOnly", type: "boolean", default: "false", description: "Look, do not draw. The default toolbar is left out and the canvas becomes a labelled image." },
        { name: "disabled", type: "boolean", default: "false", description: "Draws nothing, dims the toolbar, leaves the tab order." },
        { name: "replay / replaySpeed", type: "boolean / number", default: "false / 1", description: "Draw the strokes on again, in order, each one uncovered along its own centre line. Reduced motion shows the finished picture." },
        { name: "apiRef", type: "Ref<SketchpadHandle>", description: "undo(), redo(), clear(), replay(), strokes(), toSVG(), toDataURL() (svg, no canvas needed), toPNG() (async, null where there is no canvas)." },
        { name: "seed", type: "string | number", description: "Salts every stroke's hand. Leave it out and the same JSON draws the same picture in every browser." },
      ],
    },
    {
      name: "SketchpadCanvas",
      description:
        "The sheet the strokes land on. Pointer events with coalesced samples and pen pressure (palm rejection while a pen is in range), touch-action none, and keyboard drawing: arrows move a cursor, Space puts the pen down and lifts it. Children are guides printed under the strokes.",
      props: [
        { name: "paper", type: '"plain" | "ruled" | "graph" | "dots" | "kraft"', default: '"plain"', description: "What it is drawn on." },
        { name: "paperProps", type: "PaperProps", description: "Anything the sheet takes: tape, fastener, edge, stock." },
        { name: "label", type: "string", default: '"Drawing"', description: "Accessible name of the canvas." },
        { name: "seed", type: "string | number", description: "Pins the frame's hand." },
      ],
    },
    { name: "SketchpadToolbar", description: "A slip of paper that holds the controls. Any layout works; the parts only need to be inside the root.", props: [] },
    {
      name: "SketchpadTools",
      description: "A radio group of tool buttons. Each shows a sample of what its pen writes, in the current colour; the selected one is boxed and highlighted. Roving focus: arrow keys move and select.",
      props: [{ name: "tools", type: "SketchTool[]", description: "Override the root's tool list for this group." }],
    },
    { name: "SketchpadTool", description: "One tool button (Radix radio item and ink host).", props: [{ name: "value", type: "SketchTool", required: true, description: "Which tool." }, { name: "seed", type: "string | number", description: "Pins the hand." }] },
    { name: "SketchpadColors", description: "A radio group of scribbled colour swatches.", props: [{ name: "colors", type: "SketchColor[]", description: "Which swatches to show." }] },
    { name: "SketchpadColor", description: "One swatch, named for screen readers (Ink, Blue, Red…).", props: [{ name: "value", type: "SketchColor", required: true, description: "Which colour." }] },
    { name: "SketchpadSizes", description: "A radio group of three pooled dots: fine, medium, bold.", props: [] },
    { name: "SketchpadSize", description: "One width preset.", props: [{ name: "value", type: '"fine" | "medium" | "bold"', required: true, description: "Which preset." }] },
    { name: "SketchpadUndo", description: "A ghost Button; disabled while there is nothing to undo. History keeps the last 100 steps, and clearing is one step.", props: [] },
    { name: "SketchpadRedo", description: "A ghost Button; disabled while there is nothing to redo.", props: [] },
    { name: "SketchpadClear", description: "A ghost Button that wipes the page. Undo brings it back.", props: [] },
  ],
  a11y: [
    "The canvas is role=\"application\" (aria-roledescription \"drawing canvas\") with a name and a description of the keys; the drawn strokes are aria-hidden. Read-only, it is an image named \"Drawing, N strokes\".",
    "Keyboard drawing: arrow keys move a cursor (Shift = 32 units, Alt = 2), Space or Enter puts the pen down (\"Pen down.\") and lifts it (\"Stroke added.\"), Escape cancels the stroke or hides the cursor. Leaving the canvas lifts the pen.",
    "Focus: Undo, Redo and Clear disable themselves when they have nothing left to do; if one of them had focus, focus moves to the canvas instead of falling to the top of the page. Every part composes its own `onClick` with the built-in action (call `event.preventDefault()` to cancel it).",
    "Shortcuts on the focused canvas: F felt, B brush, P pencil, M marker, H highlighter, E eraser (only tools that are offered), [ and ] change the width, Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl+Y redo.",
    "Tools, colours and widths are radio groups (Radix): Tab enters a group, arrow keys move and select. Every swatch has a colour name; toolbar buttons are at least 28 px with a bigger hit area.",
    "Adding, erasing, undoing and clearing are announced politely (\"Stroke added. 3 strokes.\").",
    "Windows high contrast: the strokes keep their own colours (forced-color-adjust: none), the toolbar gets real outlines. Reduced motion: replay shows the finished drawing at once.",
    "Touch: the canvas sets touch-action: none so drawing never scrolls the page. That also means a canvas that fills the screen on a phone traps the scroll: leave a margin around it, or put it in a tab or dialog. Palm rejection: a finger is ignored for 1.5 s after the pen was last seen near the screen (and a palm that got there first is dropped when the pen lands), so a person who switches between pencil and finger is never locked out.",
    "Scale: a stroke is stored as thinned points (samples closer than 0.8 units are held back) and drawn by the pen as ribbons, which is about 15 to 30 KB of svg for a hundred points and up to 1 MB for a very long scribble; the finished markup is cached (bounded by size, 24 MB) and a live stroke is previewed with at most 480 points. A page with many hundreds of long strokes belongs in the replay/export flow (toSVG), not in a live canvas.",
  ],
  usage: `import { Sketchpad } from "@/components/ui/sketchpad"

export function Example() {
  return <Sketchpad className="max-w-2xl" onValueChange={(strokes) => save(JSON.stringify(strokes))} />
}`,
  related: ["signature-pad", "corkboard", "paper", "reveal"],
} satisfies ComponentDoc
