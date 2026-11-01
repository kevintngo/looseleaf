export type EventKind = "studio" | "home" | "friends" | "trips" | "errands"

export type PlannerEvent = {
  id: string
  title: string
  date: string
  start: string
  end: string
  kind: EventKind
  notes: string
}

export const TODAY = "2026-09-25"

export const KINDS: ReadonlyArray<{ id: EventKind; label: string; dot: string }> = [
  { id: "studio", label: "Studio", dot: "bg-tomato" },
  { id: "home", label: "Home", dot: "bg-grass" },
  { id: "friends", label: "Friends", dot: "bg-sky" },
  { id: "trips", label: "Trips", dot: "bg-grape" },
  { id: "errands", label: "Errands", dot: "bg-lemon" },
]

export const kindOf = (id: EventKind) => KINDS.find((k) => k.id === id) ?? KINDS[0]

export const events: PlannerEvent[] = [
  { id: "e1", title: "Watercolour class", date: "2026-09-03", start: "18:30", end: "20:30", kind: "home", notes: "Bring the small brushes." },
  { id: "e2", title: "Kiln day", date: "2026-09-10", start: "09:00", end: "13:00", kind: "studio", notes: "" },
  { id: "e3", title: "Dinner with the neighbours", date: "2026-09-12", start: "19:30", end: "22:00", kind: "friends", notes: "We are bringing the tart." },
  { id: "e4", title: "Dentist", date: "2026-09-16", start: "08:30", end: "09:15", kind: "home", notes: "" },
  { id: "e5", title: "Order the boxes", date: "2026-09-21", start: "11:00", end: "11:30", kind: "errands", notes: "" },
  { id: "e6", title: "Studio stand-up", date: "2026-09-25", start: "09:30", end: "10:00", kind: "studio", notes: "Price tags, sticker sheet, newsletter." },
  { id: "e7", title: "Lunch with Ada", date: "2026-09-25", start: "12:30", end: "14:00", kind: "friends", notes: "The place with the good bread." },
  { id: "e8", title: "Post office run", date: "2026-09-25", start: "16:00", end: "16:45", kind: "errands", notes: "Two parcels and a postcard." },
  { id: "e9", title: "Farmers market", date: "2026-09-26", start: "10:00", end: "12:00", kind: "errands", notes: "" },
  { id: "e10", title: "Ada's birthday supper", date: "2026-09-26", start: "19:30", end: "23:00", kind: "friends", notes: "Don't forget the card." },
  { id: "e11", title: "Print the price tags", date: "2026-09-28", start: "09:00", end: "12:00", kind: "studio", notes: "Kraft card, two hundred." },
  { id: "e12", title: "Newsletter deadline", date: "2026-09-29", start: "10:00", end: "11:00", kind: "studio", notes: "" },
  { id: "e13", title: "Train to Lyon", date: "2026-09-30", start: "08:15", end: "11:40", kind: "trips", notes: "Seat 42, by the window." },
  { id: "e14", title: "Paper fair, day one", date: "2026-10-01", start: "09:00", end: "18:00", kind: "trips", notes: "" },
  { id: "e15", title: "Paper fair, day two", date: "2026-10-02", start: "09:00", end: "17:00", kind: "trips", notes: "Say hello to the marbling people." },
  { id: "e16", title: "Train home", date: "2026-10-02", start: "18:30", end: "22:00", kind: "trips", notes: "" },
]

const pad = (n: number) => String(n).padStart(2, "0")

export function parseDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export const dayKey = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const clock = (hhmm: string): string => `${Number(hhmm.slice(0, 2))}:${hhmm.slice(3, 5)}`

export const onDay = (list: readonly PlannerEvent[], iso: string): PlannerEvent[] => list.filter((e) => e.date === iso).sort((a, b) => a.start.localeCompare(b.start) || a.id.localeCompare(b.id))

export const after = (list: readonly PlannerEvent[], iso: string, count = 5): PlannerEvent[] =>
  list
    .filter((e) => e.date > iso)
    .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
    .slice(0, count)
