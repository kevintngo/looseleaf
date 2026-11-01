export type ColumnId = "todo" | "doing" | "done"
export type Label = "Design" | "Shop" | "Words" | "Studio" | "Admin"

export type Note = {
  id: string
  title: string
  detail?: string
  label: Label
  who: string
  due?: string
  column: ColumnId
}

export const COLUMNS: ReadonlyArray<{ id: ColumnId; title: string; hint: string }> = [
  { id: "todo", title: "To do", hint: "Waiting for a pair of hands" },
  { id: "doing", title: "Doing", hint: "Pinned up, in progress" },
  { id: "done", title: "Done", hint: "Ticked off" },
]

export const LABEL_COLOR = { Design: "pink", Shop: "orange", Words: "green", Studio: "blue", Admin: "yellow" } as const satisfies Record<Label, string>

export const LABELS = Object.keys(LABEL_COLOR) as Label[]

export const TEAM = ["Ada Lovelace", "Jo Okafor", "Mika Kobayashi", "Sam Reyes"] as const

export const notes: Note[] = [
  { id: "n1", title: "Order washi tape for the box", label: "Shop", who: "Ada Lovelace", due: "Sep 28", column: "todo" },
  { id: "n2", title: "Write the newsletter", detail: "Three paragraphs and a link to the journal.", label: "Words", who: "Jo Okafor", due: "Sep 29", column: "todo" },
  { id: "n3", title: "Photograph the field notebooks", label: "Studio", who: "Mika Kobayashi", due: "Sep 30", column: "todo" },
  { id: "n4", title: "Book the courier", label: "Admin", who: "Sam Reyes", column: "todo" },
  { id: "n5", title: "Print the price tags", detail: "Kraft card, two hundred of them.", label: "Shop", who: "Ada Lovelace", due: "Sep 27", column: "doing" },
  { id: "n6", title: "Draw the sticker sheet", detail: "Nine stickers. One of them is a snail.", label: "Design", who: "Mika Kobayashi", due: "Sep 27", column: "doing" },
  { id: "n7", title: "Fix the postcode field at checkout", label: "Admin", who: "Sam Reyes", column: "doing" },
  { id: "n8", title: "Choose the paper stock", label: "Design", who: "Jo Okafor", column: "done" },
  { id: "n9", title: "Name the new notebook", detail: "It is called Margin.", label: "Words", who: "Jo Okafor", column: "done" },
  { id: "n10", title: "Order the shipping boxes", label: "Admin", who: "Sam Reyes", column: "done" },
]
