import * as React from "react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { act } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render } from "@testing-library/react"

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from "@/components/ui/message-scroller"
import { axeCheck, renderUI } from "./helpers"

let viewport: HTMLElement | null = null
let H = 300
let st = 0
const scrollToCalls: Array<{ top: number; behavior?: string }> = []
const rect = (top: number, h: number) => ({ top, bottom: top + h, height: h, left: 0, right: 320, width: 320, x: 0, y: top, toJSON: () => ({}) }) as DOMRect
const origRect = Element.prototype.getBoundingClientRect

function stackHeight(v: HTMLElement): number {
  const content = v.querySelector('[role="log"]') as HTMLElement | null
  if (!content) return 0
  let sum = 0
  for (const c of Array.from(content.children)) if (c instanceof HTMLElement && c.dataset.h !== undefined) sum += Number(c.dataset.h)
  const spacer = content.querySelector("[data-message-scroller-spacer]") as HTMLElement | null
  return sum + (spacer && !spacer.hidden ? Number.parseFloat(spacer.style.height || "0") || 0 : 0)
}
const maxTop = () => (viewport ? Math.max(0, stackHeight(viewport) - H) : 0)

function attachLayout(v: HTMLElement) {
  viewport = v
  st = 0
  Object.defineProperty(v, "clientHeight", { configurable: true, get: () => H })
  Object.defineProperty(v, "scrollHeight", { configurable: true, get: () => stackHeight(v) })
  Object.defineProperty(v, "scrollTop", {
    configurable: true,
    get: () => st,
    set: (n: number) => {
      const next = Math.min(Math.max(0, n), maxTop())
      if (next === st) return
      st = next
      queueMicrotask(() => v.dispatchEvent(new Event("scroll")))
    },
  })
  v.scrollTo = ((o: ScrollToOptions) => {
    scrollToCalls.push({ top: o.top ?? 0, behavior: o.behavior })
    v.scrollTop = o.top ?? 0
  }) as typeof v.scrollTo
}

beforeEach(() => {
  scrollToCalls.length = 0
  let n = 0
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    const id = ++n
    queueMicrotask(() => cb(0))
    return id
  })
  vi.stubGlobal("cancelAnimationFrame", () => {})
  Element.prototype.getBoundingClientRect = function (this: Element) {
    if (viewport && this === viewport) return rect(0, H)
    if (viewport && this instanceof HTMLElement && this.dataset.h === "0" && viewport.contains(this)) return { ...rect(0, 0), width: 0, right: 0 } as DOMRect
    if (viewport && this instanceof HTMLElement && this.dataset.h !== undefined && viewport.contains(this)) {
      let y = 0
      for (const c of Array.from(this.parentElement!.children)) {
        if (c === this) break
        if (c instanceof HTMLElement && c.dataset.h !== undefined) y += Number(c.dataset.h)
      }
      return rect(y - st, Number(this.dataset.h))
    }
    return origRect.call(this)
  }
})
afterEach(() => {
  vi.unstubAllGlobals()
  Element.prototype.getBoundingClientRect = origRect
  viewport = null
  H = 300
})

const flush = () =>
  act(async () => {
    for (let i = 0; i < 6; i++) await Promise.resolve()
  })

const observers = new Set<() => void>()
class FakeRO {
  cb: () => void
  constructor(cb: (entries: unknown[]) => void) {
    this.cb = () => cb([])
  }
  observe() {
    observers.add(this.cb)
  }
  unobserve() {}
  disconnect() {
    observers.delete(this.cb)
  }
}
const fireResize = () => act(async () => {
  observers.forEach((f) => f())
  for (let i = 0; i < 6; i++) await Promise.resolve()
})
beforeEach(() => {
  observers.clear()
  vi.stubGlobal("ResizeObserver", FakeRO)
})

type Msg = { id: string; h: number; anchor?: boolean }
const A: Msg[] = Array.from({ length: 10 }, (_, i) => ({ id: `m${i}`, h: 100 }))

function Transcript({
  messages = A,
  H: height = 300,
  position,
  autoScroll,
  preserve,
  children,
}: {
  messages?: Msg[]
  H?: number
  position?: "start" | "end" | "last-anchor"
  autoScroll?: boolean
  preserve?: boolean
  children?: React.ReactNode
}) {
  H = height
  return (
    <MessageScrollerProvider defaultScrollPosition={position} autoScroll={autoScroll}>
      <MessageScroller>
        <MessageScrollerViewport preserveScrollOnPrepend={preserve} ref={(el) => {
            if (el && viewport !== el) attachLayout(el)
          }}>
          <MessageScrollerContent>
            {messages.map((m) => (
              <MessageScrollerItem key={m.id} messageId={m.id} scrollAnchor={m.anchor} data-h={m.h}>
                {m.id}
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
        {children}
      </MessageScroller>
    </MessageScrollerProvider>
  )
}

const btn = (r: ReturnType<typeof render>) => r.container.querySelector('[data-slot="message-scroller-button"]') as HTMLElement
const spacerPx = () => Number.parseFloat((document.querySelector("[data-message-scroller-spacer]") as HTMLElement).style.height || "0") || 0

describe("MessageScroller parts", () => {
  it("has the upstream parts, slots and roles", () => {
    const r = render(<Transcript />)
    const vp = r.container.querySelector('[data-slot="message-scroller-viewport"]') as HTMLElement
    expect(vp).toHaveAttribute("role", "region")
    expect(vp).toHaveAttribute("aria-label", "Messages")
    expect(vp).toHaveAttribute("tabindex", "0")
    const log = r.container.querySelector('[data-slot="message-scroller-content"]') as HTMLElement
    expect(log).toHaveAttribute("role", "log")
    expect(log).toHaveAttribute("aria-relevant", "additions")
    expect(r.container.querySelector('[data-slot="message-scroller"]')).toHaveClass("group/message-scroller", "relative", "flex", "size-full", "min-h-0", "flex-col")
    const item = r.container.querySelector('[data-slot="message-scroller-item"]') as HTMLElement
    expect(item).toHaveAttribute("data-message-id", "m0")
    expect(item).toHaveAttribute("data-scroll-anchor", "false")
    const sp = log.querySelector("[data-message-scroller-spacer]") as HTMLElement
    expect(sp).toHaveAttribute("aria-hidden", "true")
    expect(sp.hidden).toBe(true)
    expect(sp).toBe(log.lastElementChild)
  })

  it("the viewport is a tab stop with the drawn-page fade classes, not overflow-hidden (ink bleeds)", () => {
    const r = render(<Transcript />)
    const vp = r.container.querySelector('[data-slot="message-scroller-viewport"]') as HTMLElement
    expect(vp).toHaveClass("overflow-y-auto", "overscroll-contain")
    expect(vp).not.toHaveClass("overflow-hidden")
    expect(vp.className).toContain("group-data-[scrollable~=end]/message-scroller:[--fade-b:28px]")
  })
})

describe("where it opens", () => {
  it("at the newest message by default", async () => {
    render(<Transcript />)
    await flush()
    expect(st).toBe(700)
  })

  it("at the oldest with defaultScrollPosition=start", async () => {
    render(<Transcript position="start" />)
    await flush()
    expect(st).toBe(0)
  })

  it("last-anchor: your last message at the top with the one before peeking in, when the reply is taller than the page", async () => {
    const msgs: Msg[] = [
      { id: "u1", h: 100, anchor: true },
      { id: "a1", h: 200 },
      { id: "u2", h: 100, anchor: true },
      { id: "a2", h: 600 },
    ]
    render(<Transcript messages={msgs} position="last-anchor" />)
    await flush()
    expect(st).toBe(300 - 64)
  })

  it("last-anchor: when the last exchange fits, it just goes to the end", async () => {
    const msgs: Msg[] = [
      { id: "u1", h: 300, anchor: true },
      { id: "a1", h: 300 },
      { id: "u2", h: 50, anchor: true },
      { id: "a2", h: 100 },
    ]
    render(<Transcript messages={msgs} position="last-anchor" />)
    await flush()
    expect(st).toBe(maxTop())
    expect(st).toBe(450)
  })

  it("an empty transcript waits, and opens at the end when the first messages arrive", async () => {
    const r = render(<Transcript messages={[]} />)
    await flush()
    r.rerender(<Transcript messages={A} />)
    await flush()
    expect(st).toBe(700)
  })
})

describe("scrollable state and the jump button", () => {
  it("the button is asleep at the end, awake when there is more below, and takes you there", async () => {
    const r = render(<Transcript />)
    await flush()
    expect(btn(r)).toHaveAttribute("data-active", "false")
    expect(btn(r)).toHaveAttribute("inert")
    expect(btn(r)).toHaveAttribute("tabindex", "-1")
    act(() => {
      viewport!.scrollTop = 100
    })
    await flush()
    expect(r.container.querySelector('[data-slot="message-scroller"]')).toHaveAttribute("data-scrollable", "start end")
    expect(btn(r)).toHaveAttribute("data-active", "true")
    expect(btn(r)).not.toHaveAttribute("inert")
    scrollToCalls.length = 0
    fireEvent.click(btn(r))
    await flush()
    expect(scrollToCalls).toEqual([{ top: 700, behavior: "smooth" }])
    expect(btn(r)).toHaveAttribute("data-active", "false")
  })

  it("the button says what it does", () => {
    const r = render(<Transcript />)
    expect(btn(r)).toHaveTextContent("Scroll to end")
    expect(btn(r)).toHaveAttribute("data-direction", "end")
    expect(btn(r)).toHaveAttribute("type", "button")
    expect(btn(r)).toHaveAttribute("data-variant", "secondary")
    expect(btn(r)).toHaveAttribute("data-slot", "message-scroller-button")
  })

  it("a start button takes you to the top", async () => {
    const r = render(
      <Transcript>
        <MessageScrollerButton direction="start" />
      </Transcript>,
    )
    await flush()
    const up = r.container.querySelector('[data-direction="start"]') as HTMLElement
    expect(up).toHaveAttribute("data-active", "true")
    scrollToCalls.length = 0
    fireEvent.click(up)
    await flush()
    expect(scrollToCalls).toEqual([{ top: 0, behavior: "smooth" }])
  })

  it("useMessageScrollerScrollable reports both ends", async () => {
    const seen: Array<{ start: boolean; end: boolean }> = []
    function Spy() {
      seen.push({ ...useMessageScrollerScrollable() })
      return null
    }
    render(
      <Transcript position="start">
        <Spy />
      </Transcript>,
    )
    await flush()
    expect(seen[seen.length - 1]).toEqual({ start: false, end: true })
    act(() => {
      viewport!.scrollTop = 300
    })
    await flush()
    expect(seen[seen.length - 1]).toEqual({ start: true, end: true })
    act(() => {
      viewport!.scrollTop = 700
    })
    await flush()
    expect(seen[seen.length - 1]).toEqual({ start: true, end: false })
  })
})

describe("following a streaming reply", () => {
  const grow = (msgs: Msg[], extra: number): Msg[] => msgs.map((m, i) => (i === msgs.length - 1 ? { ...m, h: m.h + extra } : m))

  it("without autoScroll it stays where it is", async () => {
    const r = render(<Transcript />)
    await flush()
    r.rerender(<Transcript messages={grow(A, 100)} />)
    await flush()
    expect(st).toBe(700)
    expect(maxTop()).toBe(800)
  })

  it("with autoScroll it follows the bottom while content grows", async () => {
    const r = render(<Transcript autoScroll />)
    await flush()
    expect(st).toBe(700)
    r.rerender(<Transcript autoScroll messages={grow(A, 100)} />)
    await fireResize()
    expect(st).toBe(800)
    r.rerender(<Transcript autoScroll messages={grow(A, 250)} />)
    await fireResize()
    expect(st).toBe(950)
  })

  it("the moment you scroll up it lets go, and it follows again when you come back to the bottom", async () => {
    const r = render(<Transcript autoScroll />)
    await flush()
    fireEvent.wheel(viewport!, { deltaY: -40 })
    act(() => {
      viewport!.scrollTop = 500
    })
    await flush()
    r.rerender(<Transcript autoScroll messages={grow(A, 100)} />)
    await fireResize()
    expect(st).toBe(500)
    act(() => {
      viewport!.scrollTop = maxTop()
    })
    await flush()
    r.rerender(<Transcript autoScroll messages={grow(A, 200)} />)
    await fireResize()
    expect(st).toBe(maxTop())
    expect(st).toBe(900)
  })

  it("a scroll key is taking over too", async () => {
    const r = render(<Transcript autoScroll />)
    await flush()
    fireEvent.keyDown(viewport!, { key: "PageUp" })
    act(() => {
      viewport!.scrollTop = 200
    })
    await flush()
    r.rerender(<Transcript autoScroll messages={grow(A, 100)} />)
    await fireResize()
    expect(st).toBe(200)
  })

  it("a new message at the end brings the view to it while following", async () => {
    const r = render(<Transcript autoScroll />)
    await flush()
    r.rerender(<Transcript autoScroll messages={[...A, { id: "m10", h: 120 }]} />)
    await flush()
    expect(st).toBe(820)
  })
})

describe("older messages arriving above", () => {
  const older: Msg[] = [
    { id: "o1", h: 100 },
    { id: "o2", h: 100 },
    { id: "o3", h: 100 },
  ]

  it("holds what you were reading still", async () => {
    const r = render(<Transcript />)
    await flush()
    act(() => {
      viewport!.scrollTop = 400
    })
    await flush()
    const item = () => document.querySelector('[data-message-id="m4"]') as HTMLElement
    const before = item().getBoundingClientRect().top
    r.rerender(<Transcript messages={[...older, ...A]} />)
    await flush()
    expect(st).toBe(700)
    expect(item().getBoundingClientRect().top).toBe(before)
  })

  it("preserveScrollOnPrepend={false} leaves the offset alone", async () => {
    const r = render(<Transcript preserve={false} />)
    await flush()
    act(() => {
      viewport!.scrollTop = 400
    })
    await flush()
    r.rerender(<Transcript preserve={false} messages={[...older, ...A]} />)
    await flush()
    expect(st).toBe(400)
  })
})

describe("your own message goes to the top", () => {
  const convo: Msg[] = [
    { id: "u1", h: 80, anchor: true },
    { id: "a1", h: 500 },
  ]

  it("a new anchor message is scrolled to the top of the view, with a spacer that makes it reachable", async () => {
    const r = render(<Transcript messages={convo} />)
    await flush()
    expect(st).toBe(280)
    r.rerender(<Transcript messages={[...convo, { id: "u2", h: 60, anchor: true }]} />)
    await flush()
    expect(st).toBe(580 - 64)
    expect(spacerPx()).toBe(580 - 64 + 300 - 640)
    expect((document.querySelector("[data-message-scroller-spacer]") as HTMLElement).hidden).toBe(false)
  })

  it("the reply grows into the spacer, and when it has outgrown it the view follows the bottom", async () => {
    const withU2 = [...convo, { id: "u2", h: 60, anchor: true }]
    const withReply = (h: number): Msg[] => [...withU2, { id: "a2", h }]
    const r = render(<Transcript messages={convo} autoScroll />)
    await flush()
    r.rerender(<Transcript messages={withU2} autoScroll />)
    await flush()
    expect(st).toBe(516)
    expect(spacerPx()).toBe(516 + 300 - 640)
    r.rerender(<Transcript messages={withReply(40)} autoScroll />)
    await fireResize()
    expect(st).toBe(516)
    expect(spacerPx()).toBe(516 + 300 - 680)
    r.rerender(<Transcript messages={withReply(120)} autoScroll />)
    await fireResize()
    expect(st).toBe(516)
    expect(spacerPx()).toBe(516 + 300 - 760)
    r.rerender(<Transcript messages={withReply(400)} autoScroll />)
    await fireResize()
    expect(spacerPx()).toBe(0)
    expect(st).toBe(maxTop())
    expect(st).toBe(1040 - 300)
  })

  it("scrolling it away by hand ends the pinning", async () => {
    const r = render(<Transcript messages={convo} />)
    await flush()
    r.rerender(<Transcript messages={[...convo, { id: "u2", h: 60, anchor: true }]} />)
    await flush()
    fireEvent.wheel(viewport!, { deltaY: 30 })
    act(() => {
      viewport!.scrollTop = 200
    })
    await flush()
    r.rerender(<Transcript messages={[...convo, { id: "u2", h: 60, anchor: true }, { id: "a2", h: 50 }]} />)
    await fireResize()
    expect(st).toBe(200)
  })
})

describe("useMessageScroller", () => {
  function Controls() {
    const s = useMessageScroller()
    return (
      <div>
        <button onClick={() => ((window as unknown as { res: unknown }).res = s.scrollToMessage("m3"))}>go m3</button>
        <button onClick={() => ((window as unknown as { res: unknown }).res = s.scrollToMessage("m5", { align: "center" }))}>center m5</button>
        <button onClick={() => ((window as unknown as { res: unknown }).res = s.scrollToMessage("nope"))}>go nope</button>
        <button onClick={() => ((window as unknown as { res: unknown }).res = s.scrollToStart())}>top</button>
        <button onClick={() => ((window as unknown as { res: unknown }).res = s.scrollToEnd())}>bottom</button>
      </div>
    )
  }
  const res = () => (window as unknown as { res: unknown }).res

  it("scrolls to a message, to the start and to the end, and says whether it could", async () => {
    const r = render(
      <Transcript>
        <Controls />
      </Transcript>,
    )
    await flush()
    fireEvent.click(r.getByText("go m3"))
    expect(res()).toBe(true)
    expect(st).toBe(300)
    fireEvent.click(r.getByText("center m5"))
    expect(st).toBe(500 - (300 - 100) / 2)
    fireEvent.click(r.getByText("go nope"))
    expect(res()).toBe(false)
    fireEvent.click(r.getByText("top"))
    expect(st).toBe(0)
    fireEvent.click(r.getByText("bottom"))
    expect(st).toBe(700)
  })

  it("a message asked for before it exists is scrolled to when it arrives", async () => {
    function Ask() {
      const s = useMessageScroller()
      React.useEffect(() => {
        s.scrollToMessage("m2")
      }, [s])
      return null
    }
    const r = render(<Transcript messages={[]} />)
    await flush()
    r.rerender(
      <Transcript messages={A}>
        <Ask />
      </Transcript>,
    )
    await flush()
    expect(st).toBe(200)
  })
})

describe("useMessageScrollerVisibility", () => {
  it("lists what is in view and the anchor you have scrolled past", async () => {
    const msgs: Msg[] = [
      { id: "u1", h: 100, anchor: true },
      { id: "a1", h: 300 },
      { id: "u2", h: 100, anchor: true },
      { id: "a2", h: 300 },
    ]
    let seen: { currentAnchorId: string | null; visibleMessageIds: string[] } = { currentAnchorId: null, visibleMessageIds: [] }
    function Spy() {
      seen = useMessageScrollerVisibility()
      return null
    }
    render(
      <Transcript messages={msgs} position="start">
        <Spy />
      </Transcript>,
    )
    await flush()
    expect(seen.visibleMessageIds).toEqual(["u1", "a1"])
    expect(seen.currentAnchorId).toBe("u1")
    act(() => {
      viewport!.scrollTop = 200
    })
    await flush()
    expect(seen.visibleMessageIds).toEqual(["a1", "u2"])
    expect(seen.currentAnchorId).toBe("u1")
    act(() => {
      viewport!.scrollTop = 400
    })
    await flush()
    expect(seen.visibleMessageIds).toEqual(["u2", "a2"])
    expect(seen.currentAnchorId).toBe("u2")
  })
})

describe("the button's render prop and parts outside a provider", () => {
  it("renders your element, keeping its props and adding the state", () => {
    const r = render(
      <MessageScrollerProvider>
        <MessageScrollerButton render={<a href="#x" data-mine="1" />}>Latest</MessageScrollerButton>
      </MessageScrollerProvider>,
    )
    const a = r.container.querySelector("a") as HTMLElement
    expect(a).toHaveAttribute("data-mine", "1")
    expect(a).toHaveAttribute("data-active", "false")
    expect(a).toHaveTextContent("Latest")
  })

  it("render can be a function", () => {
    const r = render(
      <MessageScrollerProvider>
        <MessageScrollerButton render={(props, state) => <span data-state={String(state.active)} data-t={String(props.type)} />} />
      </MessageScrollerProvider>,
    )
    expect(r.container.querySelector("span")).toHaveAttribute("data-t", "button")
  })

  it("a part outside a provider says so", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<MessageScrollerButton />)).toThrow(/Provider/)
    err.mockRestore()
  })
})

describe("MessageScroller on the server", () => {
  it("renders the transcript and hydrates without a warning", async () => {
    const tree = () => (
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <MessageScrollerItem messageId="a">hello</MessageScrollerItem>
              <MessageScrollerItem messageId="b" scrollAnchor>
                world
              </MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    )
    const html = renderToString(tree())
    expect(html).toContain("hello")
    expect(html).toContain('role="log"')
    expect(renderToString(tree())).toBe(html)
    const root = document.createElement("div")
    root.innerHTML = html
    document.body.append(root)
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    await act(async () => {
      hydrateRoot(root, tree())
    })
    expect(err).not.toHaveBeenCalled()
    err.mockRestore()
    root.remove()
  })

  it("has no axe violations", async () => {
    const r = render(<Transcript />)
    await flush()
    await axeCheck(r.container)
  })

  it("the region is reachable and scrollable by keyboard", async () => {
    const { user, container } = renderUI(<Transcript />)
    await flush()
    await user.tab()
    expect(container.querySelector('[role="region"]')).toHaveFocus()
  })
})

describe("review: following a stream", () => {
  const grow = (msgs: Msg[], extra: number): Msg[] => msgs.map((m, i) => (i === msgs.length - 1 ? { ...m, h: m.h + extra } : m))

  it("scrolling DOWN at the bottom (wheel, End, PageDown, Space, a finger dragging up) does not stop following", async () => {
    const r = render(<Transcript autoScroll />)
    await flush()
    expect(st).toBe(700)
    fireEvent.wheel(viewport!, { deltaY: 60 })
    for (const key of ["End", "PageDown", "ArrowDown", " "]) fireEvent.keyDown(viewport!, { key })
    fireEvent.touchStart(viewport!, { touches: [{ clientY: 300 }] })
    fireEvent.touchMove(viewport!, { touches: [{ clientY: 240 }] })
    await flush()
    r.rerender(<Transcript autoScroll messages={grow(A, 120)} />)
    await fireResize()
    expect(st).toBe(820)
  })

  it("scrolling UP does stop it, by wheel, key or finger", async () => {
    for (const up of [
      () => fireEvent.wheel(viewport!, { deltaY: -40 }),
      () => fireEvent.keyDown(viewport!, { key: "PageUp" }),
      () => {
        fireEvent.touchStart(viewport!, { touches: [{ clientY: 100 }] })
        fireEvent.touchMove(viewport!, { touches: [{ clientY: 160 }] })
      },
    ]) {
      const r = render(<Transcript autoScroll />)
      await flush()
      up()
      act(() => {
        viewport!.scrollTop = 500
      })
      await flush()
      r.rerender(<Transcript autoScroll messages={grow(A, 100)} />)
      await fireResize()
      expect(st).toBe(500)
      r.unmount()
    }
  })

  it("dragging the scrollbar up while tokens keep arriving lets go (no wheel, key or touch to tell us)", async () => {
    const r = render(<Transcript autoScroll />)
    await flush()
    r.rerender(<Transcript autoScroll messages={grow(A, 40)} />)
    await fireResize()
    expect(st).toBe(740)
    act(() => {
      viewport!.scrollTop = 500
    })
    await flush()
    r.rerender(<Transcript autoScroll messages={grow(A, 80)} />)
    await fireResize()
    expect(st).toBe(500)
  })

  it("autoScroll can be switched on when a reply starts (and off when it ends): at the bottom it follows from then on", async () => {
    const r = render(<Transcript />)
    await flush()
    expect(st).toBe(700)
    r.rerender(<Transcript autoScroll messages={grow(A, 0)} />)
    await flush()
    r.rerender(<Transcript autoScroll messages={grow(A, 120)} />)
    await fireResize()
    expect(st).toBe(820)
    r.rerender(<Transcript messages={grow(A, 120)} />)
    await flush()
    r.rerender(<Transcript messages={grow(A, 260)} />)
    await fireResize()
    expect(st).toBe(820)
  })

  it("switching autoScroll on while the reader is up in the history does not pull them down", async () => {
    const r = render(<Transcript />)
    await flush()
    act(() => {
      viewport!.scrollTop = 200
    })
    await flush()
    r.rerender(<Transcript autoScroll />)
    await flush()
    r.rerender(<Transcript autoScroll messages={grow(A, 100)} />)
    await fireResize()
    expect(st).toBe(200)
  })

  it("dragging the scrollbar while your message is pinned lets go of the pin (the reply keeps growing under your hand)", async () => {
    const convo: Msg[] = [
      { id: "u1", h: 80, anchor: true },
      { id: "a1", h: 500 },
    ]
    const withU2 = [...convo, { id: "u2", h: 60, anchor: true }]
    const r = render(<Transcript messages={convo} />)
    await flush()
    r.rerender(<Transcript messages={withU2} />)
    await flush()
    expect(st).toBe(516)
    fireEvent.pointerDown(viewport!)
    act(() => {
      viewport!.scrollTop = 300
    })
    await flush()
    fireEvent.pointerUp(window)
    r.rerender(<Transcript messages={[...withU2, { id: "a2", h: 90 }]} />)
    await fireResize()
    expect(st).toBe(300)
  })

  it("a press on a message is not the scrollbar: nothing lets go", async () => {
    const convo: Msg[] = [
      { id: "u1", h: 80, anchor: true },
      { id: "a1", h: 500 },
    ]
    const withU2 = [...convo, { id: "u2", h: 60, anchor: true }]
    const r = render(<Transcript messages={convo} />)
    await flush()
    r.rerender(<Transcript messages={withU2} />)
    await flush()
    fireEvent.pointerDown(document.querySelector('[data-message-id="a1"]')!)
    r.rerender(<Transcript messages={[...withU2, { id: "a2", h: 90 }]} />)
    await fireResize()
    expect(st).toBe(516)
  })

  it("keeps working after React strict mode has run its effects twice (a cancelled frame must not lock the scroller)", async () => {
    const pending = new Map<number, FrameRequestCallback>()
    let n = 0
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      pending.set(++n, cb)
      return n
    })
    vi.stubGlobal("cancelAnimationFrame", (id: number) => void pending.delete(id))
    const tick = () =>
      act(async () => {
        const cbs = [...pending.values()]
        pending.clear()
        cbs.forEach((f) => f(0))
        for (let i = 0; i < 4; i++) await Promise.resolve()
      })
    const seen: string[][] = []
    function Spy() {
      seen.push(useMessageScrollerVisibility().visibleMessageIds)
      return null
    }
    const tree = (msgs: Msg[]) => (
      <React.StrictMode>
        <Transcript messages={msgs}>
          <Spy />
        </Transcript>
      </React.StrictMode>
    )
    const r = render(tree(A))
    await tick()
    await tick()
    expect(st).toBe(700)
    expect(btn(r)).toHaveAttribute("data-active", "false")
    r.rerender(tree(A.map((m, i) => (i === A.length - 1 ? { ...m, h: 400 } : m))))
    await act(async () => {
      observers.forEach((f) => f())
    })
    await tick()
    await tick()
    expect(btn(r)).toHaveAttribute("data-active", "true")
    expect(seen[seen.length - 1]).toContain("m9")
  })
})

describe("review: focus", () => {
  it("pressing the jump button hands the keyboard to the transcript instead of dropping it on the page", async () => {
    const { user, container } = renderUI(<Transcript />)
    await flush()
    act(() => {
      viewport!.scrollTop = 100
    })
    await flush()
    const b = container.querySelector('[data-slot="message-scroller-button"]') as HTMLElement
    b.focus()
    await user.keyboard("{Enter}")
    await flush()
    expect(container.querySelector('[role="region"]')).toHaveFocus()
  })

  it("the focusable viewport draws its keyboard ring inside its edge (the fade mask would cut a ring outside it)", () => {
    const r = render(<Transcript />)
    const vp = r.container.querySelector('[data-slot="message-scroller-viewport"]') as HTMLElement
    expect(vp.className).toContain("focus-visible:-outline-offset-3")
  })
})

describe("review: reduced motion", () => {
  it("the jump button scrolls instantly when the person asked for less motion (an explicit smooth ignores the CSS override)", async () => {
    const mm = window.matchMedia
    window.matchMedia = ((q: string) => ({ matches: q.includes("reduce"), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as typeof window.matchMedia
    try {
      const r = render(<Transcript />)
      await flush()
      act(() => {
        viewport!.scrollTop = 100
      })
      await flush()
      scrollToCalls.length = 0
      fireEvent.click(btn(r))
      await flush()
      expect(scrollToCalls).toEqual([])
      expect(st).toBe(700)
    } finally {
      window.matchMedia = mm
    }
  })

  it("and under an app-level data-motion=reduced island", async () => {
    const r = render(
      <div data-motion="reduced">
        <Transcript />
      </div>,
    )
    await flush()
    act(() => {
      viewport!.scrollTop = 100
    })
    await flush()
    scrollToCalls.length = 0
    fireEvent.click(btn(r))
    await flush()
    expect(scrollToCalls).toEqual([])
    expect(st).toBe(700)
  })
})

describe("review: a long log and hidden items", () => {
  it("hidden messages (display: none) are neither visible nor in the way of finding the ones that are", async () => {
    const msgs: Msg[] = Array.from({ length: 12 }, (_, i) => ({ id: `m${i}`, h: i === 6 ? 0 : 100 }))
    let seen: string[] = []
    function Spy() {
      seen = useMessageScrollerVisibility().visibleMessageIds
      return null
    }
    render(
      <Transcript messages={msgs} position="start">
        <Spy />
      </Transcript>,
    )
    await flush()
    act(() => {
      viewport!.scrollTop = 350
    })
    await flush()
    expect(seen).toEqual(["m4", "m5", "m7"])
  })

  it("a 3,000 message log reads a handful of rects per scroll, not one per message", async () => {
    const msgs: Msg[] = Array.from({ length: 3000 }, (_, i) => ({ id: `m${i}`, h: 100 }))
    const spy = vi.spyOn(Element.prototype, "getBoundingClientRect")
    render(<Transcript messages={msgs} />)
    await flush()
    spy.mockClear()
    act(() => {
      viewport!.scrollTop = 150000
    })
    await flush()
    expect(spy.mock.calls.length).toBeLessThan(200)
    spy.mockRestore()
  })
})

describe("review: a random afternoon of chatting keeps its promises", () => {
  it("follows the bottom exactly while the reader has not left it, and never drags them back once they have", async () => {
    let seed = 20260925
    const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296
    let msgs: Msg[] = Array.from({ length: 6 }, (_, i) => ({ id: `m${i}`, h: 80 + Math.floor(rnd() * 120) }))
    const tree = () => <Transcript autoScroll messages={msgs} />
    const r = render(tree())
    await flush()
    let follow = true
    let nextId = 100
    for (let step = 0; step < 260; step++) {
      const before = st
      const op = Math.floor(rnd() * 6)
      if (op === 0) {
        msgs = msgs.map((m, i) => (i === msgs.length - 1 ? { ...m, h: m.h + 10 + Math.floor(rnd() * 90) } : m))
        r.rerender(tree())
        await fireResize()
      } else if (op === 1) {
        msgs = [...msgs, { id: `n${nextId++}`, h: 60 + Math.floor(rnd() * 160) }]
        r.rerender(tree())
        await fireResize()
      } else if (op === 2 && maxTop() > 40) {
        const d = 20 + Math.floor(rnd() * Math.min(400, maxTop()))
        fireEvent.wheel(viewport!, { deltaY: -d })
        act(() => {
          viewport!.scrollTop = Math.max(0, st - d)
        })
        await flush()
        follow = maxTop() - st <= 8
      } else if (op === 3) {
        const d = 20 + Math.floor(rnd() * 500)
        fireEvent.wheel(viewport!, { deltaY: d })
        act(() => {
          viewport!.scrollTop = Math.min(maxTop(), st + d)
        })
        await flush()
        if (maxTop() - st <= 8) follow = true
      } else if (op === 4) {
        fireEvent.wheel(viewport!, { deltaY: 30 })
        await flush()
      } else {
        msgs = msgs.map((m, i) => (i === msgs.length - 1 ? { ...m, h: Math.max(40, m.h - 30) } : m))
        r.rerender(tree())
        await fireResize()
      }
      expect(Number.isFinite(st) && st >= 0 && st <= maxTop(), `step ${step} op ${op}: scrollTop ${st} of ${maxTop()}`).toBe(true)
      if (follow && (op <= 1 || op === 4 || op === 5)) expect(st, `step ${step} op ${op} should follow`).toBe(maxTop())
      if (!follow && (op === 0 || op === 1)) expect(st, `step ${step} op ${op} must not drag the reader (was ${before})`).toBe(before)
    }
  })
})
