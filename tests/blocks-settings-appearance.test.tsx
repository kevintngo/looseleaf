import * as React from "react"
import { screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import SettingsAppearance from "@/blocks/settings-appearance/page"
import { DEFAULT_APPEARANCE, providerProps, providerSnippet, type Appearance } from "@/blocks/settings-appearance/components/settings-appearance-options"
import Preview from "@/docs/content/blocks/settings-appearance"
import meta from "@/docs/content/blocks/settings-appearance.meta"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDrawnClean, expectHydrates, expectSsrStable } from "./_blocks-apps"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 60)
})
afterEach(() => restore())

const app = (props: React.ComponentProps<typeof SettingsAppearance> = {}) => (
  <InkProvider>
    <SettingsAppearance {...props} />
  </InkProvider>
)
const snippet = () => screen.getByRole("figure", { name: "root.tsx" })

describe("settings-appearance options", () => {
  it("writes only what differs from the defaults", () => {
    expect(providerSnippet(DEFAULT_APPEARANCE)).toContain("<InkProvider>")
    const all: Appearance = { theme: "zine", density: "calm", motion: "reduced", fine: true, paper: "kraft", dir: "rtl" }
    expect(providerSnippet(all)).toContain('<InkProvider theme="zine" density="calm" motion="reduced" tier="hi" dir="rtl">')
    expect(providerProps(all)).toEqual({ density: "calm", motion: "reduced", tier: "hi", dir: "rtl", theme: "zine" })
    expect(providerProps(DEFAULT_APPEARANCE)).toMatchObject({ tier: "lo", theme: undefined })
  })
})

describe("settings-appearance block", () => {
  it("starts on the defaults with a preview and a provider snippet", () => {
    renderUI(app())
    expect(screen.getByRole("heading", { level: 2, name: "Appearance" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /Notebook/ })).toBeChecked()
    expect(screen.getByRole("radio", { name: /Comfortable/ })).toBeChecked()
    expect(screen.getByRole("radio", { name: /Follow my device/ })).toBeChecked()
    expect(screen.getByRole("switch", { name: "Fine ink" })).not.toBeChecked()
    expect(screen.getByRole("region", { name: "Preview" })).toBeInTheDocument()
    expect(snippet()).toHaveTextContent("<InkProvider>")
  })

  it("has no axe violations", async () => {
    const { container, user } = renderUI(app())
    await axeCheck(container)
    await user.click(screen.getByRole("radio", { name: /Calm/ }))
    await axeCheck(container)
  })

  it("themes that have no palette yet cannot be picked", async () => {
    const { user } = renderUI(app())
    const forest = screen.getByRole("radio", { name: /Forest/ })
    expect(forest).toBeDisabled()
    await user.click(forest)
    expect(screen.getByRole("radio", { name: /Notebook/ })).toBeChecked()
  })

  it("puts density, motion, ink detail and direction on the preview and into the snippet", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("radio", { name: /Compact/ }))
    await user.click(screen.getByRole("radio", { name: /Keep it still/ }))
    await user.click(screen.getByRole("switch", { name: "Fine ink" }))
    await user.click(screen.getByRole("radio", { name: "Right to left" }))
    const preview = screen.getByRole("region", { name: "Preview" })
    expect(preview).toHaveAttribute("dir", "rtl")
    const provider = preview.parentElement!
    expect(provider).toHaveAttribute("data-density", "compact")
    expect(provider).toHaveAttribute("data-motion", "reduced")
    expect(snippet()).toHaveTextContent('<InkProvider density="compact" motion="reduced" tier="hi" dir="rtl">')
    expect(document.querySelector("[data-slot=page]")).not.toHaveAttribute("dir", "rtl")
  })

  it("changes the paper of the preview", async () => {
    const { user } = renderUI(app())
    const preview = () => screen.getByRole("region", { name: "Preview" })
    expect(preview().querySelector(".ll-stock-paper")).not.toBeNull()
    await user.click(screen.getByRole("radio", { name: "Graph" }))
    expect(preview().querySelector(".ll-stock-graph")).not.toBeNull()
    await user.click(screen.getByRole("radio", { name: "Graph" }))
    expect(screen.getByRole("radio", { name: "Graph" })).toBeChecked()
  })

  it("puts the preview's controls to work", async () => {
    const { user } = renderUI(app())
    const preview = within(screen.getByRole("region", { name: "Preview" }))
    const share = preview.getByRole("switch", { name: "Share with the club" })
    await user.click(share)
    expect(share).not.toBeChecked()
  })

  it("goes back to the defaults", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("radio", { name: /Calm/ }))
    await user.click(screen.getByRole("button", { name: "Back to the defaults" }))
    expect(screen.getByRole("radio", { name: /Comfortable/ })).toBeChecked()
    expect(snippet()).toHaveTextContent("<InkProvider>")
  })

  it("can be controlled, and reports every change", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(app({ value: DEFAULT_APPEARANCE, onValueChange }))
    await user.click(screen.getByRole("radio", { name: /Calm/ }))
    expect(onValueChange).toHaveBeenCalledWith({ ...DEFAULT_APPEARANCE, density: "calm" })
    expect(screen.getByRole("radio", { name: /Comfortable/ })).toBeChecked()
  })

  it("is stable on the server and hydrates cleanly", () => {
    expectDrawnClean(app())
    expectSsrStable(app())
    expectHydrates(<SettingsAppearance />)
  })
})

describe("settings-appearance docs preview", () => {
  it("lays the block on the desk, has a title and description for the gallery, and is accessible", async () => {
    const { container } = renderUI(<InkProvider><Preview /></InkProvider>)
    expect(container.querySelector("[data-slot=desk]")).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2, name: "Appearance" })).toBeInTheDocument()
    expect(meta.title.length).toBeGreaterThan(2)
    expect(meta.description).toMatch(/paper|desk/)
    expect(meta.tags?.length).toBeGreaterThan(1)
    await axeCheck(container)
  })
})
