import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "clipboard",
  title: "Clipboard",
  category: "Paper",
  description:
    "A board with a spring clip holding a sheet of paper. The board is one drawn sheet (hardboard with the grain of its fiber, or colored plastic; a bevel lit from the upper left) that turns and casts its own shadow; the chrome clip is drawn over the paper it holds. The sheet is real DOM: put a form, a checklist or notes on it.",
  status: "new",
  parts: [
    {
      name: "Clipboard",
      description: "A flex column at most 28 rem wide. It leaves 3.5 rem at the top for the clip and a 1.5 rem rim round the paper. Until it is measured (or given `size`) it wears a plain board.",
      props: [
        { name: "tone", type: '"hardboard" | Accent', default: '"hardboard"', description: "Hardboard, or a plastic board in tomato, tangerine, lemon, grass, teal, sky, grape or bubblegum." },
        { name: "tilt / seed / size", type: "boolean | number / string | number / [w, h]", description: "A seeded turn under 1.2 degrees (or degrees, or false); pins the hand; the box in px for server-rendered drawings." },
      ],
    },
    {
      name: "ClipboardPaper",
      description: "The sheet on the board: a Paper with ruled lines and a red margin by default, tucked 1.5 rem under the clip. Text starts 3.5 rem in, past the margin.",
      props: [
        { name: "as", type: '"div" | "section" | "article" | "form" | "fieldset"', default: '"div"', description: "The element." },
        { name: "stock / rules / tape / tilt / seed", type: "Paper props", description: "As on any sheet: graph paper, a torn edge, a strip of tape." },
      ],
    },
  ],
  a11y: [
    "The board and the clip are aria-hidden decoration (the clip is an intrinsic `prop` drawn over the paper, with no pointer events); everything on the paper is ordinary content. Make the paper a `form`, `section` or `article` with a label when it means more than a block of text.",
    "Ink on the paper is 14:1. The paper is drawn on cream even on a colored board, so contrast never depends on the board's color. The clip hides in calm density; the tilt is zero there.",
    "Windows high contrast replaces the board with an outline; the paper keeps its own.",
  ],
  usage: `import { Clipboard, ClipboardPaper } from "@/components/ui/clipboard"

<Clipboard tone="teal">
  <ClipboardPaper as="form" aria-label="Sign-in sheet">
    <h3 className="font-script text-3xl font-bold">Visitors</h3>
    …
  </ClipboardPaper>
</Clipboard>`,
  related: ["paper", "notebook", "page", "index-card"],
} satisfies ComponentDoc
