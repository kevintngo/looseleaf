import * as React from "react"
import { screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import ChatApp from "@/blocks/chat-app/page"
import { CONVERSATIONS } from "@/blocks/chat-app/components/chat-app-data"
import Preview from "@/docs/content/blocks/chat-app"
import meta from "@/docs/content/blocks/chat-app.meta"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDrawnClean, expectHydrates, expectSsrStable } from "./_blocks-apps"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 60)
})
afterEach(() => restore())

const app = () => (
  <InkProvider>
    <ChatApp />
  </InkProvider>
)

describe("chat-app block", () => {
  it("shows the conversation list and Stubby's thread", () => {
    renderUI(app())
    const list = screen.getByRole("complementary", { name: "Chats" })
    expect(within(list).getByRole("list", { name: "Conversations" })).toBeInTheDocument()
    for (const c of CONVERSATIONS) expect(within(list).getByRole("button", { name: new RegExp(c.name) })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2, name: "Stubby" })).toBeInTheDocument()
    expect(screen.getByText(/Can you add tags to my notes/)).toBeInTheDocument()
    expect(screen.getByText("field-notes.pdf")).toBeInTheDocument()
    expect(screen.getByText("src/notes/filter.ts")).toBeInTheDocument()
    expect(within(list).getByRole("button", { name: /Stubby/ })).toHaveAttribute("aria-current", "true")
  })

  it("has no axe violations, also for another conversation", async () => {
    const { container, user } = renderUI(app())
    await axeCheck(container)
    await user.click(screen.getByRole("button", { name: /Nell Okafor/ }))
    await axeCheck(container)
  })

  it("opens another conversation and clears its unread count", async () => {
    const { user } = renderUI(app())
    const nell = screen.getByRole("button", { name: /Nell Okafor/ })
    expect(nell).toHaveTextContent("2 unread")
    await user.click(nell)
    expect(screen.getByRole("heading", { level: 2, name: "Nell Okafor" })).toBeInTheDocument()
    expect(screen.getByText(/bringing the good tape/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Nell Okafor/ })).not.toHaveTextContent("unread")
    expect(screen.getByRole("button", { name: /Nell Okafor/ })).toHaveAttribute("aria-current", "true")
  })

  it("filters by search text and by unread, and says so when nothing matches", async () => {
    const { user } = renderUI(app())
    const search = screen.getByRole("searchbox", { name: "Search chats" })
    await user.type(search, "tape")
    expect(screen.getByRole("button", { name: /Nell Okafor/ })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Jo Delacroix/ })).not.toBeInTheDocument()
    await user.clear(search)
    await user.type(search, "zzzz")
    expect(screen.getByText("No chats match")).toBeInTheDocument()
    await user.clear(search)
    await user.click(screen.getByRole("radio", { name: "Unread" }))
    expect(screen.getByRole("button", { name: /Nell Okafor/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Mum/ })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Stubby/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: "All" }))
    expect(screen.getByRole("button", { name: /Stubby/ })).toBeInTheDocument()
  })

  it("sends a message and writes the reply word by word", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("button", { name: /Mum/ }))
    await user.type(screen.getByRole("textbox", { name: "Message Mum" }), "Landed. Kettle on?{Enter}")
    expect(screen.getByText("Landed. Kettle on?")).toBeInTheDocument()
    expect(screen.getByText("Mum is writing a reply")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument()
    expect(await screen.findByText("Mum replied", {}, { timeout: 6000 })).toBeInTheDocument()
    expect(screen.getByText(/The kettle is still on/)).toBeInTheDocument()
    expect(screen.queryByText("Mum is writing a reply")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /stop/i })).not.toBeInTheDocument()
    expect(within(screen.getByRole("list", { name: "Conversations" })).getByRole("button", { name: /Mum/ })).toHaveTextContent("now")
  })

  it("does not cut a reply short when the open conversation is pressed again", async () => {
    const { user } = renderUI(app())
    await user.type(screen.getByRole("textbox", { name: "Message Stubby" }), "One more thing{Enter}")
    expect(await screen.findByText(/Good catch/, {}, { timeout: 6000 })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Stubby/ }))
    expect(await screen.findByText("Stubby replied", {}, { timeout: 9000 })).toBeInTheDocument()
    expect(screen.getByText(/Twelve notes, eleven shown/)).toBeInTheDocument()
  }, 15000)

  it("stops a reply where it is", async () => {
    const { user } = renderUI(app())
    await user.type(screen.getByRole("textbox", { name: "Message Stubby" }), "One more thing{Enter}")
    expect(await screen.findByText(/Good catch/, {}, { timeout: 6000 })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /stop/i }))
    await new Promise((r) => setTimeout(r, 900))
    expect(screen.queryByText(/Twelve notes, eleven shown/)).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /stop/i })).not.toBeInTheDocument()
  })

  it("attaches a file from the paperclip and can take it off again", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("button", { name: "Attach a file" }))
    expect(screen.getByRole("button", { name: "Remove tags-list.tsx" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Remove tags-list.tsx" }))
    expect(screen.queryByRole("button", { name: "Remove tags-list.tsx" })).not.toBeInTheDocument()
  })

  it("shows one pane at a time on a phone: the back arrow returns to the list", async () => {
    const { user, container } = renderUI(app())
    const root = container.querySelector("[data-slot=chat-app]")!
    expect(root).toHaveAttribute("data-view", "list")
    await user.click(screen.getByRole("button", { name: /Stubby/ }))
    expect(root).toHaveAttribute("data-view", "thread")
    await user.click(screen.getByRole("button", { name: "Back to chats" }))
    expect(root).toHaveAttribute("data-view", "list")
  })

  it("is stable on the server and hydrates cleanly", () => {
    expectDrawnClean(app())
    expectSsrStable(app())
    expectHydrates(<ChatApp />)
  })
})

describe("chat-app data", () => {
  it("opens the conversations it is given and tells you what was sent", async () => {
    const onSend = vi.fn()
    const only = [CONVERSATIONS[4]!]
    const { user } = renderUI(<InkProvider><ChatApp conversations={only} onSend={onSend} /></InkProvider>)
    expect(screen.getAllByRole("button", { name: /Mum|Nell|Jo /})).toHaveLength(1)
    await user.type(screen.getByRole("textbox", { name: "Message Mum" }), "Hi{Enter}")
    expect(onSend).toHaveBeenCalledTimes(1)
    expect(onSend).toHaveBeenCalledWith("mum", "Hi", [])
    await screen.findByText("Mum replied", {}, { timeout: 6000 })
  })
})

describe("chat-app docs preview", () => {
  it("lays the block on the desk, has a title and description for the gallery, and is accessible", async () => {
    const { container } = renderUI(<InkProvider><Preview /></InkProvider>)
    expect(container.querySelector("[data-slot=desk]")).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2, name: "Chats" })).toBeInTheDocument()
    expect(meta.title.length).toBeGreaterThan(2)
    expect(meta.description).toMatch(/paper|desk/)
    expect(meta.tags?.length).toBeGreaterThan(1)
    await axeCheck(container)
  })
})
