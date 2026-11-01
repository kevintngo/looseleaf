import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import AnnouncementBar from "@/blocks/announcement-bar/page"
import { AnnouncementBarStrip } from "@/blocks/announcement-bar/components/announcement-bar-strip"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(900, 56)
})
afterEach(() => restore())

describe("announcement-bar block", () => {
  it("is a labeled region with the news, a link and a dismiss button", () => {
    const { getByRole } = renderUI(<AnnouncementBar />)
    const region = getByRole("region", { name: "Announcement" })
    expect(region).toHaveTextContent("Penmark 2.0 is here")
    expect(region).toHaveTextContent("New")
    expect(getByRole("link", { name: "Read the notes" })).toHaveAttribute("href", "#notes")
    expect(getByRole("button", { name: "Dismiss announcement" })).toBeInTheDocument()
  })

  it("hides when dismissed and comes back on request", async () => {
    const { user, getByRole, queryByRole } = renderUI(<AnnouncementBar />)
    await user.click(getByRole("button", { name: "Dismiss announcement" }))
    expect(queryByRole("region", { name: "Announcement" })).toBeNull()
    await user.click(getByRole("button", { name: "Bring the announcement back" }))
    expect(getByRole("region", { name: "Announcement" })).toBeInTheDocument()
  })

  it("is reachable by keyboard: link, then dismiss", async () => {
    const { user, getByRole } = renderUI(<AnnouncementBar />)
    await user.tab()
    expect(getByRole("link", { name: "Read the notes" })).toHaveFocus()
    await user.tab()
    expect(getByRole("button", { name: "Dismiss announcement" })).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(getByRole("button", { name: "Bring the announcement back" })).toBeInTheDocument()
  })

  it("the strip alone has no dismiss button unless it is given a handler", () => {
    const { queryByRole } = renderUI(<AnnouncementBarStrip message="Hello" />)
    expect(queryByRole("button", { name: "Dismiss announcement" })).toBeNull()
  })

  it("keeps the decoration out of the accessibility tree", () => {
    const { container } = renderUI(<AnnouncementBar />)
    for (const svg of Array.from(container.querySelectorAll("svg[data-ink]"))) expect(svg.closest("[aria-hidden=true]") ?? svg.getAttribute("aria-hidden")).toBeTruthy()
  })

  it("has no axe violations, open or dismissed", async () => {
    const { user, container, getByRole } = renderUI(<AnnouncementBar />)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Dismiss announcement" }))
    await axeCheck(container)
  })

  it("renders the same on the server twice", () => {
    expect(renderToString(<AnnouncementBar />)).toBe(renderToString(<AnnouncementBar />))
  })
})
