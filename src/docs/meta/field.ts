import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "field",
  title: "Field",
  category: "Forms",
  description:
    "The words around a control: a label, help text and an error, stacked or in a row, grouped in sets with a legend. It is layout, so the only drawings are the wavy red pencil underline of an error and the hand-drawn card around a choice (a label that wraps a radio or checkbox with its own title and help).",
  status: "stable",
  upstream: "field",
  parts: [
    { name: "FieldSet", description: "A `<fieldset>` with a gap; tighter around radio and checkbox groups." },
    {
      name: "FieldLegend",
      description: "The title of a set (a `<legend>`).",
      props: [{ name: "variant", type: '"legend" | "label"', default: '"legend"', description: "`legend` is set in the script font; `label` like a Label." }],
    },
    { name: "FieldGroup", description: "Stacks Fields with a gap and is the container that `responsive` Fields measure (`@container/field-group`)." },
    {
      name: "Field",
      description: "One labelled thing: a role=group with the control, label, help and error in it. `data-invalid=\"true\"` turns its words red; `data-disabled=\"true\"` dims the label.",
      props: [{ name: "orientation", type: '"vertical" | "horizontal" | "responsive"', default: '"vertical"', description: "Label above, label beside, or vertical until the FieldGroup is md wide (a container query)." }],
    },
    { name: "FieldContent", description: "Holds a label and its help next to a control in a horizontal Field." },
    {
      name: "FieldLabel",
      description: "A Label. When a direct child is a whole `Field` it turns into a choice card: a hand-drawn box that gets a highlighter wash and a felt outline when a control inside it is checked.",
      props: [
        { name: "card", type: "boolean", description: "Force the choice-card drawing on or off (default: on when a direct child is a Field). Use it when the Field is wrapped in your own component." },
        { name: "seed", type: "string | number", description: "Pins the hand of the card." },
      ],
    },
    { name: "FieldTitle", description: "A title that is not a label (`data-slot=\"field-label\"`, as upstream) for the words inside a choice card." },
    { name: "FieldDescription", description: "Muted help text; links inside it are underlined." },
    { name: "FieldSeparator", description: "A rule between fields; with children a labelled divider (\"or\"). Uses the pencil Separator." },
    {
      name: "FieldError",
      description: "The message under a field, announced as an alert and underlined with a wavy red pencil line. Renders nothing when there is nothing to say.",
      props: [
        { name: "errors", type: "Array<{ message?: string } | undefined>", description: "react-hook-form / zod style errors: one message is text, several a bullet list, duplicates once." },
        { name: "children", type: "ReactNode", description: "Your own message; wins over `errors`." },
        { name: "seed", type: "string | number", description: "Pins the hand of the underline." },
      ],
    },
  ],
  a11y: [
    "Field is a role=group; a FieldLabel is a real <label> (use htmlFor + id), so a click on it focuses or toggles the control. Wrap radios and checkboxes in a FieldSet with a FieldLegend so the group has a name.",
    "FieldError is role=\"alert\": it is announced when it appears. Point the control at it with aria-describedby and set aria-invalid, so the control's own box turns red as well (hue is never the only cue: the message, the wavy underline and the bang of the field say it too).",
    "A choice card is one big label: clicking anywhere on it toggles its control, and the checked state is shown by the wash and the felt box, not by colour alone (the radio or checkbox inside shows it too). In Windows high contrast the checked card becomes a Highlight block.",
    "Disabling: set `data-disabled=\"true\"` on the Field (the label goes graphite) AND `disabled` on the control. A `disabled` FieldSet disables the controls natively, but the drawn controls choose their dashed disabled drawing from their own props (or their root's), not from an ancestor fieldset: pass `disabled` to each.",
    "`responsive` uses a container query on the FieldGroup, so it reacts to the width of the form, not of the screen.",
    "Right-to-left: everything uses logical properties; the error underline is symmetric.",
  ],
  usage: `import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function Example() {
  return (
    <FieldGroup className="max-w-sm">
      <Field data-invalid="true">
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" aria-invalid aria-describedby="email-error" />
        <FieldDescription>We send one page a week.</FieldDescription>
        <FieldError id="email-error">Enter an address like ada@notes.dev.</FieldError>
      </Field>
    </FieldGroup>
  )
}`,
  related: ["form", "label", "input", "select", "radio-group", "checkbox", "switch"],
} satisfies ComponentDoc
