const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export const visitors = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

export const desktopOnly = visitors.map(({ month, desktop }) => ({ month, desktop }))

export const radarDesktop = desktopOnly.map((r) => (r.month === "April" ? { ...r, desktop: 273 } : r))

export const radarClose = [
  { month: "January", desktop: 186, mobile: 160 },
  { month: "February", desktop: 185, mobile: 170 },
  { month: "March", desktop: 207, mobile: 180 },
  { month: "April", desktop: 173, mobile: 160 },
  { month: "May", desktop: 160, mobile: 190 },
  { month: "June", desktop: 174, mobile: 204 },
]

export const visitorsThree = [
  { month: "January", desktop: 186, mobile: 80, other: 45 },
  { month: "February", desktop: 305, mobile: 200, other: 100 },
  { month: "March", desktop: 237, mobile: 120, other: 150 },
  { month: "April", desktop: 73, mobile: 190, other: 50 },
  { month: "May", desktop: 209, mobile: 130, other: 100 },
  { month: "June", desktop: 214, mobile: 140, other: 160 },
]

export const visitorsShare = visitorsThree.map(({ month, desktop, mobile, other }) => {
  const total = desktop + mobile + other
  const pct = (v: number) => Math.round((v / total) * 1000) / 10
  return { month, desktop: pct(desktop), mobile: pct(mobile), other: pct(other) }
})

export const swing = [
  { month: "January", visitors: 186 },
  { month: "February", visitors: 205 },
  { month: "March", visitors: -207 },
  { month: "April", visitors: 173 },
  { month: "May", visitors: -209 },
  { month: "June", visitors: 214 },
]

export const swingColumns = swing.map(({ month, visitors }) => (visitors >= 0 ? { month, gain: visitors } : { month, loss: visitors }))

export const browsers = [
  { browser: "chrome", visitors: 275 },
  { browser: "safari", visitors: 200 },
  { browser: "firefox", visitors: 187 },
  { browser: "edge", visitors: 173 },
  { browser: "other", visitors: 90 },
]

export const browsersActive = [
  { browser: "chrome", visitors: 187 },
  { browser: "safari", visitors: 200 },
  { browser: "firefox", visitors: 275 },
  { browser: "edge", visitors: 173 },
  { browser: "other", visitors: 90 },
]

export const browsersBig = [
  { browser: "chrome", visitors: 275 },
  { browser: "safari", visitors: 200 },
  { browser: "firefox", visitors: 287 },
  { browser: "edge", visitors: 173 },
  { browser: "other", visitors: 190 },
]

export const browserColumns = browsers.map((b) => ({ browser: b.browser, [b.browser]: b.visitors }))

export const monthSlices = [
  { month: "january", desktop: 186 },
  { month: "february", desktop: 305 },
  { month: "march", desktop: 237 },
  { month: "april", desktop: 173 },
  { month: "may", desktop: 209 },
]

export const activity = [
  { date: "2024-07-15", running: 450, swimming: 300 },
  { date: "2024-07-16", running: 380, swimming: 420 },
  { date: "2024-07-17", running: 520, swimming: 120 },
  { date: "2024-07-18", running: 140, swimming: 550 },
  { date: "2024-07-19", running: 600, swimming: 350 },
  { date: "2024-07-20", running: 480, swimming: 400 },
]

const DAILY = [
  [222, 150], [97, 180], [167, 120], [242, 260], [373, 290], [301, 340], [245, 180], [409, 320], [59, 110], [261, 190],
  [327, 350], [292, 210], [342, 380], [137, 220], [120, 170], [138, 190], [446, 360], [364, 410], [243, 180], [89, 150],
  [137, 200], [224, 170], [138, 230], [387, 290], [215, 250], [75, 130], [383, 420], [122, 180], [315, 240], [454, 380],
  [165, 220], [293, 310], [247, 190], [385, 420], [481, 390], [498, 520], [388, 300], [149, 210], [227, 180], [293, 330],
  [335, 270], [197, 240], [197, 160], [448, 490], [473, 380], [338, 400], [499, 420], [315, 350], [235, 180], [177, 230],
  [82, 140], [81, 120], [252, 290], [294, 220], [201, 250], [213, 170], [420, 460], [233, 190], [78, 130], [340, 280],
  [178, 230], [178, 200], [470, 410], [103, 160], [439, 380], [88, 140], [294, 250], [323, 370], [385, 320], [438, 480],
  [155, 200], [92, 150], [492, 420], [81, 130], [426, 380], [307, 350], [371, 310], [475, 520], [107, 170], [341, 290],
  [408, 450], [169, 210], [317, 270], [480, 530], [132, 180], [141, 190], [434, 380], [448, 490], [149, 200], [103, 160],
  [446, 400],
]
const DAYS_IN_MONTH = [30, 31, 30]

export const daily = DAILY.map(([desktop, mobile], i) => {
  let day = i
  let month = 0
  while (day >= DAYS_IN_MONTH[month]) day -= DAYS_IN_MONTH[month++]
  return { date: `2024-${String(month + 4).padStart(2, "0")}-${String(day + 1).padStart(2, "0")}`, desktop, mobile }
})

export const short = (value: unknown) => String(value).slice(0, 3)

export const dayLabel = (value: unknown) => {
  const [, m, d] = String(value).split("-")
  return `${MONTHS[Number(m) - 1].slice(0, 3)} ${Number(d)}`
}

export const longDate = (value: unknown) => {
  const [y, m, d] = String(value).split("-")
  return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`
}

export const weekday = (value: unknown) => {
  const [y, m, d] = String(value).split("-").map(Number)
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4]
  const yy = m < 3 ? y - 1 : y
  return WEEKDAYS[(yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) + t[m - 1] + d) % 7]
}

export const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")

type TipItem = { payload?: Record<string, unknown> }
const fromRow = (key: string, format: (value: unknown) => string) => (_label: unknown, items: TipItem[]) => format(items[0]?.payload?.[key])

export const monthOfRow = fromRow("month", String)
export const dayOfRow = fromRow("date", dayLabel)
export const dateOfRow = fromRow("date", longDate)
