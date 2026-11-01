import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import {
  AVATAR_TONES,
  avatarBadgeRecipe,
  avatarCountRecipe,
  avatarFallbackRecipe,
  avatarRingRecipe,
  avatarTone,
  initials,
} from "@/lib/ink/recipes/avatar-ink"
import Default from "@/docs/examples/avatar/01-default"
import Colours from "@/docs/examples/avatar/02-colours"
import Group from "@/docs/examples/avatar/03-group"
import Team from "@/docs/examples/avatar/04-team"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
const RealImage = window.Image
beforeEach(() => {
  restore = mockBox(32, 32)
})
afterEach(() => {
  restore()
  window.Image = RealImage
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

function imagesLoad(ok: boolean) {
  class FakeImage extends EventTarget {
    complete = false
    naturalWidth = 0
    crossOrigin: string | null = null
    referrerPolicy = ""
    set src(_v: string) {
      setTimeout(() => {
        this.complete = true
        this.naturalWidth = ok ? 64 : 0
        this.dispatchEvent(new Event(ok ? "load" : "error"))
      }, 0)
    }
  }
  window.Image = FakeImage as unknown as typeof Image
}

describe("Avatar structure", () => {
  it("has upstream's six parts and slots", () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar>
          <AvatarImage src="/x.png" alt="" />
          <AvatarFallback>AB</AvatarFallback>
          <AvatarBadge />
        </Avatar>
        <AvatarGroupCount>+2</AvatarGroupCount>
      </AvatarGroup>,
    )
    for (const slot of ["avatar-group", "avatar", "avatar-fallback", "avatar-badge", "avatar-group-count"]) expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
  })

  it("is a round, non-clipping span that carries its size for its parts", () => {
    const { container } = render(<Avatar size="lg" />)
    const a = container.querySelector("[data-slot=avatar]")!
    expect(a.tagName).toBe("SPAN")
    expect(a).toHaveAttribute("data-size", "lg")
    expect(a).toHaveClass("size-8", "rounded-full", "relative", "isolate", "shrink-0", "data-[size=lg]:size-10", "data-[size=sm]:size-6", "data-[size=xl]:size-14")
    expect(a).not.toHaveClass("overflow-hidden")
  })

  it("shows the fallback without a picture, and the picture once it has loaded", async () => {
    imagesLoad(true)
    const { queryByText, container } = render(
      <Avatar>
        <AvatarImage src="/ada.png" alt="Ada" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    )
    expect(queryByText("AL")).not.toBeNull()
    await waitFor(() => expect(container.querySelector("img[data-slot=avatar-image]")).not.toBeNull())
    expect(container.querySelector("img")).toHaveClass("aspect-square", "size-full", "rounded-full", "object-cover")
    expect(queryByText("AL")).toBeNull()
  })

  it("keeps the fallback when the picture fails", async () => {
    imagesLoad(false)
    const { queryByText, container } = render(
      <Avatar>
        <AvatarImage src="/nope.png" alt="Ada" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    )
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10))
    })
    expect(container.querySelector("img")).toBeNull()
    expect(queryByText("AL")).not.toBeNull()
  })
})

describe("AvatarFallback", () => {
  it("makes initials from a name, hides them from assistive technology and reads the full name", () => {
    const { container, getByText } = render(
      <Avatar>
        <AvatarFallback name="Ada Lovelace" />
      </Avatar>,
    )
    expect(getByText("AL")).toHaveAttribute("aria-hidden", "true")
    expect(getByText("Ada Lovelace")).toHaveClass("sr-only")
    expect(container.querySelector("[data-slot=avatar-fallback]")).toHaveAttribute("data-tone", avatarTone("Ada Lovelace"))
  })

  it("lets children win over the generated initials, and a tone win over the name's color", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback name="Ada Lovelace" tone="grape">
          ?
        </AvatarFallback>
      </Avatar>,
    )
    expect(container).toHaveTextContent("?")
    expect(container.querySelector("[data-slot=avatar-fallback]")).toHaveAttribute("data-tone", "grape")
  })

  it("a string child picks the color when there is no name", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>JO</AvatarFallback>
      </Avatar>,
    )
    expect(container.querySelector("[data-slot=avatar-fallback]")).toHaveAttribute("data-tone", avatarTone("JO"))
  })

  it("draws the disc in the picked color as its own host", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback name="Sam Reyes" />
      </Avatar>,
    )
    const fb = container.querySelector("[data-slot=avatar-fallback]")!
    expect(fb).toHaveAttribute("data-ink-host")
    expect(fb.querySelector("svg[data-ink=disc]")!.innerHTML).toContain(`var(--ll-${avatarTone("Sam Reyes")})`)
  })
})

describe("avatarTone and initials", () => {
  it("is a pure function of the trimmed, lower-cased name", () => {
    expect(avatarTone("Ada Lovelace")).toBe(avatarTone("  ada lovelace "))
    expect(AVATAR_TONES).toContain(avatarTone("Anyone"))
  })

  it("spreads names over all eight colors", () => {
    const names = ["Ada", "Jo", "Mika", "Sam", "Priya", "Tomas", "Lena", "Omar", "Yuki", "Ines", "Kofi", "Nora", "Alice", "Bob", "Carol", "Dave", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Mallory", "Niaj", "Olivia", "Peggy", "Rupert", "Sybil", "Trent", "Victor", "Walter", "Zoe", "Amelie", "Bao", "Chidi", "Dara"]
    const seen = new Map<string, number>()
    for (const n of names) seen.set(avatarTone(n), (seen.get(avatarTone(n)) ?? 0) + 1)
    expect(seen.size).toBe(8)
    expect(Math.max(...seen.values())).toBeLessThanOrEqual(names.length / 3)
  })

  it("takes the first letters of the first and last word", () => {
    expect(initials("Ada Lovelace")).toBe("AL")
    expect(initials("  prince ")).toBe("P")
    expect(initials("Mary Jane van Dyke")).toBe("MD")
    expect(initials("")).toBe("")
    expect(initials("élise ñandú")).toBe("ÉÑ")
  })
})

describe("Avatar drawing", () => {
  it("circles the face: the root is the host of one rest layer, and ring=none draws nothing", () => {
    const { container } = render(<Avatar seed="a" />)
    const a = container.querySelector("[data-slot=avatar]")!
    expect(a).toHaveAttribute("data-ink-host")
    expect(a.firstElementChild).toHaveAttribute("data-ink", "avatar")
    expectInkLayers(container, { kinds: ["avatar"], absolute: true, layers: ["rest"] })
    const none = render(<Avatar ring="none" />)
    expect(none.container.querySelector("svg")).toBeNull()
    expect(none.container.querySelector("[data-slot=avatar]")).not.toHaveAttribute("data-ink-host")
  })

  it("the ring pen is a prop", () => {
    const pens = ["ink", "you", "marker"] as const
    const drawn = pens.map((ring) => {
      const { container, unmount } = render(<Avatar ring={ring} seed="same" />)
      const html = container.querySelector("svg[data-ink=avatar]")!.innerHTML
      unmount()
      return html
    })
    expect(new Set(drawn).size).toBe(3)
    expect(drawn[1]).toContain("var(--ll-ink-you)")
    expect(drawn[2]).toContain("var(--ll-marker)")
  })

  it("the badge is a dot host with a status color, and keeps a name for screen readers", () => {
    const { container, getByText } = render(
      <Avatar>
        <AvatarBadge status="busy">
          <span className="sr-only">busy</span>
        </AvatarBadge>
      </Avatar>,
    )
    const b = container.querySelector("[data-slot=avatar-badge]")!
    expect(b).toHaveAttribute("data-status", "busy")
    expect(b.querySelector("svg[data-ink=dot]")!.innerHTML).toContain("var(--ll-tomato)")
    expect(getByText("busy")).toBeTruthy()
    expect(b.className).toContain("group-data-[size=sm]/avatar:size-2")
  })

  it("a group overlaps with logical margins and cuts faces out with a ring variable; the count is a sketched disc", () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar />
        <Avatar />
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>,
    )
    const g = container.querySelector("[data-slot=avatar-group]")!
    expect(g.className).toContain("[&>*+*]:-ms-1.5")
    expect(g.className).toContain("has-data-[size=sm]:[&>*+*]:-ms-1")
    expect(g.className).toContain("has-data-[size=lg]:[&>*+*]:-ms-2")
    expect(g.className).toContain("*:data-[slot=avatar]:[--ll-avatar-ring:var(--ll-avatar-group-ring,var(--card))]")
    expect(container.querySelector("[data-slot=avatar]")!.className).toContain("shadow-[0_0_0_2px_var(--ll-avatar-ring,transparent)]")
    const c = container.querySelector("[data-slot=avatar-group-count]")!
    expect(c).toHaveTextContent("+3")
    expect(c.querySelector("svg[data-ink=disc]")).not.toBeNull()
    expect(c.className).toContain("group-has-data-[size=lg]/avatar-group:size-10")
  })

  it("has no accessibility violations", async () => {
    const { container } = renderUI(
      <AvatarGroup>
        <Avatar>
          <AvatarFallback name="Ada Lovelace" />
          <AvatarBadge status="online">
            <span className="sr-only">online</span>
          </AvatarBadge>
        </Avatar>
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>,
    )
    await axeCheck(container)
  })
})

describe("recipes", () => {
  const req = { seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length

  it("each recipe is one rest layer inside the budget at every avatar size, in every density", () => {
    for (const px of [16, 24, 32, 40, 56, 96]) {
      for (const density of ["comfortable", "calm"] as const) {
        const box = { w: px, h: px }
        const runs = [
          runRecipe(avatarRingRecipe, { ...req, density, params: { ring: "ink" }, box }),
          runRecipe(avatarRingRecipe, { ...req, density, params: { ring: "marker" }, box }),
          runRecipe(avatarFallbackRecipe, { ...req, density, params: { tone: "tomato" }, box }),
          runRecipe(avatarBadgeRecipe, { ...req, density, params: { status: "online" }, box: { w: Math.max(6, px / 3), h: Math.max(6, px / 3) } }),
          runRecipe(avatarCountRecipe, { ...req, density, params: {}, box }),
        ]
        for (const f of runs) {
          expect(f.layers, `${px} ${density}`).toEqual(["rest"])
          expect(nodes(f.parts.rest!)).toBeLessThanOrEqual(12)
          expect(f.parts.rest!.length).toBeLessThan(8_000)
          expect(f.parts.rest!).not.toMatch(/NaN|undefined|#[0-9a-f]{3,6}\b/)
        }
      }
    }
  })

  it("is deterministic per seed and differs between seeds", () => {
    const a = runRecipe(avatarRingRecipe, { ...req, params: { ring: "ink" }, box: { w: 32, h: 32 } })
    expect(runRecipe(avatarRingRecipe, { ...req, params: { ring: "ink" }, box: { w: 32, h: 32 } }).parts.rest).toBe(a.parts.rest)
    expect(runRecipe(avatarRingRecipe, { ...req, seed: "other", params: { ring: "ink" }, box: { w: 32, h: 32 } }).parts.rest).not.toBe(a.parts.rest)
  })

  it("every status has its color", () => {
    const keys = { online: "grass", away: "tangerine", busy: "tomato", offline: "pencil-mark", marker: "marker" } as const
    for (const [status, key] of Object.entries(keys)) {
      const f = runRecipe(avatarBadgeRecipe, { ...req, params: { status: status as keyof typeof keys }, box: { w: 10, h: 10 } })
      expect(f.parts.rest).toContain(`var(--ll-${key})`)
    }
  })
})

describe("SSR and hydration", () => {
  const tree = () => (
    <AvatarGroup>
      <Avatar seed="a">
        <AvatarImage src="/x.png" alt="Ada" />
        <AvatarFallback name="Ada Lovelace" />
        <AvatarBadge status="online" />
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  )

  it("renders identical markup twice", () => {
    expect(renderToString(tree())).toBe(renderToString(tree()))
  })

  it("hydrates without warnings, bare and inside the provider", () => {
    for (const wrap of [(x: React.ReactElement) => x, (x: React.ReactElement) => <InkProvider>{x}</InkProvider>]) {
      const ui = wrap(tree())
      const container = document.createElement("div")
      document.body.appendChild(container)
      container.innerHTML = renderToString(ui)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      let root: ReturnType<typeof hydrateRoot> | undefined
      act(() => {
        root = hydrateRoot(container, ui)
      })
      expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
      errors.mockRestore()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("examples", () => {
  it("Photo and initials", async () => {
    const { container } = renderUI(<Default />)
    expect(container.querySelectorAll("[data-slot=avatar]")).toHaveLength(4)
    await axeCheck()
  })

  it("Color from the name shows twelve faces and three ring pens", async () => {
    const { container } = renderUI(<Colours />)
    expect(container.querySelectorAll("[data-slot=avatar]")).toHaveLength(15)
    expect(container.querySelectorAll("[data-slot=avatar][data-ink-host]").length).toBe(14)
    await axeCheck()
  })

  it("Groups", async () => {
    const { container } = renderUI(<Group />)
    expect(container.querySelectorAll("[data-slot=avatar-group]")).toHaveLength(3)
    expect(container.querySelectorAll("[data-slot=avatar-group-count]")).toHaveLength(3)
    await axeCheck()
  })

  it("Team card lists four people with their presence", async () => {
    const { container, getByText } = renderUI(<Team />)
    expect(container.querySelectorAll("[data-slot=avatar-badge]")).toHaveLength(4)
    expect(getByText("Mika Kobayashi", { selector: "span.font-bold" })).toBeTruthy()
    await axeCheck()
  })
})
