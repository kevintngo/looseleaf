import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "rating",
  title: "Rating",
  category: "Forms",
  description:
    "Stars, hearts or suns somebody drew, where you pick how many are filled. Hover previews, half steps are optional, and it is a real radio group (arrow keys, form value), or a plain read-only display with a text alternative. New in Looseleaf: shadcn has no rating.",
  status: "new",
  parts: [
    {
      name: "Rating",
      description:
        "The row: `role=\"radiogroup\"` of `max` glyphs (or `role=\"img\"` when read-only). The fill of each glyph is its data-state, so previews and choices only change attributes; nothing is redrawn.",
      props: [
        { name: "value / defaultValue / onValueChange", type: "number / number / (value: number) => void", description: "Controlled or uncontrolled value, 0 to max. 0 means none chosen." },
        { name: "max", type: "number", default: "5", description: "How many glyphs." },
        { name: "allowHalf", type: "boolean", default: "false", description: "Steps of 0.5: two radios per glyph (one over each half) and a half-filled glyph, read from the start side." },
        { name: "icon", type: '"star" | "heart" | "sun"', default: '"star"', description: "The glyph: a single-stroke pentagram, a wavering heart or a sun with rays." },
        { name: "size", type: '"sm" | "default" | "lg"', default: '"default"', description: "20, 24 or 32 px glyphs. Hit areas are 2 px larger than the glyph on the outer sides, so the row is a row of 24 px targets at least." },
        { name: "readOnly", type: "boolean", default: "false", description: "A display: an image with the alt text \"Rated 4.5 out of 5\" (or your aria-label), no buttons, no tab stop." },
        { name: "disabled", type: "boolean", default: "false", description: "Faint pencil glyphs with a graphite fill. The radios are disabled." },
        { name: "clearable", type: "boolean", default: "false", description: "A click on the chosen value takes it back to 0." },
        { name: "name / required", type: "string / boolean", description: "`name` adds a hidden input so the value is in FormData (not while `disabled`). `required` sets aria-required and adds a native input the browser validates, so the form will not submit while the value is 0. A form reset puts the rating back to `defaultValue` (a controlled rating is asked with onValueChange)." },
        { name: "aria-invalid", type: 'boolean | "true" | "false"', description: "The empty glyphs are drawn in red pencil (filled ones keep their felt outline). FormControl sets it for you." },
        { name: "getLabel", type: "(value: number, max: number) => string", default: '"3 of 5"', description: "The accessible name of each radio." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same glyphs. Default: derived from useId()." },
      ],
    },
    {
      name: "RatingItem",
      description: "One glyph, `index` counting from 1, to compose your own row inside `<Rating>` (default: `max` of them are rendered for you). It must be inside a Rating.",
      props: [{ name: "index", type: "number", required: true, description: "Which glyph of the row this is (1 to max)." }],
    },
  ],
  a11y: [
    "An interactive rating is a radiogroup of role=\"radio\" buttons, named \"3 of 5\" (or with `getLabel`), with aria-checked on the chosen value and a roving tabindex: Tab lands on the chosen glyph (the first when there is none). Name the group with aria-label or aria-labelledby.",
    "ArrowRight / ArrowUp add a step, ArrowLeft / ArrowDown remove one (left and right swap in right-to-left), Home goes to the first step and End to the last; the arrows choose as they move, like native radios. Enter and Space press the focused radio. There is no way to arrow down to 0: use `clearable` and click the chosen glyph, or a Clear button.",
    "With `allowHalf` there are two radios per glyph, one over each half, so a half star has its own name (\"3.5 of 5\") and its own hit area; pointer previews show the half under the pointer.",
    "A read-only rating is role=\"img\" with a text alternative (\"Rated 4.5 out of 5\", or your aria-label) and its glyphs are decorative. Put the number in text next to it as well when it matters.",
    "Inside a Form, FormLabel's htmlFor cannot name a radiogroup: give the Rating an aria-label, or aria-labelledby with an id on the FormLabel.",
    "Half steps make narrow targets (half a glyph wide): on touch screens prefer whole steps, or `size=\"lg\"`.",
    "The preview follows the mouse only (not touch, where hover does not exist). The filled and empty glyphs differ in fill and in outline weight, not in hue alone; in Windows high contrast each glyph shows a text star (filled, empty or half).",
    "Keyboard focus draws a blue felt ring around the glyph. Reduced motion removes the little bounce under the pointer.",
  ],
  usage: `import { Rating } from "@/components/ui/rating"

export function Example() {
  return <Rating defaultValue={3} allowHalf aria-label="Rate this notebook" />
}`,
  related: ["radio-group", "slider", "toggle-group", "field"],
} satisfies ComponentDoc
