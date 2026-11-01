import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleIndicator, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Dropzone from "@/docs/examples/empty/03-dropzone"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(120, 36)
})
afterEach(() => restore())

const inkCount = (root: ParentNode) => root.querySelectorAll("svg[data-ink]").length

describe("long lists draw no ink per row", () => {
  it("a 200-row table has no svg inside it at all, drawn or not", () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 200 }, (_, i) => (
            <TableRow key={i} data-state={i === 3 ? "selected" : undefined}>
              <TableCell>Row {i}</TableCell>
              <TableCell>{i}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>,
    )
    expect(container.querySelectorAll("tr")).toHaveLength(201)
    expect(inkCount(container)).toBe(0)
    expect(container.querySelectorAll("table svg")).toHaveLength(0)
  })

  it("a table with an avatar per row: bare avatars (ring none, no name) stay cheap", () => {
    const { container } = render(
      <Table>
        <TableBody>
          {Array.from({ length: 50 }, (_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Avatar ring="none">
                  <AvatarFallback name={`Person ${i}`} />
                </Avatar>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>,
    )
    expect(inkCount(container)).toBeLessThanOrEqual(50)
  })
})

describe("Table CSS the browser will read", () => {
  it("lights the hover swipe only where a pointer can hover, and keeps a row lit while its menu is open", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const css = document.head.querySelector('style[data-href="ll-table"]')!.textContent!
    expect(css).toMatch(/@media \(hover: hover\) \{[^}]*:hover > :is\(td, th\)::before \{ opacity: 0\.4; \}/)
    expect(css).toContain(':has([aria-expanded="true"]) > :is(td, th)::before')
    expect(css.indexOf('[data-state="selected"], [aria-selected="true"]) > :is(td, th)::before { opacity: 1')).toBeGreaterThan(css.indexOf(':has([aria-expanded="true"]) > :is(td, th)::before'))
  })

  it("a table nested in a sticky table does not pin its own header", () => {
    const { container } = render(
      <Table sticky>
        <TableHeader>
          <TableRow>
            <TableHead>Outer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>cell</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const [outer, inner] = Array.from(container.querySelectorAll("thead"))
    expect(outer.className).toContain("sticky")
    expect(inner.className).not.toContain("sticky")
  })

  it("a className on the header can move the pinned offset", () => {
    const { container } = render(
      <Table sticky>
        <TableHeader className="top-14">
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    )
    const cls = container.querySelector("thead")!.className
    expect(cls).toContain("top-14")
    expect(cls).not.toContain("top-0")
  })
})

describe("SSR of several tables in one document", () => {
  it("hoists the table sheet once, however many tables there are", () => {
    const html = renderToString(
      <>
        {[0, 1, 2].map((i) => (
          <Table key={i}>
            <TableBody>
              <TableRow>
                <TableCell>{i}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ))}
      </>,
    )
    expect(html.match(/data-href="ll-table"/g)).toHaveLength(1)
  })
})

describe("nesting: a group selector matches ANY ancestor, so nested widgets must not read their parent's state", () => {
  it("a horizontal Tabs inside a vertical Tabs is laid out by its own orientation", () => {
    const { getAllByRole } = render(
      <Tabs defaultValue="a" orientation="vertical">
        <TabsList>
          <TabsTrigger value="a">Outer A</TabsTrigger>
          <TabsTrigger value="b">Outer B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">
          <Tabs defaultValue="x">
            <TabsList>
              <TabsTrigger value="x">Inner X</TabsTrigger>
              <TabsTrigger value="y">Inner Y</TabsTrigger>
            </TabsList>
            <TabsContent value="x">inner panel</TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>,
    )
    const [outerList, innerList] = getAllByRole("tablist")
    const inner = innerList.getAttribute("class") ?? ""
    const outer = outerList.getAttribute("class") ?? ""
    expect(inner).not.toMatch(/group-data-\[orientation=vertical\]\/tabs/)
    expect(outer).not.toMatch(/group-data-\[orientation=vertical\]\/tabs/)
    expect(outerList).toHaveAttribute("aria-orientation", "vertical")
    expect(innerList).toHaveAttribute("aria-orientation", "horizontal")
    for (const t of getAllByRole("tab")) expect(t.getAttribute("class") ?? "").not.toMatch(/group-data-\[orientation=(vertical|horizontal)\]\/tabs/)
  })

  it("an inner Accordion's last rule is not hidden because the OUTER item is the last one", () => {
    const { container } = render(
      <Accordion type="single" collapsible defaultValue="o">
        <AccordionItem value="o">
          <AccordionTrigger>Outer</AccordionTrigger>
          <AccordionContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="i1">
                <AccordionTrigger>Inner one</AccordionTrigger>
                <AccordionContent>x</AccordionContent>
              </AccordionItem>
              <AccordionItem value="i2">
                <AccordionTrigger>Inner two</AccordionTrigger>
                <AccordionContent>y</AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    for (const rule of container.querySelectorAll("[data-slot=accordion-rule]")) {
      expect(rule.getAttribute("class") ?? "", "rule").not.toMatch(/group-last\/accordion-item/)
    }
    const items = container.querySelectorAll("[data-slot=accordion-item]")
    for (const it of items) expect(it.getAttribute("class") ?? "").toMatch(/last:\[&>\[data-slot=accordion-rule\]\]:hidden/)
  })

  it("a closed inner Collapsible's indicator is not turned by an open outer one", () => {
    const { container } = render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>
          Outer <CollapsibleIndicator />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Collapsible>
            <CollapsibleTrigger>
              Inner <CollapsibleIndicator />
            </CollapsibleTrigger>
          </Collapsible>
        </CollapsibleContent>
      </Collapsible>,
    )
    for (const ind of container.querySelectorAll("[data-slot=collapsible-indicator]")) {
      expect(ind.getAttribute("class") ?? "").not.toMatch(/group-data-\[state=open\]\/collapsible:/)
      expect(ind.getAttribute("class") ?? "").toMatch(/group-data-\[state=open\]\/collapsible-trigger:rotate-180/)
    }
    for (const trigger of container.querySelectorAll("[data-slot=collapsible-trigger]")) expect(trigger).toHaveClass("group/collapsible-trigger")
  })
})

describe("group-level disabled", () => {
  it("Accordion disabled: no row opens and the triggers are real disabled buttons", async () => {
    const { user, getByRole } = renderUI(
      <Accordion type="single" collapsible disabled>
        <AccordionItem value="a">
          <AccordionTrigger>Locked</AccordionTrigger>
          <AccordionContent>secret</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    const trigger = getByRole("button", { name: "Locked" })
    expect(trigger).toBeDisabled()
    await user.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "false")
  })

  it("ResizablePanelGroup disabled draws its seams as disabled", () => {
    const { container } = render(
      <ResizablePanelGroup orientation="horizontal" disabled>
        <ResizablePanel id="a" defaultSize="50%">
          A
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Resize" />
        <ResizablePanel id="b" defaultSize="50%">
          B
        </ResizablePanel>
      </ResizablePanelGroup>,
    )
    const handle = container.querySelector("[data-slot=resizable-handle]")!
    const layers = Array.from(handle.querySelectorAll("svg[data-ink] [data-layer]")).map((g) => g.getAttribute("data-layer"))
    expect(layers).toEqual(["disabled"])
  })
})

describe("Empty frame detection", () => {
  it.each(["border", "border border-dashed", "rounded-lg border p-4"])("className=%j asks for the sketched frame", (cls) => {
    const { container } = render(
      <Empty className={cls}>
        <EmptyHeader>
          <EmptyMedia variant="icon" />
          <EmptyTitle>Nothing</EmptyTitle>
          <EmptyDescription>Text</EmptyDescription>
        </EmptyHeader>
      </Empty>,
    )
    expect(container.querySelector("[data-slot=empty] > svg[data-ink=frame]")).not.toBeNull()
  })

  it("a bare Empty draws no frame (and nothing to clip)", () => {
    const { container } = render(
      <Empty>
        <EmptyTitle>Nothing</EmptyTitle>
      </Empty>,
    )
    expect(container.querySelector("svg[data-ink=frame]")).toBeNull()
  })
})

describe("the dropzone example is a working drop target", () => {
  it("lights up while a file is over it, lists the dropped files, and the button opens the picker", async () => {
    const { container, getByRole, getByText } = renderUI(<Dropzone />)
    const empty = container.querySelector("[data-slot=empty]")!
    fireEvent.dragOver(empty)
    expect(empty).toHaveAttribute("data-over")
    fireEvent.dragLeave(empty)
    expect(empty).not.toHaveAttribute("data-over")
    const file = new File(["x"], "plan.pdf", { type: "application/pdf" })
    fireEvent.drop(empty, { dataTransfer: { files: [file] } })
    expect(getByText("plan.pdf")).toBeTruthy()
    expect(getByText("Ready to send")).toBeTruthy()
    const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {})
    fireEvent.click(getByRole("button", { name: "Choose others" }))
    expect(click).toHaveBeenCalled()
    click.mockRestore()
    await axeCheck(container)
  })
})

describe("Avatar in groups", () => {
  it("lets the group set the cut-out colour, with the card as the default", () => {
    const { container } = render(
      <AvatarGroup className="[--ll-avatar-group-ring:var(--background)]">
        <Avatar>
          <AvatarFallback name="Ada Lovelace" />
        </Avatar>
        <Avatar>
          <AvatarFallback name="Jo Okafor" />
        </Avatar>
      </AvatarGroup>,
    )
    const group = container.querySelector("[data-slot=avatar-group]")!
    expect(group.getAttribute("class")).toMatch(/var\(--ll-avatar-group-ring,var\(--card\)\)/)
  })

  it("badge and fallback of identical names in one page do not collide on ids", () => {
    const { container } = render(
      <>
        {[0, 1].map((i) => (
          <Avatar key={i} size="lg">
            <AvatarFallback name="Ada Lovelace" />
            <AvatarBadge status="online" />
          </Avatar>
        ))}
      </>,
    )
    const ids = Array.from(container.querySelectorAll("[id]")).map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe("StrictMode + provider + hydration of the composed layouts", () => {
  it("hydrates a tabs + accordion + table page without a warning", async () => {
    const Page = () => (
      <InkProvider>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Tab A</TabsTrigger>
            <TabsTrigger value="b" disabled>
              Tab B
            </TabsTrigger>
          </TabsList>
          <TabsContent value="a">
            <Accordion type="multiple" defaultValue={["x"]}>
              <AccordionItem value="x">
                <AccordionTrigger>Row</AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>cell</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>
      </InkProvider>
    )
    const html = renderToString(<Page />)
    const host = document.createElement("div")
    document.body.appendChild(host)
    host.innerHTML = html
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    await act(async () => {
      hydrateRoot(
        host,
        <React.StrictMode>
          <Page />
        </React.StrictMode>,
      )
    })
    expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 200))).toEqual([])
    errors.mockRestore()
    host.remove()
  })

  it("axe passes on a page composing all nine kinds", async () => {
    const { container } = renderUI(
      <div>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Tab A</TabsTrigger>
          </TabsList>
          <TabsContent value="a">
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon" />
                <EmptyTitle>Nothing yet</EmptyTitle>
                <EmptyDescription>Add something.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </TabsContent>
        </Tabs>
        <ResizablePanelGroup orientation="horizontal" className="h-20">
          <ResizablePanel id="l">L</ResizablePanel>
          <ResizableHandle withHandle aria-label="Resize the list" />
          <ResizablePanel id="r">R</ResizablePanel>
        </ResizablePanelGroup>
      </div>,
    )
    await axeCheck(container)
  })
})
