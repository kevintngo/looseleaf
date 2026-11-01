import * as React from "react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { act } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render } from "@testing-library/react"

import {
  PromptInput,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHint,
  PromptInputSubmit,
  PromptInputSuggestion,
  PromptInputSuggestions,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInput,
} from "@/components/ui/prompt-input"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { promptInputBodyRecipe } from "@/lib/ink/recipes/prompt-input-ink"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(600, 48)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length

function Composer(props: Omit<React.ComponentProps<typeof PromptInput>, "children"> & { children?: React.ReactNode }) {
  const { children, ...rest } = props
  return (
    <PromptInput {...rest}>
      <PromptInputBody>
        <PromptInputTextarea aria-label="Message" />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputButton size="icon-sm" aria-label="Attach">
            +
          </PromptInputButton>
        </PromptInputTools>
        <PromptInputSubmit />
      </PromptInputFooter>
      {children}
    </PromptInput>
  )
}

const box = (r: ReturnType<typeof render>) => r.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement

describe("PromptInput structure", () => {
  it("is a form on a napkin with the textarea, the tools and the send button", () => {
    const r = render(<Composer seed="a" />)
    const f = r.container.querySelector('[data-slot="prompt-input"]') as HTMLElement
    expect(f.tagName).toBe("FORM")
    expect(f).toHaveAttribute("data-stock", "napkin")
    expect(f).toHaveAttribute("data-status", "ready")
    expect(f).not.toHaveAttribute("aria-busy")
    for (const slot of ["prompt-input-body", "prompt-input-textarea", "prompt-input-footer", "prompt-input-tools", "prompt-input-button", "prompt-input-submit"]) {
      expect(f.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
    const t = box(r)
    expect(t).toHaveAttribute("name", "message")
    expect(t).toHaveAttribute("placeholder", "what are we making?")
    expect(t).toHaveAttribute("rows", "1")
    expect(t).toHaveClass("font-script", "text-ink-you", "resize-none", "field-sizing-content")
  })

  it("the body owns the writing line and lights it on focus within", () => {
    const r = render(<Composer />)
    const b = r.container.querySelector('[data-slot="prompt-input-body"]') as HTMLElement
    expect(b).toHaveAttribute("data-ink-host")
    expect(b).toHaveAttribute("data-ink-focus", "within")
    expect(b.querySelector('svg[data-ink="field"] > g[data-layer="rest"]')).not.toBeNull()
  })

  it("attachments and hint are plain slots; attachments hide while empty", () => {
    const r = render(
      <Composer>
        <PromptInputAttachments data-testid="a" />
        <PromptInputHint>small print</PromptInputHint>
      </Composer>,
    )
    expect(r.getByTestId("a")).toHaveClass("flex", "flex-wrap", "empty:hidden")
    expect(r.getByText("small print")).toHaveAttribute("data-slot", "prompt-input-hint")
  })

  it("usePromptInput outside a composer says so", () => {
    function Bad() {
      usePromptInput()
      return null
    }
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<Bad />)).toThrow(/inside <PromptInput>/)
    err.mockRestore()
  })
})

describe("sending", () => {
  it("Enter sends the text and clears the box; the focus stays in it", async () => {
    const onSubmit = vi.fn()
    const r = render(<Composer onSubmit={onSubmit} />)
    const { user } = { user: (await import("@testing-library/user-event")).default.setup() }
    await user.type(box(r), "Hello there")
    await user.keyboard("{Enter}")
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toBe("Hello there")
    expect(box(r)).toHaveValue("")
    expect(box(r)).toHaveFocus()
  })

  it("Shift+Enter breaks the line and sends nothing", async () => {
    const onSubmit = vi.fn()
    const { user, getByRole } = renderUI(<Composer onSubmit={onSubmit} />)
    const t = getByRole("textbox") as HTMLTextAreaElement
    await user.type(t, "one{Shift>}{Enter}{/Shift}two")
    expect(t.value).toBe("one\ntwo")
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("an empty or whitespace message is not sent; the button is pencilled in until there is text", async () => {
    const onSubmit = vi.fn()
    const { user, getByRole } = renderUI(<Composer onSubmit={onSubmit} />)
    const send = getByRole("button", { name: "Send message" })
    expect(send).toBeDisabled()
    await user.click(getByRole("textbox"))
    await user.keyboard("{Enter}")
    await user.type(getByRole("textbox"), "   {Enter}")
    expect(onSubmit).not.toHaveBeenCalled()
    await user.type(getByRole("textbox"), "hi")
    expect(send).toBeEnabled()
  })

  it("the send button sends, and allowEmpty lets an attachment-only message go", async () => {
    const onSubmit = vi.fn()
    const { user, getByRole, rerender } = renderUI(<Composer onSubmit={onSubmit} />)
    await user.type(getByRole("textbox"), "yo")
    await user.click(getByRole("button", { name: "Send message" }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    rerender(<Composer onSubmit={onSubmit} allowEmpty />)
    expect(getByRole("button", { name: "Send message" })).toBeEnabled()
    await user.click(getByRole("button", { name: "Send message" }))
    expect(onSubmit).toHaveBeenCalledTimes(2)
    expect(onSubmit.mock.calls[1][0]).toBe("")
  })

  it("hands over the form event and a real FormData with the message", async () => {
    let fd: FormData | undefined
    const { user, getByRole } = renderUI(<Composer onSubmit={(_v, e) => (fd = new FormData(e.currentTarget))} />)
    await user.type(getByRole("textbox"), "in the form")
    await user.keyboard("{Enter}")
    expect(fd?.get("message")).toBe("in the form")
  })

  it("submitOn=mod-enter: Enter is a new line, Ctrl+Enter sends", async () => {
    const onSubmit = vi.fn()
    const { user, getByRole } = renderUI(<Composer onSubmit={onSubmit} submitOn="mod-enter" />)
    const t = getByRole("textbox") as HTMLTextAreaElement
    await user.type(t, "a{Enter}b")
    expect(t.value).toBe("a\nb")
    expect(onSubmit).not.toHaveBeenCalled()
    await user.keyboard("{Control>}{Enter}{/Control}")
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it("the paper plane flies on every send: the icon is remounted with data-flying", async () => {
    const { user, getByRole } = renderUI(<Composer />)
    const send = getByRole("button", { name: "Send message" })
    const plane = () => send.querySelector("span.inline-flex") as HTMLElement
    const before = plane()
    expect(before).not.toHaveAttribute("data-flying")
    await user.type(getByRole("textbox"), "x{Enter}")
    const after = plane()
    expect(after).not.toBe(before)
    expect(after).toHaveAttribute("data-flying")
    expect(after.className).toContain("data-flying:animate-[ll-plane_0.9s_ease-in-out_both]")
    await user.type(getByRole("textbox"), "y{Enter}")
    expect(plane()).not.toBe(after)
    expect(document.querySelectorAll("style")).not.toHaveLength(0)
    expect(Array.from(document.querySelectorAll("style")).some((s) => s.textContent?.includes("@keyframes ll-plane"))).toBe(true)
  })
})

describe("controlled and uncontrolled", () => {
  it("controlled: shows the value, reports changes, is cleared by its owner", async () => {
    function Controlled({ onSend }: { onSend: (v: string) => void }) {
      const [v, setV] = React.useState("start")
      return (
        <Composer
          value={v}
          onValueChange={setV}
          onSubmit={(text) => {
            onSend(text)
            setV("")
          }}
        />
      )
    }
    const onSend = vi.fn()
    const { user, getByRole } = renderUI(<Controlled onSend={onSend} />)
    const t = getByRole("textbox") as HTMLTextAreaElement
    expect(t.value).toBe("start")
    await user.type(t, "!")
    expect(t.value).toBe("start!")
    await user.keyboard("{Enter}")
    expect(onSend).toHaveBeenCalledWith("start!")
    expect(t.value).toBe("")
  })

  it("a controlled composer does not clear itself", async () => {
    const { user, getByRole } = renderUI(<Composer value="stay" onValueChange={() => {}} onSubmit={() => {}} />)
    await user.click(getByRole("textbox"))
    await user.keyboard("{Enter}")
    expect((getByRole("textbox") as HTMLTextAreaElement).value).toBe("stay")
  })

  it("uncontrolled with defaultValue; clearOnSubmit={false} keeps the text", async () => {
    const { user, getByRole } = renderUI(<Composer defaultValue="draft" clearOnSubmit={false} onSubmit={() => {}} />)
    expect((getByRole("textbox") as HTMLTextAreaElement).value).toBe("draft")
    await user.click(getByRole("textbox"))
    await user.keyboard("{Enter}")
    expect((getByRole("textbox") as HTMLTextAreaElement).value).toBe("draft")
  })

  it("onValueChange reports every edit", async () => {
    const onValueChange = vi.fn()
    const { user, getByRole } = renderUI(<Composer onValueChange={onValueChange} />)
    await user.type(getByRole("textbox"), "ab")
    expect(onValueChange).toHaveBeenLastCalledWith("ab")
  })
})

describe("IME", () => {
  it("Enter during a composition commits the word and never sends", async () => {
    const onSubmit = vi.fn()
    const r = render(<Composer onSubmit={onSubmit} defaultValue="nihon" />)
    const t = box(r)
    fireEvent.compositionStart(t)
    fireEvent.keyDown(t, { key: "Enter", isComposing: true })
    expect(onSubmit).not.toHaveBeenCalled()
    fireEvent.compositionEnd(t)
    fireEvent.keyDown(t, { key: "Enter", keyCode: 229 })
    expect(onSubmit).not.toHaveBeenCalled()
    fireEvent.keyDown(t, { key: "Enter" })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})

describe("busy and disabled", () => {
  it("while streaming the button is a stop button, sending waits and typing goes on", async () => {
    const onSubmit = vi.fn()
    const onStop = vi.fn()
    const { user, getByRole } = renderUI(<Composer status="streaming" onSubmit={onSubmit} onStop={onStop} defaultValue="next" />)
    const stop = getByRole("button", { name: "Stop generating" })
    expect(stop).toHaveAttribute("type", "button")
    expect(stop).toBeEnabled()
    expect(stop).toHaveAttribute("data-status", "streaming")
    expect(stop.closest("form")).not.toHaveAttribute("aria-busy")
    expect(stop.closest("form")).toHaveAttribute("data-status", "streaming")
    await user.type(getByRole("textbox"), "!")
    expect((getByRole("textbox") as HTMLTextAreaElement).value).toBe("next!")
    await user.keyboard("{Enter}")
    expect(onSubmit).not.toHaveBeenCalled()
    await user.click(stop)
    expect(onStop).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("submitted counts as busy; lockWhileStreaming makes the text read-only", () => {
    const r = render(<Composer status="submitted" lockWhileStreaming />)
    expect(box(r)).toHaveAttribute("readonly")
    expect(r.getByRole("button", { name: "Stop generating" })).toBeInTheDocument()
    r.unmount()
    const free = render(<Composer status="streaming" />)
    expect(free.getByRole("textbox", { name: "Message" })).not.toHaveAttribute("readonly")
  })

  it("error is not busy: sending works again", () => {
    const r = render(<Composer status="error" defaultValue="retry" />)
    expect(r.getByRole("button", { name: "Send message" })).toBeEnabled()
  })

  it("disabled: nothing can be typed or sent, and the line is dashed", async () => {
    const onSubmit = vi.fn()
    const r = render(<Composer disabled defaultValue="x" onSubmit={onSubmit} />)
    expect(box(r)).toBeDisabled()
    expect(r.getByRole("button", { name: "Send message" })).toBeDisabled()
    expect(r.container.querySelector('[data-slot="prompt-input"]')).toHaveAttribute("data-disabled")
    r.container.querySelector("form")!.requestSubmit()
    expect(onSubmit).not.toHaveBeenCalled()
    const layers = Array.from(r.container.querySelectorAll('[data-slot="prompt-input-body"] svg > g[data-layer]')).map((g) => g.getAttribute("data-layer"))
    expect(layers).toEqual(["disabled"])
  })
})

describe("triggers and suggestions", () => {
  function Lists({ onPick }: { onPick?: (s: string) => void }) {
    const { trigger, replaceTrigger } = usePromptInput()
    const q = (trigger?.query ?? "").toLowerCase()
    const cmds = trigger?.char === "/" ? ["summarize", "sum", "draw"].filter((c) => c.startsWith(q)) : []
    const people = trigger?.char === "@" ? ["Ada", "Lin", "Adam"].filter((p) => p.toLowerCase().startsWith(q)) : []
    return (
      <>
        <PromptInputSuggestions trigger="/" aria-label="Commands" open={cmds.length > 0}>
          {cmds.map((c) => (
            <PromptInputSuggestion key={c} onSelect={() => (onPick?.(`/${c}`), replaceTrigger(`/${c}`))}>
              {c}
            </PromptInputSuggestion>
          ))}
        </PromptInputSuggestions>
        <PromptInputSuggestions trigger="@" aria-label="People" open={people.length > 0}>
          {people.map((p) => (
            <PromptInputSuggestion key={p} onSelect={() => (onPick?.(`@${p}`), replaceTrigger(`@${p}`))}>
              {p}
            </PromptInputSuggestion>
          ))}
        </PromptInputSuggestions>
      </>
    )
  }
  const withLists = (extra?: Partial<React.ComponentProps<typeof PromptInput>>, onPick?: (s: string) => void) => (
    <Composer triggers={[{ char: "/", atStart: true }, "@"]} {...extra}>
      <Lists onPick={onPick} />
    </Composer>
  )

  it("typing @a opens the people list; nothing is open before", async () => {
    const { user, getByRole, queryByRole } = renderUI(withLists())
    expect(queryByRole("listbox")).toBeNull()
    await user.type(getByRole("textbox"), "Hi @a")
    const list = getByRole("listbox", { name: "People" })
    expect(list).toHaveAttribute("data-slot", "prompt-input-suggestions")
    expect(Array.from(list.querySelectorAll('[role="option"]')).map((o) => o.textContent)).toEqual(["Ada", "Adam"])
  })

  it("the textarea points at the active option; arrows move, Enter picks, and the text and caret follow", async () => {
    const onPick = vi.fn()
    const { user, getByRole } = renderUI(withLists(undefined, onPick))
    const t = getByRole("textbox") as HTMLTextAreaElement
    await user.type(t, "Hi @a")
    const opts = () => Array.from(getByRole("listbox").querySelectorAll('[role="option"]'))
    expect(opts()[0]).toHaveAttribute("aria-selected", "true")
    expect(t).toHaveAttribute("aria-activedescendant", opts()[0].id)
    expect(t).toHaveAttribute("aria-controls", getByRole("listbox").id)
    expect(t).toHaveAttribute("aria-autocomplete", "list")
    await user.keyboard("{ArrowDown}")
    expect(opts()[1]).toHaveAttribute("aria-selected", "true")
    expect(t).toHaveAttribute("aria-activedescendant", opts()[1].id)
    await user.keyboard("{ArrowDown}")
    expect(opts()[0]).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{ArrowUp}")
    expect(opts()[1]).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{Enter}")
    expect(onPick).toHaveBeenCalledWith("@Adam")
    expect(t.value).toBe("Hi @Adam ")
    expect(t.selectionStart).toBe("Hi @Adam ".length)
    expect(t).toHaveFocus()
    expect(document.querySelector('[role="listbox"]')).toBeNull()
  })

  it("Enter with the list open picks; it does not send", async () => {
    const onSubmit = vi.fn()
    const { user, getByRole } = renderUI(withLists({ onSubmit }))
    await user.type(getByRole("textbox"), "@l")
    await user.keyboard("{Enter}")
    expect(onSubmit).not.toHaveBeenCalled()
    expect((getByRole("textbox") as HTMLTextAreaElement).value).toBe("@Lin ")
  })

  it("Tab picks too, and a click on an option picks without taking the focus away", async () => {
    const { user, getByRole, getByText } = renderUI(withLists())
    const t = getByRole("textbox") as HTMLTextAreaElement
    await user.type(t, "@ad")
    await user.keyboard("{Tab}")
    expect(t.value).toBe("@Ada ")
    await user.type(t, "and @li")
    await user.click(getByText("Lin"))
    expect(t.value).toBe("@Ada and @Lin ")
    expect(t).toHaveFocus()
  })

  it("Escape closes the list for that word only", async () => {
    const { user, getByRole, queryByRole } = renderUI(withLists())
    const t = getByRole("textbox")
    await user.type(t, "@a")
    expect(getByRole("listbox")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(queryByRole("listbox")).toBeNull()
    await user.type(t, "d")
    expect(queryByRole("listbox")).toBeNull()
    await user.type(t, " @l")
    expect(getByRole("listbox", { name: "People" })).toBeInTheDocument()
  })

  it("a slash opens commands only at the start of the message", async () => {
    const { user, getByRole, queryByRole } = renderUI(withLists())
    const t = getByRole("textbox")
    await user.type(t, "try /su")
    expect(queryByRole("listbox")).toBeNull()
    await user.clear(t)
    await user.type(t, "/su")
    expect(getByRole("listbox", { name: "Commands" })).toBeInTheDocument()
  })

  it("onTriggerChange hears the word start, change and stop", async () => {
    const seen: Array<string | null> = []
    const { user, getByRole } = renderUI(withLists({ onTriggerChange: (t) => seen.push(t ? `${t.char}${t.query}` : null) }))
    await user.type(getByRole("textbox"), "a @b c")
    expect(seen.filter((x, i) => x !== seen[i - 1])).toEqual([null, "@", "@b", null].slice(1))
  })

  it("options that are disabled are skipped by the arrows", async () => {
    const { user, getByRole } = renderUI(
      <Composer triggers={["@"]}>
        <PromptInputSuggestions>
          <PromptInputSuggestion>one</PromptInputSuggestion>
          <PromptInputSuggestion disabled>two</PromptInputSuggestion>
          <PromptInputSuggestion>three</PromptInputSuggestion>
        </PromptInputSuggestions>
      </Composer>,
    )
    await user.type(getByRole("textbox"), "@")
    await user.keyboard("{ArrowDown}")
    const opts = Array.from(getByRole("listbox").querySelectorAll('[role="option"]'))
    expect(opts[2]).toHaveAttribute("aria-selected", "true")
    expect(opts[1]).toHaveAttribute("aria-disabled", "true")
  })
})

describe("auto-grow fallback", () => {
  it("without field-sizing the box is sized from its scrollHeight", () => {
    const supports = vi.spyOn(CSS, "supports").mockReturnValue(false)
    const desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight")
    Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", { configurable: true, get: () => 96 })
    const r = render(<Composer defaultValue={"a\nb\nc"} />)
    expect(box(r).style.height).toBe("96px")
    supports.mockRestore()
    delete (HTMLTextAreaElement.prototype as unknown as Record<string, unknown>).scrollHeight
    if (desc) Object.defineProperty(HTMLElement.prototype, "scrollHeight", desc)
  })

  it("maxRows caps the height with a max-height", () => {
    const r = render(
      <PromptInput>
        <PromptInputTextarea aria-label="Message" maxRows={4} />
      </PromptInput>,
    )
    expect(box(r).style.maxHeight).toBe("calc(9rem)")
  })
})

describe("promptInputBodyRecipe", () => {
  const req = { seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }

  it("rest and a lazy blue focus; disabled is a static alternative", () => {
    const f = runRecipe(promptInputBodyRecipe, { ...req, params: {}, box: { w: 560, h: 52 }, lazy: ["focus"] })
    expect(f.layers).toEqual(["rest", "focus"])
    expect(f.parts.focus).toContain("var(--ll-ink-you)")
    const d = runRecipe(promptInputBodyRecipe, { ...req, params: { disabled: true }, box: { w: 560, h: 52 } })
    expect(d.layers).toEqual(["disabled"])
  })

  it("cheap at any width, sane in every density and direction", () => {
    for (const w of [40, 300, 900]) {
      for (const density of ["comfortable", "calm"] as const) {
        for (const dir of ["ltr", "rtl"] as const) {
          const f = runRecipe(promptInputBodyRecipe, { ...req, params: {}, box: { w, h: 52 }, density, dir, lazy: ["focus"] })
          expect(nodes(f.parts.rest ?? "")).toBeLessThanOrEqual(6)
          expect(Object.values(f.parts).join("")).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
        }
      }
    }
  })
})

describe("PromptInput on the server", () => {
  it("is deterministic and hydrates without a warning", async () => {
    restore()
    const tree = () => (
      <Composer seed="ssr" defaultValue="hello" triggers={["@"]}>
        <PromptInputSuggestions open={false} />
      </Composer>
    )
    const html = renderToString(tree())
    expect(html).toContain("<form")
    expect(html).toContain("hello")
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

  it("has no axe violations: ready, streaming, disabled, with a list open", async () => {
    const r = render(
      <div>
        <Composer defaultValue="x" />
        <Composer status="streaming" />
        <Composer disabled />
      </div>,
    )
    await axeCheck(r.container)
    r.unmount()
    const { user, getByRole, container } = renderUI(
      <Composer triggers={["@"]}>
        <PromptInputSuggestions aria-label="People">
          <PromptInputSuggestion>Ada</PromptInputSuggestion>
          <PromptInputSuggestion>Lin</PromptInputSuggestion>
        </PromptInputSuggestions>
      </Composer>,
    )
    await user.type(getByRole("textbox"), "@")
    await axeCheck(container)
  })
})

describe("review: naming, composition and focus", () => {
  it("the textarea is named even when nobody labels it, and a label of yours wins", () => {
    const bare = render(
      <PromptInput>
        <PromptInputBody>
          <PromptInputTextarea />
        </PromptInputBody>
      </PromptInput>,
    )
    expect(bare.getByRole("textbox", { name: "Message" })).toBeInTheDocument()
    bare.unmount()
    const own = render(
      <PromptInput>
        <label htmlFor="ask">Ask Stubby</label>
        <PromptInputBody>
          <PromptInputTextarea id="ask" />
        </PromptInputBody>
      </PromptInput>,
    )
    expect(own.getByRole("textbox", { name: "Ask Stubby" })).toBeInTheDocument()
    own.unmount()
    const named = render(
      <PromptInput>
        <PromptInputBody>
          <PromptInputTextarea aria-label="Reply to Ada" />
        </PromptInputBody>
      </PromptInput>,
    )
    expect(named.getByRole("textbox", { name: "Reply to Ada" })).toBeInTheDocument()
  })

  it("a composition that never ended (the field lost focus) does not leave Enter dead", () => {
    const onSubmit = vi.fn()
    const r = render(<Composer onSubmit={onSubmit} defaultValue="hello" />)
    const t = box(r)
    fireEvent.compositionStart(t)
    fireEvent.blur(t)
    fireEvent.keyDown(t, { key: "Enter" })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it("Chrome's order: the committing Enter arrives with isComposing and keyCode 229 before compositionend, and sends nothing; Shift+Enter in a composition neither", () => {
    const onSubmit = vi.fn()
    const r = render(<Composer onSubmit={onSubmit} defaultValue="konnichiwa" />)
    const t = box(r)
    fireEvent.compositionStart(t)
    fireEvent.keyDown(t, { key: "Enter", keyCode: 229, isComposing: true })
    fireEvent.compositionEnd(t)
    expect(onSubmit).not.toHaveBeenCalled()
    expect((t as HTMLTextAreaElement).value).toBe("konnichiwa")
  })

  it("a held Enter sends once (a controlled composer that has not cleared yet would send the same text again)", () => {
    const onSubmit = vi.fn()
    const r = render(<Composer onSubmit={onSubmit} value="hello" onValueChange={() => {}} />)
    const t = box(r)
    fireEvent.keyDown(t, { key: "Enter" })
    fireEvent.keyDown(t, { key: "Enter", repeat: true })
    fireEvent.keyDown(t, { key: "Enter", repeat: true })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it("Enter with a modifier that means something else (Alt) is not a send; the default action is left to the browser", () => {
    const onSubmit = vi.fn()
    const r = render(<Composer onSubmit={onSubmit} defaultValue="hello" />)
    const t = box(r)
    expect(fireEvent.keyDown(t, { key: "Enter", altKey: true })).toBe(true)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("when the reply ends while the keyboard is on Stop, the focus goes back to the writing line instead of falling to the page", () => {
    const r = render(<Composer status="streaming" defaultValue="" />)
    const stop = r.getByRole("button", { name: "Stop generating" })
    stop.focus()
    expect(stop).toHaveFocus()
    r.rerender(<Composer status="ready" defaultValue="" />)
    expect(box(r)).toHaveFocus()
  })

  it("the focus stays where it is when it was not on Stop", () => {
    const r = render(<Composer status="streaming" />)
    r.getByRole("button", { name: "Attach" }).focus()
    r.rerender(<Composer status="ready" />)
    expect(r.getByRole("button", { name: "Attach" })).toHaveFocus()
  })
})
