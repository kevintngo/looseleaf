import type { BlockDoc } from "@/docs/core/catalog"

export default {
  title: "Checkout 01",
  description:
    "Checkout on one taped page: contact, delivery (choice cards that show what each costs right now, with no address asked for a pick-up) and a card checked as you type (Luhn, expiry, grouped digits), beside a basket with quantity steppers, a promo code and a till receipt that rewrites itself with the delivery, discount and VAT. A failed try lists what needs a look with buttons to the fields; placing the order swaps the page for a thank-you with the receipt stamped PAID. The text and forms sit on sheets of their own, so it looks right on paper or on the desk.",
  tags: ["commerce", "checkout", "receipt", "form", "validation"],
} satisfies BlockDoc
