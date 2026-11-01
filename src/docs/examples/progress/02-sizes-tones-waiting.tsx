import { Progress } from "@/components/ui/progress"

export const meta = {
  title: "Sizes, tones and waiting",
  description: "sm, default and lg; marker, highlighter, grass and sky inks. Without a value the bar is indeterminate: a marker scribble slides across (it holds still, mid-bar, with reduced motion).",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <Progress value={45} size="sm" aria-label="Small" />
      <Progress value={45} aria-label="Default" />
      <Progress value={45} size="lg" aria-label="Large" />
      <Progress value={70} tone="hi" aria-label="Highlighter" />
      <Progress value={70} tone="green" aria-label="Grass" />
      <Progress value={70} tone="blue" aria-label="Sky" />
      <Progress aria-label="Waiting" />
    </div>
  )
}
