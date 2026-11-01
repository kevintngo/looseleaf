import type { ComponentDoc } from "../types"

export default {
  slug: "dialog",
  title: "Dialog",
  category: "Overlays",
  description: "A paper slip that lands in the middle of the page and asks for attention.",
  status: "new",
  parts: [{ name: "Dialog" }, { name: "DialogTrigger" }, { name: "DialogContent" }],
  usage: `<Dialog><DialogTrigger>Open</DialogTrigger><DialogContent>Hello</DialogContent></Dialog>`,
  related: ["button"],
} satisfies ComponentDoc
