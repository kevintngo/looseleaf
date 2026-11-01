import { Annotate } from "@/components/ui/annotate"
import { Paper } from "@/components/ui/paper"
import { Blockquote, H1, H2, InlineCode, Lead, List, Muted, P } from "@/components/ui/typography"

export const meta = {
  title: "An article on paper",
  description: "The parts composed into a real page, with a mark or two from the marks family.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Paper stock="paper" tilt seed="article" className="w-full max-w-2xl px-9 py-9">
      <Muted>Notebook / 4 min read</Muted>
      <H1 className="mt-1">Why the margin is the best part</H1>
      <Lead className="mt-4">A book is a conversation with someone who cannot answer back.</Lead>
      <P>
        So you answer in the margin: <Annotate type="highlight">an arrow, a question mark, a small argument</Annotate>. Keep the pencil close and the <InlineCode>rules</InlineCode> loose.
      </P>
      <H2 className="mt-8">Three habits</H2>
      <List className="mt-4">
        <li>Date every page</li>
        <li>Never erase; cross out</li>
        <li>Leave a line at the end for what you want to ask next</li>
      </List>
      <Blockquote>Write it down before you lose it.</Blockquote>
    </Paper>
  )
}
