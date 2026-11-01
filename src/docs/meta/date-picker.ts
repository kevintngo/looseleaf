import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "date-picker",
  title: "Date Picker",
  category: "Forms",
  description:
    "A date field with a calendar on a slip. Type a date (Sep 17, 2026, 9/17/26, 2026-09-17, tomorrow) or open the calendar and circle one; presets sit in a column beside it; the range version takes two months and closes when you have chosen both ends. Popover + Calendar + Button + Input, composed.",
  status: "new",
  parts: [
    {
      name: "DatePicker",
      description:
        "One date. The field is the Select trigger's pencil box around a text input and a ghost calendar Button. Typing is read on Enter or when you leave the field (an unreadable date turns the box red until the next edit); ArrowDown opens the calendar. Works uncontrolled (`defaultValue`) and controlled (`value` + `onValueChange`; `value={undefined}` is a controlled, empty field; an Invalid Date counts as empty). Enter (or a second click) on the day that is already chosen confirms it and puts the slip away; only a field with `typeable={false}` clears it that way, having no other way to. Also exported: `parseDateInput(text, { format, locale, reference })` (a two-digit year is read within 50 years of `reference`, or as 1950 to 2049 without one) and `toIsoDate`.",
      props: [
        { name: "value", type: "Date | undefined", description: "The chosen day (controlled)." },
        { name: "defaultValue", type: "Date", description: "The chosen day (uncontrolled)." },
        { name: "onValueChange", type: "(date: Date | undefined) => void", description: "Called when a day is typed, chosen or cleared." },
        { name: "typeable", type: "boolean", default: "true", description: "`false` makes the whole field a button that shows the date (like a Select), for when free typing is not wanted." },
        { name: "format", type: "string", default: '"PP"', description: "A date-fns format string used to show the date and, first, to read typed text. Other common forms (locale short / long, ISO, US, day-month-year with names) are tried after it." },
        { name: "locale", type: "date-fns Locale", description: "Names and patterns for showing and reading dates; passed on to the Calendar. date-fns cannot always read back what it wrote (a few locales' long and medium forms, e.g. Arabic \"PP\", Georgian, Kazakh): the shown text is never re-read unless it was edited, but pick a `format` such as `d MMM yyyy` if your users retype month names. Digits are Latin when typing (Eastern Arabic numerals are shown by the Calendar's `numerals` only)." },
        { name: "min / max", type: "Date", description: "Earliest / latest allowed day. Earlier and later days are hatched out in the calendar and refused when typed." },
        { name: "disabledDates", type: "Matcher | Matcher[]", description: "More days that cannot be chosen (any react-day-picker matcher: `{ dayOfWeek: [0, 6] }`, `{ before: date }`, a function...)." },
        { name: "presets", type: "{ label: string; value: Date | (() => Date) }[]", description: "A column of shortcuts beside the calendar. A function is called when the preset is chosen, so 'in a week' is computed then." },
        { name: "closeOnSelect", type: "boolean", default: "true", description: "Put the calendar away when a day is chosen." },
        { name: "name", type: "string", description: "Adds a hidden input with the day as `yyyy-MM-dd` for forms. A form reset (`<button type=\"reset\">`) puts an uncontrolled picker back to its `defaultValue`, like a native input (a controlled one is yours to reset)." },
        { name: "invalid", type: "boolean", description: "The red pencil box with a bang (also set by itself when the typed text cannot be read, until the next edit or a day chosen in the calendar)." },
        { name: "invalidMessage", type: "string", default: '"Enter a date we can read."', description: "What the browser says when a form is submitted with typed text that cannot be read (that text blocks the form through custom validity, so a click on Submit cannot send an empty date next to text that looks fine). Translate it." },
        { name: "disabled / readOnly / required / id / placeholder", type: "", description: "As on an input. The label points at `id` (the text input, or the button when `typeable={false}`)." },
        { name: "open / defaultOpen / onOpenChange", type: "", description: "Control the calendar slip." },
        { name: "calendarProps", type: "Partial<CalendarProps>", description: "Passed to the Calendar: `captionLayout`, `showWeekNumber`, `weekStartsOn`, `numberOfMonths`, `today`, `footer`..." },
        { name: "contentProps", type: "Partial<PopoverContentProps>", description: "Passed to the PopoverContent: `align`, `side`, `pin`, `tape`, `stock`, `className`..." },
        { name: "calendarLabel", type: "string", default: '"Choose date"', description: "Accessible name of the calendar button and of the dialog (translate it)." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same field." },
      ],
    },
    {
      name: "DateRangePicker",
      description:
        "Two dates in one field: \"Sep 9, 2026 – Sep 24, 2026\". Type both ends with a dash or 'to' between them (they are put in order), or open the two-month calendar: the first click starts the range, the second ends it and puts the slip away. Same props as DatePicker, with a `DateRange` value.",
      props: [
        { name: "value / defaultValue / onValueChange", type: "DateRange | undefined", description: "`{ from, to }`. A single typed date is `{ from, to: undefined }`." },
        { name: "presets", type: "{ label: string; value: DateRange | (() => DateRange) }[]", description: "Shortcuts: 'Last 7 days', 'This month'..." },
        { name: "name / nameTo", type: "string", description: "Hidden inputs for the first and the last day (`yyyy-MM-dd`)." },
      ],
    },
    { name: "DatePickerPresets", description: "The column of shortcut Buttons, exported so you can lay a custom calendar slip out yourself. Props: `presets`, `onPick`, `label` (its accessible name)." },
  ],
  a11y: [
    "The typed field is a plain text input (give it a Label or `aria-label`); the calendar button has its own name (\"Choose date\") and `aria-expanded`, and the slip is a named dialog holding the Calendar, whose keyboard model is react-day-picker's (arrows, Home/End, PageUp/PageDown, Enter/Space).",
    "ArrowDown in the field opens the calendar; Escape closes it and puts focus back on the button; with unsent text Escape drops it. Enter or leaving the field reads what you typed. Pressing Enter on a date that cannot be read does not submit the form it sits in.",
    "An unreadable or disallowed date sets `aria-invalid` (and draws the red box) until the next edit, so the error is not only in colour: the box is also dashed-red with a bang.",
    "With `typeable={false}` the field is one button (`aria-haspopup=\"dialog\"`, `aria-expanded`) whose text is the date or the placeholder.",
    "A single frame draws the focus ring for whichever part has focus (input or calendar button). The slip repeats the InkProvider's density, motion and theme and sits above dialogs, so a DatePicker inside a Dialog works.",
    "Presets are Buttons in a labelled group; ranges are announced by the Calendar's day names (\"selected\").",
  ],
  usage: `import * as React from "react"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"

export function Example() {
  const [date, setDate] = React.useState<Date | undefined>()
  return (
    <div className="grid w-64 gap-2">
      <Label htmlFor="due">Due date</Label>
      <DatePicker id="due" value={date} onValueChange={setDate} />
    </div>
  )
}`,
  related: ["calendar", "popover", "input", "select", "button"],
} satisfies ComponentDoc
