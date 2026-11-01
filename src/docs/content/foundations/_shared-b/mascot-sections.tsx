import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Mascot } from "@/components/ui/mascot"
import { Paper } from "@/components/ui/paper"
import { useEnsureInkDefs } from "@/lib/ink/react"
import { scenes } from "@/lib/ink/art/scenes"
import { AnchorHeading, Chip } from "@/docs/kit"
import { ArtShelf, type ShelfEntry } from "./art-shelf"
import { POSES, SCENE_ENTRIES, poseNote, type SceneEntry } from "./catalog"
import { Choice, ControlLabel } from "./controls"
import { CopyStatus, useCopyStatus } from "./gallery"
import { useNearViewport } from "./lazy"
import { emptySceneSnippet, importLine, mascotSnippet, mascotTierLabel } from "./snippets"

const STUDIO_SIZES = [24, 32, 48, 64, 96, 160] as const

export function MascotStudio({ pose, onPose }: { pose: string; onPose: (pose: string) => void }) {
  const [size, setSize] = useState<number>(96)
  const { copied, message, copy } = useCopyStatus()
  const note = poseNote(pose)
  const snippet = mascotSnippet(pose, { size })
  return (
    <div data-slot="mascot-studio">
      <div className="mb-4 flex flex-col gap-1.5">
        <ControlLabel>Pose</ControlLabel>
        <Choice label="Stubby's pose" value={pose} onChange={onPose} options={POSES.map((p) => ({ value: p, label: p }))} />
      </div>
      <div className="flex flex-wrap items-stretch gap-x-8 gap-y-6">
        <Paper stock="paper" tilt={false} className="grid min-h-72 min-w-64 flex-1 basis-72 place-items-center p-6">
          <Mascot pose={pose} size={size} />
        </Paper>
        <div className="flex min-w-64 flex-1 basis-72 flex-col gap-4">
          <div>
            <p className="m-0 font-script text-4xl leading-none text-ink">{pose}</p>
            <p className="mt-2 mb-0 text-ink">{note.does}</p>
            <p className="mt-1 mb-0 text-pencil-text">
              <strong className="text-ink">Belongs in:</strong> {note.serves}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <ControlLabel>Size</ControlLabel>
            <Choice label="Stubby's size" value={String(size)} onChange={(v) => setSize(Number(v))} options={STUDIO_SIZES.map((px) => ({ value: String(px), label: String(px), name: `${px} pixels` }))} />
            <p className="text-[15px] text-muted-foreground m-0">
              {size} px: {mascotTierLabel(size)}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <code className="font-mono text-sm break-all text-ink">{snippet}</code>
            <Button size="sm" onClick={() => void copy(pose, snippet)}>
              <Icon name={copied ? "check" : "copy"} />
              {copied ? "Copied" : "Copy JSX"}
            </Button>
            <code className="basis-full font-mono text-xs text-pencil-text">{importLine("Mascot")}</code>
          </div>
          <CopyStatus message={message} />
        </div>
      </div>
    </div>
  )
}

interface PoseEntry extends ShelfEntry {
  text: string
}

const POSE_ENTRIES: readonly PoseEntry[] = POSES.map((id) => ({ id, family: "poses", tags: [], text: `${poseNote(id).does} ${poseNote(id).serves}` }))

export function PoseSheet({ selected, onPose }: { selected: string; onPose: (pose: string) => void }) {
  return (
    <ArtShelf<PoseEntry>
      slug="pose"
      noun="poses"
      entries={POSE_ENTRIES}
      families={[]}
      grouped={false}
      noFamilyFilter
      searchPlaceholder="Search poses: error, search, sleep, 404"
      tile={{ min: 128, height: 150, art: 88 }}
      renderArt={(e) => <Mascot pose={e.id} size={80} />}
      snippet={(e) => mascotSnippet(e.id)}
      template={mascotSnippet("name")}
      onPress={(e) => onPose(e.id)}
      selectedId={selected}
    />
  )
}

type Tier = "full" | "compact"
type Composer = (id: string, def: unknown, opts?: { tier?: Tier; sheet?: boolean }) => { svg: string; w: number; h: number }

const COMPOSER_PATHS = ["/src/lib/ink/art/scenes/compose.ts", "/tools/lookdev/scene-compose.ts"] as const
const composerModules = import.meta.glob<{ composeScene: Composer }>(["/src/lib/ink/art/scenes/compose.ts", "/tools/lookdev/scene-compose.ts"])
let composerPromise: Promise<Composer | null> | undefined

export function loadSceneComposer(): Promise<Composer | null> {
  composerPromise ??= (async () => {
    const path = COMPOSER_PATHS.find((p) => p in composerModules)
    if (!path) return null
    try {
      return (await composerModules[path]!()).composeScene
    } catch {
      return null
    }
  })()
  return composerPromise
}

type Status = { state: "waiting" } | { state: "ready"; compose: Composer } | { state: "missing" }

export function SceneFigure({ id, tier }: { id: string; tier: Tier }) {
  useEnsureInkDefs()
  const [ref, near] = useNearViewport<HTMLDivElement>("400px 0px")
  const [status, setStatus] = useState<Status>({ state: "waiting" })
  useEffect(() => {
    if (!near) return
    let live = true
    void loadSceneComposer().then((compose) => {
      if (!live) return
      setStatus(compose ? { state: "ready", compose } : { state: "missing" })
    })
    return () => {
      live = false
    }
  }, [near])
  const drawn = useMemo(() => {
    if (status.state !== "ready") return null
    try {
      return status.compose(id, (scenes as Record<string, unknown>)[id], { tier })
    } catch {
      return null
    }
  }, [status, id, tier])
  const w = tier === "full" ? 240 : 120
  const h = tier === "full" ? 180 : 90
  return (
    <div ref={ref} className="relative w-full" style={{ aspectRatio: `${w} / ${h}` }} data-scene={id} data-state={drawn ? "drawn" : status.state}>
      {drawn ? (
        <svg data-ink="illustration" aria-hidden="true" focusable="false" viewBox={`0 0 ${drawn.w} ${drawn.h}`} className="pointer-events-none block h-auto w-full overflow-visible" dangerouslySetInnerHTML={{ __html: drawn.svg }} />
      ) : status.state === "missing" ? (
        <p className="absolute inset-0 m-0 grid place-items-center text-center text-sm text-pencil-text">This build has no scene composer, so the drawing cannot be shown.</p>
      ) : null}
    </div>
  )
}

function SceneCard({ scene, tier, copied, onCopy }: { scene: SceneEntry; tier: Tier; copied: boolean; onCopy: (id: string, text: string) => void }) {
  const snippet = scene.pose ? emptySceneSnippet(scene.pose, scene.title) : ""
  return (
    <li className="min-w-0">
      <Paper stock="card" className="flex h-full flex-col gap-3 p-3">
        <SceneFigure id={scene.id} tier={tier} />
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="m-0 font-script text-2xl leading-tight text-ink">{scene.title}</h3>
          <p className="m-0 text-ink">{scene.use}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="outline">{scene.id}</Chip>
          {scene.pose ? <Chip tone="outline">pose: {scene.pose}</Chip> : null}
          {scene.pose ? (
            <Button variant="outline" size="xs" className="ms-auto" onClick={() => onCopy(scene.id, snippet)}>
              <Icon name={copied ? "check" : "copy"} />
              {copied ? "Copied" : "Copy Empty"}
            </Button>
          ) : null}
        </div>
      </Paper>
    </li>
  )
}

export function SceneShelf() {
  const [tier, setTier] = useState<Tier>("full")
  const { copied, message, copy } = useCopyStatus()
  const min = tier === "full" ? 280 : 200
  return (
    <div data-slot="scene-shelf">
      <CopyStatus message={message} />
      <div className="mb-4 flex flex-col gap-1.5">
        <ControlLabel>Tier</ControlLabel>
        <Choice
          label="Scene tier"
          value={tier}
          onChange={setTier}
          options={[
            { value: "full", label: "240 x 180", name: "full scene, 240 by 180" },
            { value: "compact", label: "120 x 90", name: "compact scene, 120 by 90" },
          ]}
        />
        <p className="text-[15px] text-muted-foreground m-0">The compact tier is laid out again around Stubby&apos;s 48 px drawing and one or two props: it is what a small Empty would use.</p>
      </div>
      <ul role="list" className="m-0 grid list-none gap-4 p-0" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))` }}>
        {SCENE_ENTRIES.map((s) => (
          <SceneCard key={s.id} scene={s} tier={tier} copied={copied === s.id} onCopy={(id, text) => void copy(id, text)} />
        ))}
      </ul>
    </div>
  )
}

export function StubbySection() {
  const [pose, setPose] = useState("idle")
  return (
    <>
      <MascotStudio pose={pose} onPose={setPose} />
      <AnchorHeading id="all-poses" level={3} className="mt-6">
        All {POSES.length} poses
      </AnchorHeading>
      <PoseSheet selected={pose} onPose={setPose} />
    </>
  )
}
