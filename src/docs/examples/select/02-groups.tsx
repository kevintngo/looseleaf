import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const meta = {
  title: "Groups and a long list",
  description: "Kicker labels, pencil rules between groups, and scroll arrows when the slip runs out of room. Radix's item-aligned placement (the default) lays the chosen row over the field.",
  layout: "center" as const,
  height: 420,
}

const zones = [
  ["North America", ["Eastern (EST)", "Central (CST)", "Mountain (MST)", "Pacific (PST)", "Alaska (AKST)", "Hawaii (HST)"]],
  ["Europe & Africa", ["Greenwich Mean (GMT)", "Central European (CET)", "Eastern European (EET)", "West Africa (WAT)", "Central Africa (CAT)", "East Africa (EAT)"]],
  ["Asia", ["Moscow (MSK)", "India (IST)", "China (CST)", "Japan (JST)", "Korea (KST)"]],
] as const

export default function Example() {
  return (
    <Select defaultValue="Central European (CET)">
      <SelectTrigger className="w-[260px]" aria-label="Time zone">
        <SelectValue placeholder="Select a time zone" />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {zones.map(([region, items], i) => (
          <SelectGroup key={region}>
            {i > 0 && <SelectSeparator />}
            <SelectLabel>{region}</SelectLabel>
            {items.map((z) => (
              <SelectItem key={z} value={z}>
                {z}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
