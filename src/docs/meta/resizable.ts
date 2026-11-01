import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "resizable",
  title: "Resizable",
  category: "Layout",
  description:
    "Panels you can drag apart. The seam between two panels is stitched by hand, gets a paper tab with a grip if you ask, darkens under the pointer and is pulled tight into one blue line while you drag. Built on react-resizable-panels 4: keyboard resizing, collapsible panels and persisted layouts included.",
  status: "stable",
  upstream: "resizable",
  parts: [
    {
      name: "ResizablePanelGroup",
      description:
        "react-resizable-panels' `Group`. Sizes are percentages (or px, rem, vh: `\"30%\"`, `240`, `\"20rem\"`). The group clips (`overflow: hidden`, which the library does not let you override except through `style.overflow`): pass `style={{ overflow: \"visible\" }}` if a panel draws beyond its edge. Coming from react-resizable-panels 2 (older shadcn code): `direction` is now `orientation`, `autoSaveId` is `useDefaultLayout`, and a number size is pixels, so `defaultSize={30}` becomes `defaultSize=\"30%\"`.",
      props: [
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Panels side by side (seams are vertical) or stacked (seams are horizontal)." },
        { name: "defaultLayout / onLayoutChanged", type: "Layout / (layout, meta) => void", description: "Remember a layout: keys are panel ids, values percentages. `useDefaultLayout({ id, storage })` returns both props for any storage with getItem / setItem." },
        { name: "groupRef", type: "Ref<GroupImperativeHandle>", description: "`getLayout()` and `setLayout()`; `useGroupRef()` makes one." },
        { name: "disabled", type: "boolean", default: "false", description: "No panel can be resized. Its handles stay focusable (as in the library) and are drawn as the faint disabled thread." },
      ],
    },
    {
      name: "ResizablePanel",
      description: "A panel. `className` goes to the panel's inner element (the library keeps its own flex style on the outer one).",
      props: [
        { name: "id", type: "string", description: "Identifies the panel in layouts; give one to every panel of a persisted group." },
        { name: "defaultSize / minSize / maxSize", type: "number | string", description: "Numbers are pixels; strings are percentages (\"30\", \"30%\") or units (\"20rem\")." },
        { name: "collapsible / collapsedSize / collapsedThreshold", type: "boolean / size / size", description: "A collapsible panel snaps shut when dragged below its minimum." },
        { name: "panelRef / onResize", type: "Ref<PanelImperativeHandle> / (size) => void", description: "`collapse()`, `expand()`, `resize(size)`, `getSize()`, `isCollapsed()`; `usePanelRef()` makes one." },
      ],
    },
    {
      name: "ResizableHandle",
      description:
        "The separator (`role=\"separator\"`, focusable). A row of 8 px: stitches, with a slip of paper carrying a grip glyph when `withHandle` is set. Its drawn layers follow the library's `data-separator` (`hover`, `active`) so the wider hit region works.",
      props: [
        { name: "withHandle", type: "boolean", default: "false", description: "Add the paper tab with a grip." },
        { name: "disabled", type: "boolean", default: "false", description: "Faint thread, no tab, not draggable." },
        { name: "seed", type: "string | number", description: "Pins the hand. Default: derived from useId()." },
      ],
    },
  ],
  a11y: [
    "The handle is a `role=\"separator\"` with `aria-orientation`, `aria-valuenow` / `aria-valuemin` / `aria-valuemax` and `aria-controls` (the primary panel), and is in the tab order. Give it an `aria-label` that says what it resizes.",
    "Arrow keys move it by 5%, Home and End jump to the limits, Enter collapses or restores a collapsible panel, all from react-resizable-panels. Dragging works with mouse, touch and pen; the hit area is larger than the drawing (at least 24 px for a mouse and 37 px for a finger; the group asks the library for that through `resizeTargetMinimumSize`, which you can override).",
    "ArrowLeft / ArrowRight shrink / grow the first panel whatever the reading direction (react-resizable-panels does not mirror them), so on a `dir=\"rtl\"` page the handle moves against the arrow. Up / Down are exact in a vertical group.",
    "The stitches, the tab and the blue line are aria-hidden decoration; the grip glyph is decorative too.",
    "Keyboard focus draws a blue ring round the middle of the seam (round the tab, when there is one). Windows high contrast draws a real outline round the handle.",
    "Hover, dragging and focus each show without hue: the stitches darken, the seam becomes one continuous line, the ring appears.",
  ],
  usage: `import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export function Example() {
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-64 max-w-md">
      <ResizablePanel defaultSize="50%">One</ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize" />
      <ResizablePanel defaultSize="50%">Two</ResizablePanel>
    </ResizablePanelGroup>
  )
}`,
  related: ["scroll-area", "card", "tabs", "sidebar"],
} satisfies ComponentDoc
