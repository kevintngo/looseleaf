import { afterEach, beforeEach, describe, expect, it } from "vitest"

import AnnouncementBar from "@/blocks/announcement-bar/page"
import EmptyInbox from "@/blocks/empty-inbox/page"
import EmptySearch from "@/blocks/empty-search/page"
import Error404 from "@/blocks/error-404/page"
import Error500 from "@/blocks/error-500/page"
import Onboarding01 from "@/blocks/onboarding-01/page"
import { mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 60)
})
afterEach(() => restore())

const frame = (container: HTMLElement) => container.querySelector("section > div, .\\@container > div")!

describe("taped sheets keep 32 px of desk on a phone", () => {
  it.each([
    ["error-404", <Error404 key="a" />],
    ["error-500", <Error500 key="b" />],
    ["empty-search", <EmptySearch key="c" />],
  ])("%s", (_name, ui) => {
    const { container } = renderUI(ui)
    expect(frame(container)).toHaveClass("px-8")
    expect(frame(container)).not.toHaveClass("px-7")
  })

  it("announcement-bar leaves room above the strip for the tape that hangs over its top edge", () => {
    const { container } = renderUI(<AnnouncementBar />)
    expect(container.querySelector("[data-slot=announcement-bar]")!.parentElement).toHaveClass("pt-6")
  })
})

describe("error-404", () => {
  it("the search box types from the start edge, not from the center of the centered sheet", () => {
    const { getByRole } = renderUI(<Error404 />)
    expect(getByRole("searchbox", { name: "Search the site" })).toHaveClass("text-start")
  })

  it("Stubby stacks under the napkin until there is room for the overlap (no half-width shift when he wraps)", () => {
    const { container } = renderUI(<Error404 />)
    const scene = container.querySelector("[data-slot=error-scene]")!
    expect(scene).toHaveClass("flex-col", "@xl:flex-row")
    expect(scene.querySelector("[data-slot=mascot]")).not.toHaveClass("-ms-6")
  })
})

describe("error-500", () => {
  it("the incident slip reads from the start edge and at 14 px", () => {
    const { getByRole } = renderUI(<Error500 />)
    expect(getByRole("group", { name: "Details for support" })).toHaveClass("text-start", "text-sm")
  })

  it("the exclamation burst is anchored to Stubby, not to the far corner of the sheet", () => {
    const { container } = renderUI(<Error500 />)
    const burst = container.querySelector("[data-slot=error-scene] [data-slot=doodle]")!
    const stubby = container.querySelector("[data-slot=error-scene] [data-slot=mascot]")!
    expect(burst.parentElement).toContainElement(stubby as HTMLElement)
    expect(burst.parentElement).toHaveClass("relative")
  })
})

describe("onboarding-01", () => {
  it("the pencil tally sits next to the count instead of at the far end of the card", () => {
    const { container } = renderUI(<Onboarding01 />)
    const status = container.querySelector("[role=status]")!
    expect(status.parentElement).not.toHaveClass("justify-between")
  })
})

describe("empty states", () => {
  it("empty-inbox: the two buttons keep a gap wider than a hand-drawn overshoot", () => {
    const { getByRole } = renderUI(<EmptyInbox />)
    expect(getByRole("button", { name: "Write a message" }).parentElement).toHaveClass("gap-x-3", "gap-y-3")
  })

  it("empty-search: the suggestions sit apart from the primary button", () => {
    const { getByRole } = renderUI(<EmptySearch />)
    expect(getByRole("button", { name: "Ada" }).parentElement).toHaveClass("mt-2")
  })
})
