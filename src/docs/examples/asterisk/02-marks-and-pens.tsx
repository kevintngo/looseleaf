import { Asterisk } from "@/components/ui/asterisk"

export const meta = {
  title: "Marks and pens",
  description: "Asterisk, star, dagger and double dagger; red, ink, blue and pencil. Text inside comes first and the mark follows it.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid max-w-lg gap-3 text-[17px]">
      <p className="flex flex-wrap gap-x-6">
        <Asterisk>asterisk</Asterisk>
        <Asterisk mark="star">star</Asterisk>
        <Asterisk mark="dagger">dagger</Asterisk>
        <Asterisk mark="double-dagger">double dagger</Asterisk>
      </p>
      <p className="flex flex-wrap gap-x-6">
        <Asterisk tone="red">red</Asterisk>
        <Asterisk tone="ink">ink</Asterisk>
        <Asterisk tone="blue">blue</Asterisk>
        <Asterisk tone="pencil">pencil</Asterisk>
      </p>
    </div>
  )
}
