import * as React from "react"
import { screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import SettingsBilling from "@/blocks/settings-billing/page"
import { INVOICES, cardBrand, formatCardNumber, formatExpiry, luhn, makeCardSchema, money, planChange } from "@/blocks/settings-billing/components/settings-billing-data"
import Preview from "@/docs/content/blocks/settings-billing"
import meta from "@/docs/content/blocks/settings-billing.meta"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDrawnClean, expectHydrates, expectSsrStable } from "./_blocks-apps"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 60)
})
afterEach(() => restore())

const TODAY = { year: 2026, month: 9 }
const app = (props: React.ComponentProps<typeof SettingsBilling> = {}) => (
  <InkProvider>
    <SettingsBilling today={TODAY} {...props} />
  </InkProvider>
)

describe("settings-billing rules", () => {
  it("prices a plan change", () => {
    expect(planChange("studio", "studio").kind).toBe("same")
    expect(planChange("studio", "workshop")).toMatchObject({ kind: "upgrade", today: 1200, monthly: 3200 })
    expect(planChange("studio", "starter")).toMatchObject({ kind: "downgrade", today: 0, monthly: 0 })
    expect(money(1450)).toBe("$14.50")
  })

  it("checks and formats a card the way a person types it", () => {
    expect(luhn("4242424242424242")).toBe(true)
    expect(luhn("4242424242424243")).toBe(false)
    expect(cardBrand("4242")).toBe("Visa")
    expect(cardBrand("5555")).toBe("Mastercard")
    expect(cardBrand("3782")).toBe("Amex")
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242")
    expect(formatCardNumber("378282246310005")).toBe("3782 822463 10005")
    expect(formatExpiry("1229")).toBe("12/29")
    expect(formatExpiry("7")).toBe("07/")
    const schema = makeCardSchema(TODAY)
    const ok = { name: "Jo", number: "4242 4242 4242 4242", expiry: "09/26", cvc: "123" }
    expect(schema.safeParse(ok).success).toBe(true)
    expect(schema.safeParse({ ...ok, expiry: "08/26" }).error?.issues[0]?.message).toBe("That card has expired.")
    expect(schema.safeParse({ ...ok, expiry: "13/30" }).error?.issues[0]?.message).toMatch(/MM\/YY/)
    expect(schema.safeParse({ ...ok, number: "4242 4242 4242 4241" }).error?.issues[0]?.message).toMatch(/does not add up/)
  })
})

describe("settings-billing block", () => {
  it("shows the plan, the usage, the card and three receipts", () => {
    renderUI(app())
    expect(screen.getByRole("heading", { level: 2, name: "Billing" })).toBeInTheDocument()
    expect(screen.getByRole("group", { name: "Your plan: Studio" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /Studio/ })).toBeChecked()
    const usage = screen.getByRole("list", { name: "Usage" })
    expect(within(usage).getByRole("progressbar", { name: "Notebooks: 80% used" })).toBeInTheDocument()
    expect(screen.getByRole("group", { name: "Card on file" })).toHaveTextContent("Visa ending in 4242")
    expect(within(screen.getByRole("list", { name: "Invoices" })).getAllByRole("article")).toHaveLength(3)
  })

  it("has no axe violations, also with the card form open", async () => {
    const { container, user } = renderUI(app())
    await axeCheck(container)
    await user.click(screen.getByRole("button", { name: "Replace card" }))
    expect(await screen.findByRole("dialog", { name: "Replace your card" })).toBeInTheDocument()
    await axeCheck()
  })

  it("shows older invoices on request and hands the invoice to onDownload", async () => {
    const onDownload = vi.fn()
    const { user } = renderUI(app({ onDownload }))
    await user.click(screen.getByRole("button", { name: "Show 3 older invoices" }))
    expect(within(screen.getByRole("list", { name: "Invoices" })).getAllByRole("article")).toHaveLength(INVOICES.length)
    expect(screen.getByRole("button", { name: "Show fewer invoices" })).toHaveAttribute("aria-expanded", "true")
    await user.click(screen.getByRole("button", { name: "Download invoice 2026-0008" }))
    expect(onDownload).toHaveBeenCalledWith(INVOICES[1])
  })

  it("upgrades with an honest price", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("radio", { name: /Workshop/ }))
    const note = screen.getByRole("alert")
    expect(note).toHaveTextContent("Move up to Workshop")
    expect(note).toHaveTextContent("Today we charge $12.00 for the 18 days left")
    await user.click(screen.getByRole("button", { name: "Switch to Workshop" }))
    expect(screen.getByText("You are on Workshop now.")).toBeInTheDocument()
    expect(screen.getByRole("group", { name: "Your plan: Workshop" })).toBeInTheDocument()
    expect(screen.getByRole("progressbar", { name: "Notebooks: 8% used" })).toBeInTheDocument()
  })

  it("schedules a downgrade, warns about what no longer fits, and can keep the plan", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("radio", { name: /Starter/ }))
    expect(screen.getByRole("alert")).toHaveTextContent("You keep Studio until 14 Oct")
    expect(screen.getByRole("alert")).toHaveTextContent("notebooks (8 of 3)")
    await user.click(screen.getByRole("button", { name: "Switch to Starter" }))
    expect(screen.getByRole("group", { name: "Your plan: Studio" })).toBeInTheDocument()
    expect(screen.getByText(/Moving to/)).toHaveTextContent("Moving to Starter on 14 Oct.")
    await user.click(screen.getByRole("button", { name: "Keep Studio" }))
    expect(screen.queryByText(/Moving to/)).not.toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /Studio/ })).toBeChecked()
  })

  it("replaces the card: groups digits, explains mistakes, saves the brand and last four", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("button", { name: "Replace card" }))
    const dialog = await screen.findByRole("dialog", { name: "Replace your card" })
    const d = within(dialog)
    await user.click(d.getByRole("button", { name: "Save card" }))
    expect(await d.findByText("Type the name as it is printed on the card.")).toBeInTheDocument()
    await user.type(d.getByRole("textbox", { name: "Name on card" }), "Jo Delacroix")
    await user.type(d.getByRole("textbox", { name: "Card number" }), "4242424242424241")
    expect(d.getByRole("textbox", { name: "Card number" })).toHaveValue("4242 4242 4242 4241")
    await user.type(d.getByRole("textbox", { name: "Expires" }), "0826")
    expect(d.getByRole("textbox", { name: "Expires" })).toHaveValue("08/26")
    await user.type(d.getByRole("textbox", { name: "Security code" }), "12")
    await user.click(d.getByRole("button", { name: "Save card" }))
    expect(await d.findByText(/does not add up/)).toBeInTheDocument()
    expect(d.getByText("That card has expired.")).toBeInTheDocument()
    expect(d.getByText("The security code is 3 or 4 digits.")).toBeInTheDocument()
    const number = d.getByRole("textbox", { name: "Card number" })
    await user.clear(number)
    await user.type(number, "5555555555554444")
    expect(d.getByText("Mastercard")).toBeInTheDocument()
    const expiry = d.getByRole("textbox", { name: "Expires" })
    await user.clear(expiry)
    await user.type(expiry, "1229")
    await user.type(d.getByRole("textbox", { name: "Security code" }), "3")
    await user.click(d.getByRole("button", { name: "Save card" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("group", { name: "Card on file" })).toHaveTextContent("Mastercard ending in 4444")
    expect(screen.getByRole("group", { name: "Card on file" })).toHaveTextContent("12/29")
    expect(screen.getByText("Done. New charges go to the Mastercard ending in 4444.")).toBeInTheDocument()
  })

  it("forgets a half-typed card when the dialog is closed", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("button", { name: "Replace card" }))
    await user.type(await screen.findByRole("textbox", { name: "Name on card" }), "Someone")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    await user.click(screen.getByRole("button", { name: "Replace card" }))
    expect(await screen.findByRole("textbox", { name: "Name on card" })).toHaveValue("")
  })

  it("validates the invoice details and says when they are saved", async () => {
    const onSaveDetails = vi.fn(async () => {})
    const { user } = renderUI(app({ onSaveDetails }))
    const email = screen.getByRole("textbox", { name: "Send invoices to" })
    await user.clear(email)
    await user.type(email, "billing")
    const vat = screen.getByRole("textbox", { name: "VAT number" })
    await user.clear(vat)
    await user.type(vat, "12345")
    await user.click(screen.getByRole("button", { name: "Save details" }))
    expect(await screen.findByText("Enter an address like billing@notes.dev.")).toBeInTheDocument()
    expect(screen.getByText("A VAT number starts with two letters, like PT123456789.")).toBeInTheDocument()
    expect(onSaveDetails).not.toHaveBeenCalled()
    await user.clear(email)
    await user.type(email, "books@looseleaf.example")
    await user.clear(vat)
    await user.type(vat, "pt987654321")
    expect(vat).toHaveValue("PT987654321")
    await user.click(screen.getByRole("button", { name: "Save details" }))
    await waitFor(() => expect(screen.getByText("Saved. New invoices will say so.")).toBeInTheDocument())
    expect(onSaveDetails).toHaveBeenCalledWith(expect.objectContaining({ email: "books@looseleaf.example", taxId: "PT987654321" }))
  })

  it("is stable on the server and hydrates cleanly", () => {
    expectDrawnClean(app())
    expectSsrStable(app())
    expectHydrates(<SettingsBilling today={TODAY} />)
  })
})

describe("settings-billing docs preview", () => {
  it("lays the block on the desk, has a title and description for the gallery, and is accessible", async () => {
    const { container } = renderUI(<InkProvider><Preview /></InkProvider>)
    expect(container.querySelector("[data-slot=desk]")).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2, name: "Billing" })).toBeInTheDocument()
    expect(meta.title.length).toBeGreaterThan(2)
    expect(meta.description).toMatch(/paper|desk/)
    expect(meta.tags?.length).toBeGreaterThan(1)
    await axeCheck(container)
  })
})
