import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@/styles/looseleaf.css"
import { Button } from "@/components/ui/button"
import { Highlight } from "@/components/ui/highlight"
import { Label } from "@/components/ui/label"
import { Mascot } from "@/components/ui/mascot"
import { Paper } from "@/components/ui/paper"
import { Slider } from "@/components/ui/slider"
import { Sticker } from "@/components/ui/sticker"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { InkProvider } from "@/lib/ink/react"

function Card() {
  return (
    <div data-press="og" className="ll-desk relative overflow-hidden" style={{ width: 1200, height: 630 }}>
      <p className="absolute top-[112px] left-[84px] m-0 font-type text-[26px] text-ink-muted">A React component library</p>
      <h1 className="absolute top-[150px] left-[76px] m-0 font-script text-[124px] leading-none font-bold text-ink ll-riso">Looseleaf</h1>
      <p className="absolute top-[300px] left-[84px] m-0 font-hand text-[40px] leading-tight text-ink">
        shadcn/ui, <Highlight seed="og-hl">drawn by hand.</Highlight>
      </p>
      <p className="absolute top-[376px] left-[86px] m-0 w-[540px] font-hand text-[24px] leading-snug text-ink-muted">123 accessible components with the same parts and props as shadcn/ui. MIT.</p>
      <p className="absolute top-[462px] left-[86px] m-0 font-type text-[27px] font-bold text-ink">kevintngo.github.io/looseleaf</p>
      <Paper stock="graph" tilt={false} seed="og-card" className="absolute top-[92px] right-[62px] flex w-[372px] -rotate-2 flex-col gap-5 p-7">
        <ToggleGroup type="single" variant="outline" value="week" aria-label="Range" seed="og-range">
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-center justify-between">
          <Label htmlFor="og-focus" className="text-[19px]">Focus mode</Label>
          <Switch id="og-focus" checked seed="og-switch" />
        </div>
        <Slider defaultValue={[64]} max={100} step={1} seed="og-slider" aria-label="Volume" />
        <div className="flex gap-3">
          <Button seed="og-publish">Publish</Button>
          <Button seed="og-cancel" variant="outline">Cancel</Button>
        </div>
      </Paper>
      <Mascot pose="wave" size={196} seed="og-stubby" className="absolute right-[44px] bottom-[16px] [--ll-blend:normal]" />
      <Sticker name="done" size={108} rotate={10} seed="og-done" className="absolute top-[36px] right-[42px]" />
    </div>
  )
}

function Icon({ size }: { size: number }) {
  return (
    <div data-press="icon" style={{ width: size, height: size, display: "grid", placeItems: "center" }}>
      <Mascot pose="idle" size={size} seed="icon" />
    </div>
  )
}

const mode = location.hash.slice(1)
const size = Number(mode.replace("icon-", "")) || 512
const root = document.getElementById("root")
if (root)
  createRoot(root).render(
    <StrictMode>
      <InkProvider tier="hi" textures={["linen"]}>{mode.startsWith("icon") ? <Icon size={size} /> : <Card />}</InkProvider>
    </StrictMode>,
  )
