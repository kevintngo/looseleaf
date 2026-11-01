import { useId, type ComponentProps, type ReactNode } from "react"
import { paths } from "@/docs/core/router-core"
import { Section, Stage, Tile, TileGrid, cx } from "@/docs/kit"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Paper } from "@/components/ui/paper"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export interface RelatedLink {
  to: string
  title: string
  note: string
}

export const foundation = (slug: string, title: string, note: string): RelatedLink => ({ to: paths.foundations(slug), title, note })
export const component = (slug: string, title: string, note: string): RelatedLink => ({ to: paths.components(slug), title, note })

export function Related({ items }: { items: readonly RelatedLink[] }) {
  return (
    <Section id="related" title="Related" description="Where to go from here.">
      <TileGrid>
        {items.map((item) => (
          <Tile key={item.to} to={item.to} title={item.title} description={item.note} />
        ))}
      </TileGrid>
    </Section>
  )
}

export function Demo({ label, height, surface, className, children }: { label: string; height?: number; surface?: "paper" | "desk"; className?: string; children: ReactNode }) {
  return (
    <Stage layout="center" label={label} height={height} surface={surface}>
      <div className={cx("w-full min-w-0", className)}>{children}</div>
    </Stage>
  )
}

export function Panel({ title, className, children }: { title?: string; className?: string; children: ReactNode }) {
  return (
    <Paper stock="slip" tilt={false} className={cn("p-4", className)}>
      {title ? <p className="mb-3 font-type text-[13px] text-pencil-text">{title}</p> : null}
      {children}
    </Paper>
  )
}

export function Readout({ className, ...props }: ComponentProps<"output">) {
  return <output className={cn("ll-num font-mono text-sm text-muted-foreground", className)} {...props} />
}

export interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  format?: (value: number) => string
  tone?: "marker" | "hi" | "blue"
  ticks?: boolean | number
  hint?: string
  className?: string
  seed?: string
}

export function SliderRow({ label, value, min, max, step = 1, onChange, format, tone, ticks, hint, className, seed }: SliderRowProps) {
  const id = useId()
  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label id={`${id}-label`} className="text-[15px] font-bold">
          {label}
        </Label>
        <Readout>{format ? format(value) : String(value)}</Readout>
      </div>
      <Slider
        aria-labelledby={`${id}-label`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        value={[value]}
        min={min}
        max={max}
        step={step}
        tone={tone}
        ticks={ticks}
        seed={seed}
        onValueChange={(v) => {
          const next = v[0]
          if (typeof next === "number" && Number.isFinite(next)) onChange(next)
        }}
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function SwitchRow({ label, checked, onChange, hint, className }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string; className?: string }) {
  const id = useId()
  return (
    <div className={cn("grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1", className)}>
      <Switch id={id} checked={checked} onCheckedChange={onChange} aria-describedby={hint ? `${id}-hint` : undefined} />
      <Label htmlFor={id} className="text-[15px] font-bold">
        {label}
      </Label>
      {hint ? (
        <p id={`${id}-hint`} className="col-start-2 text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export interface Option<T extends string> {
  value: T
  label: string
}

export function SelectRow<T extends string>({ label, value, options, onChange, className }: { label: string; value: T; options: readonly Option<T>[]; onChange: (v: T) => void; className?: string }) {
  const id = useId()
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-[15px] font-bold">
        {label}
      </Label>
      <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className="w-full">
        {options.map((o) => (
          <NativeSelectOption key={o.value} value={o.value}>
            {o.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  )
}

export function TableScroll({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" tabIndex={0} aria-label={label} className="overflow-x-auto">
      {children}
    </div>
  )
}

export const th = "border-b-2 border-pencil-mark px-2 py-1.5 text-start align-bottom font-script text-lg font-bold whitespace-nowrap text-ink"
export const td = "border-b border-line-soft px-2 py-2 align-top"

const VERDICT_STYLE = { ok: "text-green", info: "text-orange-text", fail: "text-red" } as const

export function Verdict({ kind, children }: { kind: keyof typeof VERDICT_STYLE; children?: ReactNode }) {
  return <span className={cn("font-type text-[13px]", VERDICT_STYLE[kind])}>{children ?? kind}</span>
}
