import * as React from "react"
import { renderToString } from "react-dom/server"
import { act } from "react"
import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader, MessageText } from "@/components/ui/message"
import { axeCheck } from "./helpers"

function Full(props: React.ComponentProps<typeof Message>) {
  return (
    <Message {...props}>
      <MessageAvatar>A</MessageAvatar>
      <MessageContent>
        <MessageHeader>Stubby</MessageHeader>
        <Bubble variant="muted">
          <BubbleContent>Hello</BubbleContent>
        </Bubble>
        <MessageFooter>seen</MessageFooter>
      </MessageContent>
    </Message>
  )
}

describe("Message parts", () => {
  it("keeps upstream's parts, data-slots and layout classes", () => {
    const { container } = render(
      <MessageGroup>
        <Full />
      </MessageGroup>,
    )
    for (const slot of ["message-group", "message", "message-avatar", "message-content", "message-header", "message-footer"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
    const m = container.querySelector('[data-slot="message"]') as HTMLElement
    expect(m).toHaveAttribute("data-align", "start")
    expect(m).toHaveClass("group/message", "relative", "flex", "w-full", "min-w-0", "gap-2", "data-[align=end]:flex-row-reverse")
    expect(container.querySelector('[data-slot="message-group"]')).toHaveClass("flex", "min-w-0", "flex-col", "gap-2")
    expect(container.querySelector('[data-slot="message-avatar"]')!.className).toContain("group-has-data-[slot=message-footer]/message:-translate-y-8")
    expect(container.querySelector('[data-slot="message-content"]')!.className).toContain("group-data-[align=end]/message:*:data-slot:self-end")
  })

  it("align=end reverses the row and reaches the bubbles inside", () => {
    const { container } = render(<Full align="end" />)
    expect(container.querySelector('[data-slot="message"]')).toHaveAttribute("data-align", "end")
    expect(container.querySelector('[data-slot="bubble"]')).toHaveAttribute("data-align", "end")
  })

  it("header and footer are quiet hand notes", () => {
    const { getByText } = render(<Full />)
    expect(getByText("Stubby")).toHaveClass("font-hand", "text-sm", "text-muted-foreground")
    expect(getByText("seen")).toHaveClass("font-hand", "text-sm", "text-muted-foreground")
  })

  it("has no axe violations", async () => {
    const { container } = render(
      <MessageGroup>
        <Full />
        <Full align="end" />
      </MessageGroup>,
    )
    await axeCheck(container)
  })
})

describe("MessageText", () => {
  it("is real text: the words keep their spaces, so copy and find work", () => {
    const { container } = render(<MessageText>Tags now sit under each note.</MessageText>)
    const t = container.querySelector('[data-slot="message-text"]') as HTMLElement
    expect(t.textContent).toBe("Tags now sit under each note.")
    expect(t.querySelectorAll("span")).toHaveLength(6)
    expect(t).toHaveClass("whitespace-pre-wrap")
  })

  it("the words are plain inline text: no inline-block, no layer of their own (WebKit cut a script face's last letter to its advance), the wobble is a relative offset and a colour", () => {
    const { container } = render(<MessageText seed="s">one two three</MessageText>)
    const t = container.querySelector('[data-slot="message-text"]') as HTMLElement
    expect(t).not.toHaveClass("ll-hand-jitter")
    for (const w of Array.from(t.querySelectorAll("span"))) expect(w.className).not.toMatch(/inline-block/)
    const sheet = document.head.querySelector('style[data-href="ll-message-text"]')?.textContent ?? ""
    expect(sheet).toContain('[data-slot=message-text] [style*="--jy"]{position:relative;top:calc(var(--jy,0px)*var(--ll-jitter-k,1));color:color-mix(in srgb,currentColor')
    expect(sheet).not.toMatch(/inline-block|translate:|rotate:|opacity:/)
  })

  it("wobbles each word by a small deterministic amount", () => {
    const html = (seed: string) => renderToString(<MessageText seed={seed}>one two three</MessageText>)
    expect(html("s")).toBe(html("s"))
    expect(html("s")).not.toBe(html("t"))
    const { container } = render(<MessageText seed="s">one two three</MessageText>)
    for (const w of Array.from(container.querySelectorAll("span span"))) {
      const st = (w as HTMLElement).style
      expect(Math.abs(parseFloat(st.getPropertyValue("--jy")))).toBeLessThanOrEqual(0.6)
      expect(st.getPropertyValue("--jr")).toBe("")
      expect(parseFloat(st.getPropertyValue("--jo"))).toBeGreaterThanOrEqual(0.88)
    }
  })

  it("jitter={false} is plain words", () => {
    const { container } = render(<MessageText jitter={false}>one two</MessageText>)
    expect(container.querySelector('[data-slot="message-text"]')).not.toHaveClass("ll-hand-jitter")
    expect((container.querySelector("span span") as HTMLElement).getAttribute("style")).toBeNull()
  })

  it("words that are there at the first render are old ink; words that arrive later soak in", () => {
    const { container, rerender } = render(<MessageText streaming>Tags now</MessageText>)
    const fresh = () => Array.from(container.querySelectorAll('[data-word="fresh"]')).map((n) => n.textContent)
    expect(fresh()).toEqual([])
    rerender(<MessageText streaming>Tags now sit under</MessageText>)
    expect(fresh()).toEqual(["sit", "under"])
    for (const n of Array.from(container.querySelectorAll('[data-word="fresh"]'))) expect(n).toHaveClass("animate-soak")
    rerender(<MessageText streaming>Tags now sit under each note</MessageText>)
    expect(fresh()).toEqual(["sit", "under", "each", "note"])
  })

  it("a reply that starts empty soaks in from its very first word; a first render that ends in a space keeps the next word fresh", () => {
    const { container, rerender } = render(<MessageText streaming>{""}</MessageText>)
    const fresh = () => Array.from(container.querySelectorAll('[data-word="fresh"]')).map((n) => n.textContent)
    rerender(<MessageText streaming>Hello</MessageText>)
    expect(fresh()).toEqual(["Hello"])
    const spaced = render(<MessageText streaming>{"Tags now "}</MessageText>)
    spaced.rerender(<MessageText streaming>{"Tags now sit"}</MessageText>)
    expect(Array.from(spaced.container.querySelectorAll('[data-word="fresh"]')).map((n) => n.textContent)).toEqual(["sit"])
  })

  it("right-to-left script is left to the browser: one plain run with dir=auto, no per-word spans", () => {
    const ar = "مرحبا بالعالم كيف حالك"
    const { container } = render(<MessageText streaming>{ar}</MessageText>)
    const root = container.querySelector('[data-slot="message-text"]') as HTMLElement
    expect(root).toHaveAttribute("dir", "auto")
    expect(root.querySelectorAll("span")).toHaveLength(0)
    expect(root.textContent).toBe(ar)
    expect(root).not.toHaveClass("ll-hand-jitter")
    expect(root.className).toContain("after:bg-ink-you")
    const mixed = render(<MessageText>{"שלום hello world"}</MessageText>)
    expect(mixed.container.querySelectorAll("[data-word]")).toHaveLength(0)
    const en = render(<MessageText>hello world</MessageText>)
    expect(en.container.querySelector('[data-slot="message-text"]')).not.toHaveAttribute("dir")
    expect(en.container.querySelectorAll("span span")).toHaveLength(2)
  })

  it("never remounts the words it already has (their animation would replay)", () => {
    const { container, rerender } = render(<MessageText streaming>one</MessageText>)
    rerender(<MessageText streaming>one two</MessageText>)
    const first = container.querySelector("span span")!
    rerender(<MessageText streaming>one two three</MessageText>)
    expect(container.querySelector("span span")).toBe(first)
  })

  it("the caret rides on the last word while streaming and goes when it stops", () => {
    const { container, rerender } = render(<MessageText streaming>one two</MessageText>)
    const words = Array.from(container.querySelectorAll("span span"))
    expect(words[0].className).not.toContain("after:")
    expect(words[1].className).toContain("after:bg-ink-you")
    expect(container.querySelector('[data-slot="message-text"]')).toHaveAttribute("data-streaming")
    rerender(<MessageText>one two</MessageText>)
    expect(container.querySelector('[data-slot="message-text"]')).not.toHaveAttribute("data-streaming")
    expect(Array.from(container.querySelectorAll("span span")).every((w) => !w.className.includes("after:"))).toBe(true)
  })

  it("without streaming nothing animates", () => {
    const { container, rerender } = render(<MessageText>one</MessageText>)
    rerender(<MessageText>one two three</MessageText>)
    expect(container.querySelectorAll('[data-word="fresh"]')).toHaveLength(0)
  })

  it("keeps newlines and copes with empty text", () => {
    const { container } = render(<MessageText>{"a\nb"}</MessageText>)
    expect(container.textContent).toBe("a\nb")
    expect(render(<MessageText />).container.querySelector('[data-slot="message-text"]')).toBeEmptyDOMElement()
  })

  it("a streaming reply grows inside a bubble without an axe violation", async () => {
    const { container, rerender } = render(
      <Bubble>
        <BubbleContent>
          <MessageText streaming>one</MessageText>
        </BubbleContent>
      </Bubble>,
    )
    await act(async () => {
      rerender(
        <Bubble>
          <BubbleContent>
            <MessageText streaming>one two three</MessageText>
          </BubbleContent>
        </Bubble>,
      )
    })
    await axeCheck(container)
  })
})
