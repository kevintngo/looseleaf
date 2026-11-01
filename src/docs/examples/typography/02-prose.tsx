import { Prose } from "@/components/ui/typography"

export const meta = {
  title: "Prose: raw markup",
  description: "Plain HTML you did not style, straight from a markdown renderer: Prose gives it the notebook's type, spacing, links, lists, code and quotations.",
  layout: "stack" as const,
}

const HTML = `
<h1>Keeping a reading log</h1>
<p>A reading log is <em>not</em> a summary. It is a place to <strong>argue</strong>, and to write down where you stopped believing the author. Start with the <a href="#">field guide to margins</a>.</p>
<h2>What to write down</h2>
<ul>
  <li>The date, so future you can blame past you</li>
  <li>One sentence you would steal</li>
  <li>A question, marked with <code>?</code></li>
</ul>
<blockquote><p>The best time to write it down was when it happened.</p></blockquote>
<h2>Tools</h2>
<ol><li>A pencil</li><li>A second pencil</li></ol>
<p>Press <kbd>Cmd</kbd> + <kbd>S</kbd> to save, or run <code>npm run notes</code>.</p>
<pre><code>read --slowly --with-pencil</code></pre>
`

export default function Example() {
  return <Prose dangerouslySetInnerHTML={{ __html: HTML }} />
}
