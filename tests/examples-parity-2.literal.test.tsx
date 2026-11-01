import * as React from "react"
import { screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test } from "vitest"

import { axeCheck, mockBox, renderUI } from "./helpers"

import DialogDemo from "./_official-parity-2/dialog-demo"
import DdDemo from "./_official-parity-2/dropdown-menu-demo"
import OtpPattern from "./_official-parity-2/input-otp-pattern"
import OtpDemo from "./_official-parity-2/input-otp-demo"
import HoverDemo from "./_official-parity-2/hover-card-demo"
import ItemImageLiteral from "./_official-parity-2/item-image-literal"

let restore = () => {}
beforeEach(() => { restore = mockBox(120, 36) })
afterEach(() => restore())
const noCheck = { user: { pointerEventsCheck: 0 } } as const

describe("official JSX, unchanged but for the import path", () => {
  test("dialog-demo (Dialog > form > Trigger + Content)", async () => {
    const { user } = renderUI(<DialogDemo />, noCheck)
    await user.click(screen.getByRole("button", { name: "Open Dialog" }))
    expect(await screen.findByRole("dialog", { name: "Edit profile" })).toBeInTheDocument()
    expect(screen.getByLabelText("Name")).toHaveValue("Pedro Duarte")
    await axeCheck()
  })
  test("dropdown-menu-demo (with DropdownMenuPortal round the sub content)", async () => {
    const { user } = renderUI(<DdDemo />, noCheck)
    await user.click(screen.getByRole("button", { name: "Open" }))
    await user.click(await screen.findByRole("menuitem", { name: /Invite users/ }))
    expect(await screen.findByRole("menuitem", { name: "Email" })).toBeInTheDocument()
  })
  test("input-otp-pattern imports the regex from input-otp", async () => {
    const { container } = renderUI(<OtpPattern />)
    expect(container.querySelector("input")).toBeTruthy()
  })
  test("input-otp-demo", async () => {
    const { container } = renderUI(<OtpDemo />)
    expect(container.querySelectorAll("[data-slot=input-otp-slot]").length).toBe(6)
  })
  test("hover-card-demo with a remote avatar image", async () => {
    const { user } = renderUI(<HoverDemo />, noCheck)
    await user.hover(screen.getByRole("button", { name: "@nextjs" }))
    expect(await screen.findByText("Joined December 2021", {}, { timeout: 3000 })).toBeInTheDocument()
  })
  test("item-image with role=listitem on the asChild row: axe is clean", async () => {
    const { container } = renderUI(<ItemImageLiteral />)
    await axeCheck(container)
  })
})
