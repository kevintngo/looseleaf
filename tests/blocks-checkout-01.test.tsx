import * as React from "react"
import { screen, within } from "@testing-library/react"
import type { UserEvent } from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import Checkout01 from "@/blocks/checkout-01/page"
import { luhn, makeCheckoutSchema, totals, DEFAULT_VALUES } from "@/blocks/checkout-01/components/checkout-01-data"
import Preview from "@/docs/content/blocks/checkout-01"
import meta from "@/docs/content/blocks/checkout-01.meta"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDrawnClean, expectHydrates, expectSsrStable } from "./_blocks-apps"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 60)
})
afterEach(() => restore())

const TODAY = { year: 2026, month: 9 }
const app = (props: React.ComponentProps<typeof Checkout01> = {}) => (
  <InkProvider>
    <Checkout01 today={TODAY} {...props} />
  </InkProvider>
)
const receipt = () => screen.getByRole("article", { name: "Your order" })

async function fillEverything(user: UserEvent) {
  await user.type(screen.getByRole("textbox", { name: "Email" }), "ada@notes.dev")
  await user.type(screen.getByRole("textbox", { name: "Full name" }), "Ada Lovelace")
  await user.type(screen.getByRole("textbox", { name: "Street and number" }), "12 rue de l'Eau")
  await user.type(screen.getByRole("textbox", { name: "Town or city" }), "Lisbon")
  await user.type(screen.getByRole("textbox", { name: "Postcode" }), "1200-195")
  await user.type(screen.getByRole("textbox", { name: "Name on card" }), "Ada Lovelace")
  await user.type(screen.getByRole("textbox", { name: "Card number" }), "4242424242424242")
  await user.type(screen.getByRole("textbox", { name: "Expires" }), "1229")
  await user.type(screen.getByRole("textbox", { name: "Security code" }), "123")
  await user.click(screen.getByRole("checkbox", { name: /small print/ }))
}

describe("checkout-01 arithmetic", () => {
  it("adds up a basket, a delivery and a code to the cent", () => {
    expect(totals([1, 2, 1], "standard", null)).toEqual({ subtotal: 5400, discount: 0, shipping: 0, vat: 1010, total: 5400 })
    expect(totals([0, 2, 1], "standard", null)).toMatchObject({ subtotal: 4000, shipping: 490, total: 4490 })
    expect(totals([1, 2, 1], "standard", "PAPER10")).toMatchObject({ discount: 540, shipping: 490, total: 5350 })
    expect(totals([0, 2, 1], "standard", "FREESHIP")).toMatchObject({ shipping: 0, total: 4000 })
    expect(totals([0, 2, 1], "express", "FREESHIP")).toMatchObject({ shipping: 500, total: 4500 })
    expect(totals([1, 0, 0], "pickup", null)).toMatchObject({ shipping: 0, total: 1400 })
    expect(totals([0, 0, 0], "express", null)).toMatchObject({ shipping: 0, total: 0 })
  })

  it("checks the form without an address for a pick-up", () => {
    const schema = makeCheckoutSchema(TODAY)
    const ok = { ...DEFAULT_VALUES, email: "a@b.co", name: "Ada", cardName: "Ada", cardNumber: "4242 4242 4242 4242", expiry: "09/26", cvc: "123", terms: true }
    expect(schema.safeParse(ok).success).toBe(false)
    expect(schema.safeParse({ ...ok, method: "pickup" }).success).toBe(true)
    expect(luhn("4242424242424242")).toBe(true)
  })
})

describe("checkout-01 block", () => {
  it("shows the form, the basket and a receipt that adds up", () => {
    renderUI(app())
    expect(screen.getByRole("heading", { level: 2, name: "Checkout" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /Standard/ })).toBeChecked()
    const r = within(receipt())
    expect(r.getByText("Field notebook, A5 ruled")).toBeInTheDocument()
    expect(r.getByText("delivery")).toBeInTheDocument()
    expect(r.getByText("free")).toBeInTheDocument()
    expect(r.getAllByText("54.00", { selector: "dd" })).toHaveLength(2)
    expect(screen.getByRole("button", { name: "Pay €54.00" })).toBeEnabled()
    expect(screen.getByText("Total €54.00.")).toBeInTheDocument()
  })

  it("has no axe violations, with errors showing and on the thank-you", async () => {
    const { container, user } = renderUI(app({ onPlace: async () => {} }))
    await axeCheck(container)
    await user.click(screen.getByRole("button", { name: /^Pay/ }))
    expect(await screen.findByText(/things need a look/)).toBeInTheDocument()
    await axeCheck(container)
    await fillEverything(user)
    await user.click(screen.getByRole("button", { name: /^Pay/ }))
    expect(await screen.findByRole("heading", { name: /Thank you, Ada/ })).toBeInTheDocument()
    await axeCheck(container)
  })

  it("rewrites the receipt as the basket, the delivery and the code change", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("button", { name: "One less: Field notebook, A5 ruled" }))
    expect(within(receipt()).queryByText("Field notebook, A5 ruled")).not.toBeInTheDocument()
    expect(within(receipt()).getByText("4.90", { selector: "dd" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Pay €44.90" })).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: /Express/ }))
    expect(screen.getByRole("button", { name: "Pay €49.90" })).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: /Pick up/ }))
    expect(screen.getByRole("button", { name: "Pay €40.00" })).toBeInTheDocument()
    expect(screen.queryByRole("textbox", { name: "Street and number" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: /Standard/ }))
    expect(screen.getByRole("textbox", { name: "Street and number" })).toBeInTheDocument()
  })

  it("takes a promo code, refuses a wrong one, and lets you remove it", async () => {
    const { user } = renderUI(app())
    const code = screen.getByRole("textbox", { name: "Promo code" })
    await user.type(code, "nonsense")
    await user.click(screen.getByRole("button", { name: "Apply" }))
    expect(await screen.findByText(/not on our list/)).toBeInTheDocument()
    expect(code).toHaveAttribute("aria-invalid", "true")
    await user.clear(code)
    await user.type(code, "paper10")
    await user.click(screen.getByRole("button", { name: "Apply" }))
    expect(screen.getByText(/applied: 10% off the paper/)).toBeInTheDocument()
    expect(within(receipt()).getByText("-5.40", { selector: "dd" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Pay €53.50" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Remove" }))
    expect(screen.getByRole("button", { name: "Pay €54.00" })).toBeInTheDocument()
  })

  it("empties the basket into a friendly note and will not take the order", async () => {
    const { user } = renderUI(app({ defaultQty: [1, 0, 0] }))
    await user.click(screen.getByRole("button", { name: "One less: Field notebook, A5 ruled" }))
    expect(screen.getByText("Nothing in the basket")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Pay/ })).toBeDisabled()
    expect(screen.getByText("The basket is empty.")).toBeInTheDocument()
  })

  it("lists what needs a look, with a button to each field", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("button", { name: /^Pay/ }))
    const summary = await screen.findByRole("alert")
    expect(summary).toHaveTextContent(/things need a look/)
    expect(within(summary).getByRole("button", { name: /Email: Enter an address like/ })).toBeInTheDocument()
    expect(within(summary).getByRole("button", { name: /Street and number: Where should it go/ })).toBeInTheDocument()
    await user.click(within(summary).getByRole("button", { name: /Postcode:/ }))
    expect(screen.getByRole("textbox", { name: "Postcode" })).toHaveFocus()
    expect(screen.getByText("Please tick the box to place the order.")).toBeInTheDocument()
  })

  it("explains a bad card number and an expired card", async () => {
    const { user } = renderUI(app())
    await user.type(screen.getByRole("textbox", { name: "Card number" }), "4242424242424241")
    expect(screen.getByRole("textbox", { name: "Card number" })).toHaveValue("4242 4242 4242 4241")
    await user.type(screen.getByRole("textbox", { name: "Expires" }), "0826")
    await user.click(screen.getByRole("button", { name: /^Pay/ }))
    expect(await screen.findAllByText(/does not add up/)).not.toHaveLength(0)
    expect(screen.getAllByText("That card has expired.").length).toBeGreaterThan(0)
  })

  it("places the order, thanks the person and starts again on request", async () => {
    const onPlace = vi.fn(async () => {})
    const { user } = renderUI(app({ onPlace }))
    await fillEverything(user)
    await user.click(screen.getByRole("button", { name: "Pay €54.00" }))
    const heading = await screen.findByRole("heading", { name: "Thank you, Ada" })
    expect(heading).toHaveFocus()
    expect(onPlace).toHaveBeenCalledTimes(1)
    const [order, values] = onPlace.mock.calls[0] as unknown as [{ number: string; totals: { total: number }; email: string }, { cardNumber: string }]
    expect(order).toMatchObject({ number: "0042 1187", email: "ada@notes.dev" })
    expect(order.totals.total).toBe(5400)
    expect(values.cardNumber).toBe("4242 4242 4242 4242")
    expect(screen.getByText(/is paid\. The receipt is on its way to ada@notes\.dev/)).toBeInTheDocument()
    expect(screen.getByRole("img", { name: /paid/i })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Keep shopping" }))
    expect(screen.getByRole("heading", { level: 2, name: "Checkout" })).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue("")
  })

  it("keeps the form and says so when the order cannot be placed", async () => {
    const { user } = renderUI(app({ onPlace: async () => Promise.reject(new Error("The card was declined.")) }))
    await fillEverything(user)
    await user.click(screen.getByRole("button", { name: "Pay €54.00" }))
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("The order was not placed")
    expect(alert).toHaveTextContent("The card was declined. You have not been charged.")
    expect(screen.queryByRole("heading", { name: /Thank you/ })).not.toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue("ada@notes.dev")
    expect(screen.getByRole("button", { name: "Pay €54.00" })).toHaveAttribute("aria-busy", "false")
  })

  it("is stable on the server and hydrates cleanly", () => {
    expectDrawnClean(app())
    expectSsrStable(app())
    expectHydrates(<Checkout01 today={TODAY} />)
  })
})

describe("checkout-01 docs preview", () => {
  it("lays the block on the desk, has a title and description for the gallery, and is accessible", async () => {
    const { container } = renderUI(<InkProvider><Preview /></InkProvider>)
    expect(container.querySelector("[data-slot=desk]")).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2, name: "Checkout" })).toBeInTheDocument()
    expect(meta.title.length).toBeGreaterThan(2)
    expect(meta.description).toMatch(/paper|desk/)
    expect(meta.tags?.length).toBeGreaterThan(1)
    await axeCheck(container)
  })
})
