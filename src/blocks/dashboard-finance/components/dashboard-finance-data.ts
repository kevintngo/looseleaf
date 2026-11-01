export type Category = "Groceries" | "Rent" | "Eating out" | "Transport" | "Fun" | "Bills" | "Income"
export type Status = "cleared" | "pending" | "flagged"

export type Transaction = {
  id: number
  date: string
  description: string
  account: "Checking" | "Card"
  category: Category
  cents: number
  status: Status
}

export const CATEGORIES: readonly Category[] = ["Groceries", "Rent", "Eating out", "Transport", "Fun", "Bills", "Income"]

export const CATEGORY_ICON: Record<Category, string> = {
  Groceries: "shopping-cart",
  Rent: "house",
  "Eating out": "receipt",
  Transport: "map",
  Fun: "sparkles",
  Bills: "credit-card",
  Income: "wallet",
}

export const MONTHS = [
  { id: "2026-09", label: "September 2026", name: "September" },
  { id: "2026-08", label: "August 2026", name: "August" },
] as const

export const TODAY = "2026-09-25"

export const BUDGETS: ReadonlyArray<{ category: Exclude<Category, "Income">; cents: number }> = [
  { category: "Groceries", cents: 50000 },
  { category: "Rent", cents: 145000 },
  { category: "Eating out", cents: 15000 },
  { category: "Transport", cents: 12000 },
  { category: "Fun", cents: 15000 },
  { category: "Bills", cents: 24000 },
]

export const ACCOUNTS: ReadonlyArray<{ name: string; cents: number }> = [
  { name: "Checking", cents: 421832 },
  { name: "Savings", cents: 1290000 },
  { name: "Credit card", cents: -64210 },
  { name: "Index funds", cents: 845571 },
]

export const transactions: Transaction[] = [
  { id: 1, date: "2026-09-25", description: "Oat latte at the Blue Door", account: "Card", category: "Eating out", cents: -650, status: "pending" },
  { id: 2, date: "2026-09-24", description: "Whole Foods", account: "Card", category: "Groceries", cents: -8412, status: "cleared" },
  { id: 3, date: "2026-09-24", description: "Invoice 118, Pemberton & Sons", account: "Checking", category: "Income", cents: 180000, status: "pending" },
  { id: 4, date: "2026-09-23", description: "Metro pass top-up", account: "Checking", category: "Transport", cents: -3000, status: "cleared" },
  { id: 5, date: "2026-09-22", description: "Bakery on rue Cler", account: "Card", category: "Eating out", cents: -1840, status: "cleared" },
  { id: 6, date: "2026-09-21", description: "Anniversary dinner", account: "Card", category: "Eating out", cents: -9800, status: "cleared" },
  { id: 7, date: "2026-09-20", description: "Farmers market", account: "Checking", category: "Groceries", cents: -4630, status: "cleared" },
  { id: 8, date: "2026-09-19", description: "Climbing gym", account: "Card", category: "Fun", cents: -3800, status: "cleared" },
  { id: 9, date: "2026-09-18", description: "Electric bill", account: "Checking", category: "Bills", cents: -9215, status: "cleared" },
  { id: 10, date: "2026-09-17", description: "Corner shop", account: "Card", category: "Groceries", cents: -6785, status: "cleared" },
  { id: 11, date: "2026-09-15", description: "Salary, Marigold Paper Co.", account: "Checking", category: "Income", cents: 340000, status: "cleared" },
  { id: 12, date: "2026-09-14", description: "Cinema, two tickets", account: "Card", category: "Fun", cents: -2200, status: "cleared" },
  { id: 13, date: "2026-09-12", description: "Taxi home (charged twice?)", account: "Card", category: "Transport", cents: -2400, status: "flagged" },
  { id: 14, date: "2026-09-10", description: "Internet", account: "Checking", category: "Bills", cents: -4900, status: "cleared" },
  { id: 15, date: "2026-09-08", description: "Whole Foods", account: "Card", category: "Groceries", cents: -10250, status: "cleared" },
  { id: 16, date: "2026-09-05", description: "Ramen night", account: "Card", category: "Eating out", cents: -6000, status: "cleared" },
  { id: 17, date: "2026-09-03", description: "Watercolour set", account: "Card", category: "Fun", cents: -3600, status: "cleared" },
  { id: 18, date: "2026-09-02", description: "Rent", account: "Checking", category: "Rent", cents: -145000, status: "cleared" },
  { id: 19, date: "2026-09-01", description: "Phone plan", account: "Checking", category: "Bills", cents: -6400, status: "cleared" },
  { id: 20, date: "2026-09-01", description: "Garden club dues", account: "Checking", category: "Fun", cents: -1200, status: "cleared" },
  { id: 21, date: "2026-08-31", description: "Whole Foods", account: "Card", category: "Groceries", cents: -9120, status: "cleared" },
  { id: 22, date: "2026-08-29", description: "Salary, Marigold Paper Co.", account: "Checking", category: "Income", cents: 340000, status: "cleared" },
  { id: 23, date: "2026-08-27", description: "Pottery class", account: "Card", category: "Fun", cents: -4500, status: "cleared" },
  { id: 24, date: "2026-08-24", description: "Ramen night", account: "Card", category: "Eating out", cents: -5200, status: "cleared" },
  { id: 25, date: "2026-08-20", description: "Electric bill", account: "Checking", category: "Bills", cents: -8830, status: "cleared" },
  { id: 26, date: "2026-08-18", description: "Farmers market", account: "Checking", category: "Groceries", cents: -5210, status: "cleared" },
  { id: 27, date: "2026-08-14", description: "Metro pass top-up", account: "Checking", category: "Transport", cents: -3000, status: "cleared" },
  { id: 28, date: "2026-08-12", description: "Invoice 112, Pemberton & Sons", account: "Checking", category: "Income", cents: 120000, status: "cleared" },
  { id: 29, date: "2026-08-10", description: "Trattoria", account: "Card", category: "Eating out", cents: -7300, status: "cleared" },
  { id: 30, date: "2026-08-02", description: "Rent", account: "Checking", category: "Rent", cents: -145000, status: "cleared" },
  { id: 31, date: "2026-08-01", description: "Phone plan", account: "Checking", category: "Bills", cents: -6400, status: "cleared" },
]

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function money(cents: number, { sign = false }: { sign?: boolean } = {}): string {
  const abs = Math.abs(Math.round(cents))
  const dollars = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  const body = `$${dollars}.${String(abs % 100).padStart(2, "0")}`
  if (cents < 0) return `−${body}`
  return sign && cents > 0 ? `+${body}` : body
}

export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-")
  return `${MONTH_NAMES[Number(m) - 1] ?? m} ${Number(d)}`
}

export const inMonth = (list: readonly Transaction[], month: string) => list.filter((t) => t.date.startsWith(month))

export function spentBy(list: readonly Transaction[], month: string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const t of inMonth(list, month)) if (t.cents < 0) out[t.category] = (out[t.category] ?? 0) - t.cents
  return out
}

export function cashFlow(list: readonly Transaction[]) {
  const past = [
    { month: "Apr", income: 5200, spending: 2410 },
    { month: "May", income: 5200, spending: 2180 },
    { month: "Jun", income: 5350, spending: 2630 },
    { month: "Jul", income: 5200, spending: 2305 },
  ]
  const totals = (month: string, name: string) => {
    const rows = inMonth(list, month)
    const income = rows.filter((t) => t.cents > 0).reduce((a, t) => a + t.cents, 0) / 100
    const spending = rows.filter((t) => t.cents < 0).reduce((a, t) => a - t.cents, 0) / 100
    return { month: name, income: Math.round(income), spending: Math.round(spending) }
  }
  return [...past, totals("2026-08", "Aug"), totals("2026-09", "Sep")]
}
