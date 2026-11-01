import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "Ruled notes",
  description: "Printed rules are part of the sheet, so they turn with it and the text stays upright. Set the line height to the rule pitch (28 px) and start the first line 16 px down (p-4) and the words sit on the lines, baseline 2 to 3 px above the rule. Each rule is printed 8 px above the bottom of its line; --ll-rule-offset tunes that.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <Paper stock="paper" rules="ruled" seed="notes" className="mx-auto w-full max-w-md px-4 pt-4 pb-6 pl-14" style={{ minHeight: 236 }}>
      <h3 className="relative top-[calc(3px-var(--ll-rule-offset,8px))] font-script text-[1.7rem] leading-[28px] font-bold">Field notes</h3>
      <p className="text-[15px] leading-[28px]">
        Tuesday. Rain on the window, three cups of tea, and one very small plan for a very big week.
      </p>
    </Paper>
  )
}
