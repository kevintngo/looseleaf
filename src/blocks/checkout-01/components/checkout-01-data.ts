import { z } from "zod"

export type Product = { id: string; name: string; cents: number; note: string }

export const PRODUCTS: Product[] = [
  { id: "notebook", name: "Field notebook, A5 ruled", cents: 1400, note: "Stitched, 96 pages" },
  { id: "tape", name: "Washi tape, three rolls", cents: 900, note: "Dots, stripes, gingham" },
  { id: "pen", name: "Brass pen", cents: 2200, note: "Refillable, felt tip" },
]

export const DEFAULT_QTY = [1, 2, 1]

export const money = (cents: number): string => (cents / 100).toFixed(2)

export type MethodId = "standard" | "express" | "pickup"

export const METHODS: { id: MethodId; name: string; help: string; cents: number }[] = [
  { id: "standard", name: "Standard", help: "4 to 6 days. Free over 50.00.", cents: 490 },
  { id: "express", name: "Express", help: "Tomorrow, if you order before 4 pm.", cents: 990 },
  { id: "pickup", name: "Pick up at the shop", help: "12 rue de l'Eau, ready in an hour.", cents: 0 },
]

export const PROMOS: Record<string, { label: string; percent?: number; freeStandard?: boolean }> = {
  PAPER10: { label: "10% off the paper", percent: 10 },
  FREESHIP: { label: "Standard delivery on us", freeStandard: true },
}

export const FREE_SHIPPING_FROM = 5000
export const VAT = 23

export type Totals = { subtotal: number; discount: number; shipping: number; vat: number; total: number }

export function totals(qty: number[], method: MethodId, code: string | null): Totals {
  const subtotal = PRODUCTS.reduce((sum, p, i) => sum + p.cents * (qty[i] ?? 0), 0)
  const promo = code ? PROMOS[code] : undefined
  const discount = promo?.percent ? Math.round((subtotal * promo.percent) / 100) : 0
  const base = METHODS.find((m) => m.id === method)!.cents
  let shipping = base
  if (subtotal === 0) shipping = 0
  else if (method === "standard" && (subtotal - discount >= FREE_SHIPPING_FROM || promo?.freeStandard)) shipping = 0
  else if (method === "express" && promo?.freeStandard) shipping = base - METHODS[0]!.cents
  const total = subtotal - discount + shipping
  return { subtotal, discount, shipping, vat: Math.round((total * VAT) / (100 + VAT)), total }
}

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

export const COUNTRIES = ["Portugal", "France", "Germany", "Netherlands", "United Kingdom", "United States"]

export function makeCheckoutSchema(today: Month) {
  return z
    .object({
      email: z.email("Enter an address like ada@notes.dev."),
      name: z.string().trim().min(2, "Who should we address it to?"),
      address: z.string().trim(),
      city: z.string().trim(),
      postcode: z.string().trim(),
      country: z.string().min(1, "Choose a country."),
      method: z.enum(["standard", "express", "pickup"]),
      cardName: z.string().trim().min(2, "Type the name as it is printed on the card."),
      cardNumber: z
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
      terms: z.boolean().refine((v) => v, "Please tick the box to place the order."),
    })
    .superRefine((v, ctx) => {
      if (v.method === "pickup") return
      if (v.address.length < 5) ctx.addIssue({ code: "custom", path: ["address"], message: "Where should it go? Add a street and number." })
      if (v.city.length < 2) ctx.addIssue({ code: "custom", path: ["city"], message: "Add the town or city." })
      if (v.postcode.length < 3) ctx.addIssue({ code: "custom", path: ["postcode"], message: "Add the postcode." })
    })
}

export type CheckoutValues = z.infer<ReturnType<typeof makeCheckoutSchema>>

export const DEFAULT_VALUES: CheckoutValues = {
  email: "",
  name: "",
  address: "",
  city: "",
  postcode: "",
  country: "Portugal",
  method: "standard",
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
  terms: false,
}

export const FIELD_LABELS: Partial<Record<keyof CheckoutValues, string>> = {
  email: "Email",
  name: "Full name",
  address: "Street and number",
  city: "Town or city",
  postcode: "Postcode",
  country: "Country",
  cardName: "Name on card",
  cardNumber: "Card number",
  expiry: "Expires",
  cvc: "Security code",
  terms: "The terms",
}
