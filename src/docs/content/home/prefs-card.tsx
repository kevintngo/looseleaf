import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { IndexCard, IndexCardContent, IndexCardFooter, IndexCardHeader, IndexCardTitle } from "@/components/ui/index-card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

export default function PrefsCard() {
  const [pressure, setPressure] = useState([60])
  return (
    <IndexCard data-home="prefs" seed="home-prefs" flag="sky" stack={1} className="w-full max-w-md">
      <IndexCardHeader>
        <IndexCardTitle>Settings</IndexCardTitle>
      </IndexCardHeader>
      <IndexCardContent>
        <div className="flex h-[30px] items-center justify-between gap-3">
          <Label htmlFor="home-airplane">Airplane mode</Label>
          <Switch id="home-airplane" />
        </div>
        <div className="flex h-[30px] items-center justify-between gap-3">
          <Label htmlFor="home-pencil">Write in pencil</Label>
          <Switch id="home-pencil" defaultChecked />
        </div>
        <div className="flex h-[30px] items-center gap-3">
          <Label id="home-pressure-label" className="shrink-0">
            Pen pressure
          </Label>
          <Slider value={pressure} onValueChange={setPressure} max={100} step={1} aria-labelledby="home-pressure-label" className="min-w-0 flex-1" />
          <output aria-label="Pen pressure value" className="ll-num w-8 shrink-0 text-end font-script text-xl leading-none text-ink-you">
            {pressure[0]}
          </output>
        </div>
        <div className="flex h-[30px] items-center gap-2">
          <Checkbox id="home-tally" defaultChecked />
          <Label htmlFor="home-tally">Keep score with tally marks</Label>
        </div>
      </IndexCardContent>
      <IndexCardFooter>
        <span className="ll-num">no. 0007</span>
        <span className="ll-num">p. 1</span>
      </IndexCardFooter>
    </IndexCard>
  )
}
