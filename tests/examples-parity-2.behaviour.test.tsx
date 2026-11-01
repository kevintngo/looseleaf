import * as React from "react"
import { act, screen, waitFor, within, fireEvent } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test } from "vitest"

import { axeCheck, mockBox, renderUI } from "./helpers"

import DialogClose from "@/docs/examples/dialog/50-close-button"
import DdCheckboxes from "@/docs/examples/dropdown-menu/50-checkboxes"
import DdRadio from "@/docs/examples/dropdown-menu/51-radio-group"
import DdDialog from "@/docs/examples/dropdown-menu/52-dialog"
import FormDemo from "@/docs/examples/form/50-rhf-demo"
import FormArray from "@/docs/examples/form/57-rhf-array"
import FormComplex from "@/docs/examples/form/58-rhf-complex"
import FormPassword from "@/docs/examples/form/59-rhf-password"
import FormSwitch from "@/docs/examples/form/54-rhf-switch"
import FormCheckbox from "@/docs/examples/form/53-rhf-checkbox"
import FormRadio from "@/docs/examples/form/56-rhf-radiogroup"
import FormSelect from "@/docs/examples/form/52-rhf-select"
import FieldSlider from "@/docs/examples/field/57-slider"
import IGButton from "@/docs/examples/input-group/54-button"
import IGDemo from "@/docs/examples/input-group/50-demo"
import IGTooltip from "@/docs/examples/input-group/53-tooltip"
import OtpControlled from "@/docs/examples/input-otp/53-controlled"
import KbdTooltip from "@/docs/examples/kbd/51-tooltip"
import NavDemo from "@/docs/examples/navigation-menu/50-demo"
import MenubarDemo from "@/docs/examples/menubar/50-demo"
import HoverDemo from "@/docs/examples/hover-card/50-demo"
import ScrollerDemo from "@/docs/examples/message-scroller/50-demo"
import ScrollerAnchoring from "@/docs/examples/message-scroller/55-anchoring"
import ScrollerGroup from "@/docs/examples/message-scroller/57-group-chat"
import ScrollerOpening from "@/docs/examples/message-scroller/54-opening-position"
import ScrollerCommands from "@/docs/examples/message-scroller/53-commands"
import ScrollerPrev from "@/docs/examples/message-scroller/56-previous-context"
import MarkerLink from "@/docs/examples/marker/57-link-button"
import ItemDropdown from "@/docs/examples/item/58-dropdown"
import FieldSelect from "@/docs/examples/field/58-select"

document.elementFromPoint ??= () => null

let restore = () => {}
beforeEach(() => {
  restore = mockBox(120, 36)
})
afterEach(() => restore())

const noCheck = { user: { pointerEventsCheck: 0 } } as const

describe("dialog", () => {
  test("close button example opens and the footer Close closes it", async () => {
    const { user } = renderUI(<DialogClose />, noCheck)
    await user.click(screen.getByRole("button", { name: "Share" }))
    const dialog = await screen.findByRole("dialog", { name: "Share link" })
    expect(within(dialog).getByRole("textbox", { name: "Link" })).toHaveAttribute("readonly")
    const closers = within(dialog).getAllByRole("button", { name: "Close" })
    await user.click(closers[closers.length - 1])
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await axeCheck()
  })
})

describe("dropdown-menu", () => {
  test("checkboxes: ticking toggles, the disabled row stays", async () => {
    const { user } = renderUI(<DdCheckboxes />, noCheck)
    await user.click(screen.getByRole("button", { name: "Open" }))
    const status = await screen.findByRole("menuitemcheckbox", { name: "Status Bar" })
    expect(status).toHaveAttribute("aria-checked", "true")
    await user.click(status)
    await user.click(screen.getByRole("button", { name: "Open" }))
    expect(await screen.findByRole("menuitemcheckbox", { name: "Status Bar" })).toHaveAttribute("aria-checked", "false")
    expect(screen.getByRole("menuitemcheckbox", { name: "Activity Bar" })).toHaveAttribute("aria-disabled", "true")
  })
  test("radio group: choose Top", async () => {
    const { user } = renderUI(<DdRadio />, noCheck)
    await user.click(screen.getByRole("button", { name: "Open" }))
    expect(await screen.findByRole("menuitemradio", { name: "Bottom" })).toHaveAttribute("aria-checked", "true")
    await user.click(screen.getByRole("menuitemradio", { name: "Top" }))
    await user.click(screen.getByRole("button", { name: "Open" }))
    expect(await screen.findByRole("menuitemradio", { name: "Top" })).toHaveAttribute("aria-checked", "true")
  })
  test("menu opens dialogs", async () => {
    const { user } = renderUI(<DdDialog />, noCheck)
    await user.click(screen.getByRole("button", { name: "Open menu" }))
    await user.click(await screen.findByRole("menuitem", { name: "New File..." }))
    const dialog = await screen.findByRole("dialog", { name: "Create New File" })
    expect(within(dialog).getByLabelText("File Name")).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await user.click(screen.getByRole("button", { name: "Open menu" }))
    await user.click(await screen.findByRole("menuitem", { name: "Share..." }))
    const share = await screen.findByRole("dialog", { name: "Share File" })
    expect(within(share).getByLabelText("Email Address")).toBeInTheDocument()
    expect(within(share).getByLabelText("Message (Optional)")).toBeInTheDocument()
  })
})

describe("forms", () => {
  test("bug report: errors then submit", async () => {
    const { user, container } = renderUI(<FormDemo />, noCheck)
    await user.click(screen.getByRole("button", { name: "Submit" }))
    expect(await screen.findByText("Bug title must be at least 5 characters.")).toBeInTheDocument()
    expect(screen.getByLabelText("Bug Title")).toHaveAttribute("aria-invalid", "true")
    await user.type(screen.getByLabelText("Bug Title"), "Login is broken")
    await user.type(screen.getByLabelText("Description"), "The login button does nothing on mobile Safari.")
    await user.click(screen.getByRole("button", { name: "Submit" }))
    await waitFor(() => expect(document.body.textContent).toContain("You submitted the following values:"))
    expect(document.body.textContent).toContain("Login is broken")
    await axeCheck(container)
  })
  test("array: add and remove", async () => {
    const { user } = renderUI(<FormArray />, noCheck)
    expect(screen.getAllByRole("textbox")).toHaveLength(2)
    await user.click(screen.getByRole("button", { name: "Add Email Address" }))
    expect(screen.getAllByRole("textbox")).toHaveLength(3)
    await user.click(screen.getByRole("button", { name: "Remove email 1" }))
    expect(screen.getAllByRole("textbox")).toHaveLength(2)
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect((await screen.findAllByText("Enter a valid email address.")).length).toBeGreaterThan(0)
  })
  test("complex: errors for the empty billing period and add-ons", async () => {
    const { user } = renderUI(<FormComplex />, noCheck)
    await user.click(screen.getByRole("button", { name: "Save Preferences" }))
    expect(await screen.findByText("Please select a billing period")).toBeInTheDocument()
    expect(screen.getByText("Please select at least one add-on")).toBeInTheDocument()
    await user.click(screen.getByRole("checkbox", { name: /Analytics/ }))
    await waitFor(() => expect(screen.queryByText("Please select at least one add-on")).toBeNull())
  })
  test("password: strength and checklist", async () => {
    const { user } = renderUI(<FormPassword />, noCheck)
    expect(screen.getByRole("progressbar", { name: "Password strength" })).toHaveAttribute("aria-valuenow", "0")
    await user.type(screen.getByLabelText("Password"), "Abcdef1!")
    await waitFor(() => expect(screen.getByRole("progressbar", { name: "Password strength" })).toHaveAttribute("aria-valuenow", "100"))
  })
  test("switch: refuses off", async () => {
    const { user } = renderUI(<FormSwitch />, noCheck)
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(await screen.findByText("It is highly recommended to enable two-factor authentication.")).toBeInTheDocument()
    expect(screen.getByRole("switch")).toHaveAttribute("aria-invalid", "true")
  })
  test("checkbox: needs a task", async () => {
    const { user } = renderUI(<FormCheckbox />, noCheck)
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(await screen.findByText("Please select at least one notification type.")).toBeInTheDocument()
    await user.click(screen.getByRole("checkbox", { name: "Email notifications" }))
    await waitFor(() => expect(screen.queryByText("Please select at least one notification type.")).toBeNull())
  })
  test("radiogroup: needs a plan", async () => {
    const { user } = renderUI(<FormRadio />, noCheck)
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(await screen.findByText("You must select a subscription plan to continue.")).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: /Pro/ }))
    await waitFor(() => expect(screen.queryByText("You must select a subscription plan to continue.")).toBeNull())
  })
  test("select: needs a language", async () => {
    const { user } = renderUI(<FormSelect />, noCheck)
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(await screen.findByText("Please select your spoken language.")).toBeInTheDocument()
  })
})

describe("field/slider", () => {
  test("two thumbs read out", () => {
    renderUI(<FieldSlider />)
    expect(screen.getAllByRole("slider")).toHaveLength(2)
    expect(screen.getByText("200")).toBeInTheDocument()
    expect(screen.getByText("800")).toBeInTheDocument()
  })
})

describe("field/select", () => {
  test("label opens the select", async () => {
    const { user } = renderUI(<FieldSelect />, noCheck)
    expect(screen.getByLabelText("Department")).toBe(screen.getByRole("combobox"))
    await user.click(screen.getByRole("combobox"))
    expect(await screen.findByRole("option", { name: "Design" })).toBeInTheDocument()
  })
})

describe("input-group", () => {
  test("buttons: favourite toggles and copy ticks", async () => {
    const { user } = renderUI(<IGButton />, noCheck)
    const star = screen.getByRole("button", { name: "Favorite" })
    expect(star).toHaveAttribute("aria-pressed", "false")
    await user.click(star)
    expect(star).toHaveAttribute("aria-pressed", "true")
    await user.click(screen.getByRole("button", { name: "Copy" }))
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument()
  })
  test("buttons: the info popover opens from the leading addon", async () => {
    const { user } = renderUI(<IGButton />, noCheck)
    await user.click(screen.getByRole("button", { name: "Connection details" }))
    expect(await screen.findByText("Your connection is not secure.")).toBeInTheDocument()
  })
  test("demo renders every group", () => {
    renderUI(<IGDemo />)
    expect(screen.getByRole("textbox", { name: "Search" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
  })
  test("tooltips: hover opens the note", async () => {
    const { user } = renderUI(<IGTooltip />, noCheck)
    await user.hover(screen.getAllByRole("button", { name: "Info" })[0])
    expect((await screen.findAllByText("Password must be at least 8 characters")).length).toBeGreaterThan(0)
  })
})

describe("input-otp", () => {
  test("controlled echoes the code", async () => {
    const { user } = renderUI(<OtpControlled />)
    expect(screen.getByText("Enter your one-time password.")).toBeInTheDocument()
    await user.click(screen.getByLabelText("One-time password"))
    await user.keyboard("123")
    expect(await screen.findByText("You entered: 123")).toBeInTheDocument()
  })
})

describe("kbd", () => {
  test("tooltip shows the shortcut on focus", async () => {
    const { user } = renderUI(<KbdTooltip />, noCheck)
    await user.tab()
    expect((await screen.findAllByText(/Save Changes/)).length).toBeGreaterThan(0)
  })
})

describe("navigation-menu / menubar / hover-card demos", () => {
  test("nav: Home opens the featured panel", async () => {
    const { user } = renderUI(<NavDemo />, noCheck)
    await user.click(screen.getByRole("button", { name: /Home/ }))
    expect(await screen.findByRole("link", { name: /Introduction/ })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Docs" })).toBeInTheDocument()
  })
  test("menubar: File menu and the fixed radio", async () => {
    const { user } = renderUI(<MenubarDemo />, noCheck)
    await user.click(screen.getByRole("menuitem", { name: "Profiles" }))
    expect(await screen.findByRole("menuitemradio", { name: "Benoit" })).toHaveAttribute("aria-checked", "true")
  })
  test("hover-card: opens with plain content", async () => {
    const { user } = renderUI(<HoverDemo />, noCheck)
    await user.hover(screen.getByRole("button", { name: "@nextjs" }))
    expect(await screen.findByText("Joined December 2021", {}, { timeout: 3000 })).toBeInTheDocument()
  })
})

describe("item dropdown", () => {
  test("menu rows are items", async () => {
    const { user } = renderUI(<ItemDropdown />, noCheck)
    await user.click(screen.getByRole("button", { name: /Select/ }))
    expect(await screen.findAllByRole("menuitem")).toHaveLength(3)
  })
})

describe("marker link/button", () => {
  test("button marker toasts", async () => {
    const { user } = renderUI(<MarkerLink />, noCheck)
    expect(screen.getByRole("link", { name: "View the pull request" })).toHaveAttribute("href", "#links-and-buttons")
    await user.click(screen.getByRole("button", { name: "Revert this change" }))
    await waitFor(() => expect(document.body.textContent).toContain("You clicked the revert button"))
  })
})

describe("message-scroller", () => {
  test("demo: send streams a reply", async () => {
    const { user, container } = renderUI(<ScrollerDemo />, noCheck)
    expect(screen.getByText("Morning, Ada!")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Send" }))
    await waitFor(() => expect(container.textContent).toContain("driving me nuts"))
    await waitFor(() => expect(container.textContent).toContain("classic streaming scroll problem"), { timeout: 8000 })
    await waitFor(() => expect(screen.getByRole("button", { name: "Reset conversation" })).not.toBeDisabled(), { timeout: 8000 })
    await user.click(screen.getByRole("button", { name: "Reset conversation" }))
    expect(await screen.findByText("Morning, Ada!")).toBeInTheDocument()
  })
  test("anchoring: sends scripted turns and switches role", async () => {
    const { user, container } = renderUI(<ScrollerAnchoring />, noCheck)
    await user.click(screen.getByRole("button", { name: "Send Message" }))
    expect(container.textContent).toContain("anchoring behaves")
    await user.click(screen.getByRole("radio", { name: "Anchor assistant messages" }))
    expect(screen.getByText("No anchored messages yet")).toBeInTheDocument()
  })
  test("group chat: Rocky joins", async () => {
    const { user, container } = renderUI(<ScrollerGroup />, noCheck)
    await user.click(screen.getByRole("button", { name: "Add Rocky" }))
    expect(container.textContent).toContain("Rocky has joined the chat")
    await user.click(screen.getByRole("button", { name: "Send Message as Rocky" }))
    expect(container.textContent).toContain("Amaze.")
    expect(screen.getByRole("button", { name: "Send Message as Rocky" })).toBeDisabled()
  })
  test("opening position: choices", async () => {
    const { user } = renderUI(<ScrollerOpening />, noCheck)
    expect(screen.getByRole("radio", { name: "last-anchor" })).toBeChecked?.()
    await user.click(screen.getByRole("radio", { name: "start" }))
    expect(screen.getByRole("radio", { name: "start" })).toHaveAttribute("aria-checked", "true")
  })
  test("commands: menu lists user questions", async () => {
    const { user } = renderUI(<ScrollerCommands />, noCheck)
    await user.click(screen.getByRole("button", { name: "Jump to..." }))
    expect((await screen.findAllByRole("menuitem")).length).toBe(4)
  })
  test("previous context: sends and slider is labelled", async () => {
    const { user, container } = renderUI(<ScrollerPrev />, noCheck)
    expect(screen.getByRole("slider", { name: "Previous context peek" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(container.textContent).toContain("jarring")
  })
})
