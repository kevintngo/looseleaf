export type Period = "monthly" | "yearly"

export type Tier = {
  id: "starter" | "studio" | "workshop"
  name: string
  tagline: string
  monthly: number
  yearly: number
  features: string[]
  cta: string
  popular?: boolean
  tape: "masking" | "washi-dots" | "washi-stripes"
}

export const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "One notebook, one pen, no rush.",
    monthly: 0,
    yearly: 0,
    features: ["3 notebooks", "1 GB of paper", "Just you at the desk", "Help from the community"],
    cta: "Start for free",
    tape: "masking",
  },
  {
    id: "studio",
    name: "Studio",
    tagline: "Ten notebooks and the good highlighters.",
    monthly: 1200,
    yearly: 12000,
    features: ["10 notebooks", "10 GB of paper", "3 people at the desk", "The good highlighters", "Email help, same day"],
    cta: "Get Studio",
    popular: true,
    tape: "washi-dots",
  },
  {
    id: "workshop",
    name: "Workshop",
    tagline: "A whole desk. Washi tape included.",
    monthly: 3200,
    yearly: 32000,
    features: ["100 notebooks", "100 GB of paper", "15 people at the desk", "Unlimited washi tape", "A real person, quickly"],
    cta: "Get Workshop",
    tape: "washi-stripes",
  },
]

export const dollars = (cents: number): string => `$${cents % 100 === 0 ? cents / 100 : (cents / 100).toFixed(2)}`

export const perMonth = (t: Tier, period: Period): number => (period === "yearly" ? Math.round(t.yearly / 12) : t.monthly)

export const FAQ = [
  { q: "Can I change plans later?", a: "Any time. Going up starts today and you pay only the difference for the days that are left. Going down waits for your next renewal." },
  { q: "What happens if I run out of notebooks?", a: "Nothing is deleted. The extra notebooks stay readable, and you can write in them again when there is room." },
  { q: "Is there a discount for schools or clubs?", a: "Yes, 40% off for teachers, students and anyone running a club. Write to us from your school address and we will sort it out." },
  { q: "Do you take my card details on this page?", a: "No. You pick a plan here and add a card on the next page, where it is checked and stored by our payment provider." },
]
