import { Scribble } from "@/components/ui/scribble"

export const meta = {
  title: "Pens",
  description: "Ink brush, a fine liner that leaves the words readable, red felt, blue felt and soft pencil: one change of mind each.",
  layout: "stack" as const,
}

const row = "grid grid-cols-[6.5rem_1fr] items-baseline gap-x-4"
const pen = "font-type text-xs text-muted-foreground"

export default function Example() {
  return (
    <dl className="grid gap-y-3 text-[17px] leading-[1.55]">
      <div className={row}>
        <dt className={pen}>Ink brush</dt>
        <dd>
          Meet on <Scribble>Tuesday</Scribble> Thursday.
        </dd>
      </div>
      <div className={row}>
        <dt className={pen}>Fine liner</dt>
        <dd>
          The password is <Scribble weight="fine">hunter2</Scribble>, still readable.
        </dd>
      </div>
      <div className={row}>
        <dt className={pen}>Red felt</dt>
        <dd>
          Total <Scribble tone="red">14.10</Scribble> 12.00.
        </dd>
      </div>
      <div className={row}>
        <dt className={pen}>Blue felt</dt>
        <dd>
          Call <Scribble tone="blue">Ada</Scribble> Jo about the tomatoes.
        </dd>
      </div>
      <div className={row}>
        <dt className={pen}>Soft pencil</dt>
        <dd>
          Pick up <Scribble tone="pencil">milk</Scribble> oat milk.
        </dd>
      </div>
    </dl>
  )
}
