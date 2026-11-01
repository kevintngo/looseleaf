import * as React from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Bookmark, BookmarkRibbon } from "@/components/ui/bookmark"
import { Clipboard, ClipboardPaper } from "@/components/ui/clipboard"
import { Desk } from "@/components/ui/desk"
import { Envelope, EnvelopeAddress, EnvelopeFront, EnvelopeLetter, EnvelopeSender, EnvelopeTrigger } from "@/components/ui/envelope"
import { Folder, FolderContent, FolderTab, FolderTabs } from "@/components/ui/folder"
import { IndexCard, IndexCardContent, IndexCardHeader, IndexCardTitle } from "@/components/ui/index-card"
import { LabelTag, LabelTagPrice, LabelTagTitle } from "@/components/ui/label-tag"
import { Napkin, NapkinContent } from "@/components/ui/napkin"
import { Notebook, NotebookCover, NotebookCoverLabel, NotebookPage, NotebookTitle, NotebookTurn } from "@/components/ui/notebook"
import { Page, PageContent, PageHeader, PageTitle } from "@/components/ui/page"
import { Polaroid, PolaroidCaption, PolaroidImage } from "@/components/ui/polaroid"
import { Receipt, ReceiptBarcode, ReceiptLine, ReceiptLines, ReceiptTotal } from "@/components/ui/receipt"
import { StickyNote } from "@/components/ui/sticky-note"
import { Ticket, TicketBody, TicketStub } from "@/components/ui/ticket"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 240)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

function Everything() {
  return (
    <Desk as="main" objects aria-label="Everything">
      <Page holes reinforced stain torn>
        <PageHeader>
          <PageTitle>Field notes</PageTitle>
        </PageHeader>
        <PageContent>
          <p>body</p>
        </PageContent>
      </Page>
      <Notebook curl defaultValue="a">
        <NotebookPage value="a">
          <NotebookTitle>Monday</NotebookTitle>
        </NotebookPage>
        <NotebookPage value="b">Tuesday</NotebookPage>
        <NotebookTurn to="b">Next</NotebookTurn>
        <BookmarkRibbon className="absolute -top-1 end-8" />
      </Notebook>
      <NotebookCover>
        <NotebookCoverLabel>Cover</NotebookCoverLabel>
      </NotebookCover>
      <IndexCard hole flag="sky" stack={2}>
        <IndexCardHeader>
          <IndexCardTitle>Sources</IndexCardTitle>
        </IndexCardHeader>
        <IndexCardContent>x</IndexCardContent>
      </IndexCard>
      <StickyNote done curl fastener="pin">
        note
      </StickyNote>
      <Napkin stain>
        <NapkinContent>napkin</NapkinContent>
      </Napkin>
      <Polaroid tape="top">
        <PolaroidImage scene="night" date="'25 9 24" develop />
        <PolaroidCaption>night</PolaroidCaption>
      </Polaroid>
      <Receipt>
        <ReceiptLines>
          <ReceiptLine price="1.00">tea</ReceiptLine>
        </ReceiptLines>
        <ReceiptTotal circled>1.00</ReceiptTotal>
        <ReceiptBarcode value="0042 1187" />
      </Receipt>
      <Ticket punched>
        <TicketBody>admit one</TicketBody>
        <TicketStub>No. 1</TicketStub>
      </Ticket>
      <Envelope defaultOpen airmail>
        <EnvelopeFront>
          <EnvelopeSender>Ada</EnvelopeSender>
          <EnvelopeAddress>Paris</EnvelopeAddress>
          <EnvelopeTrigger>Read the letter</EnvelopeTrigger>
        </EnvelopeFront>
        <EnvelopeLetter>hello</EnvelopeLetter>
      </Envelope>
      <Folder defaultValue="a">
        <FolderTabs aria-label="Files">
          <FolderTab value="a">A</FolderTab>
          <FolderTab value="b" disabled>
            B
          </FolderTab>
        </FolderTabs>
        <FolderContent value="a" crease fastener="clip">
          a
        </FolderContent>
      </Folder>
      <Clipboard tone="teal">
        <ClipboardPaper>form</ClipboardPaper>
      </Clipboard>
      <LabelTag asChild shape="luggage">
        <a href="#gate">
          <LabelTagTitle>Gate 7</LabelTagTitle>
          <LabelTagPrice>1.00</LabelTagPrice>
        </a>
      </LabelTag>
      <Bookmark defaultPressed>Saved</Bookmark>
    </Desk>
  )
}

describe("the whole paper set together", () => {
  it("mounts in StrictMode, in the provider, with no React warning, and every drawing follows the ink conventions", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const { container } = render(
      <React.StrictMode>
        <InkProvider>
          <Everything />
        </InkProvider>
      </React.StrictMode>,
    )
    expect(err.mock.calls.map((c) => String(c[0]).slice(0, 160))).toEqual([])
    err.mockRestore()
    for (const svg of Array.from(container.querySelectorAll("svg[data-ink]"))) {
      expect(svg.getAttribute("aria-hidden") === "true" || svg.getAttribute("role") === "img", svg.getAttribute("data-ink") ?? "").toBe(true)
      expect(svg.querySelector("a, button, input, [tabindex]")).toBeNull()
    }
    expectInkLayers(container, { min: 20 })
  })

  it("mounts in calm density, right-to-left, without motion, and the tree is still accessible", async () => {
    document.documentElement.setAttribute("dir", "rtl")
    try {
      const { container } = render(
        <InkProvider density="calm" motion="reduced">
          <Everything />
        </InkProvider>,
      )
      expectInkLayers(container, { min: 10 })
      await axeCheck(container)
    } finally {
      document.documentElement.removeAttribute("dir")
    }
  })

  it("a long, awkward text never asks for a scrollbar the object cannot give: wrapped or clipped by design", () => {
    const long = "Supercalifragilisticexpialidocious".repeat(3)
    const { getByText } = render(
      <>
        <LabelTag>
          <LabelTagTitle>{long}</LabelTagTitle>
        </LabelTag>
        <Ticket>
          <TicketBody>{long}</TicketBody>
        </Ticket>
        <IndexCard>
          <IndexCardHeader>
            <IndexCardTitle>{long}</IndexCardTitle>
          </IndexCardHeader>
        </IndexCard>
      </>,
    )
    const els = getByText(long, { selector: '[data-slot="label-tag-title"]' })
    expect(els.closest('[data-slot="label-tag"]')).toHaveClass("break-words")
    expect(getByText(long, { selector: '[data-slot="ticket-body"]' })).toHaveClass("break-words", "min-w-0")
    expect(getByText(long, { selector: '[data-slot="index-card-title"]' })).toHaveClass("truncate", "min-w-0")
  })
})

describe("lists of paper", () => {
  it("200 bookmarks in a list cost one small drawing each, and nothing per row beyond it", () => {
    restore()
    restore = mockBox(32, 48)
    const t0 = performance.now()
    const { container } = render(
      <InkProvider>
        <ul>
          {Array.from({ length: 200 }, (_, i) => (
            <li key={i}>
              <Bookmark>Save {i}</Bookmark>
            </li>
          ))}
        </ul>
      </InkProvider>,
    )
    const svgs = container.querySelectorAll("svg[data-ink]")
    expect(svgs.length).toBe(200)
    const perRow = (container.innerHTML.length - (container.querySelector("[data-ll-defs]")?.outerHTML.length ?? 0)) / 200
    expect(perRow).toBeLessThan(5000)
    expect(performance.now() - t0).toBeLessThan(5000)
  })

  it("200 sticky notes and 200 index cards are pure CSS: no svg at all", () => {
    const { container } = render(
      <div>
        {Array.from({ length: 200 }, (_, i) => (
          <React.Fragment key={i}>
            <StickyNote>n{i}</StickyNote>
            <IndexCard>c{i}</IndexCard>
          </React.Fragment>
        ))}
      </div>,
    )
    expect(container.querySelectorAll("svg").length).toBe(0)
  })
})

describe("behaviour a real page leans on", () => {
  it("a right-to-left folder moves between tabs with the arrow that points that way (Radix Tabs' dir), tabs keep the roving tab stop", async () => {
    const { user, getAllByRole } = renderUI(
      <Folder defaultValue="a" dir="rtl">
        <FolderTabs aria-label="Files">
          <FolderTab value="a">A</FolderTab>
          <FolderTab value="b">B</FolderTab>
          <FolderTab value="c">C</FolderTab>
        </FolderTabs>
        <FolderContent value="a">a</FolderContent>
        <FolderContent value="b">b</FolderContent>
        <FolderContent value="c">c</FolderContent>
      </Folder>,
    )
    const tabs = getAllByRole("tab")
    tabs[0].focus()
    await user.keyboard("{ArrowLeft}")
    expect(document.activeElement).toBe(tabs[1])
    expect(tabs[1]).toHaveAttribute("aria-selected", "true")
    expect(tabs.map((t) => t.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"])
  })

  it("a bookmark inside a form toggles without submitting it", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    const { user, getByRole } = renderUI(
      <form onSubmit={onSubmit}>
        <Bookmark>Save</Bookmark>
      </form>,
    )
    const b = getByRole("button", { name: "Save" })
    expect(b).toHaveAttribute("type", "button")
    await user.click(b)
    expect(b).toHaveAttribute("aria-pressed", "true")
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("a tag that is a disabled button stays a disabled button (the swing and the hover layer skip :disabled in the stylesheet)", () => {
    const { getByRole } = render(
      <LabelTag asChild>
        <button type="button" disabled>
          <LabelTagTitle>Sold</LabelTagTitle>
        </button>
      </LabelTag>,
    )
    expect(getByRole("button", { name: "Sold" })).toBeDisabled()
  })
})
