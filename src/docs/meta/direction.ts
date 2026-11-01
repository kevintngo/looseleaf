import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "direction",
  title: "Direction",
  category: "Layout",
  description:
    "Tells every Radix part, every drawing and every logical property which way the page reads. One provider at the root of a right-to-left page (or on an island inside a left-to-right one) turns arrow keys, sub-menus, slider edges, tab shoulders and hand-drawn strokes round together.",
  status: "stable",
  upstream: "direction",
  parts: [
    {
      name: "DirectionProvider",
      description:
        "Sets the direction for Radix, the ink engine and the DOM. It renders a layout-neutral wrapper (`display: contents`) that carries `dir`; portalled content (popovers, dialogs, sheets, tooltips, menus) leaves the wrapper, so it is handed the direction through the ink scope and carries `dir` itself.",
      props: [
        { name: "direction", type: '"ltr" | "rtl"', description: "The reading direction. Leave it out to follow the page: the nearest `dir` above the provider, else `<html dir>`, read after mount and whenever it changes (the first render is `ltr` on the server and in hydration)." },
        { name: "dir", type: '"ltr" | "rtl"', description: "Upstream shadcn's prop name for `direction`. `direction` wins when both are given." },
        { name: "asChild", type: "boolean", default: "false", description: "Put `dir` on your own single child (a `main`, a `section`) instead of the wrapper element." },
        { name: "className", type: "string", default: '"contents"', description: "The wrapper is `contents`; give it a display utility (`grid`, `flex`) to make it a real box." },
      ],
    },
    {
      name: "useDirection",
      description: "`useDirection(localDir?)` returns the direction of the nearest provider, `\"ltr\"` without one. It is Radix's own hook, so it stays in step with the keys and thumbs of every Radix part. A `localDir` wins, the way a `dir` prop does on a Radix root.",
      props: [{ name: "localDir", type: '"ltr" | "rtl"', description: "A direction that overrides the context, typically a prop of your own component." }],
    },
  ],
  a11y: [
    "Radix reads its direction from this provider only, never from the `dir` attribute. Without it, Tabs, Menubar, Radio Group, Toggle Group, Navigation Menu and the menus keep their left-to-right arrow keys on a right-to-left page, a Scroll Area keeps its scrollbar on the wrong side and a Slider starts at the wrong edge. With it, ArrowLeft moves to the next tab, opens a sub-menu towards the left, and so on.",
    "The wrapper carries `dir`, so the browser lays out bidirectional text, punctuation and inline order correctly; `lang` is yours to set on the wrapper or the page (`<DirectionProvider direction=\"rtl\" lang=\"ar\">`) so screen readers pick the right voice.",
    "Direction glyphs (chevrons, arrows, panel, log-in and log-out, undo and redo, send, list and menu icons) flip themselves in a right-to-left context; icons that do not depend on reading order (check, plus, clock, media controls) stay as drawn.",
    "The drawn layer is aria-hidden and decorative; mirroring it never changes what a screen reader announces.",
    "Two engines behind Looseleaf parts take the direction as an option of their own and do not read the provider yet: give a Carousel `opts={{ direction: \"rtl\" }}` (Embla) and a Calendar `dir=\"rtl\"` (react-day-picker); a Sonner Toaster follows `<html dir>` or takes its own `dir`. The Direction examples do it.",
    "Kevin Sans covers Latin only. Arabic and Hebrew text falls back to the system font for each missing glyph, which is correct and readable but not hand-lettered; ship an Arabic or Hebrew face in `--font-hand` for a matching look.",
  ],
  usage: `import { DirectionProvider, useDirection } from "@/components/ui/direction"

export function Root({ children }: { children: React.ReactNode }) {
  return <DirectionProvider direction="rtl">{children}</DirectionProvider>
}

function useForwardKey() {
  const dir = useDirection()
  return dir === "rtl" ? "ArrowLeft" : "ArrowRight"
}`,
  related: ["tabs", "dropdown-menu", "slider", "carousel", "sidebar", "table", "icon"],
} satisfies ComponentDoc
