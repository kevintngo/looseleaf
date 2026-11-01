import { useId, type ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cx } from "@/docs/kit"

export function ControlLabel({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <span id={id} className={cx("font-script text-xl leading-none text-ink-you", className)}>
      {children}
    </span>
  )
}

export interface ChoiceOption<T extends string> {
  value: T
  label: ReactNode
  name?: string
}

export function Choice<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: T
  onChange: (value: T) => void
  options: readonly ChoiceOption<T>[]
  className?: string
}) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      spacing={2}
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as T)
      }}
      aria-label={label}
      className={cx("max-w-full flex-wrap", className)}
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} aria-label={o.name}>
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export function SearchField({ label, value, onChange, placeholder, className }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; className?: string }) {
  return (
    <Input
      type="search"
      aria-label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="off"
      spellCheck={false}
      className={className}
    />
  )
}

export function SizeSlider({
  label,
  value,
  onChange,
  min,
  max,
  readout,
  unit = "px",
  className,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  readout?: ReactNode
  unit?: string
  className?: string
}) {
  const id = useId()
  return (
    <div className={cx("flex min-w-56 flex-1 flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <ControlLabel id={id}>{label}</ControlLabel>
        <span className="font-type text-sm text-ink tabular-nums">
          {value} {unit}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([next]) => {
          if (next !== undefined) onChange(next)
        }}
        aria-labelledby={id}
        getValueText={(v) => `${v} ${unit === "px" ? "pixels" : unit}`}
      />
      {readout ? <p className="text-[15px] text-muted-foreground m-0">{readout}</p> : null}
    </div>
  )
}

export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mb-4 flex flex-col gap-4", className)}>{children}</div>
}

export function ToolbarRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("flex flex-wrap items-end gap-x-6 gap-y-3", className)}>{children}</div>
}
