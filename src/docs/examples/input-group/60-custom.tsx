import { InputGroup, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group"

export const meta = {
  title: "Custom control",
  description:
    "shadcn's `input-group-custom`: any control can be the group's field if it carries `data-slot=\"input-group-control\"`. The original uses react-textarea-autosize; this one is a plain textarea with `field-sizing: content`, which grows with the text without a package.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <textarea
          data-slot="input-group-control"
          aria-label="Autoresize textarea"
          className="flex field-sizing-content min-h-16 w-full resize-none bg-transparent px-3 py-2.5 text-base outline-none md:text-sm"
          placeholder="Autoresize textarea..."
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton className="ms-auto" size="sm" variant="default">
            Submit
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
