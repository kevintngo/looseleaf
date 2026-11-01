import { Signature } from "@/components/ui/signature"

export const meta = {
  title: "Flourishes, sizes and pens",
  description: "A swoosh, an underline, none; three sizes; blue, ink and red pens. A signature keeps its own size in a row or a grid, so names of different sizes sit on one baseline with `self-baseline`.",
  layout: "stack" as const,
}

const row = "flex flex-wrap items-baseline gap-x-10 gap-y-3"
const kicker = "mb-1 font-type text-xs text-muted-foreground"

export default function Example() {
  return (
    <div className="grid gap-6">
      <div>
        <p className={kicker}>Flourish</p>
        <div className={row}>
          <Signature flourish="swoosh" className="self-baseline">Grace Hopper</Signature>
          <Signature flourish="underline" className="self-baseline">Grace Hopper</Signature>
          <Signature flourish="none" className="self-baseline">Grace Hopper</Signature>
        </div>
      </div>
      <div>
        <p className={kicker}>Size</p>
        <div className={row}>
          <Signature size="sm" className="self-baseline">Grace Hopper</Signature>
          <Signature size="md" className="self-baseline">Grace Hopper</Signature>
          <Signature size="lg" className="self-baseline">Grace Hopper</Signature>
        </div>
      </div>
      <div>
        <p className={kicker}>Pen</p>
        <div className={row}>
          <Signature className="self-baseline">Katherine J.</Signature>
          <Signature tone="ink" className="self-baseline">Katherine J.</Signature>
          <Signature tone="red" weight="brush" className="self-baseline">M. Curie</Signature>
        </div>
      </div>
    </div>
  )
}
