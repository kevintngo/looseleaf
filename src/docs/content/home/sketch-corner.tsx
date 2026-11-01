import { Sketchpad, SketchpadCanvas, SketchpadColors, SketchpadToolbar, SketchpadTools, SketchpadUndo } from "@/components/ui/sketchpad"
import { HOME_SKETCH } from "./strokes"

export default function SketchCorner() {
  return (
    <div data-home="sketch" className="grid w-full gap-2">
      <Sketchpad defaultValue={HOME_SKETCH} tools={["felt", "marker", "eraser"]} width={360} height={240} seed="home-sketch" className="w-full">
        <SketchpadToolbar>
          <SketchpadTools />
          <SketchpadColors colors={["ink", "ink-you", "red", "tangerine", "teal"]} />
          <SketchpadUndo className="ms-auto" />
        </SketchpadToolbar>
        <SketchpadCanvas paper="plain" label="Sketchpad: draw with a mouse, a finger or a pen" paperProps={{ tape: "corner", tilt: false }} />
      </Sketchpad>
      <p className="text-center font-script text-3xl leading-none text-ink">add to the drawing.</p>
    </div>
  )
}
