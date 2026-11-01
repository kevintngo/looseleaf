import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Link, RouterProvider, createHashStore, navigate, scrollToAnchor, useLocation } from "@/docs/core/router"
import { hrefFor, matchRoute, normalisePath, parseHash, paths, slugifyAnchor, withAnchor } from "@/docs/core/router-core"

describe("parseHash", () => {
  it("treats empty and bare slash hashes as home", () => {
    expect(parseHash("")).toMatchObject({ path: "/", anchor: "", anchorOnly: false })
    expect(parseHash("#")).toMatchObject({ path: "/" })
    expect(parseHash("#/")).toMatchObject({ path: "/" })
  })

  it("splits path, second-hash anchor and query", () => {
    expect(parseHash("#/components/button#usage")).toEqual({ path: "/components/button", anchor: "usage", search: "", anchorOnly: false })
    expect(parseHash("#/components/button?tab=code#api-button")).toEqual({
      path: "/components/button",
      anchor: "api-button",
      search: "?tab=code",
      anchorOnly: false,
    })
  })

  it("normalizes case, slashes and encoding in the path but not in the anchor", () => {
    expect(parseHash("#//Components///Button/").path).toBe("/components/button")
    expect(parseHash("#/components/data%20table").path).toBe("/components/data table")
    expect(parseHash("#/x#Some%20Anchor").anchor).toBe("Some Anchor")
    expect(normalisePath("/a/%E0%A4%A")).toBe("/a/%e0%a4%a")
  })

  it("recognises anchor-only hashes", () => {
    expect(parseHash("#usage")).toEqual({ path: "", anchor: "usage", search: "", anchorOnly: true })
  })
})

describe("matchRoute", () => {
  it("maps every documented route", () => {
    expect(matchRoute("/")).toEqual({ name: "home" })
    expect(matchRoute("/getting-started")).toEqual({ name: "getting-started" })
    expect(matchRoute("/foundations")).toEqual({ name: "foundations", topic: null })
    expect(matchRoute("/foundations/color")).toEqual({ name: "foundations", topic: "color" })
    expect(matchRoute("/components")).toEqual({ name: "components", slug: null })
    expect(matchRoute("/components/button")).toEqual({ name: "components", slug: "button" })
    expect(matchRoute("/blocks")).toEqual({ name: "blocks", slug: null })
    expect(matchRoute("/blocks/login")).toEqual({ name: "blocks", slug: "login" })
    expect(matchRoute("/playground")).toEqual({ name: "playground" })
    expect(matchRoute("/changelog")).toEqual({ name: "changelog" })
  })

  it("sends everything else to not-found", () => {
    expect(matchRoute("/nope")).toEqual({ name: "not-found", path: "/nope" })
    expect(matchRoute("/components/button/extra")).toMatchObject({ name: "not-found" })
    expect(matchRoute("/playground/x")).toMatchObject({ name: "not-found" })
  })
})

describe("href helpers", () => {
  it("builds hash hrefs", () => {
    expect(hrefFor("/components/button")).toBe("#/components/button")
    expect(hrefFor("components")).toBe("#/components")
    expect(hrefFor("#/already")).toBe("#/already")
    expect(withAnchor(paths.components("card"), "usage")).toBe("/components/card#usage")
    expect(withAnchor(paths.home, "")).toBe("/")
  })

  it("slugifies anchors", () => {
    expect(slugifyAnchor("Data display")).toBe("data-display")
    expect(slugifyAnchor("Stickers & doodles")).toBe("stickers-and-doodles")
    expect(slugifyAnchor("  --Weird__Name!! ")).toBe("weird-name")
  })
})

describe("createHashStore", () => {
  function fakeWindow(initial: string) {
    const listeners = new Set<() => void>()
    const win = {
      location: { hash: initial },
      addEventListener: vi.fn((_: string, l: () => void) => listeners.add(l)),
      removeEventListener: vi.fn((_: string, l: () => void) => listeners.delete(l)),
    }
    return { win: win as unknown as Window, fire: (hash: string) => { win.location.hash = hash; listeners.forEach((l) => l()) }, listeners }
  }

  it("keeps the route when only the anchor changes", () => {
    const { win, fire } = fakeWindow("#/components/card")
    const store = createHashStore(win)
    const seen = vi.fn()
    const off = store.subscribe(seen)
    expect(store.getState().path).toBe("/components/card")

    fire("#usage")
    expect(store.getState()).toMatchObject({ path: "/components/card", anchor: "usage" })
    expect(seen).toHaveBeenCalledTimes(1)

    fire("#/blocks/login")
    expect(store.getState()).toMatchObject({ path: "/blocks/login", anchor: "", route: { name: "blocks", slug: "login" } })
    off()
  })

  it("does not notify when nothing changed and detaches its listener", () => {
    const { win, fire, listeners } = fakeWindow("#/changelog")
    const store = createHashStore(win)
    const seen = vi.fn()
    const off = store.subscribe(seen)
    fire("#/changelog")
    expect(seen).not.toHaveBeenCalled()
    expect(listeners.size).toBe(1)
    off()
    expect(listeners.size).toBe(0)
  })
})

function Where() {
  const { path, anchor, route } = useLocation()
  return (
    <p data-testid="where">
      {route.name}|{path}|{anchor}
    </p>
  )
}

describe("RouterProvider in the DOM", () => {
  beforeEach(() => {
    window.location.hash = ""
  })

  it("follows location.hash, navigate() and links", async () => {
    window.location.hash = "#/components/button"
    render(
      <RouterProvider>
        <Where />
        <Link to="/blocks/login#files">go</Link>
      </RouterProvider>,
    )
    expect(screen.getByTestId("where")).toHaveTextContent("components|/components/button|")
    expect(screen.getByRole("link", { name: "go" })).toHaveAttribute("href", "#/blocks/login#files")

    act(() => navigate("/changelog"))
    await waitFor(() => expect(screen.getByTestId("where")).toHaveTextContent("changelog|/changelog|"))

    act(() => navigate("/foundations/color#swatches"))
    await waitFor(() => expect(screen.getByTestId("where")).toHaveTextContent("foundations|/foundations/color|swatches"))
  })
})

describe("scrollToAnchor", () => {
  it("waits for lazily rendered targets", async () => {
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll
    const cancel = scrollToAnchor("late", 1000)
    expect(scroll).not.toHaveBeenCalled()
    const el = document.createElement("h2")
    el.id = "late"
    el.tabIndex = -1
    document.body.appendChild(el)
    await waitFor(() => expect(scroll).toHaveBeenCalled())
    expect(document.activeElement).toBe(el)
    cancel()
    el.remove()
  })
})
