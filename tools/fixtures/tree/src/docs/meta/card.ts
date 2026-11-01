import type { ComponentDoc } from "../types"

export default {
  slug: "card",
  title: "Index card",
  category: "Paper",
  description: "A sheet of paper that lies on the table, slightly turned. Holds a header and content.",
  parts: [{ name: "Card" }, { name: "CardHeader" }, { name: "CardContent" }],
  usage: `<Card><CardHeader>Title</CardHeader><CardContent>Body</CardContent></Card>`,
} satisfies ComponentDoc
