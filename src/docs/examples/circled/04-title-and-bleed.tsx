import { Circled } from "@/components/ui/circled"

export const meta = {
  title: "A word in a title, and bleed",
  description: "The loop hugs one line of writing: a short word in a display title keeps clear of the lines above and below. bleed sets how far it stands off.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid max-w-lg gap-5 py-2">
      <h3 className="font-script text-4xl font-bold">
        Good to see <Circled tone="blue">you</Circled> again
      </h3>
      <p className="text-muted-foreground">Sign in with your email and the password you keep in your head.</p>
      <p className="flex flex-wrap items-baseline gap-x-8 gap-y-3 text-[17px]">
        <span>
          <Circled bleed={0}>bleed 0</Circled>
        </span>
        <span>
          <Circled>bleed 2, the default</Circled>
        </span>
        <span>
          <Circled bleed={7} tone="red">
            bleed 7
          </Circled>
        </span>
      </p>
    </div>
  )
}
