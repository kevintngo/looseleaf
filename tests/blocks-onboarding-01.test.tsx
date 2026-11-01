import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import Onboarding01 from "@/blocks/onboarding-01/page"
import { STEPS } from "@/blocks/onboarding-01/components/onboarding-01-steps"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk, expectHydrates, expectLogicalClasses, expectSsrStable, headingOutline } from "./_blocks-marketing"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(560, 80)
})
afterEach(() => restore())

const tickAll = async (user: ReturnType<typeof renderUI>["user"], getByRole: ReturnType<typeof renderUI>["getByRole"]) => {
  for (const s of STEPS) {
    const box = getByRole("checkbox", { name: s.title })
    if (box.getAttribute("aria-checked") !== "true") await user.click(box)
  }
}

describe("onboarding-01 block", () => {
  it("is a section named by its h2 with five checkboxes, each described by its hint", () => {
    const { getByRole, container, getAllByRole } = renderUI(<Onboarding01 />)
    expect(getByRole("region", { name: "Let’s get you set up" })).toBeInTheDocument()
    expect(headingOutline(container)).toEqual([[2, "Let’s get you set up"]])
    expect(getAllByRole("checkbox")).toHaveLength(5)
    expect(getByRole("checkbox", { name: "Invite a teammate" })).toHaveAccessibleDescription("Notes are better with company.")
    expect(getByRole("checkbox", { name: "Name your first notebook" })).toBeChecked()
    expect(getByRole("checkbox", { name: "Pin a page you love" })).not.toBeChecked()
  })

  it("the bar, the words and the tally agree: two of five", () => {
    const { getByRole } = renderUI(<Onboarding01 />)
    const bar = getByRole("progressbar", { name: "Setup progress" })
    expect(bar).toHaveAttribute("aria-valuenow", "2")
    expect(bar).toHaveAttribute("aria-valuemax", "5")
    expect(bar).toHaveAttribute("aria-valuetext", "2 of 5 steps done")
    expect(getByRole("status")).toHaveTextContent("2 of 5 done")
    expect(getByRole("img", { name: "2 steps done" })).toBeInTheDocument()
  })

  it("ticking and unticking moves all three, and tells the caller", async () => {
    const onDoneChange = vi.fn()
    const { user, getByRole } = renderUI(<Onboarding01 onDoneChange={onDoneChange} />)
    await user.click(getByRole("checkbox", { name: "Pin a page you love" }))
    expect(getByRole("progressbar", { name: "Setup progress" })).toHaveAttribute("aria-valuenow", "3")
    expect(getByRole("status")).toHaveTextContent("3 of 5 done")
    expect(onDoneChange).toHaveBeenLastCalledWith(["name", "invite", "pin"])
    await user.click(getByRole("checkbox", { name: "Name your first notebook" }))
    expect(getByRole("img", { name: "2 steps done" })).toBeInTheDocument()
    expect(onDoneChange).toHaveBeenLastCalledWith(["invite", "pin"])
  })

  it("can be ticked with the keyboard", async () => {
    const { user, getByRole } = renderUI(<Onboarding01 />)
    getByRole("checkbox", { name: "Try the shortcut" }).focus()
    await user.keyboard(" ")
    expect(getByRole("checkbox", { name: "Try the shortcut" })).toBeChecked()
  })

  it("each step's own button reports which step it is", async () => {
    const onAction = vi.fn()
    const { user, getByRole } = renderUI(<Onboarding01 onAction={onAction} />)
    await user.click(getByRole("button", { name: /^Invite/ }))
    expect(onAction).toHaveBeenCalledWith("invite")
  })

  it("when the last step is ticked: a stamp, a call to action and Stubby celebrates; unticking takes them back", async () => {
    const { user, getByRole, queryByRole, container } = renderUI(<Onboarding01 />)
    expect(queryByRole("img", { name: "All set" })).toBeNull()
    expect(container.querySelector("[data-pose=write]")).not.toBeNull()
    await tickAll(user, getByRole)
    expect(getByRole("img", { name: "All set" })).toBeInTheDocument()
    expect(getByRole("link", { name: "Start writing" })).toHaveAttribute("href", "#write")
    expect(container.querySelector("[data-pose=celebrate]")).not.toBeNull()
    expect(queryByRole("button", { name: "Skip for now" })).toBeNull()
    await user.click(getByRole("checkbox", { name: "Try the shortcut" }))
    expect(queryByRole("img", { name: "All set" })).toBeNull()
    expect(getByRole("button", { name: "Skip for now" })).toBeInTheDocument()
  })

  it("skip folds the card to a link that brings it back with its ticks", async () => {
    const { user, getByRole, queryByRole } = renderUI(<Onboarding01 />)
    await user.click(getByRole("button", { name: "Skip for now" }))
    expect(queryByRole("checkbox")).toBeNull()
    await user.click(getByRole("button", { name: "Show the setup checklist (2 of 5 done)" }))
    expect(getByRole("checkbox", { name: "Invite a teammate" })).toBeChecked()
  })

  it("keeps every drawing decorative and uses logical classes", () => {
    const { container } = renderUI(<Onboarding01 />)
    expectDecorativeInk(container)
    expectLogicalClasses(container)
  })

  it("has no axe violations: partly done, all done, skipped", async () => {
    const { user, container, getByRole } = renderUI(<Onboarding01 />)
    await axeCheck(container)
    await tickAll(user, getByRole)
    await axeCheck(container)
    await user.click(getByRole("checkbox", { name: "Try the shortcut" }))
    await user.click(getByRole("button", { name: "Skip for now" }))
    await axeCheck(container)
  })

  it("renders the same on the server twice and hydrates cleanly", async () => {
    expectSsrStable(<Onboarding01 />)
    await expectHydrates(<Onboarding01 />)
  })
})
