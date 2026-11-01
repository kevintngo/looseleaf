import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "button",
  title: "Button",
  category: "Actions",
  description: "Triggers an action. Reach for it when something should happen on click.",
  status: "stable",
  upstream: "button",
  parts: [
    {
      name: "Button",
      description: "The button itself.",
      props: [
        { name: "variant", type: '"default" | "outline" | "ghost"', default: '"default"', description: "Visual weight." },
        { name: "asChild", type: "boolean", description: "Render the child element instead.", required: true },
      ],
    },
  ],
  a11y: ["Renders a native button, so Enter and Space activate it.", "Disabled buttons leave the tab order."],
  usage: 'import { Button } from "@/components/ui/button"\n\n<Button variant="outline">Save</Button>',
  related: ["card", "not-written-yet"],
} satisfies ComponentDoc
