import type { NotebookCoverProps } from "@/components/ui/notebook"

export type Stat = { id: string; label: string; value: string; note: string }
export type Week = { label: string; pages: number }
export type ShelfNotebook = { tone: NotebookCoverProps["tone"]; name: string; pages: number }
export type Badge = { id: string; sticker: string; name: string; how: string; earned?: string }

export type Profile = {
  name: string
  handle: string
  pronouns: string
  place: string
  joined: string
  website: string
  bio: string
  followers: number
  following: number
  photo?: string
  topics: string[]
  stats?: Stat[]
  streakDays?: number
  weeks?: Week[]
  feed?: Entry[]
  shelf?: ShelfNotebook[]
  badges?: Badge[]
}

export const PROFILE: Profile = {
  name: "Jo Delacroix",
  handle: "jo_writes",
  pronouns: "she / her",
  place: "Lisbon",
  joined: "March 2024",
  website: "jo.looseleaf.example",
  bio: "I write in the margins. Letterpress on weekends, tea all week, and a running argument with a dead author about semicolons.",
  followers: 312,
  following: 148,
  topics: ["Letterpress", "Recipes", "Margins", "Tea"],
}

export const STATS: Stat[] = [
  { id: "pages", label: "Pages written", value: "1,284", note: "up 12% on last month" },
  { id: "books", label: "Notebooks", value: "12", note: "3 of them full" },
  { id: "words", label: "Words a day", value: "640", note: "steady since June" },
]

export const WEEKS: Week[] = [
  { label: "Aug 4 to 10", pages: 28 },
  { label: "Aug 11 to 17", pages: 34 },
  { label: "Aug 18 to 24", pages: 19 },
  { label: "Aug 25 to 31", pages: 41 },
  { label: "Sep 1 to 7", pages: 12 },
  { label: "Sep 8 to 14", pages: 36 },
  { label: "Sep 15 to 21", pages: 30 },
  { label: "Sep 22 to 28", pages: 22 },
]

export const STREAK_DAYS = 23

export type Entry = { id: string; day: "Today" | "Yesterday" | "Last week"; icon: "pencil" | "book-open" | "bookmark" | "message-square" | "star"; title: string; where: string; time: string }

export const FEED: Entry[] = [
  { id: "e1", day: "Today", icon: "pencil", title: "Finished “Porridge, the slow way”", where: "Recipes", time: "9:12" },
  { id: "e2", day: "Today", icon: "message-square", title: "Answered a question from Nell about deckle edges", where: "Letterpress club", time: "8:40" },
  { id: "e3", day: "Yesterday", icon: "book-open", title: "Read “On owning books” for the seventh time", where: "Reading", time: "21:05" },
  { id: "e4", day: "Yesterday", icon: "star", title: "Earned a sticker: 100 pages in a month", where: "Stickers", time: "18:30" },
  { id: "e5", day: "Last week", icon: "bookmark", title: "Pinned “Lisbon, three days” to the top of Trips", where: "Trips", time: "Tue" },
]

export const SHELF: ShelfNotebook[] = [
  { tone: "tomato", name: "Field notes", pages: 48 },
  { tone: "teal", name: "Recipes", pages: 31 },
  { tone: "sky", name: "Sketches", pages: 22 },
  { tone: "grape", name: "Letters", pages: 64 },
  { tone: "ink", name: "Accounts", pages: 9 },
]

export const BADGES: Badge[] = [
  { id: "first", sticker: "first-place", name: "First notebook", how: "Fill one notebook", earned: "Apr 2024" },
  { id: "hundred", sticker: "hundred", name: "A hundred pages", how: "Write 100 pages in a month", earned: "Sep 2026" },
  { id: "rocket", sticker: "rocket", name: "Early bird", how: "Join in the first year", earned: "Mar 2024" },
  { id: "owl", sticker: "owl", name: "Night owl", how: "Write after midnight, ten times", earned: "Jun 2025" },
  { id: "tea", sticker: "teacup", name: "Tea break", how: "Take a break every day for a week", earned: "Nov 2024" },
  { id: "marker", sticker: "highlighter", name: "Margin note", how: "Mark up 50 lines" },
  { id: "party", sticker: "party-popper", name: "Full house", how: "Fill ten notebooks" },
  { id: "member", sticker: "stamp-member", name: "Club member", how: "Join a club" },
]
