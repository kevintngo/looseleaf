import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const meta = {
  title: "Demo",
  description:
    "Official `select-demo`: a 180 px trigger with a placeholder and one labelled group of fruit. The trigger is a drawn field with a hand-drawn chevron; the list is a slip, the pointed-at row wears the highlighter and the chosen one a felt tick. Type a letter to jump to a fruit. Only addition: an `aria-label` on the trigger, because a placeholder is not a name.",
  layout: "center" as const,
  height: 340,
}

export default function Example() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]" aria-label="Fruit">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
