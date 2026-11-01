import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "calendar",
  title: "Calendar",
  category: "Forms",
  description:
    "A month on planner paper. The grid is ruled by hand, the day you chose is circled in marker, today is underlined in felt, a range is one highlighter swipe per week, and a day you may not pick is hatched out in pencil. react-day-picker v10 underneath: single, multiple and range selection, locales, right-to-left, week numbers, dropdown captions, several months.",
  status: "stable",
  upstream: "calendar",
  parts: [
    {
      name: "Calendar",
      description:
        "A react-day-picker `DayPicker`, so every prop of DayPicker works (`mode`, `selected`, `onSelect`, `required`, `disabled`, `hidden`, `modifiers`, `locale`, `dir`, `numberOfMonths`, `startMonth` / `endMonth`, `showWeekNumber`, `weekStartsOn`, `footer`, `timeZone`, ...). The root is transparent so it sits on the paper it is placed on (Card, Popover, Page); `sheet` gives it a sheet of its own.",
      props: [
        { name: "captionLayout", type: '"label" | "dropdown" | "dropdown-months" | "dropdown-years"', default: '"label"', description: "The month name in script, or native month / year selects drawn in pencil boxes. Dropdowns default to a hundred years back (set `startMonth` / `endMonth`)." },
        { name: "showOutsideDays", type: "boolean", default: "true", description: "Days of the neighboring months in the first and last week, in graphite." },
        { name: "buttonVariant", type: "ButtonProps['variant']", default: '"ghost"', description: "Variant of the previous / next month Buttons (real Buttons: hover swipe, press and drawn focus ring)." },
        { name: "ruled", type: "boolean", default: "true", description: "Hand-rule the grid (weekday rule, week rules, day rules, a red margin rule beside the week numbers). `false` leaves the page plain." },
        { name: "sheet", type: "boolean | PaperProps", default: "false", description: "Put the calendar on a sheet of paper. `true` is a card; an object passes `stock`, `edge`, `tilt`, `tape`, `tapeKind`, `fastener`, `fastenerTone`, `fastenerClassName`, `shadow` and `seed` to Paper. A paper clip is set between the next-month arrow and the caption (not on the arrow); `fastenerClassName` moves it." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always rules the same grid." },
        { name: "components", type: "Partial<CustomComponents>", description: "Swap any DayPicker part; yours are merged over ours." },
        { name: "classNames", type: "Partial<ClassNames>", description: "Same keys as upstream shadcn (`root`, `months`, `month`, `nav`, `month_caption`, `weekday`, `day`, `today`, `range_start`, ...); merged over the defaults." },
      ],
    },
    {
      name: "CalendarDayButton",
      description: "The button of one day, exported as upstream does so you can wrap it in `components.DayButton`. A plain `<button>` with no ink of its own: its marks are CSS masks keyed on `data-selected-single`, `data-range-start|end|middle` and `data-v` (the hand that draws them, from the date). Adds `aria-current=\"date\"` on today.",
    },
  ],
  a11y: [
    "The month is a `role=grid` table named by its caption, days are buttons with the full date as their name (\"Today, Thursday, September 17th, 2026, selected\"), and the selected cell has `aria-selected`. Today also carries `aria-current=\"date\"`. All of that is react-day-picker's.",
    "One day is the tab stop (roving tabindex). Arrow keys move by day and week, Home and End to the week edge, PageUp / PageDown by month, Shift with them by year, Enter and Space select. Right-to-left swaps the horizontal arrows.",
    "The previous / next buttons keep `aria-disabled` (not `disabled`) at the end of `startMonth` / `endMonth`, so focus is not lost when you reach the limit.",
    "Nothing depends on hue alone: the chosen day is circled and bold, a range is a swipe with bold ends, a disabled day is hatched (and unclickable), today is underlined, and focus is a drawn blue loop that bleeds past the cell. The month caption is a polite live region, so paging announces the new month.",
    "Touch: a day is 40 px by default, 34 px in compact density and 30 px in calm. In a space narrower than the month the days shrink but stay square, so the ruled lines always fall between them, and several months stack instead of squeezing side by side.",
    "Forced colors (Windows high contrast): the masks give way to real borders: a border round the chosen day, top and bottom borders on a range, an underline for today, a line-through for disabled days and a Highlight outline for focus.",
    "Reduced motion: month changes do not animate (`animate` is off by default).",
  ],
  usage: `import * as React from "react"
import { Calendar } from "@/components/ui/calendar"

export function Example() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  return <Calendar mode="single" selected={date} onSelect={setDate} sheet />
}`,
  related: ["date-picker", "popover", "card", "button"],
} satisfies ComponentDoc
