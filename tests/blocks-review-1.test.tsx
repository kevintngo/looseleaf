import * as React from "react"
import { act, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import Calendar from "@/blocks/calendar-planner/page"
import DashboardAnalytics from "@/blocks/dashboard-analytics/page"
import { DataTable } from "@/blocks/dashboard-01/components/dashboard-01-data-table"
import { sections } from "@/blocks/dashboard-01/components/dashboard-01-data"
import { parseAmount } from "@/blocks/dashboard-finance/components/dashboard-finance-add-dialog"
import DashboardFinance from "@/blocks/dashboard-finance/page"
import FileExplorer from "@/blocks/file-explorer/page"
import { ForgotPasswordForm } from "@/blocks/forgot-password-01/components/forgot-password-01-form"
import Inbox from "@/blocks/inbox/page"
import KanbanBoard from "@/blocks/kanban-board/page"
import { LoginForm as Login05Form } from "@/blocks/login-05/components/login-05-form"
import { DEMO_CODE, OtpForm } from "@/blocks/otp-01/components/otp-01-form"
import Sidebar11 from "@/blocks/sidebar-11/page"
import Sidebar12 from "@/blocks/sidebar-12/page"
import Sidebar13 from "@/blocks/sidebar-13/page"
import { SignupForm as Signup05Form } from "@/blocks/signup-05/components/signup-05-form"
import { InkProvider } from "@/lib/ink/react"
import { mockBox, renderUI } from "./helpers"

const opts = { user: { pointerEventsCheck: 0 } }

let restore = () => {}
beforeEach(() => {
  restore = mockBox(360, 80)
  if (!document.elementFromPoint) document.elementFromPoint = () => null
})
afterEach(() => {
  restore()
  document.cookie = "sidebar_state=; max-age=0; path=/"
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

const blockSources = import.meta.glob("../src/blocks/**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }) as Record<string, string>
const uiSources = import.meta.glob("../src/components/ui/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>
const SCOPE = /^\.\.\/src\/blocks\/(login|signup|otp|forgot|reset|sidebar|dashboard|kanban|calendar|inbox|file-explorer)/
const inScope = Object.entries(blockSources).filter(([file]) => SCOPE.test(file))
const isClientModule = (source: string) => /^\s*(?:\/\/[^\n]*\n\s*|\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(source)

function moduleSource(specifier: string): string | undefined {
  const rel = specifier.replace(/^@\//, "../src/")
  for (const ext of [".tsx", ".ts"]) {
    const hit = blockSources[rel + ext] ?? uiSources[rel + ext]
    if (hit !== undefined) return hit
  }
  return undefined
}

describe("review: the sources of the auth, sidebar and dashboard blocks", () => {
  it("finds the blocks it is meant to read", () => {
    expect(inScope.length).toBeGreaterThan(100)
  })

  it("never calls, while it renders, a function that lives in a 'use client' file (a server component cannot: the Next.js app router throws)", () => {
    const offenders: string[] = []
    for (const [file, source] of inScope) {
      if (isClientModule(source)) continue
      for (const m of source.matchAll(/^import\s+\{([^}]*)\}\s+from\s+"(@\/[^"]+)"/gm)) {
        const target = moduleSource(m[2])
        if (target === undefined || !isClientModule(target)) continue
        for (const raw of m[1].split(",")) {
          const name = raw.trim().split(/\s+as\s+/).pop()!
          if (!/^[a-z]\w*$/.test(name) || raw.trim().startsWith("type ")) continue
          if (new RegExp(`(?<![\\w.])${name}\\(`).test(source.replace(m[0], ""))) offenders.push(`${file} calls ${name}() from ${m[2]}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it("has no link to a bare '#': in a page that routes by hash it means 'home'", () => {
    const offenders: string[] = []
    for (const [file, source] of inScope) {
      if (/\/(login|signup|otp|forgot|reset)-/.test(file) === false && !/\/(sidebar|dashboard|kanban|calendar|inbox|file-explorer)/.test(file)) continue
      for (const m of source.matchAll(/(?:href|url)(?:=|:\s*)["']#["']/g)) offenders.push(`${file}: ${m[0]}`)
    }
    expect(offenders).toEqual([])
  })

  it("keeps 12px text out of the information (Kalam reads small: the design floor is 14px)", () => {
    const offenders: string[] = []
    for (const [file, source] of inScope) {
      if (/ticket|top-pages|kanban-board-card/.test(file)) continue
      for (const m of source.matchAll(/text-xs/g)) offenders.push(`${file}: ${m[0]}`)
    }
    expect(offenders).toEqual([])
  })
})

describe("review: pages that can sit inside an app's own main", () => {
  const pages: Array<[string, React.ComponentType<{ as?: "main" | "div" }>]> = [
    ["kanban-board", KanbanBoard],
    ["calendar-planner", Calendar],
    ["inbox", Inbox],
    ["file-explorer", FileExplorer],
    ["dashboard-analytics", DashboardAnalytics],
    ["dashboard-finance", DashboardFinance],
  ]
  it.each(pages)("%s is the main landmark by default and a plain div with as=\"div\", still with its one h1", (_name, Page) => {
    const { unmount } = renderUI(<Page />, opts)
    expect(screen.getAllByRole("main")).toHaveLength(1)
    unmount()
    renderUI(<Page as="div" />, opts)
    expect(screen.queryByRole("main")).not.toBeInTheDocument()
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
  })
})

describe("review: auth", () => {
  it("login-05: once the link is sent the cursor is on the message, not lost with the button", async () => {
    const { user, getByRole, getByLabelText } = renderUI(
      <InkProvider>
        <Login05Form onSubmit={vi.fn().mockResolvedValue(undefined)} />
      </InkProvider>,
    )
    await user.type(getByLabelText("Email"), "ada@notes.dev")
    await user.click(getByRole("button", { name: "Email me a sign-in link" }))
    const status = await screen.findByRole("status")
    expect(status).toHaveTextContent("Your link is on its way")
    await waitFor(() => expect(status).toHaveFocus())
  })

  it("signup-05: the same", async () => {
    const { user, getByRole, getByLabelText } = renderUI(
      <InkProvider>
        <Signup05Form onSubmit={vi.fn().mockResolvedValue(undefined)} />
      </InkProvider>,
    )
    await user.type(getByLabelText("Email"), "ada@notes.dev")
    await user.click(getByRole("button", { name: "Email me a link to start" }))
    const status = await screen.findByRole("status")
    expect(status).toHaveTextContent("Check your inbox")
    await waitFor(() => expect(status).toHaveFocus())
  })

  it("otp-01: a right code leaves the cursor on the new title", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      const { user, getByRole } = renderUI(
        <InkProvider>
          <OtpForm />
        </InkProvider>,
      )
      await user.click(document.querySelector<HTMLInputElement>('[data-slot="input-otp"]')!)
      await user.keyboard(DEMO_CODE)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(700)
      })
      expect(getByRole("heading", { level: 1, name: "You are verified" })).toHaveFocus()
    } finally {
      vi.useRealTimers()
    }
  })

  it("forgot-password-01: 'send it again' only says it sent when it did, and keeps the button focusable while it works", async () => {
    const onSubmit = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("Too many links today."))
    const { user, getByRole, getByLabelText } = renderUI(
      <InkProvider>
        <ForgotPasswordForm onSubmit={onSubmit} />
      </InkProvider>,
    )
    await user.type(getByLabelText("Email"), "ada@notes.dev")
    await user.click(getByRole("button", { name: "Send reset link" }))
    const again = await screen.findByRole("button", { name: "send it again" })
    await user.click(again)
    expect(await screen.findByRole("alert")).toHaveTextContent("Too many links today.")
    expect(screen.queryByText("We sent the link again.")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "send it again" })).not.toHaveAttribute("disabled")
    onSubmit.mockResolvedValueOnce(undefined)
    await user.click(screen.getByRole("button", { name: "send it again" }))
    expect(await screen.findByText("We sent the link again.")).toBeInTheDocument()
  })
})

describe("review: sidebars", () => {
  it("sidebar-11: the open file says so to a screen reader (its row is a button, and isActive is only a drawing)", async () => {
    const { user } = renderUI(<Sidebar11 />, opts)
    const current = () => screen.getAllByRole("button").filter((b) => b.getAttribute("aria-current") === "true")
    expect(current().map((b) => b.textContent)).toEqual(["button.tsx"])
    await user.click(screen.getByRole("button", { name: "header.tsx" }))
    expect(current().map((b) => b.textContent)).toEqual(["header.tsx"])
  })

  it("sidebar-11: a changed file's name leaves room for its M / U letter", () => {
    renderUI(<Sidebar11 />, opts)
    const badge = document.querySelector('[data-sidebar="menu-badge"]')!
    const button = badge.parentElement!.querySelector('[data-sidebar="menu-button"]')!
    expect(button.className).toContain("group-has-data-[sidebar=menu-badge]/menu-item:pe-8")
  })

  it("sidebar-13: the section that is showing is the current one", async () => {
    const { user } = renderUI(<Sidebar13 />, opts)
    await user.click(within(screen.getByRole("navigation", { name: "Main" })).getByRole("button", { name: "Settings" }))
    const pad = await screen.findByRole("navigation", { name: "Settings sections" })
    const current = () => within(pad).getAllByRole("button").filter((b) => b.getAttribute("aria-current") === "true")
    expect(current().map((b) => b.textContent)).toEqual(["Messages & media"])
    await user.click(within(pad).getByRole("button", { name: "Appearance" }))
    expect(current().map((b) => b.textContent)).toEqual(["Appearance"])
  })

  it("sidebar-12: the month fits a 16rem pad with room for a classic scrollbar (7 cells of 2rem = 224px)", () => {
    const { container } = renderUI(<Sidebar12 />, opts)
    const month = container.querySelector('[data-slot="sidebar-content"] [data-slot="calendar"]')
    expect(month).not.toBeNull()
    expect(month!.className).toContain("[--cell:2rem]")
  })
})

describe("review: dashboard-01", () => {
  it("two tables on one page do not share a label target", () => {
    renderUI(
      <div>
        <DataTable data={sections} />
        <DataTable data={sections} />
      </div>,
      opts,
    )
    const ids = Array.from(document.querySelectorAll("[id]")).map((n) => n.id)
    expect(ids.length).toBeGreaterThan(4)
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([])
  })
})

describe("review: dashboard-finance", () => {
  it("refuses what Number() would swallow as money", () => {
    for (const bad of ["0x10", "1e3", "Infinity", "1_000", "12abc", "1.2.3"]) expect(parseAmount(bad), bad).toBeNull()
    expect(parseAmount("12.50")).toBe(1250)
    expect(parseAmount("1,234.50")).toBe(123450)
  })

  it("puts the cursor on the first field to fix when the dialog is sent half empty", async () => {
    const { user } = renderUI(<DashboardFinance />, opts)
    await user.click(screen.getByRole("button", { name: /Add transaction/ }))
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Add it" }))
    expect(within(dialog).getByLabelText("What was it?")).toHaveFocus()
    await user.type(within(dialog).getByLabelText("What was it?"), "Ramen")
    await user.click(within(dialog).getByRole("button", { name: "Add it" }))
    expect(within(dialog).getByLabelText("How much?")).toHaveFocus()
  })
})

describe("review: calendar-planner", () => {
  it("puts the cursor on the first field to fix when an event is sent without a name", async () => {
    const { user } = renderUI(<Calendar />, opts)
    await user.click(screen.getByRole("button", { name: "New event" }))
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Add it" }))
    expect(within(dialog).getByLabelText("What is happening?")).toHaveFocus()
  })
})

const row = (subject: RegExp) => screen.getByRole("button", { name: subject })
const letter = () => screen.getByRole("article")

describe("review: inbox", () => {
  it("archiving opens the next letter and puts the cursor on its title, not on nothing", async () => {
    const { user } = renderUI(<Inbox />, opts)
    await user.click(row(/Photos of the field notebooks/))
    await user.click(within(letter()).getByRole("button", { name: "Archive" }))
    expect(screen.getByRole("heading", { level: 2, name: "Postcode field is fixed" })).toHaveFocus()
  })

  it("archiving the last letter of a search leaves the cursor on the folder tab", async () => {
    const { user } = renderUI(<Inbox />, opts)
    await user.type(screen.getByRole("searchbox", { name: "Search letters" }), "plum")
    await user.click(row(/Did you eat/))
    await user.click(within(letter()).getByRole("button", { name: "Archive" }))
    expect(screen.queryByRole("article")).not.toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /Inbox/ })).toHaveFocus()
  })

  it("the toolbar of a letter is a plain group (it has no arrow-key roving to promise)", async () => {
    const { user } = renderUI(<Inbox />, opts)
    await user.click(row(/Supper on Saturday/))
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument()
    expect(within(letter()).getByRole("group", { name: "What to do with this letter" })).toBeInTheDocument()
  })

  describe("on a phone, where the list gives way to the letter", () => {
    beforeEach(() => {
      Object.defineProperty(window, "innerWidth", { value: 500, configurable: true, writable: true })
    })
    afterEach(() => {
      Object.defineProperty(window, "innerWidth", { value: 1024, configurable: true, writable: true })
    })

    it("opening a letter moves the cursor to its title, and Back returns it to the row", async () => {
      const { user } = renderUI(<Inbox />, opts)
      await user.click(row(/The sticker sheet, finally/))
      const title = screen.getByRole("heading", { level: 2, name: "The sticker sheet, finally" })
      await waitFor(() => expect(title).toHaveFocus())
      await user.click(within(letter()).getByRole("button", { name: "Back to the list" }))
      await waitFor(() => expect(row(/The sticker sheet, finally/)).toHaveFocus())
    })

    it("archiving goes back to the list with the cursor on the letter that took its place", async () => {
      const { user } = renderUI(<Inbox />, opts)
      await user.click(row(/Photos of the field notebooks/))
      await user.click(within(letter()).getByRole("button", { name: "Archive" }))
      await waitFor(() => expect(screen.queryByRole("article")).not.toBeInTheDocument())
      await waitFor(() => expect(document.activeElement).toHaveAttribute("data-mail-row"))
    })
  })
})

const open = (name: RegExp) => screen.getByRole("button", { name })

describe("review: file-explorer", () => {
  it("opening a folder puts the cursor on its first item", async () => {
    const { user } = renderUI(<FileExplorer />, opts)
    await user.click(open(/^Autumn drop/))
    await waitFor(() => expect(open(/^launch-plan\.xlsx/)).toHaveFocus())
  })

  it("going up a level with the trail puts the cursor on the first item there", async () => {
    const { user } = renderUI(<FileExplorer />, opts)
    await user.click(open(/^Autumn drop/))
    await user.click(within(screen.getByRole("navigation", { name: "Where you are in Projects" })).getByRole("button", { name: "Projects" }))
    await waitFor(() => expect(open(/^Autumn drop/)).toHaveFocus())
  })

  it("deleting a row puts the cursor on the row that took its place", async () => {
    const { user } = renderUI(<FileExplorer />, opts)
    await user.click(screen.getByRole("button", { name: "Actions for Journal" }))
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }))
    await waitFor(() => expect(open(/^brand-guide\.pdf/)).toHaveFocus())
  })

  it("Undo puts the cursor back in the list, and so does deleting the picked ones", async () => {
    const { user } = renderUI(<FileExplorer />, opts)
    await user.click(screen.getByRole("checkbox", { name: "Select brand-guide.pdf" }))
    await user.click(screen.getByRole("checkbox", { name: "Select notes-2026.txt" }))
    await user.click(within(screen.getByRole("group", { name: "Selected items" })).getByRole("button", { name: "Delete" }))
    await waitFor(() => expect(open(/^Autumn drop/)).toHaveFocus())
    await user.click(screen.getByRole("button", { name: "Undo" }))
    await waitFor(() => expect(document.activeElement).toHaveAttribute("data-file-open"))
  })

  it("an emptied folder leaves the cursor on 'New folder'", async () => {
    const { user } = renderUI(<FileExplorer />, opts)
    await user.click(open(/^Journal/))
    await user.click(screen.getByRole("checkbox", { name: "Select everything in this folder" }))
    await user.click(within(screen.getByRole("group", { name: "Selected items" })).getByRole("button", { name: "Delete" }))
    await waitFor(() => expect(screen.getByRole("button", { name: "New folder" })).toHaveFocus())
  })
})
