import * as React from "react"
import { screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import ProfilePage from "@/blocks/profile-page/page"
import { BADGES, FEED, PROFILE, SHELF, WEEKS } from "@/blocks/profile-page/components/profile-page-data"
import Preview from "@/docs/content/blocks/profile-page"
import meta from "@/docs/content/blocks/profile-page.meta"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDrawnClean, expectHydrates, expectSsrStable } from "./_blocks-apps"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 60)
})
afterEach(() => restore())

const app = (props: React.ComponentProps<typeof ProfilePage> = {}) => (
  <InkProvider>
    <ProfilePage {...props} />
  </InkProvider>
)

describe("profile-page block", () => {
  it("shows the polaroid, the words and the numbers", () => {
    renderUI(app())
    expect(screen.getByRole("heading", { level: 2, name: "Jo Delacroix" })).toBeInTheDocument()
    expect(screen.getByRole("figure")).toHaveTextContent("Jo, at the desk")
    expect(screen.getByText("JD")).toBeInTheDocument()
    expect(screen.getByText(/argument with a dead author/)).toBeInTheDocument()
    expect(screen.getByRole("list", { name: "Writes about" }).children).toHaveLength(PROFILE.topics.length)
    for (const label of ["Pages written", "Notebooks", "Words a day", "Writing streak"]) expect(screen.getByText(label, { selector: "dt" })).toBeInTheDocument()
    expect(screen.getByText("1,284", { selector: "dd" })).toBeInTheDocument()
  })

  it("puts a photo in the polaroid when there is one", () => {
    const { container } = renderUI(app({ profile: { ...PROFILE, photo: "/jo.jpg" } }))
    expect(container.querySelector("img[src='/jo.jpg']")).not.toBeNull()
    expect(screen.queryByText("JD")).not.toBeInTheDocument()
  })

  it("has no axe violations on any tab", async () => {
    const { container, user } = renderUI(app())
    await axeCheck(container)
    await user.click(screen.getByRole("tab", { name: "Notebooks" }))
    await axeCheck(container)
    await user.click(screen.getByRole("tab", { name: "Stickers" }))
    await axeCheck(container)
  })

  it("keeps a tally of pages, week by week, with this week in marker", () => {
    renderUI(app())
    const list = screen.getByRole("list", { name: "Pages written each week" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(WEEKS.length)
    expect(within(list).getByRole("img", { name: "41 pages, Aug 25 to 31" })).toBeInTheDocument()
    expect(within(list).getByText("This week")).toBeInTheDocument()
    expect(screen.getByText("Best week: 41 pages")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "23 days in a row" })).toBeInTheDocument()
  })

  it("lists what happened lately under its day", () => {
    renderUI(app())
    for (const day of ["Today", "Yesterday", "Last week"]) {
      const group = screen.getByRole("group", { name: day })
      expect(within(group).getAllByRole("listitem")).toHaveLength(FEED.filter((e) => e.day === day).length)
    }
    expect(screen.getByText("Finished “Porridge, the slow way”")).toBeInTheDocument()
  })

  it("follows and unfollows, and the count moves with it", async () => {
    const onFollowChange = vi.fn()
    const { user } = renderUI(app({ onFollowChange }))
    expect(screen.getByText("312", { selector: "b" })).toBeInTheDocument()
    const follow = screen.getByRole("button", { name: "Follow" })
    expect(follow).toHaveAttribute("aria-pressed", "false")
    await user.click(follow)
    expect(screen.getByRole("button", { name: "Following" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("313", { selector: "b" })).toBeInTheDocument()
    expect(onFollowChange).toHaveBeenLastCalledWith(true)
    await user.click(screen.getByRole("button", { name: "Following" }))
    expect(screen.getByText("312", { selector: "b" })).toBeInTheDocument()
    expect(onFollowChange).toHaveBeenLastCalledWith(false)
  })

  it("messages through the callback", async () => {
    const onMessage = vi.fn()
    const { user } = renderUI(app({ onMessage }))
    await user.click(screen.getByRole("button", { name: "Message" }))
    expect(onMessage).toHaveBeenCalledTimes(1)
  })

  it("shows the shelf and the stickers, earned and to earn", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("tab", { name: "Notebooks" }))
    const shelf = screen.getByRole("list", { name: "Notebooks" })
    expect(within(shelf).getAllByRole("group")).toHaveLength(SHELF.length)
    expect(within(shelf).getByRole("group", { name: "Recipes notebook" })).toBeInTheDocument()
    expect(within(shelf).getByText("64 pages")).toBeInTheDocument()
    await user.click(screen.getByRole("tab", { name: "Stickers" }))
    const earned = BADGES.filter((b) => b.earned).length
    expect(screen.getByText(`of ${BADGES.length} stickers earned.`).parentElement).toHaveTextContent(`${earned} of ${BADGES.length} stickers earned.`)
    expect(screen.getByText("Earned Sep 2026")).toBeInTheDocument()
    expect(screen.getByText("Mark up 50 lines")).toBeInTheDocument()
  })

  it("moves between the tabs with the arrow keys", async () => {
    const { user } = renderUI(app())
    screen.getByRole("tab", { name: "Activity" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { name: "Notebooks" })).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{ArrowRight}{ArrowRight}")
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true")
  })

  it("is stable on the server and hydrates cleanly", () => {
    expectDrawnClean(app())
    expectSsrStable(app())
    expectHydrates(<ProfilePage />)
  })
})

describe("profile-page docs preview", () => {
  it("lays the block on the desk, has a title and description for the gallery, and is accessible", async () => {
    const { container } = renderUI(<InkProvider><Preview /></InkProvider>)
    expect(container.querySelector("[data-slot=desk]")).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2, name: "Jo Delacroix" })).toBeInTheDocument()
    expect(meta.title.length).toBeGreaterThan(2)
    expect(meta.description).toMatch(/paper|desk/)
    expect(meta.tags?.length).toBeGreaterThan(1)
    await axeCheck(container)
  })
})
