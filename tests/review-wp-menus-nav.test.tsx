import * as React from "react"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(120, 32)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})
const opts = { user: { pointerEventsCheck: 0 } }

describe("Carousel does not eat the arrow keys of the things inside its slides", () => {
  it("ArrowRight on a sub-menu trigger inside a slide (portalled, so it bubbles through the React tree) still opens the sub-menu", async () => {
    const { user } = renderUI(
      <Carousel aria-label="Cards">
        <CarouselContent>
          <CarouselItem>
            <DropdownMenu>
              <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>One</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Deep</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
      opts
    )
    await user.click(screen.getByRole("button", { name: "Menu" }))
    await screen.findByRole("menu")
    const more = screen.getByRole("menuitem", { name: "More" })
    more.focus()
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(screen.getAllByRole("menu")).toHaveLength(2))
    expect(screen.getByRole("menuitem", { name: "Deep" })).toBeInTheDocument()
  })

  it("ArrowRight inside a radio group in a slide moves the radio", async () => {
    const { user } = renderUI(
      <Carousel aria-label="Cards">
        <CarouselContent>
          <CarouselItem>
            <RadioGroup defaultValue="a" aria-label="Pick">
              <RadioGroupItem value="a" aria-label="A" />
              <RadioGroupItem value="b" aria-label="B" />
            </RadioGroup>
          </CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>
    )
    screen.getByRole("radio", { name: "A" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "B" }))
  })

  it("a modified arrow (Alt+Left is the browser's Back) is not swallowed, and the user's own onKeyDown still runs", async () => {
    const seen: string[] = []
    renderUI(
      <Carousel aria-label="Cards" onKeyDown={(e) => seen.push(e.key)}>
        <CarouselContent>
          <CarouselItem>
            <a href="#x">Link</a>
          </CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>
    )
    const link = screen.getByRole("link", { name: "Link" })
    const alt = fireEvent.keyDown(link, { key: "ArrowLeft", altKey: true })
    expect(alt).toBe(true)
    const plain = fireEvent.keyDown(link, { key: "ArrowRight" })
    expect(plain).toBe(false)
    expect(seen).toEqual(["ArrowLeft", "ArrowRight"])
  })
})

describe("Breadcrumb ellipsis as a menu trigger", () => {
  it("has an accessible name when the trigger adds a sr-only label", async () => {
    const { user } = renderUI(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger aria-label="Show hidden pages">
                <BreadcrumbEllipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Docs</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Now</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
      opts
    )
    await user.click(screen.getByRole("button", { name: "Show hidden pages" }))
    expect(await screen.findByRole("menuitem", { name: "Docs" })).toBeInTheDocument()
  })
})

describe("DropdownMenu keyboard and focus", () => {
  function Demo({ n = 6 }: { n?: number }) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          {Array.from({ length: n }, (_, i) => (
            <DropdownMenuItem key={i} onSelect={() => {}}>
              {["Alpha", "Alpine", "Beta", "Bill", "Billing", "Zed"][i % 6]}
              {i >= 6 ? ` ${i}` : ""}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  it("opens from the keyboard on Enter, first row is focused, Escape gives focus back to the trigger", async () => {
    const { user } = renderUI(<Demo />, opts)
    screen.getByRole("button", { name: "Open" }).focus()
    await user.keyboard("{Enter}")
    const menu = await screen.findByRole("menu")
    await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true))
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open" }))
  })

  it("multi-letter typeahead: 'bil' lands on Bill, 'bill' + 'i' on Billing", async () => {
    const { user } = renderUI(<Demo />, opts)
    await user.click(screen.getByRole("button", { name: "Open" }))
    await screen.findByRole("menu")
    await user.keyboard("bil")
    expect(document.activeElement).toHaveTextContent("Bill")
    await user.keyboard("li")
    expect(document.activeElement).toHaveTextContent("Billing")
  })

  it("a long menu (200 rows) costs no svg at all when its rows are plain", async () => {
    const { user } = renderUI(<Demo n={200} />, opts)
    await user.click(screen.getByRole("button", { name: "Open" }))
    const menu = await screen.findByRole("menu")
    expect(menu.querySelectorAll("svg")).toHaveLength(0)
    expect(menu.querySelectorAll('[role="menuitem"]')).toHaveLength(200)
  })

  it("200 checkbox rows draw one small icon each and no ink host", async () => {
    const { user } = renderUI(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          {Array.from({ length: 200 }, (_, i) => (
            <DropdownMenuCheckboxItem key={i} checked={i % 2 === 0}>
              Row {i}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>,
      opts
    )
    await user.click(screen.getByRole("button", { name: "Open" }))
    const menu = await screen.findByRole("menu")
    expect(menu.querySelectorAll("[data-ink-host]")).toHaveLength(0)
    const nodes = menu.querySelectorAll("*").length
    process.stdout.write(`\nNODES_PER_CHECKBOX_ROW=${(nodes / 200).toFixed(1)} html=${(menu.innerHTML.length / 200).toFixed(0)}B/row\n`)
    expect(nodes / 200).toBeLessThan(30)
  })

  it("40 rows with a three-key shortcut each: the keycaps are the only ink, measure it", async () => {
    const { user } = renderUI(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          {Array.from({ length: 40 }, (_, i) => (
            <DropdownMenuItem key={i}>
              Row {i} <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>,
      opts
    )
    await user.click(screen.getByRole("button", { name: "Open" }))
    const menu = await screen.findByRole("menu")
    const hosts = menu.querySelectorAll("[data-ink-host]").length
    process.stdout.write(`\nKEYCAP_HOSTS=${hosts} bytes/row=${(menu.innerHTML.length / 40).toFixed(0)}\n`)
    expect(hosts).toBeLessThanOrEqual(40 * 3)
  })

  it("preventDefault in onSelect keeps the menu open; focus stays inside", async () => {
    const { user } = renderUI(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Stay</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
      opts
    )
    await user.click(screen.getByRole("button", { name: "Open" }))
    await user.click(await screen.findByRole("menuitem", { name: "Stay" }))
    expect(screen.getByRole("menu")).toBeInTheDocument()
  })

  it("ArrowLeft in a sub-menu closes it and puts focus back on its trigger; Escape then closes the parent and focus returns to the trigger", async () => {
    const { user } = renderUI(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Deep</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
      opts
    )
    await user.click(screen.getByRole("button", { name: "Open" }))
    await screen.findByRole("menu")
    screen.getByRole("menuitem", { name: "More" }).focus()
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(screen.getAllByRole("menu")).toHaveLength(2))
    await user.keyboard("{ArrowLeft}")
    await waitFor(() => expect(screen.getAllByRole("menu")).toHaveLength(1))
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "More" }))
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open" }))
  })
})

import { Sidebar, SidebarContent, SidebarGroup, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

describe("Sidebar across a resize", () => {
  const original = window.matchMedia
  let fire: () => void = () => {}
  const setWidth = (px: number) => Object.defineProperty(window, "innerWidth", { value: px, configurable: true, writable: true })
  beforeEach(() => {
    window.matchMedia = ((q: string) => ({
      matches: false,
      media: q,
      onchange: null,
      addEventListener: (_: string, cb: () => void) => {
        fire = cb
      },
      removeEventListener: () => {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  })
  afterEach(() => {
    window.matchMedia = original
    setWidth(1024)
    document.cookie = "sidebar_state=; max-age=0; path=/"
  })

  function Page() {
    return (
      <SidebarProvider>
        <Sidebar aria-label="Main">
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Home</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <SidebarTrigger />
        </SidebarInset>
      </SidebarProvider>
    )
  }

  it("a sheet left open on a phone is closed when the window grows to desktop width, and stays closed when it shrinks again", async () => {
    setWidth(500)
    const { user } = renderUI(<Page />, opts)
    await waitFor(() => expect(document.querySelector('[data-slot="sidebar-wrapper"]')).toBeTruthy())
    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }))
    await screen.findByRole("dialog", { name: "Sidebar" })
    act(() => {
      setWidth(1200)
      fire()
    })
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    act(() => {
      setWidth(500)
      fire()
    })
    await act(async () => {})
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("the phone sheet returns focus to the trigger that opened it (Escape, and the toggle key)", async () => {
    setWidth(500)
    const { user } = renderUI(<Page />, opts)
    await waitFor(() => expect(document.querySelector('[data-slot="sidebar-wrapper"]')).toBeTruthy())
    const trigger = screen.getByRole("button", { name: "Toggle Sidebar" })
    await user.click(trigger)
    const dialog = await screen.findByRole("dialog", { name: "Sidebar" })
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it("Cmd/Ctrl+B is left to an editor that already handled it", () => {
    renderUI(<Page />)
    const before = document.querySelector('[data-slot="sidebar"]')!.getAttribute("data-state")
    const editor = document.createElement("div")
    editor.addEventListener("keydown", (e) => e.preventDefault())
    document.body.appendChild(editor)
    fireEvent.keyDown(editor, { key: "b", ctrlKey: true })
    expect(document.querySelector('[data-slot="sidebar"]')!.getAttribute("data-state")).toBe(before)
    editor.remove()
  })
})

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"

describe("Menubar keyboard", () => {
  function Bar() {
    return (
      <Menubar aria-label="App">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarItem>Open</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Zoom</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )
  }

  it("ArrowRight/ArrowLeft across titles, ArrowDown opens and focuses the first row, Escape returns focus to the title", async () => {
    const { user } = renderUI(<Bar />, opts)
    const file = screen.getByRole("menuitem", { name: "File" })
    file.focus()
    await user.keyboard("{ArrowRight}")
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Edit" }))
    await user.keyboard("{ArrowLeft}{ArrowLeft}")
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "View" }))
    await user.keyboard("{ArrowDown}")
    const menu = await screen.findByRole("menu")
    await waitFor(() => expect(within(menu).getByRole("menuitem", { name: "Zoom" })).toHaveFocus())
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "View" }))
  })

  it("ArrowRight inside an open menu moves to the next menu, ArrowLeft back, and the open title follows", async () => {
    const { user } = renderUI(<Bar />, opts)
    await user.click(screen.getByRole("menuitem", { name: "File" }))
    await screen.findByRole("menu")
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveAttribute("data-state", "open"))
    expect(screen.getByRole("menuitem", { name: "File" })).toHaveAttribute("data-state", "closed")
    await user.keyboard("{ArrowLeft}")
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "File" })).toHaveAttribute("data-state", "open"))
  })

  it("choosing a row closes the menu and puts focus back on its title", async () => {
    const { user } = renderUI(<Bar />, opts)
    await user.click(screen.getByRole("menuitem", { name: "Edit" }))
    await user.click(await screen.findByRole("menuitem", { name: "Undo" }))
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Edit" }))
  })
})

describe("NavigationMenu keyboard", () => {
  function Nav() {
    return (
      <NavigationMenu aria-label="Main">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#intro">Intro</NavigationMenuLink>
              <NavigationMenuLink href="#guide">Guide</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#docs" active>
              Docs
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    )
  }

  it("Enter opens the panel, Tab goes into it, Escape closes it and focus returns to the trigger", async () => {
    const { user } = renderUI(<Nav />, opts)
    const trigger = screen.getByRole("button", { name: /Learn/ })
    trigger.focus()
    await user.keyboard("{Enter}")
    await screen.findByRole("link", { name: "Intro" })
    await user.keyboard("{Tab}")
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Intro" }))
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("link", { name: "Intro" })).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it("the current page link carries aria-current=page", () => {
    renderUI(<Nav />, opts)
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("aria-current", "page")
  })
})

describe("ContextMenu keyboard", () => {
  it("opens on contextmenu, arrows walk the rows, Enter picks, and the menu closes", async () => {
    let picked = ""
    const { user } = renderUI(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>Area</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => (picked = "a")}>Alpha</ContextMenuItem>
          <ContextMenuItem onSelect={() => (picked = "b")}>Beta</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
      opts
    )
    fireEvent.contextMenu(screen.getByText("Area"), { clientX: 10, clientY: 10 })
    await screen.findByRole("menu")
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}")
    expect(picked).toBe("b")
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
  })
})

describe("what the docs claim about opening from the keyboard", () => {
  it("ArrowUp on a DropdownMenu trigger does NOT open it (Radix: Enter, Space and ArrowDown do)", async () => {
    const { user } = renderUI(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
          <DropdownMenuItem>Two</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
      opts
    )
    screen.getByRole("button", { name: "Open" }).focus()
    await user.keyboard("{ArrowUp}")
    expect(screen.queryByRole("menu")).toBeNull()
    await user.keyboard("{ArrowDown}")
    expect(await screen.findByRole("menu")).toBeInTheDocument()
  })

  it("ArrowUp on a Menubar title does not open it either (Enter, Space and ArrowDown do)", async () => {
    const { user } = renderUI(
      <Menubar aria-label="App">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>One</MenubarItem>
            <MenubarItem>Two</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
      opts
    )
    screen.getByRole("menuitem", { name: "File" }).focus()
    await user.keyboard("{ArrowUp}")
    expect(screen.queryByRole("menu")).toBeNull()
    await user.keyboard("{ArrowDown}")
    expect(await screen.findByRole("menu")).toBeInTheDocument()
  })
})

import { Icon } from "@/components/ui/icon"
describe("typeahead on rows that carry icons and keycaps", () => {
  it("jumps by the label, not by the icon's title or the keycaps' words", async () => {
    const { user } = renderUI(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Icon name="user" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon name="credit-card" label="Card" /> Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon name="settings" /> Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
      opts
    )
    await user.click(screen.getByRole("button", { name: "Open" }))
    await screen.findByRole("menu")
    await user.keyboard("b")
    expect(document.activeElement).toHaveTextContent("Billing")
    await user.keyboard("{Escape}")
  })
})

import { splitMenuClass } from "@/lib/menu-styles"
import { ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from "@/components/ui/context-menu"
import { MenubarSub, MenubarSubContent, MenubarSubTrigger } from "@/components/ui/menubar"

describe("scrolling classes on the content go to the viewport", () => {
  it("splitMenuClass moves max-h / overflow / overscroll (with variants, important, arbitrary values) and keeps the rest", () => {
    expect(splitMenuClass("w-56 max-h-72 overflow-y-auto")).toEqual({ content: "w-56", viewport: "max-h-72 overflow-y-auto" })
    expect(splitMenuClass("md:max-h-[calc(100vh-4rem)] data-[side=top]:overflow-hidden! min-h-8 h-40 overscroll-contain text-sm")).toEqual({
      content: "min-h-8 h-40 text-sm",
      viewport: "md:max-h-[calc(100vh-4rem)] data-[side=top]:overflow-hidden! overscroll-contain",
    })
    expect(splitMenuClass(undefined)).toEqual({ content: "", viewport: "" })
    expect(splitMenuClass("  ")).toEqual({ content: "", viewport: "" })
  })

  const scrolly = "w-56 max-h-72 overflow-y-auto"
  const check = (menu: HTMLElement, slot: string) => {
    expect(menu.className).toContain("w-56")
    expect(menu.className).not.toMatch(/max-h-72|overflow-y-auto/)
    const vp = menu.querySelector(`[data-slot="${slot}"]`)!
    expect(vp.className).toContain("max-h-72")
    expect(vp.className).toContain("overflow-y-auto")
    expect(vp.className).not.toContain("available-height")
  }

  it("DropdownMenu", async () => {
    const { user } = renderUI(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent className={scrolly}>
          <DropdownMenuItem>One</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className={scrolly}>
              <DropdownMenuItem>Deep</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
      opts
    )
    await user.click(screen.getByRole("button", { name: "Open" }))
    const menu = await screen.findByRole("menu")
    check(menu, "dropdown-menu-viewport")
    screen.getByRole("menuitem", { name: "More" }).focus()
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(screen.getAllByRole("menu")).toHaveLength(2))
    check(screen.getAllByRole("menu")[1], "dropdown-menu-viewport")
  })

  it("ContextMenu", async () => {
    renderUI(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>Area</div>
        </ContextMenuTrigger>
        <ContextMenuContent className={scrolly}>
          <ContextMenuItem>One</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
            <ContextMenuSubContent className={scrolly}>
              <ContextMenuItem>Deep</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>,
      opts
    )
    fireEvent.contextMenu(screen.getByText("Area"), { clientX: 5, clientY: 5 })
    check(await screen.findByRole("menu"), "context-menu-viewport")
  })

  it("Menubar", async () => {
    const { user } = renderUI(
      <Menubar aria-label="App">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent className={scrolly}>
            <MenubarItem>One</MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>More</MenubarSubTrigger>
              <MenubarSubContent className={scrolly}>
                <MenubarItem>Deep</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
      opts
    )
    await user.click(screen.getByRole("menuitem", { name: "File" }))
    check(await screen.findByRole("menu"), "menubar-viewport")
  })
})

import { axeCheck } from "./helpers"
import { InkProvider } from "@/lib/ink/react"
import { DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

describe("axe on a full menu with its sub-menu open", () => {
  for (const [name, wrap] of [
    ["comfortable ltr", (n: React.ReactNode) => <>{n}</>],
    ["calm rtl", (n: React.ReactNode) => <InkProvider density="calm"><div dir="rtl">{n}</div></InkProvider>],
  ] as const) {
    it(name, async () => {
      const { user } = renderUI(
        wrap(
          <DropdownMenu dir={name.includes("rtl") ? "rtl" : "ltr"}>
            <DropdownMenuTrigger>Open</DropdownMenuTrigger>
            <DropdownMenuContent aria-label="Account">
              <DropdownMenuCheckboxItem checked>Bookmarks</DropdownMenuCheckboxItem>
              <DropdownMenuRadioGroup value="a" aria-label="Side">
                <DropdownMenuRadioItem value="a">Top</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="b">Bottom</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        opts
      )
      await user.click(screen.getByRole("button", { name: "Open" }))
      await screen.findByRole("menu")
      screen.getByRole("menuitem", { name: "More" }).focus()
      await user.keyboard(name.includes("rtl") ? "{ArrowLeft}" : "{ArrowRight}")
      await waitFor(() => expect(screen.getAllByRole("menu")).toHaveLength(2))
      await axeCheck()
    })
  }
})
