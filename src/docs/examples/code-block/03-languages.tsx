import { CodeBlock } from "@/components/ui/code-block"

export const meta = {
  title: "css, json and bash",
  description: "The small lexer knows tsx, ts, jsx, js, css, json and bash. The language comes from the file name when you do not say. Long lines wrap with `wrap`.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-10 pt-2">
      <CodeBlock
        filename="card.css"
        seed="css"
        code={`@media (min-width: 40rem) {
  .card > h1 {
    color: var(--ll-ink); /* felt */
    margin: -2px 1.5rem !important;
  }
}`}
      />
      <CodeBlock filename="package.json" seed="json" code={`{\n  "name": "looseleaf",\n  "private": true,\n  "keywords": ["paper", null]\n}`} />
      <CodeBlock
        language="bash"
        filename="terminal"
        wrap
        seed="bash"
        code={`$ npx shadcn add https://kevintngo.github.io/looseleaf/r/bubble.json https://kevintngo.github.io/looseleaf/r/message.json --overwrite
# then draw something
export FOO=$BAR && echo "\${FOO}" | grep -i tags`}
      />
    </div>
  )
}
