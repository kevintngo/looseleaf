import { Button } from "@/components/ui/button"

export const meta = {
  title: "States",
  description:
    "Rest, hover, pressed, keyboard focus and disabled, forced with data attributes (data-hover, data-pressed, data-focus-visible) so they can be compared side by side. Hover any button yourself: the drawing tilts and lifts a shadow line.",
  layout: "center" as const,
}

const variants = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const

export default function Example() {
  return (
    <div className="grid grid-cols-[repeat(5,auto)] items-center justify-start gap-x-5 gap-y-5">
      {["rest", "hover", "pressed", "focus", "disabled"].map((state) => (
        <span key={state} className="font-script text-lg text-ink-you">
          {state}
        </span>
      ))}
      {variants.map((variant) => (
        <div key={variant} className="contents">
          <Button variant={variant}>{variant}</Button>
          <Button variant={variant} data-hover>
            {variant}
          </Button>
          <Button variant={variant} data-pressed>
            {variant}
          </Button>
          <Button variant={variant} data-focus-visible>
            {variant}
          </Button>
          <Button variant={variant} disabled>
            {variant}
          </Button>
        </div>
      ))}
    </div>
  )
}
