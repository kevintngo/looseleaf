import * as React from "react"
import { screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import Pricing01 from "@/blocks/pricing-01/page"
import { TIERS, dollars, perMonth } from "@/blocks/pricing-01/components/pricing-01-data"
import Preview from "@/docs/content/blocks/pricing-01"
import meta from "@/docs/content/blocks/pricing-01.meta"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDrawnClean, expectHydrates, expectSsrStable } from "./_blocks-apps"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 60)
})
afterEach(() => restore())

const app = (props: React.ComponentProps<typeof Pricing01> = {}) => (
  <InkProvider>
    <Pricing01 {...props} />
  </InkProvider>
)
const card = (name: string) => screen.getByRole("article", { name: new RegExp(`^${name}`) })

describe("pricing-01 data", () => {
  it("formats prices the way people say them and gives two months free for a year", () => {
    expect(dollars(1200)).toBe("$12")
    expect(dollars(2667)).toBe("$26.67")
    for (const t of TIERS) expect(t.yearly).toBe(t.monthly * 10)
    expect(perMonth(TIERS[1]!, "yearly")).toBe(1000)
    expect(perMonth(TIERS[2]!, "yearly")).toBe(2667)
    expect(perMonth(TIERS[1]!, "monthly")).toBe(1200)
  })
})

describe("pricing-01 block", () => {
  it("shows three plans, and marks the popular one", () => {
    renderUI(app())
    expect(screen.getByRole("heading", { level: 2, name: "Pick a desk that fits" })).toBeInTheDocument()
    expect(screen.getAllByRole("article")).toHaveLength(3)
    expect(within(card("Studio")).getByText("Most popular")).toBeInTheDocument()
    expect(within(card("Starter")).queryByText("Most popular")).not.toBeInTheDocument()
    expect(within(card("Starter")).getByText("$0")).toBeInTheDocument()
    expect(within(card("Studio")).getByText("$12")).toBeInTheDocument()
    expect(within(card("Workshop")).getByRole("list", { name: "Workshop includes" }).children).toHaveLength(5)
    expect(screen.getByRole("radio", { name: "Monthly" })).toBeChecked()
  })

  it("has no axe violations, on yearly prices and with a question open", async () => {
    const { container, user } = renderUI(app())
    await axeCheck(container)
    await user.click(screen.getByRole("radio", { name: "Yearly" }))
    await user.click(screen.getByRole("button", { name: "Can I change plans later?" }))
    await axeCheck(container)
  })

  it("switches every price to yearly, and says so", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("radio", { name: "Yearly" }))
    expect(within(card("Studio")).getByText("$10")).toBeInTheDocument()
    expect(within(card("Studio")).getByText("billed $120 once a year")).toBeInTheDocument()
    expect(within(card("Workshop")).getByText("$26.67")).toBeInTheDocument()
    expect(screen.getByText(/Showing yearly prices/)).toHaveTextContent("Studio saves you $24 a year")
    await user.click(screen.getByRole("radio", { name: "Yearly" }))
    expect(screen.getByRole("radio", { name: "Yearly" })).toBeChecked()
    await user.click(screen.getByRole("radio", { name: "Monthly" }))
    expect(within(card("Studio")).getByText("$12")).toBeInTheDocument()
  })

  it("starts on the period it is given", () => {
    renderUI(app({ defaultPeriod: "yearly" }))
    expect(within(card("Studio")).getByText("$10")).toBeInTheDocument()
  })

  it("reports the plan and the period that were picked", async () => {
    const onChoose = vi.fn()
    const { user } = renderUI(app({ onChoose }))
    await user.click(screen.getByRole("radio", { name: "Yearly" }))
    await user.click(within(card("Workshop")).getByRole("button", { name: "Get Workshop" }))
    expect(onChoose).toHaveBeenCalledWith(expect.objectContaining({ id: "workshop" }), "yearly")
    expect(within(card("Workshop")).getByRole("button", { name: "Picked" })).toHaveAttribute("aria-pressed", "true")
    expect(within(card("Studio")).getByRole("button", { name: "Get Studio" })).toHaveAttribute("aria-pressed", "false")
  })

  it("answers questions one at a time from the keyboard", async () => {
    const { user } = renderUI(app())
    const first = screen.getByRole("button", { name: "Can I change plans later?" })
    expect(first).toHaveAttribute("aria-expanded", "false")
    first.focus()
    await user.keyboard("{Enter}")
    expect(first).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText(/pay only the difference/)).toBeVisible()
    await user.click(screen.getByRole("button", { name: "What happens if I run out of notebooks?" }))
    expect(first).toHaveAttribute("aria-expanded", "false")
  })

  it("is stable on the server and hydrates cleanly", () => {
    expectDrawnClean(app())
    expectSsrStable(app())
    expectHydrates(<Pricing01 />)
  })
})

describe("pricing-01 docs preview", () => {
  it("lays the block on the desk, has a title and description for the gallery, and is accessible", async () => {
    const { container } = renderUI(<InkProvider><Preview /></InkProvider>)
    expect(container.querySelector("[data-slot=desk]")).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2, name: "Pick a desk that fits" })).toBeInTheDocument()
    expect(meta.title.length).toBeGreaterThan(2)
    expect(meta.description).toMatch(/paper|desk/)
    expect(meta.tags?.length).toBeGreaterThan(1)
    await axeCheck(container)
  })
})
