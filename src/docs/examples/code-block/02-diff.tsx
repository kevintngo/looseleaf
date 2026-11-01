import { CodeBlock } from "@/components/ui/code-block"

export const meta = {
  title: "A diff",
  description: "Removed lines are struck through in red pencil, added lines are ticked in green, and the header counts them. Copy puts the result on the clipboard.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const PATCH = `-const shown = notes;
+const shown = picked.size
+  ? notes.filter((n) => picked.has(n.tag))
+  : notes;
 export const count = shown.length;
-export const label = "all";
+export const label = picked.size ? "filtered" : "all";`

export default function Example() {
  return <CodeBlock diff code={PATCH} language="ts" filename="src/notes/filter.ts" lineNumbers className="mx-auto w-full max-w-xl" seed="diff" />
}
