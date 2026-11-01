import type { ComponentDoc } from "../types"

const usage = `import { Button } from "@/components/ui/button"

export function Demo() {
  return <Button variant="ghost">Sign here</Button>
}`

export default {
  slug: "button",
  title: "Button",
  category: "Actions",
  description:
    "A pressable felt-tip button with a pen underline. Reach for it for any action that is not navigation.",
  status: "stable",
  upstream: "button",
  parts: [
    {
      name: "Button",
      description: "The button itself.",
      props: [
        { name: "variant", type: '"default" | "ghost"', default: '"default"', description: "Visual weight." },
        { name: "seed", type: "string", description: "Fixes the pen wobble." },
      ],
    },
  ],
  a11y: ["Native <button>: Enter and Space activate it.", "The ink layer is aria-hidden."],
  usage,
  related: ["dialog", "card"],
} satisfies ComponentDoc
