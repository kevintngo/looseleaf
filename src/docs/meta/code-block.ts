import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "code-block",
  title: "Code block",
  category: "Chat",
  description:
    "A typed slip taped to the page: the file name in a typewriter face, the code on a two-color ribbon (red keywords and numbers, black for the rest), line numbers in the margin and a diff mode where removed lines are struck through in red pencil and added ones ticked in green. Ships its own small lexer for tsx, ts, jsx, js, css, json and bash.",
  status: "new",
  parts: [
    {
      name: "CodeBlock",
      description: "A `figure` on a slip of paper, taped at the top. With `code` and no children it assembles a header (file name, `+/-` counts, copy button) and the content itself; with children you compose the parts.",
      props: [
        { name: "code", type: "string", description: "The source. For a diff: unified diff lines (`+added`, `-removed`, ` context`)." },
        { name: "language", type: '"tsx" | "ts" | "jsx" | "js" | "css" | "json" | "bash" | "diff" | "text"', description: "Default: from the file name, else plain text. Aliases (`typescript`, `sh`, `javascript`...) work." },
        { name: "filename", type: "string", description: "Typed at the top of the slip." },
        { name: "lineNumbers", type: "boolean", default: "false", description: "Number the lines in the margin (generated content: never selected, never copied)." },
        { name: "diff", type: "boolean", description: "Read the code as a diff. `language=\"diff\"` turns it on too; give the code's own language with `filename`." },
        { name: "wrap", type: "boolean", default: "false", description: "Wrap long lines instead of scrolling sideways." },
        { name: "startLine", type: "number", default: "1", description: "The number of the first line." },
        { name: "copyable", type: "boolean", default: "true", description: "Show the copy button of the default header." },
        { name: "stock / tape / edge / tilt / fastener / seed", type: "PaperProps", description: "It is a Paper: default `slip` stock with `tape=\"top\"`. Any Paper prop works (a torn `receipt`, a kraft `stock`)." },
      ],
    },
    { name: "CodeBlockHeader", description: "The typed line at the top, ruled off with a dashed pencil line (a drawn rule)." },
    { name: "CodeBlockTitle", description: "The file name, or the language when there is none. Truncates." },
    { name: "CodeBlockStats", description: "`+14 -3` for a diff (green and red, with visually hidden 'Added' and 'Removed'); nothing for plain code." },
    { name: "CodeBlockActions", description: "A row for the header's buttons." },
    { name: "CodeBlockCopy", description: "Copies the code (a diff copies the result: context and added lines) with the Clipboard API, or a hidden textarea where it is missing. The icon turns into a tick and a polite status says 'Copied'. When nothing can copy it selects the code and asks for Ctrl+C." },
    {
      name: "CodeBlockContent",
      description: "The lines, in a scrolling `pre` (focusable, so the keyboard can scroll it) inside a host that draws the focus ring. Takes its own `code` and `language` to override the block's.",
      props: [
        { name: "code", type: "string", description: "Show this instead of the block's code." },
        { name: "language", type: "string", description: "Language of `code`." },
      ],
    },
  ],
  a11y: [
    "The code is real text in a `pre` > `code`, one `span` per line, each ending in a real newline (the last one does not): select, copy, find-in-page and screen readers see the source, blank lines included. Line numbers are CSS generated content and are never selected. The visually hidden 'Added:' / 'Removed:' are `user-select: none`, so they stay out of a copied selection. The figure is named by the file name, or by the language.",
    "The scrolling body is a tab stop (`tabindex=0`) so a keyboard user can scroll long lines; on :focus-visible a blue ring is drawn round it.",
    "Diff lines are `ins` and `del` elements with a visually hidden 'Added:' / 'Removed:'; the tick and the strike are aria-hidden and never the only signal. Git's `\\ No newline at end of file` is read as a note, not as code.",
    "Contrast: ink on the slip 14:1, red ribbon 4.8:1, graphite comments and line numbers 5.9:1. Reduced motion changes nothing (there is no animation but the copied tick).",
    "Forced colors: the drawn rule and the ring step aside for real outlines; the strike and tick keep the text color.",
  ],
  usage: `import { CodeBlock } from "@/components/ui/code-block"

export function Example() {
  return (
    <CodeBlock
      filename="src/notes/filter.ts"
      language="ts"
      lineNumbers
      code={\`export const shown = picked.size
  ? notes.filter((n) => n.tags.some((t) => picked.has(t)))
  : notes\`}
    />
  )
}

<CodeBlock diff filename="filter.ts" language="ts" code={patch} />`,
  related: ["bubble", "message", "attachment", "card", "paper"],
} satisfies ComponentDoc
