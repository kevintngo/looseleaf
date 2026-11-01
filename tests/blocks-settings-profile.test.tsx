import * as React from "react"
import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import SettingsProfile from "@/blocks/settings-profile/page"
import { DEFAULT_PROFILE, profileSchema, type ProfileValues } from "@/blocks/settings-profile/components/settings-profile-schema"
import Preview from "@/docs/content/blocks/settings-profile"
import meta from "@/docs/content/blocks/settings-profile.meta"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDrawnClean, expectHydrates, expectSsrStable } from "./_blocks-apps"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 60)
})
afterEach(() => restore())

const app = (props: React.ComponentProps<typeof SettingsProfile> = {}) => (
  <InkProvider>
    <SettingsProfile onSave={async () => {}} {...props} />
  </InkProvider>
)

describe("settings-profile schema", () => {
  it("accepts the sample profile and explains what is wrong with the rest", () => {
    expect(profileSchema.safeParse(DEFAULT_PROFILE).success).toBe(true)
    const bad = profileSchema.safeParse({ ...DEFAULT_PROFILE, name: "J", username: "ada", email: "nope", website: "example.com", bio: "x".repeat(161) })
    expect(bad.success).toBe(false)
    const messages = bad.error!.issues.map((i) => i.message)
    expect(messages).toContain("Your name needs at least 2 letters.")
    expect(messages).toContain("That username is taken. Try another.")
    expect(messages).toContain("Enter an address like ada@notes.dev.")
    expect(messages).toContain("Start with https:// so the link works.")
    expect(messages).toContain("Bios are 160 characters or fewer.")
  })
})

describe("settings-profile block", () => {
  it("shows the form filled in and the preview card", () => {
    renderUI(app())
    expect(screen.getByRole("heading", { level: 2, name: "Profile" })).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Jo Delacroix")
    expect(screen.getByRole("textbox", { name: "Username" })).toHaveValue("jo_writes")
    expect(screen.getByRole("switch", { name: "Show me in search" })).toBeChecked()
    const card = screen.getByRole("group", { name: "Preview of your profile card" })
    expect(within(card).getByText("Jo Delacroix", { selector: "[data-slot=index-card-title]" })).toBeInTheDocument()
    expect(within(card).getByText(/@jo_writes/)).toBeInTheDocument()
  })

  it("has no axe violations, also with errors showing", async () => {
    const { container, user } = renderUI(app())
    await axeCheck(container)
    await user.clear(screen.getByRole("textbox", { name: "Name" }))
    await user.click(screen.getByRole("button", { name: "Save changes" }))
    expect(await screen.findByText("Your name needs at least 2 letters.")).toBeInTheDocument()
    await axeCheck(container)
  })

  it("updates the card as you type", async () => {
    const { user } = renderUI(app())
    const name = screen.getByRole("textbox", { name: "Name" })
    await user.clear(name)
    await user.type(name, "Ada Lovelace")
    const card = screen.getByRole("group", { name: "Preview of your profile card" })
    expect(within(card).getByText("Ada Lovelace", { selector: "[data-slot=index-card-title]" })).toBeInTheDocument()
    await user.click(screen.getByRole("switch", { name: "Show me in search" }))
    expect(within(card).getByText("not in search")).toBeInTheDocument()
  })

  it("writes each rule under its field and puts the keyboard on the first mistake", async () => {
    const { user } = renderUI(app())
    const name = screen.getByRole("textbox", { name: "Name" })
    await user.clear(name)
    await user.type(name, "J")
    const username = screen.getByRole("textbox", { name: "Username" })
    await user.clear(username)
    await user.type(username, "Ada")
    await user.clear(screen.getByRole("textbox", { name: "Email" }))
    await user.type(screen.getByRole("textbox", { name: "Email" }), "ada")
    await user.clear(screen.getByRole("textbox", { name: "Website" }))
    await user.type(screen.getByRole("textbox", { name: "Website" }), "ada.dev")
    await user.click(screen.getByRole("button", { name: "Save changes" }))
    expect(await screen.findByText("Your name needs at least 2 letters.")).toBeInTheDocument()
    expect(screen.getByText("That username is taken. Try another.")).toBeInTheDocument()
    expect(screen.getByText("Enter an address like ada@notes.dev.")).toBeInTheDocument()
    expect(screen.getByText("Start with https:// so the link works.")).toBeInTheDocument()
    expect(name).toHaveAttribute("aria-invalid", "true")
    expect(name).toHaveFocus()
    expect(screen.queryByText(/Saved\./)).not.toBeInTheDocument()
  })

  it("counts the bio and turns the counter red past the limit", async () => {
    const { user } = renderUI(app())
    const bio = screen.getByRole("textbox", { name: "Bio" })
    expect(screen.getByText(/\/160/)).toBeInTheDocument()
    await user.clear(bio)
    await user.click(bio)
    await user.paste("x".repeat(170))
    expect(screen.getByText("170/160")).toHaveClass("text-red")
    await user.tab()
    expect(await screen.findByText("Bios are 160 characters or fewer.")).toBeInTheDocument()
  })

  it("saves, says so once, and asks again after the next change", async () => {
    const onSave = vi.fn(async (_values: ProfileValues) => {})
    const { user } = renderUI(app({ onSave }))
    await user.type(screen.getByRole("textbox", { name: "Bio" }), " Twelve notebooks.")
    expect(screen.getByRole("button", { name: "Undo changes" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Save changes" }))
    await waitFor(() => expect(screen.getByText("Saved. Your card is up to date.")).toBeInTheDocument())
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave.mock.calls[0]![0]).toMatchObject({ username: "jo_writes", bio: expect.stringContaining("Twelve notebooks.") })
    expect(screen.queryByRole("button", { name: "Undo changes" })).not.toBeInTheDocument()
    await user.type(screen.getByRole("textbox", { name: "Name" }), "!")
    expect(screen.queryByText("Saved. Your card is up to date.")).not.toBeInTheDocument()
  })

  it("undoes changes back to what was saved", async () => {
    const { user } = renderUI(app())
    const name = screen.getByRole("textbox", { name: "Name" })
    await user.type(name, " Jr")
    await user.click(screen.getByRole("button", { name: "Undo changes" }))
    expect(name).toHaveValue("Jo Delacroix")
  })

  it("takes a photo, refuses a big or wrong file, and lets you remove it", async () => {
    const create = vi.fn(() => "blob:photo")
    const revoke = vi.fn()
    const url = URL as unknown as { createObjectURL: unknown; revokeObjectURL: unknown }
    const before = [url.createObjectURL, url.revokeObjectURL]
    url.createObjectURL = create
    url.revokeObjectURL = revoke
    try {
      const { user, container } = renderUI(app())
      const file = container.querySelector("input[type=file]") as HTMLInputElement
      await user.upload(file, new File(["x"], "face.png", { type: "image/png" }))
      expect(create).toHaveBeenCalled()
      expect(screen.getByRole("button", { name: "Choose another" })).toBeInTheDocument()
      await user.click(screen.getByRole("button", { name: "Remove" }))
      expect(screen.getByRole("button", { name: "Upload a photo" })).toBeInTheDocument()
      expect(revoke).toHaveBeenCalledWith("blob:photo")
      const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "huge.png", { type: "image/png" })
      await user.upload(file, big)
      expect(screen.getByRole("alert")).toHaveTextContent("over 2 MB")
      fireEvent.change(file, { target: { files: [new File(["x"], "notes.txt", { type: "text/plain" })] } })
      expect(screen.getByRole("alert")).toHaveTextContent("Choose an image")
    } finally {
      url.createObjectURL = before[0]
      url.revokeObjectURL = before[1]
    }
  })

  it("is stable on the server and hydrates cleanly", () => {
    expectDrawnClean(app())
    expectSsrStable(app())
    expectHydrates(<SettingsProfile />)
  })
})

describe("settings-profile docs preview", () => {
  it("lays the block on the desk, has a title and description for the gallery, and is accessible", async () => {
    const { container } = renderUI(<InkProvider><Preview /></InkProvider>)
    expect(container.querySelector("[data-slot=desk]")).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2, name: "Profile" })).toBeInTheDocument()
    expect(meta.title.length).toBeGreaterThan(2)
    expect(meta.description).toMatch(/paper|desk/)
    expect(meta.tags?.length).toBeGreaterThan(1)
    await axeCheck(container)
  })
})
