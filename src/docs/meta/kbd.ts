import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "kbd",
  title: "Kbd",
  category: "Typography",
  description:
    "A keyboard key, drawn in pencil as a little keycap with a shaded thickness that presses flat under your finger. Used inline, in groups, in tooltips and in menus.",
  status: "stable",
  upstream: "kbd",
  parts: [
    {
      name: "Kbd",
      description:
        "A <kbd> element with a pencil keycap behind its label. (Unlike shadcn's it is not pointer-events-none, so that pressing it can sink the cap.) The label is real text in the hand font; the drawing is measured from the element and uses the text color, so it is graphite on paper and takes its color from whatever it sits in. While the pointer is down on it, or while you set data-pressed, the thickness disappears and the cap sinks onto its base.",
      props: [
        {
          name: "data-pressed",
          type: "boolean",
          description: "Draw the key as held down. Set it from your own key handlers to show what the user is pressing.",
        },
        {
          name: "seed",
          type: "string | number",
          description: "Pins the hand: the same seed always draws the same keycap, also across remounts. Default: derived from useId().",
        },
      ],
    },
    {
      name: "KbdGroup",
      description:
        'An inline group of keys with a small gap, for a shortcut such as Ctrl + K. Like upstream it is a <kbd> containing <kbd>s, which is how HTML says "this key combination".',
    },
  ],
  a11y: [
    'Kbd is the semantic <kbd> element: screen readers read the text as it is written. Write words for modifier keys when the symbol would be read unhelpfully ("Ctrl" rather than an icon), or give an icon-only key an Icon with a label (aria-label is not allowed on a bare <kbd>).',
    "Decorative by nature: it is not focusable and has no role. The press animation is pointer feedback only; nothing depends on it.",
    "Muted graphite on paper is 8.9:1. Inside a Tooltip or a menu the label and the drawing take that surface's text color.",
    "Calm density draws a plain pencil box without the thickness; reduced motion removes the press transition.",
  ],
  usage: `import { Kbd, KbdGroup } from "@/components/ui/kbd"

export function Example() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p>
        Press <Kbd>Esc</Kbd> to close.
      </p>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>K</Kbd>
      </KbdGroup>
    </div>
  )
}`,
  related: ["tooltip", "command", "dropdown-menu", "badge"],
} satisfies ComponentDoc
