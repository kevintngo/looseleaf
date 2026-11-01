import { z } from "zod"

export type PlanId = "starter" | "studio" | "workshop"

export const PLANS: { id: PlanId; name: string; cents: number; blurb: string; notebooks: number; storageGb: number; seats: number }[] = [
  { id: "starter", name: "Starter", cents: 0, blurb: "One notebook, one pen, no rush.", notebooks: 3, storageGb: 1, seats: 1 },
  { id: "studio", name: "Studio", cents: 1200, blurb: "Ten notebooks and the good highlighters.", notebooks: 10, storageGb: 10, seats: 3 },
  { id: "workshop", name: "Workshop", cents: 3200, blurb: "A whole desk. Washi tape included.", notebooks: 100, storageGb: 100, seats: 15 },
]

export const money = (cents: number): string => `$${(cents / 100).toFixed(2)}`

export const DAYS_LEFT = 18
export const DAYS_IN_CYCLE = 30
export const RENEWS = "14 Oct"

export type PlanChange = { from: PlanId; to: PlanId; kind: "same" | "upgrade" | "downgrade"; today: number; monthly: number }

export function planChange(from: PlanId, to: PlanId): PlanChange {
  const a = PLANS.find((p) => p.id === from)!.cents
  const b = PLANS.find((p) => p.id === to)!.cents
  if (from === to) return { from, to, kind: "same", today: 0, monthly: b }
  if (b > a) return { from, to, kind: "upgrade", today: Math.round(((b - a) * DAYS_LEFT) / DAYS_IN_CYCLE), monthly: b }
  return { from, to, kind: "downgrade", today: 0, monthly: b }
}

export const USAGE = [
  { id: "notebooks", label: "Notebooks", used: 8, unit: "" },
  { id: "storage", label: "Storage", used: 8.4, unit: " GB" },
  { id: "seats", label: "People on the desk", used: 3, unit: "" },
] as const

export type Invoice = { number: string; date: string; lines: { name: string; price: string }[]; total: string; paidWith: string }

export const INVOICES: Invoice[] = [
  { number: "2026-0009", date: "14 Sep 2026", lines: [{ name: "Studio plan, September", price: "12.00" }, { name: "Extra storage, 5 GB", price: "2.50" }], total: "14.50", paidWith: "Visa 4242" },
  { number: "2026-0008", date: "14 Aug 2026", lines: [{ name: "Studio plan, August", price: "12.00" }], total: "12.00", paidWith: "Visa 4242" },
  { number: "2026-0007", date: "14 Jul 2026", lines: [{ name: "Studio plan, July", price: "12.00" }, { name: "Washi tape pack, sticker sheet", price: "6.00" }], total: "18.00", paidWith: "Visa 4242" },
  { number: "2026-0006", date: "14 Jun 2026", lines: [{ name: "Studio plan, June", price: "12.00" }], total: "12.00", paidWith: "Visa 4242" },
  { number: "2026-0005", date: "14 May 2026", lines: [{ name: "Studio plan, May", price: "12.00" }], total: "12.00", paidWith: "Visa 4242" },
  { number: "2026-0004", date: "14 Apr 2026", lines: [{ name: "Starter to Studio, part month", price: "7.20" }], total: "7.20", paidWith: "Visa 4242" },
]

export function luhn(digits: string): boolean {
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return digits.length > 0 && sum % 10 === 0
}

export function cardBrand(digits: string): "Visa" | "Mastercard" | "Amex" | "Card" {
  if (/^4/.test(digits)) return "Visa"
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard"
  if (/^3[47]/.test(digits)) return "Amex"
  return "Card"
}

export function formatCardNumber(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 19)
  if (/^3[47]/.test(d)) return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(" ")
  return d.replace(/(.{4})/g, "$1 ").trim()
}

export function formatExpiry(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 4)
  if (d.length === 1 && Number(d) > 1) return `0${d}/`
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export type Month = { year: number; month: number }

export function currentMonth(): Month {
  // lint-house-disable-next-line render-time
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export function makeCardSchema(today: Month) {
  return z.object({
    name: z.string().trim().min(2, "Type the name as it is printed on the card."),
    number: z
      .string()
      .refine((v) => /^\d{13,19}$/.test(v.replace(/\s/g, "")), "A card number has 13 to 19 digits.")
      .refine((v) => luhn(v.replace(/\s/g, "")), "That number does not add up. Check each digit."),
    expiry: z
      .string()
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Write it as MM/YY, like 08/28.")
      .refine((v) => {
        const [m, y] = v.split("/").map(Number)
        return 2000 + y > today.year || (2000 + y === today.year && m >= today.month)
      }, "That card has expired."),
    cvc: z.string().regex(/^\d{3,4}$/, "The security code is 3 or 4 digits."),
  })
}

export type CardValues = z.infer<ReturnType<typeof makeCardSchema>>

export const detailsSchema = z.object({
  email: z.email("Enter an address like billing@notes.dev."),
  company: z.string().trim().max(60, "Keep the company name to 60 characters."),
  taxId: z.string().trim().regex(/^([A-Za-z]{2}[A-Za-z0-9]{8,12})?$/, "A VAT number starts with two letters, like PT123456789."),
})

export type DetailsValues = z.infer<typeof detailsSchema>
