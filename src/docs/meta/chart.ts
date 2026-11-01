import type { ComponentDoc, PropDoc } from "@/docs/types"

const standalone: PropDoc = { name: "config / tooltip / legend / className", type: "ChartConfig / boolean / boolean | 'top' | 'bottom' / string", description: "Only when used on its own, without a ChartContainer: it wraps itself in one. Inside a container, className sizes the drawing." }
const xyProps: PropDoc[] = [
  { name: "data", type: "Record<string, unknown>[]", required: true, description: "One row per category (per point for a scatter). Very long data is thinned (bars are averaged into at most 240 bins, fewer with several series so a chart never draws more than 480 bars; lines keep 1,500 points chosen to keep their shape) and the summary says so." },
  { name: "xKey", type: "string", description: "The category key (a scatter's x number). Default: the first key whose value is text." },
  { name: "series", type: "string[]", description: "Keys to draw, in stacking order. Default: the numeric keys named in the container's config, else the numeric keys of the data." },
  { name: "kinds", type: 'Record<string, "bar" | "line" | "area" | "scatter">', description: 'Mix marks: `{ revenue: "bar", target: "line" }`.' },
  { name: "stacked", type: "boolean", default: "false", description: "Stack bars (or areas). Positive values stack up from zero, negative ones down." },
  { name: "curve", type: '"smooth" | "linear" | "step"', default: '"smooth"', description: "How lines and areas join their points. Smooth is monotone: it never overshoots a peak." },
  { name: "yDomain", type: '[number | "auto", number | "auto"]', description: "Pin the value axis. `auto` picks a tidy end (0, 50, 100...). Bars and areas always include zero unless `zero` is false." },
  { name: "zero", type: "boolean", description: "Whether the value axis includes zero. Default: yes for bars and areas, no for lines." },
  { name: "xFormatter", type: "(value: unknown, index: number) => string", description: "Text of a category on the axis (\"January\" to \"Jan\"). The tooltip and the table keep the full value." },
  { name: "yFormatter", type: "(value: number) => string", description: "Text of an axis tick. Default: compact numbers (1.2k, 3.4M)." },
  { name: "valueFormatter", type: "(value: number) => string", description: "Text of the numbers on bars, in the tooltip, the summary and the table. Default: 1,234." },
  { name: "dots", type: 'boolean | "auto"', default: '"auto"', description: "Point markers on lines: drawn when there are few points and room for them. Each series has its own marker shape." },
  { name: "showValues", type: 'boolean | "auto"', default: '"auto"', description: "Numbers on top of bars: drawn when they fit (wide enough, not stacked)." },
  { name: "showGrid", type: "boolean", default: "true", description: "Broken pencil rules across the plot." },
  { name: "showXAxis / showYAxis", type: "boolean", default: "true", description: "Axis labels (the baseline is always drawn)." },
  { name: "annotations", type: "ChartAnnotation[]", description: "Hand-circled call-outs: `{ at, series?, text, pen?, shape?, dx?, dy? }`. `at` is max, min, first, last, a category label or an index. `pen`: red, blue, ink, green. `shape`: loop, underline, none." },
  { name: "references", type: "ChartReference[]", description: "Dashed goal lines: `{ y, label?, pen? }` (a scatter also takes `{ x }`)." },
  { name: "highlights", type: "ChartHighlight[]", description: "A stretch of categories marked with a highlighter: `{ from, to, text? }` (labels or indices). It is part of the spoken summary." },
  { name: "label", type: "string", description: "The chart's accessible name and the start of its summary." },
  { name: "description", type: "string", description: "One more sentence for the spoken summary." },
  { name: "xLabel", type: "string", description: "Name of the category column in the data table." },
  { name: "loading", type: "boolean", description: "Ghost bars pulse, the chart is aria-busy and not interactive." },
  { name: "emptyText", type: "string", description: "Text shown when there is nothing to draw." },
  { name: "animate", type: "boolean", default: "true", description: "Wipe the chart on once when it first appears. Reduced motion skips it; a redraw with new data never replays it." },
  { name: "seed", type: "string | number", description: "Pins the hand." },
  { name: "accessibilityLayer", type: "boolean", description: "Accepted so shadcn's markup keeps working; the keyboard cursor, live region and data table are always on." },
  { name: "onActiveChange", type: "(info: { index: number; series: number | null } | null) => void", description: "The data point under the pointer or the keys changed." },
  { name: "onSelect", type: "(info: { index: number; series: number | null }) => void", description: "A click, Enter or Space on a data point (drill down, filter)." },
  standalone,
]

const common: PropDoc[] = [
  { name: "label", type: "string", description: "The accessible name and the start of the spoken summary." },
  { name: "description", type: "string", description: "One more sentence for the summary." },
  { name: "loading", type: "boolean", description: "Ghost drawing, aria-busy, not interactive." },
  { name: "emptyText", type: "string", description: "Text shown when there is nothing to draw." },
  { name: "animate", type: "boolean", default: "true", description: "Wipe on once when it first appears." },
  { name: "seed", type: "string | number", description: "Pins the hand." },
  { name: "onActiveChange", type: "(info: { index: number; series: number | null } | null) => void", description: "The data point under the pointer or the keys changed." },
  { name: "onSelect", type: "(info: { index: number; series: number | null }) => void", description: "A click, Enter or Space on a data point." },
  standalone,
]

export default {
  slug: "chart",
  title: "Chart",
  category: "Charts",
  description:
    "Charts drawn by hand: bars coloured in with a marker, felt lines, pencil-shaded areas, pies, radars, dials, sparklines, tally marks and calendar heat maps. Real text on a real DOM, a keyboard cursor, a tooltip on a slip of paper, a legend that switches series off, a table for screen readers, and a pencil pattern on every series so colour is never the only channel.",
  status: "new",
  upstream: "chart",
  parts: [
    {
      name: "ChartContainer",
      description:
        "The frame around a chart and its legend and tooltip. Same job as shadcn's: it owns the config and puts the series colours on the frame as `--color-<key>` (a `theme` gives a light and a dark value). It also owns which series are switched off. The drawing is not recharts: every chart component in this file draws itself with the ink engine.",
      props: [
        { name: "config", type: "ChartConfig", required: true, description: "`{ desktop: { label: 'Desktop', color: 'var(--chart-1)' } }`. A key's position is its palette slot (`--chart-1` is the marker orange, then blue felt, green pencil, deep highlighter, grape). Add `pattern`, `marker` and `dash` to override the look a series gets." },
        { name: "patterns", type: 'boolean | "auto"', default: '"auto"', description: "Pencil patterns on filled marks and dashes on lines when there is more than one series (`true`: always, `false`: colour only)." },
        { name: "hiddenSeries", type: "string[]", description: "Series (or slices) switched off, controlled. The legend buttons toggle them." },
        { name: "defaultHiddenSeries", type: "string[]", description: "Uncontrolled start value." },
        { name: "onHiddenSeriesChange", type: "(hidden: string[]) => void", description: "A legend button was pressed." },
        { name: "initialDimension", type: "{ width: number; height: number }", description: "Draw at this size on the server and before the first measure, so the chart is part of the server HTML." },
        { name: "className", type: "string", description: "Sizes the frame: `aspect-auto h-64 w-full`. It is `aspect-video` by default, like shadcn's. A chart takes its size from the frame, so give it a height or a ratio: `aspect-auto` with no height is 0 px tall." },
      ],
    },
    {
      name: "ChartStyle",
      description: "The `<style>` that carries `--color-<key>` for each config entry (light and `.dark`). ChartContainer renders it for you.",
      props: [
        { name: "id", type: "string", required: true, description: "The container's `data-chart` value." },
        { name: "config", type: "ChartConfig", required: true, description: "The config to write out." },
      ],
    },
    {
      name: "ChartTooltip",
      description: "Switches the tooltip on. It renders nothing itself: the chart draws the tooltip inside its own box, where the point is, and keeps it in view. Hover, touch and the arrow keys all move it.",
      props: [
        { name: "content", type: "ReactElement", default: "<ChartTooltipContent />", description: "Cloned with `active`, `payload` and `label`. Any component that takes those works." },
        { name: "defaultIndex", type: "number", description: "Show this data point when nothing is hovered or focused." },
        { name: "cursor", type: "boolean", default: "true", description: "Kept for shadcn parity. The highlighter behind a column and the ring on a point are part of the drawing." },
      ],
    },
    {
      name: "ChartTooltipContent",
      description: "The slip of paper: a label in the script font and one row per series with a swatch that matches the drawing (colour, pattern, marker). Same props as shadcn's; the payload is recharts-shaped so an existing `formatter` keeps working.",
      props: [
        { name: "indicator", type: '"dot" | "line" | "dashed"', default: '"dot"', description: "The swatch: a chip (a line swatch for line series), a narrow bar, or a dashed rule." },
        { name: "hideLabel", type: "boolean", default: "false", description: "Leave out the label." },
        { name: "hideIndicator", type: "boolean", default: "false", description: "Leave out the swatches." },
        { name: "labelFormatter", type: "(label: ReactNode, payload: ChartTooltipItem[]) => ReactNode", description: "Change the label." },
        { name: "formatter", type: "(value, name, item, index, payload) => ReactNode", description: "Replace a whole row." },
        { name: "nameKey / labelKey", type: "string", description: "Which payload key names a row / the label in the config." },
        { name: "color", type: "string", description: "Force the indicator colour." },
        { name: "className / labelClassName", type: "string", description: "Merged onto the slip / the label." },
      ],
    },
    {
      name: "ChartLegend",
      description: "The key of the chart in this container. Place it before (`verticalAlign=\"top\"`) or after the chart. It shows the series the chart registered, with the very swatches the drawing uses.",
      props: [
        { name: "content", type: "ReactElement", default: "<ChartLegendContent />", description: "Custom legend markup." },
        { name: "verticalAlign", type: '"top" | "bottom"', default: '"bottom"', description: "Which side gets the padding." },
        { name: "keys", type: "string[]", description: "Only these entries, in this order." },
        { name: "toggle", type: "boolean", default: "true", description: "Entries are buttons (aria-pressed) that switch a series off and on. `false` makes a plain key." },
      ],
    },
    {
      name: "ChartLegendContent",
      description: "The default legend body; same props as ChartLegend without `content`. `hideIcon` drops the config icon or swatch.",
      props: [{ name: "hideIcon", type: "boolean", default: "false", description: "Leave out the swatch / icon." }],
    },
    {
      name: "ChartSwatch",
      description: "The little chip of a legend or tooltip row: the series' marker fill, its pencil pattern, in a tiny felt box (`line` draws a line sample with its marker and dash).",
      props: [
        { name: "palette", type: "number", required: true, description: "The series' slot (its position in the config)." },
        { name: "pattern", type: '"solid" | "hatch" | "dots" | "cross" | "lines" | "scribble"', default: '"solid"', description: "The pencil pattern." },
        { name: "marker", type: "MarkerShape", description: "Line swatches: the marker on the sample." },
        { name: "line", type: "boolean", description: "A line sample instead of a filled chip." },
      ],
    },
    {
      name: "ChartCenterLabel",
      description: "The words in the hole of a donut or radial chart: a big number in the script font and a small caption. `centerLabel` takes one, a node, or a function of the total and the slice under the cursor.",
      props: [
        { name: "value", type: "ReactNode", required: true, description: "The big text." },
        { name: "label", type: "ReactNode", description: "The caption." },
      ],
    },
    {
      name: "BarChart",
      description: "Bars: single, grouped, stacked or sideways, with negative values hanging below the line. Bars are filled edge to edge in solid colour, with a steady felt outline rounded at the far end. The highest bar can be circled by hand.",
      props: [
        { name: "horizontal", type: "boolean", default: "false", description: "Bars run sideways, categories down the left (ignored when a series is not a bar)." },
        { name: "layout", type: '"horizontal" | "vertical"', description: 'recharts\' name for the same thing: "vertical" runs the bars sideways.' },
        ...xyProps,
      ],
    },
    { name: "LineChart", description: "A felt line per series, with a marker shape and a dash pattern each so lines survive greyscale. Gaps in the data break the line. Long series keep their peaks and dips.", props: xyProps },
    { name: "AreaChart", description: "Lines with the space under them washed in the series colour and shaded in pencil. Stack them with `stacked`.", props: xyProps },
    { name: "ScatterChart", description: "Points on two number lines, one marker shape per series; a `sizeKey` turns them into bubbles. Up to 600 points are drawn; the tooltip finds the nearest point.", props: [{ name: "sizeKey", type: "string", description: "The data key that sizes each point." }, ...xyProps] },
    {
      name: "PieChart",
      description: "Slices coloured in with a marker, outlined in felt, each with its own pencil pattern and a percentage round the outside. Arrow keys walk the slices; the legend switches them off.",
      props: [
        { name: "data", type: "Record<string, unknown>[]", required: true, description: "One row per slice." },
        { name: "nameKey", type: "string", description: "The key that names a slice and finds its config entry. Default: the first key with text." },
        { name: "valueKey", type: "string", description: "The key with the amount. Default: the first numeric key." },
        { name: "innerRadius", type: "number", default: "0", description: "Fraction of the radius that is hole (0 to 0.9)." },
        { name: "startAngle", type: "number", default: "0", description: "Degrees clockwise from twelve o'clock." },
        { name: "showLabels", type: "boolean", default: "true", description: "Percentages round the outside." },
        { name: "centerLabel", type: "ReactNode | { value, label } | (info: { total, active }) => ReactNode", description: "Text in the hole." },
        { name: "valueFormatter", type: "(value: number) => string", description: "Number text." },
        ...common,
      ],
    },
    { name: "DonutChart", description: "A PieChart with a hole (`innerRadius` 0.58) for a number in the middle.", props: [{ name: "innerRadius", type: "number", default: "0.58", description: "Fraction of the radius that is hole." }, { name: "centerLabel", type: "ReactNode | { value, label } | function", description: "Text in the hole." }, ...common] },
    {
      name: "RadarChart",
      description: "A pencil web with a washed and shaded shape per series. The spokes are the keyboard stops.",
      props: [
        { name: "data", type: "Record<string, unknown>[]", required: true, description: "One row per axis." },
        { name: "xKey", type: "string", description: "The key that names an axis." },
        { name: "series", type: "string[]", description: "Keys to draw." },
        { name: "max", type: "number", description: "The value at the rim. Default: a tidy number above the largest value." },
        { name: "levels", type: "number", default: "4", description: "Rings of the web." },
        { name: "fill", type: "boolean", default: "true", description: "Shade the shapes." },
        { name: "dots", type: "boolean", default: "true", description: "A marker on each vertex." },
        ...common,
      ],
    },
    {
      name: "RadialChart",
      description: "Concentric arcs in pale tracks: one ring per row, filled to its value. Ring names sit in the open quadrant.",
      props: [
        { name: "data", type: "Record<string, unknown>[]", required: true, description: "One row per ring; a row's own `max` overrides `max`." },
        { name: "nameKey / valueKey", type: "string", description: "Which keys name and size a ring." },
        { name: "max", type: "number", default: "100", description: "The value that fills a ring." },
        { name: "startAngle / endAngle", type: "number", default: "0 / 270", description: "Degrees clockwise from twelve o'clock." },
        { name: "centerLabel", type: "ReactNode | { value, label }", description: "Text in the hole." },
        ...common,
      ],
    },
    {
      name: "Gauge",
      description: "A dial: marker zones (each with a pencil pattern) and a red felt needle, or a single coloured arc. `role=\"meter\"` with a value, a minimum, a maximum and a text, so assistive tech reads it. The children are the text under the pivot.",
      props: [
        { name: "value", type: "number", required: true, description: "The reading; clamped to min and max." },
        { name: "min / max", type: "number", default: "0 / 100", description: "The ends of the dial." },
        { name: "zones", type: "{ to: number; tone?: 'good' | 'warn' | 'bad' | 'info' | 'brand' | number }[]", description: "Coloured stretches from the minimum up." },
        { name: "sweep", type: "number", default: "180", description: "Degrees the dial covers (180 is a half circle)." },
        { name: "ticks", type: "number", default: "10", description: "Pencil ticks round the outside." },
        { name: "valueFormatter", type: "(value: number) => string", description: "Number text." },
        { name: "label", type: "string", description: "The accessible name." },
        { name: "children", type: "ReactNode", description: "Text under the pivot. Default: the value." },
        standalone,
      ],
    },
    {
      name: "Sparkline",
      description: "One felt pull and a red dot at the end, a shaded area, or a row of marker bars, at 112 x 40 px unless you size it. A picture with a spoken summary; `interactive` makes it a chart with a cursor and a tooltip.",
      props: [
        { name: "data", type: "(number | null)[] | Record<string, unknown>[]", required: true, description: "Numbers, or rows with `dataKey`." },
        { name: "dataKey / xKey", type: "string", description: "For rows: the value and the category key." },
        { name: "variant", type: '"line" | "area" | "bar"', default: '"line"', description: "How it is drawn." },
        { name: "slot / series", type: "number / string", description: "Palette slot, or the config key whose colour to use." },
        { name: "ends", type: "boolean", default: "true", description: "A red dot on the last point." },
        { name: "extremes", type: "boolean", default: "false", description: "Small marks on the lowest and highest points." },
        { name: "interactive", type: "boolean", default: "false", description: "Hover and arrow keys show a tooltip." },
        { name: "label", type: "string", description: "The accessible name." },
        standalone,
      ],
    },
    {
      name: "TallyChart",
      description: "Counts as hand-tallied marks: four uprights and a slash across for every five, in the colour of the row. When a row is too long for the width each mark stands for more, and the chart says so.",
      props: [
        { name: "data", type: "Record<string, unknown>[]", required: true, description: "One row per line of the board." },
        { name: "nameKey / valueKey", type: "string", description: "Which keys name and count a row." },
        { name: "unit", type: "number", default: "auto", description: "What one mark stands for." },
        ...common,
      ],
    },
    {
      name: "Heatmap",
      description: "Squares coloured in shades of one marker: a calendar (weeks across, weekdays down, month names on top) or a grid of your own rows and columns. Arrow keys move over the cells: left and right by week, up and down by day.",
      props: [
        { name: "data", type: "Record<string, unknown>[]", required: true, description: "Calendar: rows with a date and a value. Grid: rows with a row name, a column name and a value." },
        { name: "variant", type: '"calendar" | "grid"', default: '"calendar"', description: "The layout." },
        { name: "dateKey / valueKey", type: "string", default: '"date" / "value"', description: "Calendar keys. Dates are `YYYY-MM-DD` or Date, read in UTC." },
        { name: "weeks / end / weekStart", type: "number / string | Date / 0 | 1", description: "Weeks shown, the last day, and whether weeks start on Sunday (0) or Monday (1)." },
        { name: "rowKey / colKey / rows / cols", type: "string / string[]", description: "Grid keys and the order of rows and columns." },
        { name: "levels / thresholds", type: "number / number[]", default: "5", description: "Shades, and optionally the value at which each starts." },
        { name: "slot / series", type: "number / string", description: "Palette slot, or the config key whose colour to use. Default the green pencil." },
        { name: "unit", type: "string", description: "What a value counts (\"pages\"), shown in the tooltip." },
        { name: "showLegend", type: "boolean", default: "true", description: "The Less / More key." },
        ...common,
      ],
    },
  ],
  a11y: [
    "Every chart is one tab stop with arrow-key navigation. The drawing is a `role=\"application\"` with an accessible name, a role description (\"bar chart\") and a spoken summary; left and right move between data points (up and down between series, or between rows for sideways bars and grids), Home and End jump to the first and last, Escape closes the tooltip. The current point is announced through a polite live region.",
    "Each chart ships its data as a visually hidden table (a caption, column and row headers) next to the drawing. Charts that are pictures (empty, loading, static sparklines) are `role=\"img\"` with the same summary; a gauge is `role=\"meter\"` with a value, a minimum, a maximum and a text.",
    "Colour is never the only channel: every series has a pencil pattern (hatching, dots, cross-hatching, rules, scribble) on its marks, and lines have a marker shape and a dash pattern. The legend and the tooltip show the same swatch as the drawing. Legend entries are buttons with `aria-pressed`.",
    "All chart text is DOM text in the hand fonts at 12 px or more (15 px script in the default density). Ink on paper is 14:1; muted tick labels 8.9:1. The pointer never has to be used: everything the tooltip shows is in the live region and the table.",
    "Reduced motion removes the wipe-on, the pulse and the cursor slide. In Windows high contrast the drawing is replaced by the data table. Calm density draws hairlines, no fill offset and 12 px hand text for dense screens. The plot always runs left to right (a time axis does not mirror); the legend and the words on the tooltip follow the page direction.",
  ],
  usage: `import { BarChart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const data = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
]

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig

export function Example() {
  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <BarChart data={data} xKey="month" label="Visitors by month" annotations={[{ at: "max", text: "best month!" }]} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend />
    </ChartContainer>
  )
}

export function OnItsOwn() {
  return <BarChart data={data} xKey="month" className="h-64" />
}

export function TheOthers({ days }: { days: { date: string; value: number }[] }) {
  return (
    <>
      <LineChart data={data} xKey="month" />
      <AreaChart data={data} xKey="month" stacked />
      <ScatterChart data={points} xKey="age" series={["height"]} sizeKey="weight" />
      <PieChart data={plans} nameKey="plan" valueKey="users" />
      <DonutChart data={plans} nameKey="plan" valueKey="users" centerLabel={{ value: 1070, label: "users" }} />
      <RadarChart data={skills} xKey="skill" />
      <RadialChart data={rings} nameKey="ring" valueKey="done" />
      <Gauge value={68} zones={[{ to: 40, tone: "good" }, { to: 100, tone: "bad" }]} />
      <Sparkline data={[3, 5, 4, 8]} />
      <TallyChart data={cups} nameKey="drink" valueKey="cups" />
      <Heatmap data={days} />
    </>
  )
}`,
  related: ["card", "tooltip", "table", "progress"],
} satisfies ComponentDoc
