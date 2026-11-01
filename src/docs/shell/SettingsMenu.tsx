import { useId } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { DENSITIES, MOTIONS, useSettings, type Density, type Motion } from "../core/settings"
import { useDeskKnob } from "./desk-knob"

const DENSITY: Record<Density, { label: string; hint: string }> = {
  comfortable: { label: "Comfortable", hint: "Roomy hit boxes, the full hand." },
  compact: { label: "Compact", hint: "Tighter rows for dense screens." },
  calm: { label: "Calm", hint: "Hairlines, no wobble: for data and long forms." },
}
const MOTION: Record<Motion, { label: string; hint: string }> = {
  system: { label: "Follow system", hint: "Motion unless your device asks for less." },
  reduced: { label: "Reduced", hint: "No animation, no per-word jitter." },
}

function Option({ group, value, label, hint }: { group: string; value: string; label: string; hint: string }) {
  const id = `${group}-${value}`
  return (
    <div className="flex items-start gap-2.5">
      <RadioGroupItem value={value} id={id} aria-describedby={`${id}-hint`} className="mt-1" />
      <div className="flex min-w-0 flex-col">
        <Label htmlFor={id} className="leading-snug">
          {label}
        </Label>
        <p id={`${id}-hint`} className="text-sm leading-snug text-muted-foreground">
          {hint}
        </p>
      </div>
    </div>
  )
}

export function SettingsMenu() {
  const { density, motion, setDensity, setMotion } = useSettings()
  const { clutter, setClutter } = useDeskKnob()
  const base = useId()
  const densityLabel = `${base}-density`
  const motionLabel = `${base}-motion`
  const clutterId = `${base}-clutter`
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Display settings">
          <Icon name="sliders-horizontal" size={20} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" aria-label="Display settings" tilt={false} className="flex w-80 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p id={densityLabel} className="font-type text-xs text-ink-muted">
            Density
          </p>
          <RadioGroup aria-labelledby={densityLabel} value={density} onValueChange={(v) => setDensity(v as Density)} className="gap-2.5">
            {DENSITIES.map((value) => (
              <Option key={value} group={`${base}-d`} value={value} label={DENSITY[value].label} hint={DENSITY[value].hint} />
            ))}
          </RadioGroup>
        </div>
        <Separator variant="dashed" />
        <div className="flex flex-col gap-2">
          <p id={motionLabel} className="font-type text-xs text-ink-muted">
            Motion
          </p>
          <RadioGroup aria-labelledby={motionLabel} value={motion} onValueChange={(v) => setMotion(v as Motion)} className="gap-2.5">
            {MOTIONS.map((value) => (
              <Option key={value} group={`${base}-m`} value={value} label={MOTION[value].label} hint={MOTION[value].hint} />
            ))}
          </RadioGroup>
        </div>
        <Separator variant="dashed" />
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={clutterId}>Things on the desk</Label>
          <Switch id={clutterId} checked={clutter} onCheckedChange={setClutter} />
        </div>
      </PopoverContent>
    </Popover>
  )
}
