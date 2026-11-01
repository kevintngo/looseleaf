import { StrictMode, useEffect, useState, type ComponentType } from "react"
import { createRoot } from "react-dom/client"
import "@/styles/looseleaf.css"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Highlight } from "@/components/ui/highlight"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Paper } from "@/components/ui/paper"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { InkProvider } from "@/lib/ink/react"
import { LogoMark } from "@/docs/shell/LogoMark"

function Card() {
  return (
    <div data-press="og" className="ll-desk relative overflow-hidden" style={{ width: 1200, height: 630 }}>
      <div className="absolute top-[86px] left-[80px] flex items-center gap-4">
        <LogoMark size={60} />
        <p className="m-0 font-type text-[26px] text-ink-muted">A React component library</p>
      </div>
      <h1 className="absolute top-[158px] left-[76px] m-0 font-script text-[124px] leading-none font-bold text-ink">Looseleaf</h1>
      <p className="absolute top-[300px] left-[84px] m-0 font-hand text-[40px] leading-tight text-ink">
        shadcn/ui, <Highlight seed="og-hl">drawn by hand.</Highlight>
      </p>
      <p className="absolute top-[376px] left-[86px] m-0 w-[540px] font-hand text-[24px] leading-snug text-ink-muted">123 accessible components with the same parts and props as shadcn/ui. MIT.</p>
      <p className="absolute top-[462px] left-[86px] m-0 font-type text-[27px] font-bold text-ink">kevintngo.github.io/looseleaf</p>
      <Paper stock="graph" tilt={false} seed="og-card" className="absolute top-[118px] right-[70px] flex w-[384px] -rotate-2 flex-col gap-5 p-7">
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
      <Paper stock="paper" tilt={false} tape="top" tapeKind="masking" seed="og-form" className="absolute top-[378px] right-[118px] flex w-[330px] rotate-2 flex-col gap-3 px-6 pt-6 pb-5">
        <Label htmlFor="og-email" className="text-[18px]">Email</Label>
        <Input id="og-email" readOnly value="ada@looseleaf.dev" seed="og-input" />
        <div className="flex items-center gap-2">
          <Checkbox id="og-remember" checked seed="og-check" />
          <Label htmlFor="og-remember" className="text-[17px]">Remember me</Label>
        </div>
      </Paper>
    </div>
  )
}

function Icon({ size, plate }: { size: number; plate: boolean }) {
  return (
    <div data-press="icon" style={{ width: size, height: size, display: "grid", placeItems: "center", background: plate ? "var(--ll-desk)" : "transparent" }}>
      <LogoMark size={plate ? Math.round(size * 0.8) : size} />
    </div>
  )
}

const BLOCKS = import.meta.glob<{ default: ComponentType }>(["/src/docs/content/blocks/*.tsx", "!/src/docs/content/blocks/_*.tsx"])

function BlockShot({ slug, width, side, top }: { slug: string; width: number; side: number; top: boolean }) {
  const [Shot, setShot] = useState<ComponentType | null>(null)
  useEffect(() => {
    const load = BLOCKS[`/src/docs/content/blocks/${slug}.tsx`]
    if (load) void load().then((m) => setShot(() => m.default))
  }, [slug])
  const block = (
    <div data-press="block" data-ready={Shot ? "" : undefined} style={{ width }}>
      {Shot ? <Shot /> : null}
    </div>
  )
  if (!side) return block
  return (
    <div data-press="square" className="ll-desk relative overflow-hidden" style={{ width: side, height: side, display: "grid", justifyItems: "center", alignItems: top ? "start" : "center", paddingTop: top ? 64 : 0 }}>
      {block}
      {top ? <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-linear-to-b from-transparent to-(--ll-desk)" /> : null}
    </div>
  )
}

const mode = location.hash.slice(1)
const [, blockSlug, blockWidth, blockSide, blockTop] = mode.startsWith("block/") ? mode.split("/") : []
const size = Number(mode.replace("icon-", "").replace("-plate", "")) || 512
const root = document.getElementById("root")
if (root)
  createRoot(root).render(
    <StrictMode>
      <InkProvider tier="hi" textures={["linen"]}>{blockSlug ? <BlockShot slug={blockSlug} width={Number(blockWidth) || 1100} side={Number(blockSide) || 0} top={blockTop === "top"} /> : mode.startsWith("icon") ? <Icon size={size} plate={mode.endsWith("-plate")} /> : <Card />}</InkProvider>
    </StrictMode>,
  )
