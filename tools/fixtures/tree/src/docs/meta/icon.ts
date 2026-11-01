import type { ComponentDoc } from "../types"

export default {
  slug: "icon",
  title: "Doodle icon",
  category: "Icons",
  description: "A hand-drawn glyph. Sized by prop, coloured by the text colour, hidden from screen readers.",
  parts: [{ name: "Icon" }],
  usage: `<Icon name="check" size={20} />`,
} satisfies ComponentDoc
