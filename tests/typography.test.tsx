import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Blockquote, H1, H2, H3, H4, InlineCode, Large, Lead, List, Muted, P, Prose, Small } from "@/components/ui/typography"
import { TYPOGRAPHY_QUOTE_BAR, TYPOGRAPHY_RULE_1, TYPOGRAPHY_RULE_2 } from "@/lib/ink/typography-tiles.generated"
import { axeCheck } from "./helpers"

describe("Typography parts", () => {
  it("each part is the right element with its data-slot", () => {
    const { container } = render(
      <div>
        <H1>One</H1>
        <H2>Two</H2>
        <H3>Three</H3>
        <H4>Four</H4>
        <P>Para</P>
        <Lead>Lead</Lead>
        <Large>Large</Large>
        <Small>Small</Small>
        <Muted>Muted</Muted>
        <List>
          <li>a</li>
        </List>
        <List ordered>
          <li>b</li>
        </List>
        <p>
          <InlineCode>x</InlineCode>
        </p>
        <Blockquote>Quote</Blockquote>
      </div>,
    )
    const tag = (slot: string) => container.querySelector(`[data-slot=${slot}]`)?.tagName.toLowerCase()
    expect(["h1", "h2", "h3", "h4"].map((t, i) => tag(`typography-h${i + 1}`))).toEqual(["h1", "h2", "h3", "h4"])
    expect(tag("typography-p")).toBe("p")
    expect(tag("typography-lead")).toBe("p")
    expect(tag("typography-large")).toBe("div")
    expect(tag("typography-small")).toBe("small")
    expect(tag("typography-muted")).toBe("p")
    expect(container.querySelectorAll("[data-slot=typography-list]")[0].tagName).toBe("UL")
    expect(container.querySelectorAll("[data-slot=typography-list]")[1].tagName).toBe("OL")
    expect(tag("typography-inline-code")).toBe("code")
    expect(tag("typography-blockquote")).toBe("blockquote")
  })

  it("headings use the hand fonts; body text is 17 px on a comfortable line", () => {
    const { getByText } = render(
      <div>
        <H1>Title</H1>
        <H3>Sub</H3>
        <H4>Minor</H4>
        <P>Body</P>
      </div>,
    )
    expect(getByText("Title")).toHaveClass("font-script", "text-5xl")
    expect(getByText("Sub")).toHaveClass("font-script")
    expect(getByText("Minor")).toHaveClass("font-hand", "font-bold")
    expect(getByText("Body")).toHaveClass("text-[17px]", "leading-[1.7]")
  })

  it("H1 and H2 carry a hand rule from a hoisted stylesheet that holds the six masks once; rule={false} turns it off", () => {
    const { getByText, container } = render(
      <div>
        <H1 seed="a">Ruled</H1>
        <H2 seed="b">Also ruled</H2>
        <H2 rule={false}>Plain</H2>
      </div>,
    )
    expect(getByText("Ruled").className).toContain("supports-[mask-image:none]:after:[mask-image:var(--ll-rule-1")
    expect(getByText("Also ruled").className).toContain("var(--ll-rule-2")
    expect(getByText("Plain").className).not.toContain("mask-image")
    const styles = document.head.querySelectorAll("style[data-href=ll-typography-rules]")
    expect(styles.length).toBeLessThanOrEqual(1)
    expect(TYPOGRAPHY_RULE_1).toHaveLength(3)
    expect(TYPOGRAPHY_RULE_2).toHaveLength(3)
    expect(container.textContent).toBe("RuledAlso ruledPlain")
  })

  it("the hand of the rule follows the seed: different seeds pick different tiles", () => {
    const cls = (seed: string) => {
      const { getByText, unmount } = render(<H2 seed={seed}>{seed}</H2>)
      const c = /--ll-rule-2([abc])/.exec(getByText(seed).className)?.[1]
      unmount()
      return c
    }
    const set = new Set(["a", "b", "c", "d", "e", "f", "g", "h"].map(cls))
    expect(set.size).toBeGreaterThan(1)
    expect(cls("a")).toBe(cls("a"))
  })

  it("the rule beside a quotation is a felt-tip pull (a mask on ::before, three hands by seed) with a plain border only where masks are missing", () => {
    const { getByText, container } = render(<Blockquote seed="q">Quote</Blockquote>)
    const bq = getByText("Quote")
    expect(bq.className).toContain("border-s-[3px]")
    expect(bq.className).toContain("supports-[mask-image:none]:border-s-0")
    expect(bq.className).toMatch(/supports-\[mask-image:none\]:before:\[mask-image:var\(--ll-bar-[abc]\)\]/)
    expect(TYPOGRAPHY_QUOTE_BAR).toHaveLength(3)
    for (const t of TYPOGRAPHY_QUOTE_BAR) expect(t).toMatch(/^url\("data:image\/svg\+xml,/)
    const css = document.head.querySelector("style[data-href=ll-typography-rules]")!.textContent!
    expect(css).toContain("--ll-bar-a:")
    expect(css).toContain("--ll-bar-c:")
    expect(container.textContent).toBe("Quote")
  })

  it("merges className after the defaults", () => {
    const { getByText } = render(<P className="text-lg text-ink-you">Big</P>)
    expect(getByText("Big")).toHaveClass("text-lg", "text-ink-you")
    expect(getByText("Big")).not.toHaveClass("text-[17px]")
  })

  it("has no axe violations", async () => {
    const { container } = render(
      <main>
        <H1>One</H1>
        <P>Text with <InlineCode>code</InlineCode>.</P>
        <List>
          <li>a</li>
        </List>
        <Blockquote>q</Blockquote>
      </main>,
    )
    await axeCheck(container)
  })
})

describe("Prose", () => {
  it("wraps raw children, adds nothing to them, and ships one stylesheet for the markup it styles", () => {
    const { container, getByText } = render(
      <Prose>
        <h1>Title</h1>
        <p>
          Some <a href="#x">link</a> and <code>code</code>.
        </p>
        <ul>
          <li>one</li>
        </ul>
      </Prose>,
    )
    const root = container.querySelector("[data-slot=typography-prose]")!
    expect(root).toBeTruthy()
    expect(getByText("Title").tagName).toBe("H1")
    expect(getByText("Title")).not.toHaveAttribute("class")
    expect(root.querySelector("a")).not.toHaveAttribute("class")
    const css = Array.from(document.querySelectorAll("style")).map((s) => s.textContent).join("\n")
    expect(css).toContain('[data-slot="typography-prose"]')
    expect(css).toContain("@layer components")
    expect(css).toContain("--ll-rule-1a")
    expect(css).toContain(':where(blockquote)::before')
    expect(css).toContain("mask-image: var(--ll-bar-a)")
    expect(css).toContain("max-width: 64ch")
  })

  it("a table in Prose is ruled by its cells with the baked pencil pull, never by the row (WebKit), with the plain borders as the fallback", () => {
    render(<Prose>x</Prose>)
    const css = Array.from(document.querySelectorAll("style")).map((s) => s.textContent).join("\n")
    expect(css).toContain("--ll-prose-rule:")
    expect(css).toContain("--ll-prose-head:")
    expect(css).toContain(':where(th, td)::after')
    expect(css).not.toMatch(/:where\(tr[^)]*\)::(before|after)/)
    expect(css).toContain(":where(th) { font-family: var(--font-script)")
    expect(css).toContain("border-bottom: 1px solid color-mix")
    expect(css).toMatch(/forced-colors: active\)[\s\S]*:where\(th, td\)::after \{ display: none; \}/)
  })

  it("the stylesheet only uses tokens (no colour literals) and keeps specificity low with :where", () => {
    render(<Prose>x</Prose>)
    const css = Array.from(document.querySelectorAll("style")).map((s) => s.textContent).join("\n")
    const prose = css.slice(css.indexOf('[data-slot="typography-prose"]'))
    expect(prose).not.toMatch(/#[0-9a-f]{3,8}\b(?![^()]*\))/i)
    expect(prose).toContain(":where(a)")
    expect(prose).toContain("var(--ll-link)")
    expect(prose).toContain("var(--font-script)")
  })

  it("has no axe violations and renders identically on the server twice", async () => {
    const ui = (
      <Prose>
        <h2>Section</h2>
        <p>Text</p>
      </Prose>
    )
    expect(renderToString(ui)).toBe(renderToString(ui))
    const { container } = render(ui)
    await axeCheck(container)
  })

  it("hydrates without a warning", async () => {
    const ui = (
      <Prose>
        <h2>Section</h2>
        <p>Text</p>
      </Prose>
    )
    const a = renderToString(ui)
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const div = document.createElement("div")
    div.innerHTML = a
    document.body.appendChild(div)
    await act(async () => {
      hydrateRoot(div, ui)
    })
    expect(err).not.toHaveBeenCalled()
    err.mockRestore()
    div.remove()
  })
})
