import * as React from "react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { act } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, waitFor } from "@testing-library/react"

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopy,
  CodeBlockHeader,
  CodeBlockStats,
  CodeBlockTitle,
} from "@/components/ui/code-block"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { codeBodyRecipe, codeRuleRecipe } from "@/lib/ink/recipes/code-block-ink"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(400, 40)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length
const CODE = `import { a } from "b"\n\nexport const x = 1 // one\n`
const PATCH = `-const shown = notes;\n+const shown = picked.size\n+  ? notes\n+  : [];\n export const count = 1;\n-export const label = "all";\n+export const label = "some";`

describe("CodeBlock", () => {
  it("is a figure on a slip, taped, with the header and the lines", () => {
    const { container } = render(<CodeBlock code={CODE} filename="src/a.ts" seed="a" />)
    const f = container.querySelector('[data-slot="code-block"]') as HTMLElement
    expect(f.tagName).toBe("FIGURE")
    expect(f).toHaveAttribute("data-language", "ts")
    expect(f).toHaveAttribute("data-stock", "slip")
    expect(f).toHaveClass("ll-paper", "m-0", "flex", "max-w-full", "min-w-0", "flex-col")
    expect(f.querySelector('[data-slot="tape"]')).not.toBeNull()
    expect(f.querySelector('[data-slot="code-block-title"]')).toHaveTextContent("src/a.ts")
    expect(f.querySelector('[data-slot="code-block-copy"]')).toHaveTextContent("copy")
    expect(f.querySelector('[data-slot="code-block-stats"]')).toBeNull()
  })

  it("the code is real text, one span per line, in a focusable pre", () => {
    const { container } = render(<CodeBlock code={CODE} language="ts" seed="a" />)
    const pre = container.querySelector("pre") as HTMLElement
    expect(pre).toHaveAttribute("tabindex", "0")
    expect(pre).toHaveClass("overflow-x-auto", "whitespace-pre", "font-mono")
    const lines = container.querySelectorAll('[data-slot="code-line"]')
    expect(lines).toHaveLength(3)
    expect(Array.from(lines).map((l) => l.textContent)).toEqual(['import { a } from "b"\n', "\n", "export const x = 1 // one"])
    expect(container.querySelector("code")!.textContent).toBe(CODE.replace(/\n$/, ""))
    expect(lines[1]).toHaveClass("min-h-lh")
  })

  it("language comes from the file name unless given; unknown is plain text", () => {
    expect(render(<CodeBlock code="x" filename="a.css" />).container.firstElementChild).toHaveAttribute("data-language", "css")
    expect(render(<CodeBlock code="x" filename="a.css" language="json" />).container.firstElementChild).toHaveAttribute("data-language", "json")
    expect(render(<CodeBlock code="x" />).container.firstElementChild).toHaveAttribute("data-language", "text")
    expect(render(<CodeBlock code="x" language="TypeScript" />).container.firstElementChild).toHaveAttribute("data-language", "ts")
  })

  it("the title falls back to the language", () => {
    const { container } = render(<CodeBlock code="x" language="bash" />)
    expect(container.querySelector('[data-slot="code-block-title"]')).toHaveTextContent("bash")
  })

  it("types keywords in red, strikes functions twice, underscores strings, greys comments", () => {
    const { getByText } = render(<CodeBlock code={'const f = g("s") // c'} language="ts" />)
    expect(getByText("const")).toHaveClass("text-red")
    expect(getByText("g")).toHaveClass("[text-shadow:0.45px_0_0_currentColor]")
    expect(getByText('"s"')).toHaveClass("underline")
    expect(getByText("// c")).toHaveClass("text-pencil-text")
  })

  it("line numbers are generated content from data-line", () => {
    const { container } = render(<CodeBlock code={CODE} language="ts" lineNumbers startLine={10} />)
    const lines = Array.from(container.querySelectorAll('[data-slot="code-line"]'))
    expect(lines.map((l) => l.getAttribute("data-line"))).toEqual(["10", "11", "12"])
    expect(lines[0].className).toContain("before:content-[attr(data-line)]")
    expect(lines[0].className).toContain("before:select-none")
    expect(render(<CodeBlock code={CODE} language="ts" />).container.querySelector("[data-line]")).toBeNull()
  })

  it("wrap lets long lines wrap", () => {
    const { container } = render(<CodeBlock code={CODE} wrap />)
    expect(container.querySelector("pre")).toHaveClass("whitespace-pre-wrap")
  })

  it("composes: children replace the default layout, an own code overrides the block's", () => {
    const { container } = render(
      <CodeBlock code="const a = 1" language="ts">
        <CodeBlockHeader>
          <CodeBlockTitle>my title</CodeBlockTitle>
        </CodeBlockHeader>
        <CodeBlockContent code="let b" />
      </CodeBlock>,
    )
    expect(container.querySelector('[data-slot="code-block-title"]')).toHaveTextContent("my title")
    expect(container.querySelector('[data-slot="code-block-copy"]')).toBeNull()
    expect(container.querySelector("pre")).toHaveTextContent("let b")
  })

  it("copyable={false} drops the button", () => {
    expect(render(<CodeBlock code="x" copyable={false} />).container.querySelector('[data-slot="code-block-copy"]')).toBeNull()
  })

  it("a part used outside a block says so", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<CodeBlockTitle />)).toThrow(/inside <CodeBlock>/)
    err.mockRestore()
  })
})

describe("CodeBlock diff", () => {
  it("added lines are ins with a tick, removed lines are del with a strike, and the markers are gone", () => {
    const { container } = render(<CodeBlock diff code={PATCH} language="ts" seed="d" />)
    const lines = Array.from(container.querySelectorAll('[data-slot="code-line"]'))
    expect(lines.map((l) => l.tagName)).toEqual(["DEL", "INS", "INS", "INS", "SPAN", "DEL", "INS"])
    expect(lines.map((l) => l.getAttribute("data-diff"))).toEqual(["del", "add", "add", "add", null, "del", "add"])
    expect(lines[0].textContent).toContain("const shown = notes;")
    expect(lines[0].textContent).not.toMatch(/^-/)
    expect(lines[0].querySelectorAll("svg")).toHaveLength(1)
    expect(lines[1].querySelectorAll("svg")).toHaveLength(1)
    expect(lines[4].querySelector("svg")).toBeNull()
    for (const l of lines) expect(l).toHaveClass("no-underline")
    for (const s of Array.from(container.querySelectorAll("svg"))) {
      expect(s).toHaveAttribute("aria-hidden", "true")
      expect(s).toHaveAttribute("focusable", "false")
    }
  })

  it("says added and removed to a screen reader, and counts in the header", () => {
    const { container } = render(<CodeBlock diff code={PATCH} language="ts" />)
    expect(container.querySelectorAll("ins .sr-only")).toHaveLength(4)
    expect(container.querySelectorAll("del .sr-only")).toHaveLength(2)
    const stats = container.querySelector('[data-slot="code-block-stats"]') as HTMLElement
    expect(stats.textContent).toContain("+")
    expect(stats.textContent?.replace(/\s+/g, " ")).toContain("Added 4")
    expect(stats.textContent?.replace(/\s+/g, " ")).toContain("Removed 2")
  })

  it('language="diff" turns diff mode on', () => {
    const { container } = render(<CodeBlock language="diff" code={PATCH} />)
    expect(container.firstElementChild).toHaveAttribute("data-diff")
    expect(container.querySelectorAll("ins")).toHaveLength(4)
  })

  it("numbers the new file: removed lines have no number", () => {
    const { container } = render(<CodeBlock diff code={PATCH} language="ts" lineNumbers />)
    const lines = Array.from(container.querySelectorAll('[data-slot="code-line"]'))
    expect(lines.map((l) => l.getAttribute("data-line"))).toEqual([null, "1", "2", "3", "4", null, "5"])
  })

  it("the same seed strikes and ticks the same way", () => {
    const html = (seed: string) => {
      const { container, unmount } = render(<CodeBlock diff code={PATCH} language="ts" seed={seed} />)
      const s = container.querySelector("pre")!.innerHTML
      unmount()
      return s
    }
    expect(html("a")).toBe(html("a"))
    expect(html("a")).not.toBe(html("b"))
  })
})

describe("CodeBlockCopy", () => {
  const clipboard = () => vi.spyOn(navigator.clipboard, "writeText")

  it("copies the code, shows a tick and announces it", async () => {
    const { getByRole, container, user } = renderUI(<CodeBlock code={"a\nb"} language="ts" />)
    const write = clipboard()
    await user.click(getByRole("button", { name: "Copy code" }))
    expect(write).toHaveBeenCalledWith("a\nb")
    await waitFor(() => expect(getByRole("button", { name: "Copy code" })).toHaveTextContent("copied"))
    expect(container.querySelector('[data-slot="code-block-status"]')).toHaveTextContent("Copied")
    expect(container.querySelector('[data-slot="code-block-status"]')).toHaveAttribute("role", "status")
  })

  it("a diff copies the result: context and added lines, no markers", async () => {
    const { getByRole, user } = renderUI(<CodeBlock diff code={PATCH} language="ts" />)
    const write = clipboard()
    await user.click(getByRole("button", { name: "Copy code" }))
    expect(write).toHaveBeenCalledWith('const shown = picked.size\n  ? notes\n  : [];\nexport const count = 1;\nexport const label = "some";')
  })

  it("falls back to a hidden textarea, and says so when nothing works", async () => {
    const { getByRole, user } = renderUI(<CodeBlock code="zz" language="ts" />)
    clipboard().mockRejectedValue(new Error("denied"))
    const exec = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, "execCommand", { configurable: true, value: exec })
    await user.click(getByRole("button", { name: "Copy code" }))
    expect(exec).toHaveBeenCalledWith("copy")
    await waitFor(() => expect(getByRole("button", { name: "Copy code" })).toHaveTextContent("copied"))
    exec.mockReturnValue(false)
    await user.click(getByRole("button", { name: "Copy code" }))
    await waitFor(() => expect(getByRole("button", { name: "Copy code" })).toHaveTextContent("press Ctrl+C"))
    expect(document.querySelector("textarea")).toBeNull()
  })

  it("when nothing works the code is selected, so the Ctrl+C it asks for has something to copy; and the button keeps the focus", async () => {
    const { getByRole, user, container } = renderUI(<CodeBlock code={"one\n\ntwo"} language="ts" />)
    clipboard().mockRejectedValue(new Error("denied"))
    Object.defineProperty(document, "execCommand", { configurable: true, value: vi.fn().mockReturnValue(false) })
    const b = getByRole("button", { name: "Copy code" })
    b.focus()
    await user.keyboard("{Enter}")
    await waitFor(() => expect(b).toHaveTextContent("press Ctrl+C"))
    expect(b).toHaveFocus()
    const sel = window.getSelection()!
    expect(sel.rangeCount).toBe(1)
    expect(sel.getRangeAt(0).commonAncestorContainer).toBe(container.querySelector('[data-slot="code-block-code"]'))
    expect(sel.toString().replace(/\n+/g, "|")).toBe("one|two")
  })

  it("is a keyboard button and a user onClick can cancel it", async () => {
    const { getByRole, user } = renderUI(
      <CodeBlock code="q" language="ts">
        <CodeBlockHeader>
          <CodeBlockActions>
            <CodeBlockCopy onClick={(e) => e.preventDefault()} />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent />
      </CodeBlock>,
    )
    const write = clipboard()
    await user.tab()
    expect(getByRole("button", { name: "Copy code" })).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(write).not.toHaveBeenCalled()
  })
})

describe("CodeBlock ink", () => {
  it("the header is a host with a dashed rule, the body a host that only draws a focus ring", () => {
    const { container } = render(<CodeBlock code={CODE} seed="ink" />)
    const h = container.querySelector('[data-slot="code-block-header"]') as HTMLElement
    expect(h).toHaveAttribute("data-ink-host")
    expect(h.querySelector('svg[data-ink="rule"] > g[data-layer="rest"]')).not.toBeNull()
    const b = container.querySelector('[data-slot="code-block-body"]') as HTMLElement
    expect(b).toHaveAttribute("data-ink-host")
    expect(b).toHaveAttribute("data-ink-focus", "within")
    expect(b.querySelector("svg[data-ink] [data-layer='rest']")).toBeNull()
  })

  it("the rule and the ring recipes", () => {
    const req = { seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
    for (const w of [80, 400, 900]) {
      const r = runRecipe(codeRuleRecipe, { ...req, params: {}, box: { w, h: 44 } })
      expect(r.layers).toEqual(["rest"])
      expect(nodes(r.parts.rest ?? "")).toBeLessThanOrEqual(12)
      expect(r.parts.rest ?? "").not.toMatch(/NaN|undefined|#[0-9a-f]{3,8}\b/i)
    }
    const calm = runRecipe(codeRuleRecipe, { ...req, params: {}, box: { w: 400, h: 44 }, density: "calm" })
    const comfy = runRecipe(codeRuleRecipe, { ...req, params: {}, box: { w: 400, h: 44 } })
    expect((calm.parts.rest ?? "").length).toBeLessThan((comfy.parts.rest ?? "").length)
    const ring = runRecipe(codeBodyRecipe, { ...req, params: {}, box: { w: 400, h: 200 }, lazy: ["focus"] })
    expect(ring.layers).toEqual(["focus"])
    expect(runRecipe(codeBodyRecipe, { ...req, params: {}, box: { w: 400, h: 200 } }).layers).toEqual([])
  })

  it("keyboard focus on the scrolling body draws the ring", async () => {
    const { container, user } = renderUI(<CodeBlock code={CODE} copyable={false} seed="f" />)
    await user.tab()
    expect(container.querySelector("pre")).toHaveFocus()
  })
})

describe("CodeBlock on the server", () => {
  it("is deterministic (useId seeds) and hydrates without a warning", async () => {
    restore()
    const tree = () => <CodeBlock diff code={PATCH} language="ts" filename="f.ts" lineNumbers />
    const html = renderToString(tree())
    expect(html).toContain("f.ts")
    expect(html).toContain("<pre")
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

  it("has no axe violations (plain, numbered, diff)", async () => {
    const { container } = render(
      <div>
        <CodeBlock code={CODE} filename="a.ts" lineNumbers />
        <CodeBlock diff code={PATCH} language="ts" filename="b.ts" lineNumbers />
        <CodeBlock code="echo hi" language="bash" wrap />
      </div>,
    )
    await axeCheck(container)
  })
})

describe("CodeBlockStats", () => {
  it("renders nothing for plain code", () => {
    const { container } = render(
      <CodeBlock code="x" language="ts">
        <CodeBlockStats />
      </CodeBlock>,
    )
    expect(container.querySelector('[data-slot="code-block-stats"]')).toBeNull()
  })
})

describe("review: what a dragged selection carries", () => {
  const selectable = (root: Element) => {
    const c = root.cloneNode(true) as Element
    c.querySelectorAll(".select-none").forEach((n) => n.remove())
    return c.textContent
  }

  it("the visually hidden Added / Removed markers do not travel with a copied selection", () => {
    const { container } = render(<CodeBlock diff code={PATCH} language="ts" seed="sel" />)
    const markers = Array.from(container.querySelectorAll('[data-slot="code-line"] .sr-only'))
    expect(markers.length).toBe(6)
    for (const m of markers) expect(m).toHaveClass("select-none")
    expect(selectable(container.querySelector("code")!)).toBe(
      ["const shown = notes;", "const shown = picked.size", "  ? notes", "  : [];", "export const count = 1;", 'export const label = "all";', 'export const label = "some";'].join("\n"),
    )
  })

  it("blank lines survive: the code text is the source, newline for newline", () => {
    const src = "a\n\n\nb\n  c"
    const { container } = render(<CodeBlock code={src} language="js" />)
    expect(selectable(container.querySelector("code")!)).toBe(src)
    const bash = render(<CodeBlock code={"$ npm i\n\n# done\n"} language="bash" />)
    expect(selectable(bash.container.querySelector("code")!)).toBe("$ npm i\n\n# done")
  })

  it("line numbers are generated content, so nothing of them is in the text", () => {
    const { container } = render(<CodeBlock code={"x\ny"} lineNumbers />)
    expect(container.querySelector("code")!.textContent).toBe("x\ny")
  })

  it("the figure has a name: the file, or the language", () => {
    expect(render(<CodeBlock code="x" filename="src/a.ts" />).getByRole("figure", { name: "src/a.ts" })).toBeInTheDocument()
    expect(render(<CodeBlock code="x" language="bash" />).getByRole("figure", { name: "bash code" })).toBeInTheDocument()
    expect(render(<CodeBlock code="x" aria-label="Install steps" />).getByRole("figure", { name: "Install steps" })).toBeInTheDocument()
  })
})
