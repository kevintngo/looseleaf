import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "sonner",
  title: "Sonner",
  category: "Feedback",
  description:
    "Toasts as slips of paper tossed onto the desk. A guest check for success, a pink sticky for errors, yellow for warnings, blue for news; stacked, swipeable, with drawn icons, action buttons, promise toasts and tape or a pin to hold them down. Built on the sonner package: you keep its `toast()` API.",
  status: "stable",
  upstream: "sonner",
  parts: [
    {
      name: "Toaster",
      description:
        "Mount it once near the root of the app. It wraps sonner's Toaster in unstyled mode and gives each toast the paper look with classes on sonner's own elements, so stacking, swiping, timers, hover-to-expand and the aria-live region are all sonner's. Every sonner prop works (`position`, `expand`, `visibleToasts`, `duration`, `gap`, `offset`, `closeButton`, `dir`, `hotkey`, `toastOptions`, `icons`, `id` ...).",
      props: [
        { name: "decoration", type: '"none" | "tape" | "pin"', default: '"none"', description: "Hold every slip to the page with a strip of masking tape or a push-pin (drawn with CSS on the content box; hidden in calm density)." },
        { name: "portal", type: "boolean", default: "false", description: "Render the stack into `document.body`. The stack is `position: fixed`, so an ancestor with `container-type` (Tailwind's `@container`), `transform`, `filter` or `contain: layout` becomes its containing block and pins the toasts to that box instead of the window. Mount `<Toaster />` at the app root and you never need this; pass `portal` when it has to live inside such a wrapper. The stack appears after the first client render, and repeats the InkProvider's density, motion and theme." },
        { name: "theme", type: '"light" | "dark" | "system"', default: '"light"', description: "Passed to sonner. There is no next-themes here; Looseleaf themes come from CSS variables and the InkProvider, so the slips follow them without a prop." },
        { name: "icons", type: "ToastIcons", description: "Override the drawn icons: success (circle-check), info, warning (triangle-alert), error (octagon-x), loading (loader-circle, spinning), close." },
        { name: "toastOptions", type: "ToastOptions", description: "Sonner's options. `classNames` are merged with ours (yours come last); `unstyled` stays on." },
      ],
    },
    { name: "toast", description: "Sonner's `toast()` re-exported for convenience: `toast(...)`, `toast.success/error/warning/info/loading/message/custom`, `toast.promise`, `toast.dismiss`. Importing it from \"sonner\" directly works the same." },
    { name: "useSonner", description: "Sonner's hook that returns the list of active toasts." },
  ],
  a11y: [
    "Sonner renders a polite aria-live region (`aria-label=\"Notifications alt+T\"`); Alt+T focuses it so a keyboard user can reach the toasts, and hovering or focusing pauses the timers. Each type is its own icon shape and paper (guest check, pink, yellow, blue sticky), so color is never the only signal.",
    "Action and cancel are real buttons at least 24 px tall; the close button is named \"Close toast\". Keep toast text short and never put the only copy of an error in a toast that disappears: pair it with an inline message.",
    "Swipe to dismiss is a pointer shortcut only (sonner); every toast also closes with its close button, its action, its timer or `toast.dismiss()`.",
    "The toss-in uses the theme's `ll-toss` (`ll-drop` when the stack is not on the right) and collapses to nothing with reduced motion. In `calm` density the slips lose their tilt, tape and pin.",
    "Toasts are above dialogs and popovers on the z-scale and stay clickable while a modal is open.",
  ],
  usage: `// app/layout.tsx  (once)
import { Toaster } from "@/components/ui/sonner"

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}

import { toast } from "sonner"

toast.success("Notebook saved", { description: "All 48 pages are safe." })

toast.promise(saveNotebook(), {
  loading: "Saving notebook…",
  success: "Saved",
  error: "Could not save",
})`,
  related: ["alert", "dialog", "button", "popover"],
} satisfies ComponentDoc
