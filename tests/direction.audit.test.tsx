import * as fs from "node:fs"
import * as path from "node:path"
import * as React from "react"
import { renderToString } from "react-dom/server"
import { act, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Calendar } from "@/components/ui/calendar"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import { DirectionProvider } from "@/components/ui/direction"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar, SidebarContent, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { icons } from "@/lib/ink/art/icons"
import { InkProvider } from "@/lib/ink/react"
import { smokeRender, withServerGlobals } from "./_ssr-lib"
import { expectInkLayers, mockBox, renderUI } from "./helpers"

const modal = { user: { pointerEventsCheck: 0 } }

const cssSource = fs.readFileSync(path.resolve(import.meta.dirname, "../src/styles/looseleaf.css"), "utf8")

const UI = import.meta.glob("/src/components/ui/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>
const HOOKS = import.meta.glob("/src/hooks/*.ts*", { query: "?raw", import: "default", eager: true }) as Record<string, string>
const LIB = import.meta.glob(["/src/lib/*.ts*", "/src/lib/ink/recipes/*.ts"], { query: "?raw", import: "default", eager: true }) as Record<string, string>

const slug = (path: string) => path.replace(/^.*\//, "").replace(/\.tsx?$/, "")
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/(^|[^:"'`\w])\/\/.*$/gm, "$1")
const uiFiles = Object.entries(UI).map(([path, src]) => ({ file: slug(path), src, code: stripComments(src) }))

function utilityOf(token: string): { variants: string; utility: string } {
  let depth = 0
  let cut = -1
  for (let i = 0; i < token.length; i++) {
    const c = token[i]
    if (c === "[" || c === "(") depth++
    else if (c === "]" || c === ")") depth--
    else if (c === ":" && depth === 0) cut = i
  }
  return { variants: token.slice(0, cut + 1), utility: token.slice(cut + 1).replace(/^!/, "").replace(/!$/, "") }
}

let restore = () => {}
beforeEach(() => {
  restore = mockBox(120, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

describe("rtl audit: physical directions in src/components/ui", () => {
  const PHYSICAL =
    /^(?:-?(?:left|right)-.+|-?(?:ml|mr|pl|pr)-.+|-?scroll-(?:ml|mr|pl|pr)-.+|text-(?:left|right)|border-[lr](?:-.+)?|rounded-[lr]-.+|float-(?:left|right)|clear-(?:left|right)|origin-(?:left|right|(?:top|bottom)-(?:left|right))|-?translate-x-.+|slide-(?:in-from|out-to)-(?:left|right)(?:-.+)?|-?scale-x-.+|inset-[lr]-.+|object-(?:left|right)(?:-.+)?|bg-(?:left|right)(?:-.+)?)$/

  const ALLOWED: Array<{ file: string; token: RegExp; why: string }> = [
    { file: "alert-dialog", token: /^-(?:left|right)-7$/, why: "a strip of tape on each top corner: a symmetric pair of objects, not text flow" },
    { file: "attachment", token: /^-ml-\[26px\]$/, why: "the offset that centres a tape strip together with left-1/2" },
    { file: "corkboard", token: /^left-0$/, why: "notes sit at x/y in board coordinates; the board origin is its top-left in any language" },
    { file: "desk", token: /^origin-left$/, why: "rotation pivot of the still-life pencil (its position is logical: start-10)" },
    { file: "doodle", token: /^-scale-x-100$/, why: "the explicit `flip` prop" },
    { file: "icon", token: /^-scale-x-100$/, why: "the explicit `flip` prop (art marked `mirror`)" },
    { file: "sticker-board", token: /^-scale-x-100$/, why: "a sticker's own flip, chosen by the person arranging the board" },
    { file: "drawer", token: /^data-\[vaul-drawer-direction=(?:left|right)\]:(?:left|right)-0$/, why: "vaul's drawer sides are physical (`direction` prop), like upstream" },
    { file: "hover-card", token: /^data-\[side=(?:left|right)\]:slide-in-from-(?:left|right)-2$/, why: "Radix `data-side` is a physical side; the slide comes from the trigger's direction" },
    { file: "popover", token: /^data-\[side=(?:left|right)\]:slide-in-from-(?:left|right)-2$/, why: "Radix `data-side` is a physical side" },
    { file: "tooltip", token: /^data-\[side=(?:left|right)\]:slide-in-from-(?:left|right)-2$/, why: "Radix `data-side` is a physical side" },
    { file: "select", token: /^data-\[side=(?:left|right)\]:(?:slide-in-from-(?:left|right)-2|-?translate-x-1)$/, why: "Radix `data-side` is a physical side" },
    { file: "kbd", token: /^(?:calm:)?p[lr]-.+$/, why: "the keycap's thickness is drawn on its right edge in both directions, so its padding is physical (review-wp-basics #11)" },
    { file: "notebook", token: /^right-0$/, why: "the dog-ear is drawn on the bottom-right corner in both directions, and the turn button sits on it (documented on NotebookTurn)" },
    { file: "paper", token: /^(?:-?(?:left|right)-\S+|-ml-\S+)$/, why: "fasteners and tape are objects placed on a corner or the middle of the sheet, not text flow" },
    { file: "peel-corner", token: /^(?:left-0|right-0|origin-bottom-(?:left|right))$/, why: "`corner` is a physical prop (bottom-left / bottom-right)" },
    { file: "reveal", token: /^-translate-x-\[12%\]$/, why: "a 3 px optical offset of the pen nib" },
    { file: "scroll-area", token: /^border-l(?:-transparent)?$/, why: "a 1 px transparent inset inside the vertical scrollbar; 1 px asymmetric in RTL, requested as `border-s` (requests.md)" },
    { file: "sheet", token: /^(?:left-0|right-0|data-\[state=(?:closed|open)\]:slide-(?:in-from|out-to)-(?:left|right)|p[lr]-6)$/, why: "`side` and the binding edge are physical, like upstream's Sheet" },
    { file: "sidebar", token: /^(?:group-data-\[side=(?:left|right)\]:-?(?:left|right)-[\d/]+|(?:left|right)-0|group-data-\[collapsible=offcanvas\]:(?:left|right)-\[calc\(var\(--sidebar-width\)\*-1\)\]|group-data-\[collapsible=offcanvas\]:translate-x-0|group-data-\[collapsible=offcanvas\]:after:left-full|\[\[data-side=(?:left|right)\]\[data-collapsible=offcanvas\]_&\]:-(?:left|right)-2|-translate-x-1\/2|after:left-1\/2)$/, why: "`side` is physical (fixed to an edge), like upstream's Sidebar; the rail sits on the edge facing the page" },
    { file: "sticker-board", token: /^(?:left-0|origin-top-left)$/, why: "board coordinates" },
    { file: "sticker-sheet", token: /^group-data-\[(?:state=peeled|drop)\]\/slot:translate-x-(?:4|0!?)$/, why: "the nudge of a sticker peeling off the sheet; decorative motion" },
    { file: "tear-off", token: /^origin-(?:top-left|bottom-left|bottom-right)$/, why: "chosen per direction in code (`rtl ? … : …`)" },
  ]
  const CENTRING = /^(?:-?translate-x-1\/2|left-1\/2)$/

  const found = uiFiles.flatMap(({ file, code }) =>
    code.split("\n").flatMap((line, i) =>
      line
        .split(/[\s"'`{},;]+/)
        .filter(Boolean)
        .map((raw) => ({ file, line: i + 1, raw, ...utilityOf(raw), text: line }))
        .filter(({ utility }) => PHYSICAL.test(utility))
    )
  )

  const root = (u: string) => {
    const n = u.replace(/^-/, "")
    if (/^slide-(?:in-from|out-to)-/.test(n)) return n.replace(/^(slide-(?:in-from|out-to)).*$/, "$1")
    if (/^translate-x-/.test(n)) return "translate-x"
    if (/^scale-x-/.test(n)) return "scale-x"
    if (/^(?:left|right)-/.test(n)) return "inset-x"
    return n
  }
  const tokensOf = (line: string) => line.split(/[\s"'`{},;]+/).filter(Boolean).map(utilityOf)

  const covered = (f: (typeof found)[number]): string | null => {
    if (f.variants.split(":").includes("rtl")) return "is itself an rtl: twin"
    if (CENTRING.test(f.utility)) return "centring (left-1/2 with a matching translate) is symmetric"
    if (tokensOf(f.text).some((t) => t.variants.split(":").includes("rtl") && root(t.utility) === root(f.utility))) return "has an rtl: twin on the same line"
    const allowed = ALLOWED.find((a) => a.file === f.file && a.token.test(f.raw))
    return allowed ? allowed.why : null
  }

  it("every physical left/right class is a centring pair, has an rtl: twin, or is allowed for a written reason", () => {
    const loose = found.filter((f) => covered(f) === null).map((f) => `${f.file}.tsx:${f.line}  ${f.raw}`)
    expect(loose, `physical direction classes with no reason (use start/end, add an rtl: twin, or list it in ALLOWED):\n  ${loose.join("\n  ")}`).toEqual([])
  })

  it("no allowance is stale: each one still matches a class in its file", () => {
    const stale = ALLOWED.filter((a) => !found.some((f) => f.file === a.file && a.token.test(f.raw) && !f.variants.split(":").includes("rtl"))).map((a) => `${a.file}: ${a.token}`)
    expect(stale).toEqual([])
  })

  it("fixed by this audit: marker text is text-start, the tear-off hint centres with a physical pair, navigation-menu slides have rtl twins", () => {
    const src = (name: string) => uiFiles.find((f) => f.file === name)!.code
    expect(src("marker")).toContain("text-start")
    expect(src("marker")).not.toMatch(/\btext-left\b/)
    expect(src("tear-off")).toContain('"left-1/2 bottom-1 -translate-x-1/2"')
    for (const c of ["from-end]:slide-in-from-left-52", "from-start]:slide-in-from-right-52", "to-end]:slide-out-to-left-52", "to-start]:slide-out-to-right-52"]) {
      expect(src("navigation-menu")).toContain(`rtl:data-[motion=${c}`)
    }
  })

  it("no inline physical style: no margin/padding/border/text-align left|right in style props, and left/right in style only for coordinates", () => {
    const bad = uiFiles.flatMap(({ file, code }) =>
      code.split("\n").flatMap((line, i) => (/\b(?:marginLeft|marginRight|paddingLeft|paddingRight|borderLeft|borderRight)\b|textAlign:\s*["'](?:left|right)|text-align:\s*(?:left|right)\b/.test(line) ? [`${file}.tsx:${i + 1}`] : []))
    )
    expect(bad).toEqual([])
  })
})

describe("rtl audit: icons that mirror", () => {
  const FLIPPED = ["chevron-right", "chevron-left", "arrow-right", "arrow-left", "chevrons-left", "chevrons-right", "undo-2", "redo-2", "panel-left", "panel-left-close", "panel-left-open", "menu", "list", "send", "log-in", "log-out"]
  const KEPT: Record<string, string> = {
    "chevron-down": "vertical axis",
    "chevron-up": "vertical axis",
    "arrow-down": "vertical axis",
    "arrow-up": "vertical axis",
    "arrow-up-down": "vertical axis",
    "chevrons-up-down": "vertical axis",
    "arrow-up-right": "diagonal: the 'external' arrow reads the same in both directions",
    "external-link": "same reasoning as arrow-up-right",
    "skip-back": "transport controls keep the tape-deck direction",
    "skip-forward": "transport controls keep the tape-deck direction",
    "rotate-cw": "clockwise stays clockwise",
    "rotate-ccw-clock": "counter-clockwise stays counter-clockwise (a clock)",
    "trending-up": "the plot is left to right on any page (charts are dir=ltr canvases)",
    "trending-down": "the plot is left to right on any page (charts are dir=ltr canvases)",
    repeat: "a loop",
    shuffle: "crossing arrows: symmetric enough",
    share: "an arrow leaving a box",
    terminal: "a prompt caret is left to right in every language",
    "square-terminal": "a prompt caret is left to right in every language",
    play: "media controls",
    "circle-play": "media controls",
    "list-filter": "a funnel",
    "file-text": "lines of text on a page",
  }
  const DIRECTIONAL = /left|right|arrow|chevron|undo|redo|panel|log-|send|list|menu|skip|forward|back|next|prev|reply|indent|external|trending|rotate|repeat|shuffle|share|terminal|play/

  it("every icon whose name looks directional is either flipped or kept on purpose", () => {
    const unknown = Object.keys(icons).filter((n) => DIRECTIONAL.test(n) && !FLIPPED.includes(n) && !(n in KEPT))
    expect(unknown, `decide for each: add \`rtl: 'flip'\` to its art, or list it in KEPT with the reason`).toEqual([])
  })

  it("the art flags exactly the flipped list", () => {
    const flagged = Object.entries(icons as Record<string, { rtl?: string }>).filter(([, d]) => d.rtl === "flip").map(([n]) => n)
    expect([...flagged].sort()).toEqual([...FLIPPED].sort())
  })

  it("<Icon> mirrors the flipped ones in rtl and leaves the kept ones alone", () => {
    for (const name of FLIPPED) expect(renderToString(<Icon name={name} />), name).toContain("rtl:-scale-x-100")
    for (const name of Object.keys(KEPT)) expect(renderToString(<Icon name={name} />), name).not.toContain("rtl:-scale-x-100")
  })

  it("components use the flipping names for previous/next: the chevron of a pagination and of a sub-menu trigger", async () => {
    const { container } = render(
      <DirectionProvider direction="rtl">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#p" />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#n" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </DirectionProvider>
    )
    const svgs = [...container.querySelectorAll('svg[data-icon^="chevron"]')]
    expect(svgs.map((s) => s.getAttribute("data-icon"))).toEqual(["chevron-left", "chevron-right"])
    for (const s of svgs) expect(s.getAttribute("class")).toContain("rtl:-scale-x-100")
  })
})

describe("rtl audit: the stylesheet", () => {
  it("swaps the wipe: [dir=rtl] reverses the two inset variables, and ll-wipe reads them", () => {
    expect(cssSource).toMatch(/\[dir="rtl"\]\s*\{\s*--ll-wipe-r:\s*-4%;\s*--ll-wipe-l:\s*100%;\s*\}/)
    expect(cssSource).toMatch(/\[dir="ltr"\]\s*\{\s*--ll-wipe-r:\s*100%;\s*--ll-wipe-l:\s*-4%;\s*\}/)
    expect(cssSource).toMatch(/@keyframes ll-wipe\s*\{[^}]*inset\(-10% var\(--ll-wipe-r, 100%\) -10% var\(--ll-wipe-l, -4%\)\)/)
  })

  it("no component keyframe moves or wipes along x without a right-to-left twin, a mirroring element, or a written reason", () => {
    const PHYSICAL_KEYFRAME = /clip-path:\s*inset\((?!0\))|\bleft\s*:|\bright\s*:|translate(?:X)?\(/
    const names = uiFiles.flatMap(({ code }) => [...code.matchAll(/@keyframes\s+([\w-]+)\s*\{([^@]*)/g)].filter((m) => PHYSICAL_KEYFRAME.test(m[2])).map((m) => m[1]))
    const MIRRORED_OTHERWISE: Record<string, string> = {
      "ll-type-wipe": "the typing-indicator svg is flipped as a whole (rtl:[&>svg]:-scale-x-100), so are its hop and walk",
      "ll-reveal-nib": "left: var(--ll-nib-a) / --ll-nib-b are swapped by [dir=rtl]",
    }
    const KNOWN_GAPS: Record<string, string> = {
      "ll-plane": "prompt-input's send plane flies off up and to the RIGHT and re-enters from the left in both directions, while the send icon points left in RTL (requested in notes/requests.md)",
    }
    const loose = names.filter((n) => !names.includes(`${n}-rtl`) && !n.endsWith("-rtl") && !(n in MIRRORED_OTHERWISE)).sort()
    expect(loose, "physical keyframes without an -rtl twin or a listed reason").toEqual(Object.keys(KNOWN_GAPS))
    expect(names.filter((n) => n.endsWith("-rtl")).sort()).toEqual(["ll-marquee-rtl", "ll-progress-slide-rtl"])
  })
})

describe("rtl audit: ten components inside dir=rtl (server, drawn, facts)", () => {
  const driftless = /NaN|Infinity|undefined|\[object/

  function rtl(node: React.ReactNode) {
    return (
      <InkProvider>
        <DirectionProvider direction="rtl">{node}</DirectionProvider>
      </InkProvider>
    )
  }
  const ltr = (node: React.ReactNode) => (
    <InkProvider>
      <DirectionProvider direction="ltr">{node}</DirectionProvider>
    </InkProvider>
  )

  type Sample = { name: string; make: () => React.ReactNode; mirrors?: boolean }
  const SAMPLES: Sample[] = [
    {
      name: "Tabs",
      mirrors: true,
      make: () => (
        <Tabs defaultValue="a">
          <TabsList aria-label="صفحات">
            <TabsTrigger value="a" seed="a">أ</TabsTrigger>
            <TabsTrigger value="b" seed="b">ب</TabsTrigger>
          </TabsList>
        </Tabs>
      ),
    },
    {
      name: "Switch",
      mirrors: true,
      make: () => <Switch aria-label="تفعيل" defaultChecked seed="sw" />,
    },
    {
      name: "Select",
      mirrors: true,
      make: () => (
        <Select defaultValue="a">
          <SelectTrigger aria-label="اختيار" seed="sel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">أ</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      name: "Carousel",
      mirrors: true,
      make: () => (
        <div className="mx-12">
          <Carousel aria-label="شرائح" seed="car">
            <CarouselContent>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CarouselItem key={i}>{i}</CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      ),
    },
    {
      name: "Input",
      make: () => <Input aria-label="اسم" aria-invalid defaultValue="ليلى" />,
    },
    {
      name: "Slider",
      make: () => <Slider defaultValue={[30]} aria-label="حجم" />,
    },
    {
      name: "Progress",
      make: () => <Progress value={40} aria-label="تقدم" />,
    },
    {
      name: "Table",
      make: () => (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead className="text-end">المبلغ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>ليلى</TableCell>
              <TableCell className="text-end">250</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ),
    },
    {
      name: "Accordion",
      make: () => (
        <Accordion type="single" collapsible defaultValue="a">
          <AccordionItem value="a">
            <AccordionTrigger>سؤال</AccordionTrigger>
            <AccordionContent>جواب</AccordionContent>
          </AccordionItem>
        </Accordion>
      ),
    },
    {
      name: "Breadcrumb and Pagination",
      make: () => (
        <>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>بيت</BreadcrumbItem>
              <BreadcrumbSeparator>
                <Icon name="chevron-right" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>دفتر</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#p" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#1" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#n" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      ),
    },
    {
      name: "Sidebar",
      make: () => (
        <SidebarProvider>
          <Sidebar side="right" seed="sb">
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>الرئيسية</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <SidebarTrigger />
          </SidebarInset>
        </SidebarProvider>
      ),
    },
  ]

  for (const sample of SAMPLES) {
    it(`${sample.name}: renders on the server twice alike, with no leaked values`, async () => {
      const { problems, markup } = await withServerGlobals(() => smokeRender(() => rtl(sample.make() as React.ReactElement)))
      expect(problems.map((p) => `${p.check}: ${p.message}`)).toEqual([])
      expect(markup).toContain('dir="rtl"')
    })

    it(`${sample.name}: is drawn in rtl with clean ink${sample.mirrors ? ", and the drawing is mirrored" : ""}`, async () => {
      const draw = async (tree: React.ReactElement) => {
        const { container, unmount } = render(tree)
        await act(async () => {})
        const svgs = [...container.querySelectorAll("svg[data-ink]")].filter((s) => s.getAttribute("data-ink") !== "icon")
        const markup = svgs.map((s) => s.outerHTML).join("\n")
        expect(markup).not.toMatch(driftless)
        expectInkLayers(container, { min: 0 })
        for (const host of container.querySelectorAll("[data-ink-ready]")) {
          if (!host.matches("[data-slot=paper]")) expect(host.querySelector(":scope > svg[data-ink]"), `<${host.tagName.toLowerCase()} data-slot=${host.getAttribute("data-slot")}> is ready but has no svg`).not.toBeNull()
        }
        unmount()
        return markup
      }
      const r = await draw(rtl(sample.make()) as React.ReactElement)
      if (sample.mirrors) {
        expect(r.length).toBeGreaterThan(0)
        const l = await draw(ltr(sample.make()) as React.ReactElement)
        expect(r, `${sample.name} draws the same thing in both directions`).not.toBe(l)
      }
    })
  }

  it("Tabs: the arrows run against the page (ArrowLeft is next)", async () => {
    const { user, getAllByRole } = renderUI(rtl(SAMPLES[0].make()))
    const tabs = getAllByRole("tab")
    await user.click(tabs[0])
    await user.keyboard("{ArrowLeft}")
    expect(tabs[1]).toHaveFocus()
  })

  it("Menu: the sub-menu chevron flips, the sub-menu opens with ArrowLeft, and both levels carry dir", async () => {
    const { user } = renderUI(
      rtl(
        <DropdownMenu>
          <DropdownMenuTrigger>فتح</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>نقل</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>المسودات</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      modal
    )
    await user.click(screen.getByText("فتح"))
    const trigger = await screen.findByRole("menuitem", { name: "نقل" })
    expect(trigger.querySelector('svg[data-icon="chevron-right"]')?.getAttribute("class")).toContain("rtl:-scale-x-100")
    trigger.focus()
    await user.keyboard("{ArrowLeft}")
    const sub = await screen.findByText("المسودات")
    expect(sub.closest("[role=menu]")).toHaveAttribute("dir", "rtl")
    expect(screen.getAllByRole("menu")[0]).toHaveAttribute("dir", "rtl")
  })

  it("Slider: starts at the right edge and ArrowLeft raises the value", async () => {
    const { user, container } = renderUI(rtl(<Slider defaultValue={[30]} aria-label="حجم" />))
    expect(container.querySelector<HTMLElement>("[data-slot=slider-range]")!.style.right).toBe("0%")
    screen.getByRole("slider").focus()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "31")
  })

  it("Progress: the fill grows from the right", () => {
    const { container } = render(rtl(<Progress value={40} aria-label="تقدم" />))
    const cls = container.querySelector("[data-slot=progress-indicator]")!.getAttribute("class")!
    expect(cls).toContain("rtl:[clip-path:inset(-12px_0_-12px_calc(100%_-_var(--ll-progress,100)_*_1%))]")
    expect(cls).toContain("rtl:data-[state=indeterminate]:animate-[ll-progress-slide-rtl")
  })

  it("Switch: the thumb travels the other way", () => {
    const { container } = render(rtl(<Switch aria-label="تفعيل" />))
    const cls = container.querySelector("[data-slot=switch-thumb]")!.getAttribute("class")!
    expect(cls).toContain("rtl:data-[state=unchecked]:-translate-x-1")
    expect(cls).toContain("rtl:data-[state=checked]:-translate-x-(--sw-on)")
  })

  it("Table: headings start at the reading edge and rules are logical", () => {
    const { container } = render(rtl(SAMPLES.find((s) => s.name === "Table")!.make()))
    expect(container.querySelector("[data-slot=table-head]")!.getAttribute("class")).toContain("text-start")
    expect([...document.querySelectorAll("style")].map((el) => el.textContent).join("")).toContain("inset-inline: 0")
  })

  it("Sidebar: pinned right, its trigger icon is the flipping panel glyph", () => {
    const { container } = render(rtl(SAMPLES.find((s) => s.name === "Sidebar")!.make()))
    expect(container.querySelector("[data-slot=sidebar]")).toHaveAttribute("data-side", "right")
    expect(container.querySelector('[data-slot=sidebar-trigger] svg[data-icon="panel-left"]')?.getAttribute("class")).toContain("rtl:-scale-x-100")
  })

  it("Sheet: on a right-hand sheet the close mark steps in past the coils on its left edge, which is its END edge in rtl", async () => {
    const { user } = renderUI(
      rtl(
        <Sheet>
          <SheetTrigger>فتح</SheetTrigger>
          <SheetContent side="right">
            <SheetTitle>عنوان</SheetTitle>
            <SheetDescription>وصف</SheetDescription>
          </SheetContent>
        </Sheet>
      ),
      modal
    )
    await user.click(screen.getByText("فتح"))
    const dialog = await screen.findByRole("dialog")
    expect(dialog).toHaveAttribute("dir", "rtl")
    expect(dialog.querySelector("[data-slot=sheet-close]")!.getAttribute("class")).toContain("rtl:end-9")
  })

  it("Carousel: ArrowLeft is next in rtl (read from the computed direction)", async () => {
    let api: CarouselApi
    const { user } = renderUI(
      rtl(
        <div className="mx-12">
          <Carousel aria-label="شرائح" opts={{ direction: "rtl" }} setApi={(a) => (api = a)}>
            <CarouselContent>
              {[1, 2, 3].map((i) => (
                <CarouselItem key={i}>
                  <button type="button">{i}</button>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )
    )
    await waitFor(() => expect(api).toBeTruthy())
    const next = vi.spyOn(api!, "scrollNext")
    const prev = vi.spyOn(api!, "scrollPrev")
    screen.getByRole("button", { name: "1" }).focus()
    await user.keyboard("{ArrowLeft}")
    expect([next.mock.calls.length, prev.mock.calls.length]).toEqual([1, 0])
    await user.keyboard("{ArrowRight}")
    expect([next.mock.calls.length, prev.mock.calls.length]).toEqual([1, 1])
  })

  it.fails("Carousel: hands the reading direction to Embla without being told", async () => {
    let api: CarouselApi
    renderUI(
      rtl(
        <Carousel aria-label="شرائح" setApi={(a) => (api = a)}>
          <CarouselContent>
            <CarouselItem>1</CarouselItem>
          </CarouselContent>
        </Carousel>
      )
    )
    await waitFor(() => expect(api).toBeTruthy())
    expect(api!.internalEngine().options.direction).toBe("rtl")
  })

  it("Calendar: with dir passed by hand, ArrowLeft goes to the next day", async () => {
    const { user } = renderUI(rtl(<Calendar mode="single" dir="rtl" selected={new Date(2026, 8, 17)} today={new Date(2026, 8, 15)} defaultMonth={new Date(2026, 8, 1)} />))
    const day = (n: number) => screen.getByRole("button", { name: new RegExp(`September ${n}(st|nd|rd|th), 2026`) })
    day(17).focus()
    await user.keyboard("{ArrowLeft}")
    await waitFor(() => expect(day(18)).toHaveFocus())
  })

  it("Calendar: takes the reading direction from the provider without dir being passed", async () => {
    const { user } = renderUI(rtl(<Calendar mode="single" selected={new Date(2026, 8, 17)} today={new Date(2026, 8, 15)} defaultMonth={new Date(2026, 8, 1)} />))
    const day = (n: number) => screen.getByRole("button", { name: new RegExp(`September ${n}(st|nd|rd|th), 2026`) })
    day(17).focus()
    await user.keyboard("{ArrowLeft}")
    await waitFor(() => expect(day(18)).toHaveFocus(), { timeout: 400 })
  })

  it("Input: the invalid squiggle and bang move to the start side (the field frame is drawn mirrored)", async () => {
    const draw = async (tree: React.ReactElement) => {
      const { container, unmount } = render(tree)
      await act(async () => {})
      const out = container.querySelector("[data-slot=input-frame] > svg[data-ink]")?.innerHTML ?? ""
      unmount()
      return out
    }
    const r = await draw(rtl(<Input aria-label="اسم" aria-invalid seed="i" />))
    const l = await draw(ltr(<Input aria-label="اسم" aria-invalid seed="i" />))
    expect(r.length).toBeGreaterThan(50)
    expect(r).not.toBe(l)
  })
})

describe("rtl audit: the whole library under one DirectionProvider", () => {
  const modules = import.meta.glob<{ default: React.ComponentType }>("/src/docs/examples/*/*.tsx")
  const first = new Map<string, () => Promise<{ default: React.ComponentType }>>()
  for (const path of Object.keys(modules).sort()) {
    const component = path.split("/")[4]
    if (!first.has(component) && !/\/_[^/]*$/.test(path)) first.set(component, modules[path])
  }

  it("covers the library", () => {
    expect(first.size).toBeGreaterThan(100)
    expect(first.has("direction")).toBe(true)
  })

  for (const [component, load] of first) {
    it(component, async () => {
      const { default: Example } = await load()
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      try {
        const { container, unmount } = render(
          <DirectionProvider direction="rtl">
            <InkProvider>
              <Example />
            </InkProvider>
          </DirectionProvider>
        )
        await act(async () => {})
        expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 200))).toEqual([])
        expectInkLayers(container, { min: 0 })
        const bad = [...document.querySelectorAll("svg[data-ink]")].map((svg) => /NaN|Infinity|undefined|\[object/.exec(svg.outerHTML)).filter(Boolean)
        expect(bad).toEqual([])
        expect(container.querySelector("[data-slot=direction]")).toHaveAttribute("dir", "rtl")
        unmount()
      } finally {
        errors.mockRestore()
      }
    })
  }
})

describe("reduced-motion audit", () => {
  it("G3: the blanket rule exists for both switches and zeroes durations, delays and iterations with !important", () => {
    const media = /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/.exec(cssSource)?.[1] ?? ""
    const attr = /\[data-motion="reduced"\],\s*\[data-motion="reduced"\] \*,\s*\[data-motion="reduced"\] \*::before,\s*\[data-motion="reduced"\] \*::after\s*\{([^}]*)\}/.exec(cssSource)?.[1] ?? ""
    for (const [name, body] of [["prefers-reduced-motion", media], ["[data-motion=reduced]", attr]] as const) {
      for (const decl of ["animation-duration: 0.01ms !important", "animation-delay: 0s !important", "animation-iteration-count: 1 !important", "transition-duration: 0.01ms !important", "transition-delay: 0s !important", "scroll-behavior: auto !important"]) {
        expect(body, `${name}: ${decl}`).toContain(decl)
      }
    }
    expect(media).toContain("--ll-motion: 0")
    expect(cssSource).toMatch(/\[data-motion="reduced"\]\s*\{\s*--ll-motion:\s*0;/)
  })

  it("G1: every duration token collapses with --ll-motion, and every theme animation is built from those tokens", () => {
    const durs = [...cssSource.matchAll(/^\s*(--ll-dur-[a-z]+):\s*([^;]+);/gm)]
    expect(durs.map((d) => d[1])).toEqual(["--ll-dur-press", "--ll-dur-hover", "--ll-dur-fade", "--ll-dur-pop", "--ll-dur-sheet", "--ll-dur-drop", "--ll-dur-toss", "--ll-dur-soak", "--ll-dur-boil", "--ll-dur-draw"])
    for (const [, name, value] of durs) expect(value, name).toMatch(/^calc\([\d.]+s \* var\(--ll-motion\)\)$/)
    const animates = [...cssSource.matchAll(/^\s*(--animate-[a-z-]+):\s*([^;]+);/gm)]
    expect(animates.length).toBe(8)
    for (const [, name, value] of animates) expect(value, name).toContain("var(--ll-dur-")
  })

  it("G3 is not undone: no utility in src/components/ui forces a literal time with !important (a layered !important beats the unlayered blanket)", () => {
    const bad = uiFiles.flatMap(({ file, code }) =>
      code.split("\n").flatMap((line, i) =>
        line
          .split(/[\s"'`{},;]+/)
          .filter((t) => /^(?:[^:]*:)*(?:animate|duration|delay|transition)-/.test(t) && /!$/.test(t) && !/--ll-dur/.test(t))
          .map((t) => `${file}.tsx:${i + 1} ${t}`)
      )
    )
    expect(bad).toEqual([])
  })

  it("the literal times in components are exactly the ones below, each covered by G2 or G3", () => {
    const LITERAL_OK: Record<string, string> = {
      marquee: "30 s scroll (var fallback) - G2: animation:none and the duplicate group hidden for both switches",
      progress: "1.6 s indeterminate slide - G2: motion-reduce: and [data-motion=reduced]_& set animate-none and a fixed window",
      "prompt-input": "0.9 s paper plane, fill-mode both - G3 (one frame, at the end position)",
      reveal: "stagger fallback .12 s - G3 zeroes delays; and the component does not arm under reduced motion (motionIsOff)",
      typewriter: "1.1 s caret blink - G2: animation:none for both switches",
      "typing-indicator": "2 s / 2.2 s loops, delays .4 / .8 s - G3 (one iteration of .01 ms: ends on the finished picture)",
      polaroid: "delay-500 before the photo develops - G3 zeroes transition-delay and animation-delay",
    }
    const TIME = /(?<![A-Za-z0-9.-])(\d*\.?\d+)(ms|s)(?![A-Za-z0-9-])/g
    const literal = uiFiles
      .filter(
        ({ code }) =>
          /\b(?:delay|duration)-\d/.test(code) ||
          code.split("\n").some((line) => /animat|transition|duration|delay|keyframes/i.test(line) && [...line.matchAll(TIME)].some((m) => Number(m[1]) !== 0))
      )
      .map((f) => f.file)
    expect(literal.sort()).toEqual(Object.keys(LITERAL_OK).sort())
  })

  it("G4: every file that runs script-driven motion asks first", () => {
    const SCRIPTED = /requestAnimationFrame|setInterval|\.animate\(|behavior:\s*["']smooth["']/
    const ASKS = /motionIsOff|useReducedMotion|reducedMotion/
    const NOT_MOTION: Record<string, string> = {
      sketchpad: "requestAnimationFrame batches pointer moves into one paint; the replay is a CSS animation (G3)",
      stepper: "setInterval is the press-and-hold repeat of a person's finger, not decoration",
    }
    const bad = uiFiles
      .filter(({ code }) => SCRIPTED.test(code) && !ASKS.test(code))
      .map((f) => f.file)
      .filter((f) => !(f in NOT_MOTION))
    expect(bad, "script-driven motion without motionIsOff()/useReducedMotion()").toEqual([])
    const primitive = Object.entries(LIB).find(([p]) => p.endsWith("message-scroller-primitive.tsx"))?.[1] ?? ""
    expect(primitive).toMatch(/reducedMotion\(\)/)
    const hook = Object.entries(HOOKS).find(([p]) => p.endsWith("use-live-motion.ts"))?.[1] ?? ""
    for (const signal of ["prefers-reduced-motion", "--ll-motion", "[data-motion=\"reduced\"]"]) expect(hook, signal).toContain(signal)
    for (const f of Object.keys(NOT_MOTION)) expect(uiFiles.find((u) => u.file === f)!.code, `${f} is no longer script-driven: drop it from NOT_MOTION`).toMatch(SCRIPTED)
  })

  it("no component scrolls smoothly on its own: an explicit behavior:'smooth' ignores the CSS override", () => {
    const smooth = uiFiles.filter(({ code }) => /behavior:\s*["']smooth["']/.test(code)).map((f) => f.file)
    expect(smooth).toEqual([])
  })

  it("motionIsOff reads the theme switch and the provider", async () => {
    const { motionIsOff } = await import("@/hooks/use-live-motion")
    const host = document.createElement("div")
    document.body.append(host)
    expect(motionIsOff(host)).toBe(false)
    host.setAttribute("data-motion", "reduced")
    expect(motionIsOff(host)).toBe(true)
    host.remove()
    expect(motionIsOff(document.body, true)).toBe(true)
  })

  it.fails("Carousel: scrolls instantly when motion is reduced", async () => {
    let api: CarouselApi
    renderUI(
      <InkProvider motion="reduced">
        <Carousel aria-label="Slides" setApi={(a) => (api = a)}>
          <CarouselContent>
            <CarouselItem>1</CarouselItem>
          </CarouselContent>
        </Carousel>
      </InkProvider>
    )
    await waitFor(() => expect(api).toBeTruthy())
    expect(api!.internalEngine().options.duration).toBe(0)
  })
})

describe("forced-colors audit", () => {
  const sourceOf = (name: string): string => {
    const own = uiFiles.find((f) => f.file === name)?.src ?? ""
    const recipe = Object.entries(LIB).find(([p]) => p.endsWith(`/recipes/${name}-ink.ts`))?.[1] ?? ""
    return own + recipe
  }
  const hasFallback = (name: string, extra: string[] = []) => /forced-colors/.test(sourceOf(name) + extra.map((e) => Object.entries(LIB).find(([p]) => p.endsWith(e))?.[1] ?? "").join(""))

  it("the theme's own rule hides overlay ink, keeps intrinsic art, and gives every host a real outline and a Highlight focus ring", () => {
    const block = /@media \(forced-colors: active\)\s*\{([\s\S]*?)\n\}/.exec(cssSource)?.[1] ?? ""
    expect(block).toContain("display: none")
    for (const kind of ["icon", "doodle", "sticker", "stamp", "tape", "prop", "mascot", "illustration", "badge"]) expect(block).toContain(`[data-ink="${kind}"]`)
    expect(block).toContain("[data-ink-keep]")
    expect(block).toContain("outline: 1px solid ButtonBorder")
    expect(block).toContain("outline: 3px solid Highlight")
    expect(block).toContain(".ll-paper")
  })

  const COVERED = [
    "input-group",
    "checkbox",
    "radio-group",
    "switch",
    "toggle",
    "rating",
    "slider",
    "progress",
    "select",
    "combobox",
    "command",
    "native-select",
    "input",
    "textarea",
    "input-otp",
    "field",
    "bookmark",
    "folder",
    "table",
    "sidebar",
    "menubar",
    "dropdown-menu",
    "context-menu",
    "chart",
    "accordion",
    "collapsible",
    "dropzone",
    "sketchpad",
    "sticker-picker",
    "sticker-board",
    "avatar",
    "dialog",
    "sheet",
    "quote",
    "strike",
    "underline",
    "highlight",
    "scribble",
    "marker",
  ]
  it("components whose state lives in ink and that DO carry a forced-colors fallback still do", () => {
    const lost = COVERED.filter((c) => !hasFallback(c, c === "dropdown-menu" || c === "context-menu" || c === "menubar" ? ["/menu-styles.ts"] : []))
    expect(lost).toEqual([])
  })

  const GAPS: Record<string, string> = {
    tabs: "the active tab is a filled, outlined drawing (`checked` layer); only aria-selected says which one is on",
    "navigation-menu": "the open / current trigger is the `open` and `checked` layers",
    carousel: "the current slide is the blue stroke of the tally (`checked` tick); the other strokes look the same",
    pagination: "the current page is a `secondary` Button: a drawn highlighter block, aria-current only",
    attachment: "upload progress is a clipped ink bar; role=progressbar carries the number only for a screen reader",
    stepper: "`invalid` is the red frame",
    "date-picker": "`invalid` / `open` are the frame's layers",
  }
  it("components whose state lives only in ink and have NO fallback are exactly this list", () => {
    const now = Object.keys(GAPS).filter((c) => !hasFallback(c))
    expect(now, "one of these gained a forced-colors fallback: move it from GAPS to COVERED").toEqual(Object.keys(GAPS))
  })
})
