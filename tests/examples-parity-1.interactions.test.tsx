import * as React from "react"
import { cleanup, screen, within, act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"

const mods = import.meta.glob("/src/docs/examples/*/5[0-9]-*.tsx", { eager: true }) as Record<string, { default: React.ComponentType; meta: { title: string } }>

let restore = () => {}
beforeEach(() => {
  restore = mockBox(120, 36)
})
afterEach(() => {
  restore()
  cleanup()
})

function ex(slug: string, name: string) {
  const key = Object.keys(mods).find((k) => k.includes(`/${slug}/${name}`))
  if (!key) throw new Error("no example " + slug + name)
  return mods[key].default
}
function mount(C: React.ComponentType) {
  return renderUI(
    <InkProvider>
      <C />
    </InkProvider>,
    { user: { pointerEventsCheck: 0 } }
  )
}

describe("interactions", () => {
  test("alert-dialog open", async () => {
    const { user, container } = mount(ex("alert-dialog", "50-"))
    await user.click(screen.getByRole("button", { name: "Show dialog" }))
    expect(await screen.findByRole("alertdialog")).toBeTruthy()
    await axeCheck()
    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.queryByRole("alertdialog")).toBeNull()
    void container
  })
  test("breadcrumb dropdown", async () => {
    const { user } = mount(ex("breadcrumb", "50-"))
    await user.click(screen.getByRole("button", { name: /Components/ }))
    expect(await screen.findByRole("menuitem", { name: "Themes" })).toBeTruthy()
    await axeCheck()
  })
  test("breadcrumb router link", async () => {
    const { user } = mount(ex("breadcrumb", "52-"))
    expect(screen.getByRole("status").textContent).toContain("/docs/components/breadcrumb")
    await user.click(screen.getByRole("button", { name: "Open Card" }))
    expect(screen.getByRole("status").textContent).toContain("/docs/components/card")
    await user.click(screen.getByRole("link", { name: "Components" }))
    expect(screen.getByRole("status").textContent).toContain("path: /docs/components")
    expect(document.querySelector("[aria-current=page]")?.textContent).toBe("Components")
    await axeCheck()
  })
  for (const desktop of [true, false]) {
    test(`breadcrumb responsive desktop=${desktop}`, async () => {
      const mm = window.matchMedia
      window.matchMedia = ((q: string) => ({ matches: desktop, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as never
      try {
        const { user } = mount(ex("breadcrumb", "53-"))
        await user.click(screen.getByRole("button", { name: "Toggle menu" }))
        if (desktop) expect(await screen.findByRole("menuitem", { name: "Documentation" })).toBeTruthy()
        else expect(await screen.findByRole("dialog")).toBeTruthy()
        await axeCheck()
      } finally {
        window.matchMedia = mm
      }
    })
    test(`combobox responsive desktop=${desktop}`, async () => {
      const mm = window.matchMedia
      window.matchMedia = ((q: string) => ({ matches: desktop, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as never
      try {
        const { user } = mount(ex("combobox", "52-"))
        await user.click(screen.getByRole("combobox", { name: "Status" }))
        await screen.findByPlaceholderText("Filter status...")
        await axeCheck(document.body, { rules: { "aria-required-children": { enabled: false } } })
        await user.click(screen.getByText("Done"))
        expect(screen.getByRole("combobox", { name: "Status" }).textContent).toContain("Done")
      } finally {
        window.matchMedia = mm
      }
    })
  }
  test("button loading", async () => {
    const { user } = mount(ex("button", "50-"))
    await user.click(screen.getByRole("button", { name: "Send the letter" }))
    expect(screen.getByRole("button", { name: /Sending/ })).toHaveAttribute("aria-disabled", "true")
  })
  test("button-group mail toolbar", async () => {
    const { user } = mount(ex("button-group", "50-"))
    await user.click(screen.getByRole("button", { name: "More options" }))
    expect(await screen.findByRole("menuitem", { name: /Mark as read/ })).toBeTruthy()
    await axeCheck()
    await user.click(screen.getByRole("menuitem", { name: /Label as/ }))
    expect(await screen.findByRole("menuitemradio", { name: "Work" })).toBeTruthy()
    await axeCheck()
  })
  test("button-group pagination", async () => {
    const { user } = mount(ex("button-group", "51-"))
    await user.click(screen.getByRole("button", { name: "Next page" }))
    expect(screen.getByRole("status").textContent).toContain("Page 3 of 5")
    expect(screen.getByRole("button", { name: "Page 3" }).getAttribute("aria-current")).toBe("page")
  })
  test("button-group follow menu", async () => {
    const { user } = mount(ex("button-group", "53-"))
    await user.click(screen.getByRole("button", { name: "Follow" }))
    expect(screen.getByRole("button", { name: "Following" }).getAttribute("aria-pressed")).toBe("true")
    await user.click(screen.getByRole("button", { name: "More conversation actions" }))
    expect(await screen.findByRole("menuitem", { name: /Delete conversation/ })).toBeTruthy()
    await axeCheck()
  })
  test("button-group currency", async () => {
    const { user } = mount(ex("button-group", "54-"))
    await user.click(screen.getByRole("combobox", { name: "Currency" }))
    await user.click(await screen.findByRole("option", { name: /Euro/ }))
    expect(screen.getByRole("combobox", { name: "Currency" }).textContent).toContain("€")
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(screen.getByRole("status").textContent).toBe("Sent €10.00")
  })
  test("button-group popover", async () => {
    const { user } = mount(ex("button-group", "55-"))
    await user.click(screen.getByRole("button", { name: "Open the task popover" }))
    expect(await screen.findByRole("dialog", { name: "Agent tasks" })).toBeTruthy()
    await axeCheck()
  })
  test("button-group composer", async () => {
    const { user } = mount(ex("button-group", "56-"))
    const voice = screen.getByRole("button", { name: "Voice mode" })
    await user.click(voice)
    expect(voice.getAttribute("aria-pressed")).toBe("true")
    expect((screen.getByLabelText("Message") as HTMLInputElement).disabled).toBe(true)
    await axeCheck()
  })
  test("card create", async () => {
    const { user } = mount(ex("card", "51-"))
    await user.type(screen.getByLabelText("Name"), "Atlas")
    await user.click(screen.getByRole("button", { name: "Deploy" }))
    expect(screen.getByRole("status").textContent).toContain('Deploying "Atlas"')
    await user.click(screen.getByRole("combobox", { name: "Framework" }))
    await user.click(await screen.findByRole("option", { name: "Astro" }))
    await user.click(screen.getByRole("button", { name: "Deploy" }))
    expect(screen.getByRole("status").textContent).toContain("astro")
  })
  test("alert session", async () => {
    const { user } = mount(ex("alert", "51-"))
    await user.click(screen.getByRole("button", { name: "Log in again" }))
    expect(screen.getByText("Signed in")).toBeTruthy()
  })
  test("carousel autoplay toggle", async () => {
    const { user } = mount(ex("carousel", "52-"))
    const b = screen.getByRole("button", { name: "Pause autoplay" })
    await user.click(b)
    expect(screen.getByRole("button", { name: "Play autoplay" })).toBeTruthy()
    await axeCheck()
  })
  test("combobox menu with labels", async () => {
    const { user } = mount(ex("combobox", "50-"))
    await user.click(screen.getByRole("button", { name: "Task actions" }))
    const sub = await screen.findByRole("menuitem", { name: "Apply label" })
    await user.click(sub)
    await screen.findByPlaceholderText("Filter label...")
    await user.keyboard("des")
    expect(screen.getByRole("option", { name: "design" })).toBeTruthy()
    expect(screen.queryByRole("option", { name: "bug" })).toBeNull()
    await user.keyboard("{Enter}")
    expect(screen.queryByRole("menu")).toBeNull()
    expect(document.querySelector("[data-slot=badge]")?.textContent).toBe("design")
  })
  test("combobox popover", async () => {
    const { user } = mount(ex("combobox", "51-"))
    await user.click(screen.getByRole("combobox", { name: "Status" }))
    await user.click(await screen.findByText("Backlog"))
    expect(screen.getByRole("combobox", { name: "Status" }).textContent).toBe("Backlog")
  })
  test("checkbox cards toggle", async () => {
    const { user } = mount(ex("checkbox", "51-"))
    const cb = screen.getByRole("checkbox", { name: /Weekly digest/ })
    await user.click(cb)
    expect(cb.getAttribute("aria-checked")).toBe("true")
    await axeCheck()
  })
})
void within
void act
void vi
