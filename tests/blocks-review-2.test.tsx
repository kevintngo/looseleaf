import * as React from "react"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import AnnouncementBar from "@/blocks/announcement-bar/page"
import ChatApp from "@/blocks/chat-app/page"
import Checkout01 from "@/blocks/checkout-01/page"
import Faq01 from "@/blocks/faq-01/page"
import LandingHero01 from "@/blocks/landing-hero-01/page"
import Features01 from "@/blocks/features-01/page"
import Newsletter01 from "@/blocks/newsletter-01/page"
import NotesApp from "@/blocks/notes-app/page"
import Onboarding01 from "@/blocks/onboarding-01/page"
import Pricing01 from "@/blocks/pricing-01/page"
import ProfilePage from "@/blocks/profile-page/page"
import { PROFILE, type Profile } from "@/blocks/profile-page/components/profile-page-data"
import SettingsBilling from "@/blocks/settings-billing/page"
import SettingsNotifications from "@/blocks/settings-notifications/page"
import SettingsProfile from "@/blocks/settings-profile/page"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 60)
})
afterEach(() => restore())

const BLOCKS = [
  "chat-app", "notes-app", "settings-profile", "settings-notifications", "settings-billing", "settings-appearance", "pricing-01", "checkout-01", "profile-page",
  "landing-hero-01", "landing-hero-02", "features-01", "testimonials-01", "faq-01", "footer-01", "newsletter-01", "cta-01", "logos-01", "onboarding-01",
  "error-404", "error-500", "empty-inbox", "empty-search", "announcement-bar",
] as const

function sources(name: string): { file: string; text: string }[] {
  const out: { file: string; text: string }[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) walk(full)
      else out.push({ file: full, text: readFileSync(full, "utf8") })
    }
  }
  walk(join(process.cwd(), "src/blocks", name))
  return out
}

function narrow(slot: string, panes: [list: string, other: string], views: [string, string]) {
  const style = document.createElement("style")
  style.textContent = `[data-slot=${slot}][data-view=${views[0]}] [data-slot=${panes[0]}], [data-slot=${slot}][data-view=${views[1]}] [data-slot=${panes[1]}] { display: none }`
  document.head.append(style)
  return () => style.remove()
}

describe("source guards", () => {
  it("no block links to a bare '#': the docs router reads it as 'go home'", () => {
    for (const name of BLOCKS) for (const { file, text } of sources(name)) expect(text, file).not.toMatch(/href=(?:"#"|\{"#"\})|href = "#"/)
  })

  it("no block positions a Button with a translate utility (the Button's own press sink writes the same variable)", () => {
    for (const name of BLOCKS)
      for (const { file, text } of sources(name)) {
        for (const m of text.matchAll(/<(?:Button|InputGroupButton|PromptInputButton)\b[^>]*className="([^"]*)"/g)) expect(m[1], file).not.toMatch(/(?:^|\s)-?translate-[xy]-/)
      }
  })

  it("no block hard-codes a generic element id (two of them on a page would share it)", () => {
    for (const name of BLOCKS) for (const { file, text } of sources(name)) expect(text, file).not.toMatch(/\bid="(?:pricing-01-|settings-|profile-|starter|studio|workshop)[a-z0-9-]*"/)
  })
})

describe("ruled sheets", () => {
  it("the kicker line of the FAQ sheet is 28 px tall like every other line (text-xs alone would make it 16 px and push the words off the rules)", () => {
    renderUI(<Faq01 />)
    expect(screen.getByText("Frequently asked")).toHaveClass("leading-7")
  })

  it("the kicker line of the bento page is 28 px tall too", () => {
    renderUI(<Features01 variant="bento" />)
    expect(screen.getByText(/Kickoff notes/)).toHaveClass("leading-7")
  })

  it("the red margin turns round in right-to-left (Paper does not do it itself)", () => {
    const faq = renderUI(<Faq01 />)
    expect(faq.container.querySelector("[data-slot=paper][class*='ll-stock'], [data-slot=paper]")?.className).toContain("rtl:[&>[data-slot=paper-rules]]:-scale-x-100")
    faq.unmount()
    const bento = renderUI(<Features01 variant="bento" />)
    const sheet = Array.from(bento.container.querySelectorAll("[data-slot=paper]")).find((n) => n.textContent?.includes("Write together"))
    expect(sheet?.className).toContain("rtl:[&>[data-slot=paper-rules]]:-scale-x-100")
  })
})

describe("layouts that a phone would break", () => {
  it("FAQ questions can grow: the trigger has a minimum of two lines, not a fixed height (a multiple of 28 px stays on the rules)", () => {
    renderUI(<Faq01 />)
    const trigger = screen.getByRole("button", { name: "Is there a free plan?" })
    expect(trigger).toHaveClass("min-h-14")
    expect(trigger.className).not.toMatch(/(?:^|\s)h-14(?:\s|$)/)
  })

  it("the ruled sheets start at pt-4 (the rules are printed 8 px above the line foot), so the text stands on them", () => {
    const faq = renderUI(<Faq01 />)
    expect(faq.container.querySelector("[data-slot=paper]")).toHaveClass("pt-4")
    faq.unmount()
    const bento = renderUI(<Features01 variant="bento" />)
    const sheet = Array.from(bento.container.querySelectorAll("[data-slot=paper]")).find((n) => n.textContent?.includes("Write together"))
    expect(sheet).toHaveClass("pt-4")
  })

  it("the hero collage pieces of 15 rem can shrink into a 320 px phone", () => {
    const { container } = renderUI(<LandingHero01 />)
    const collage = container.querySelector("[data-slot=landing-hero-collage]")!
    for (const piece of [collage.querySelector("[data-slot=polaroid]"), collage.querySelector("[data-slot=index-card]")]) expect(piece).toHaveClass("max-w-full")
  })

  it("profile: the strokes of a busy week go on their own line on a phone and keep their reading order", () => {
    renderUI(<InkProvider><ProfilePage /></InkProvider>)
    const rows = within(screen.getByRole("list", { name: "Pages written each week" })).getAllByRole("listitem")
    expect(rows).toHaveLength(8)
    for (const row of rows) {
      const [label, tally, count] = Array.from(row.children) as HTMLElement[]
      expect(tally.getAttribute("data-slot")).toBe("tally")
      expect(tally.className).toContain("col-span-2")
      expect(count.className).toContain("col-start-2")
      expect(label.textContent).toBeTruthy()
    }
  })
})

describe("printed rules that would fight the content", () => {
  it("the chat list and the notes shelf sit on a plain pad: their rows and cards bring their own lines", () => {
    const chat = renderUI(<ChatApp />)
    expect(chat.container.querySelector("[data-slot=chat-app-list]")).not.toBeNull()
    expect(chat.container.querySelector("[data-slot=chat-app-list] > [data-slot=paper-rules]")).toBeNull()
    chat.unmount()
    const notes = renderUI(<NotesApp />)
    expect(notes.container.querySelector("[data-slot=notes-app-list]")).not.toBeNull()
    expect(notes.container.querySelector("[data-slot=notes-app-list] > [data-slot=paper-rules]")).toBeNull()
  })
})

describe("announcement-bar", () => {
  it("the dismiss button is centred with margins, not a translate", () => {
    renderUI(<AnnouncementBar />)
    const button = screen.getByRole("button", { name: "Dismiss announcement" })
    expect(button.className).toContain("my-auto")
    expect(button.className).not.toMatch(/(?:^|\s)-?translate-y/)
  })

  it("keeps the keyboard: dismiss lands on 'Bring it back', bringing it back lands on the strip", async () => {
    const { user } = renderUI(<AnnouncementBar />)
    await user.click(screen.getByRole("button", { name: "Dismiss announcement" }))
    expect(screen.getByRole("button", { name: "Bring the announcement back" })).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(screen.getByRole("region", { name: "Announcement" })).toHaveFocus()
  })
})

describe("save failures are said out loud", () => {
  it("notifications: a rejected onSave shows why, is not stuck on 'Saving' and does not claim 'Saved'", async () => {
    const { user } = renderUI(<SettingsNotifications onSave={() => Promise.reject(new Error("The server is asleep."))} />)
    await user.click(screen.getByRole("button", { name: "Save preferences" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The server is asleep.")
    expect(screen.getByRole("button", { name: "Save preferences" })).not.toHaveAttribute("aria-busy", "true")
    expect(screen.queryByText(/^Saved\./)).toBeNull()
    await user.click(screen.getByRole("checkbox", { name: "News from Looseleaf by email" }))
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("notifications: a rejected onTest shows why and does not claim the note is on its way", async () => {
    const { user } = renderUI(<SettingsNotifications onTest={() => Promise.reject(new Error("No route to the phone."))} />)
    await user.click(screen.getByRole("button", { name: "Send a test" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("No route to the phone.")
    expect(screen.queryByText("A test note is on its way")).toBeNull()
  })

  it("notifications: with a message-less rejection there is still a sentence", async () => {
    const { user } = renderUI(<SettingsNotifications onSave={() => Promise.reject("x")} />)
    await user.click(screen.getByRole("button", { name: "Save preferences" }))
    expect(await screen.findByRole("alert")).toHaveTextContent(/not saved/)
  })

  it("profile: a rejected onSave keeps the form, shows why and leaves 'Save changes' live", async () => {
    const { user } = renderUI(
      <InkProvider>
        <SettingsProfile onSave={() => Promise.reject(new Error("Try again in a minute."))} />
      </InkProvider>
    )
    const name = screen.getByRole("textbox", { name: "Name" })
    await user.clear(name)
    await user.type(name, "Jo D")
    await user.click(screen.getByRole("button", { name: "Save changes" }))
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Try again in a minute.")
    expect(name).toHaveValue("Jo D")
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "Undo changes" })).toBeInTheDocument()
    expect(screen.queryByText(/Saved\. Your card/)).toBeNull()
    await user.type(name, "x")
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull())
  })

  it("billing: a rejected onSaveDetails keeps what was typed and says why", async () => {
    const { user } = renderUI(
      <InkProvider>
        <SettingsBilling onSaveDetails={() => Promise.reject(new Error("The tax office did not answer."))} />
      </InkProvider>
    )
    await user.click(screen.getByRole("button", { name: "Save details" }))
    expect(await screen.findByText("The tax office did not answer.")).toBeInTheDocument()
    expect(screen.queryByText("Saved. New invoices will say so.")).toBeNull()
    expect(screen.getByRole("textbox", { name: "Send invoices to" })).toHaveValue("billing@looseleaf.example")
  })

  it("has no axe violations while a failure is showing", async () => {
    const { user, container } = renderUI(<SettingsNotifications onSave={() => Promise.reject(new Error("Nope."))} />)
    await user.click(screen.getByRole("button", { name: "Save preferences" }))
    await screen.findByRole("alert")
    await axeCheck(container)
  })
})

describe("focus does not fall on the floor", () => {
  it("newsletter: after a failed sign-up the cursor is back in the address", async () => {
    const { user } = renderUI(<Newsletter01 onSubscribe={() => Promise.reject(new Error("nope"))} />)
    const field = screen.getByRole("textbox", { name: "Your email address" })
    await user.type(field, "ada@example.com")
    await user.click(screen.getByRole("button", { name: "Subscribe" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong")
    expect(field).toHaveFocus()
  })

  it("onboarding: 'Skip for now' lands on the link that brings it back, which lands on the heading", async () => {
    const { user } = renderUI(<Onboarding01 />)
    await user.click(screen.getByRole("button", { name: "Skip for now" }))
    expect(screen.getByRole("button", { name: /Show the setup checklist/ })).toHaveFocus()
    await user.click(screen.getByRole("button", { name: /Show the setup checklist/ }))
    expect(screen.getByRole("heading", { level: 2, name: /get you set up/ })).toHaveFocus()
  })

  it("onboarding: nothing takes the focus when the page loads", () => {
    renderUI(<Onboarding01 />)
    expect(document.body).toHaveFocus()
  })

  it("checkout: applying a code lands on 'Remove', removing it lands back in the field", async () => {
    const { user } = renderUI(<Checkout01 />)
    await user.type(screen.getByRole("textbox", { name: "Promo code" }), "paper10")
    await user.click(screen.getByRole("button", { name: "Apply" }))
    expect(screen.getByRole("button", { name: "Remove" })).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(screen.getByRole("textbox", { name: "Promo code" })).toHaveFocus()
  })

  describe("one pane at a time", () => {
    it("chat: into a chat lands on its name, back lands on the chat you left", async () => {
      const off = narrow("chat-app", ["chat-app-list", "chat-app-thread"], ["thread", "list"])
      try {
        const { user, container } = renderUI(<ChatApp />)
        const list = container.querySelector("[data-slot=chat-app-list]") as HTMLElement
        const row = within(list).getAllByRole("button", { name: /Nell|Jo|Stubby/ })[1]!
        await user.click(row)
        expect(container.querySelector("[data-slot=chat-app-thread] h2")).toHaveFocus()
        await user.click(screen.getByRole("button", { name: "Back to chats" }))
        expect(list.querySelector("[aria-current=true]")).toHaveFocus()
      } finally {
        off()
      }
    })

    it("chat: with both panes on screen, opening a chat leaves the focus where the person put it", async () => {
      const { user, container } = renderUI(<ChatApp />)
      const list = container.querySelector("[data-slot=chat-app-list]") as HTMLElement
      const row = within(list).getAllByRole("button", { name: /Nell|Jo|Stubby/ })[1]!
      await user.click(row)
      expect(row).toHaveFocus()
    })

    it("notes: into a page lands on the page, back lands on its card", async () => {
      const off = narrow("notes-app", ["notes-app-list", "notes-app-editor"], ["editor", "list"])
      try {
        const { user, container } = renderUI(<NotesApp />)
        await user.click(screen.getByRole("button", { name: "Open Soup that forgives" }))
        expect(container.querySelector("[data-slot=notes-app-editor]")).toHaveFocus()
        await user.click(screen.getByRole("button", { name: "Back to notes" }))
        expect(screen.getByRole("button", { name: "Open Soup that forgives" })).toHaveFocus()
      } finally {
        off()
      }
    })

    it("notes: tearing a page out still hands the keyboard to the shelf heading", async () => {
      const off = narrow("notes-app", ["notes-app-list", "notes-app-editor"], ["editor", "list"])
      try {
        const { user } = renderUI(<NotesApp />)
        await user.click(screen.getByRole("button", { name: "Open Soup that forgives" }))
        await user.click(screen.getByRole("button", { name: "Tear this page out" }))
        await user.click(await screen.findByRole("button", { name: "Tear it out" }))
        await waitFor(() => expect(screen.getByRole("heading", { level: 2, name: "Notes" })).toHaveFocus())
      } finally {
        off()
      }
    })

    it("notes: with both panes on screen, opening a page leaves the focus on its card", async () => {
      const { user } = renderUI(<NotesApp />)
      const card = screen.getByRole("button", { name: "Open Soup that forgives" })
      await user.click(card)
      expect(card).toHaveFocus()
    })
  })
})

describe("profile-page shows the person it is given, all of it", () => {
  const other: Profile = {
    ...PROFILE,
    name: "Sam Reyes",
    handle: "sam_prints",
    stats: [
      { id: "a", label: "Prints pulled", value: "312", note: "since spring" },
      { id: "b", label: "Presses", value: "2", note: "one is loud" },
      { id: "c", label: "Inks mixed", value: "48", note: "mostly teal" },
    ],
    streakDays: 5,
    weeks: [
      { label: "Week one", pages: 3 },
      { label: "Week two", pages: 9 },
    ],
    feed: [{ id: "x", day: "Today", icon: "pencil", title: "Pulled a proof of the poster", where: "Workshop", time: "10:02" }],
    shelf: [{ tone: "sky", name: "Proofs", pages: 12 }],
    badges: [
      { id: "b1", sticker: "rocket", name: "Early press", how: "Print before nine", earned: "May 2026" },
      { id: "b2", sticker: "owl", name: "Late press", how: "Print after midnight" },
    ],
  }

  it("the numbers, the tally, the feed", () => {
    renderUI(<InkProvider><ProfilePage profile={other} /></InkProvider>)
    expect(screen.getByText("Prints pulled", { selector: "dt" })).toBeInTheDocument()
    expect(screen.queryByText("Pages written")).toBeNull()
    expect(screen.getByText("5 days", { selector: "dd" })).toBeInTheDocument()
    expect(screen.getByText("Best week: 9 pages")).toBeInTheDocument()
    expect(screen.getByText("This week")).toBeInTheDocument()
    expect(screen.getByText("Pulled a proof of the poster")).toBeInTheDocument()
    expect(screen.queryByText(/Porridge/)).toBeNull()
  })

  it("the shelf and the stickers", async () => {
    const { user } = renderUI(<InkProvider><ProfilePage profile={other} /></InkProvider>)
    await user.click(screen.getByRole("tab", { name: "Notebooks" }))
    expect(within(screen.getByRole("list", { name: "Notebooks" })).getAllByRole("listitem")).toHaveLength(1)
    expect(screen.getByText("12 pages")).toBeInTheDocument()
    await user.click(screen.getByRole("tab", { name: "Stickers" }))
    expect(screen.getByText(/of 2 stickers earned/)).toBeInTheDocument()
    expect(screen.getByText("Early press")).toBeInTheDocument()
  })

  it("the sample still fills every part when nothing is given", () => {
    renderUI(<InkProvider><ProfilePage /></InkProvider>)
    expect(screen.getByText("Pages written", { selector: "dt" })).toBeInTheDocument()
    expect(screen.getByText("23 days", { selector: "dd" })).toBeInTheDocument()
  })
})

const duplicateIds = () => {
  const ids = Array.from(document.querySelectorAll("[id]"))
    .map((n) => n.id)
    .filter((id) => !id.startsWith("ll-"))
  return ids.filter((id, i) => ids.indexOf(id) !== i)
}

describe("ids", () => {
  it("two pricing sections on one page do not share an id", () => {
    renderUI(<><Pricing01 /><Pricing01 /></>)
    expect(duplicateIds()).toEqual([])
    expect(screen.getAllByRole("region", { name: "Pick a desk that fits" })).toHaveLength(2)
  })

  it("two billing pages do not share a plan radio id", () => {
    renderUI(<InkProvider><SettingsBilling /><SettingsBilling /></InkProvider>)
    expect(duplicateIds()).toEqual([])
  })
})
