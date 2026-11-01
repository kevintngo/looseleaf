import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "skeleton",
  title: "Skeleton",
  category: "Feedback",
  description:
    "A placeholder someone sketched in pencil: a pale hatch inside a rough ruled outline that boils gently between three redrawn frames. It costs no ink per instance, so a page of hundreds is as cheap as one.",
  status: "stable",
  upstream: "skeleton",
  parts: [
    {
      name: "Skeleton",
      description:
        "An empty div. Shape it with classes exactly as with shadcn's (h-4 w-[250px], size-12 rounded-full). The pencil is CSS: the hatch and the outline are masks made from a few tiny drawn tiles, defined once per page in one hoisted stylesheet; three redrawn frames of each are stepped through slowly. A rounded-full box gets a drawn circle.",
      props: [
        {
          name: "className",
          type: "string",
          description: "Its size and shape: any width and height, rounded-full for a circle. Colours are the theme's pencil and paper tokens.",
        },
        {
          name: "seed",
          type: "string | number",
          description: "Picks the phase of the boil this skeleton starts on, so a page of them does not flicker in unison. Default: derived from useId().",
        },
      ],
    },
  ],
  a11y: [
    'A skeleton is an empty element, invisible to assistive tech, as shadcn\'s. Mark the region that is loading with aria-busy="true" (and a status or a visually hidden "Loading" for screen readers), and remove the skeletons when the content arrives.',
    "Nothing in it is interactive or focusable; the boil is decoration, and a page of skeletons never announces anything.",
    "Reduced motion (the OS setting or the in-app calm-ink setting) and calm density hold the first frame still.",
    "In Windows high contrast the drawing is replaced by a dashed system-colour outline.",
    "The masks need CSS mask-image (every current browser); the stylesheet is injected with <style href precedence>, so React 19 hoists it, dedupes it and includes it in server HTML.",
  ],
  usage: `import { Skeleton } from "@/components/ui/skeleton"

export function Example() {
  return (
    <div className="flex items-center gap-4" aria-busy="true">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}`,
  related: ["spinner", "card", "progress", "item"],
} satisfies ComponentDoc
