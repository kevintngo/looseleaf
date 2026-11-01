import * as React from "react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { act } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "@testing-library/react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentProgress,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { Icon } from "@/components/ui/icon"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { attachmentMediaRecipe, attachmentProgressRecipe, attachmentRecipe, attachmentStateList } from "@/lib/ink/recipes/attachment-ink"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(200, 56)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length
const layerNames = (root: ParentNode) => Array.from(root.querySelectorAll("svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

function Chip({ children, ...props }: React.ComponentProps<typeof Attachment>) {
  return (
    <Attachment {...props}>
      <AttachmentMedia>
        <Icon name="file-text" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>field-notes.pdf</AttachmentTitle>
        <AttachmentDescription>2.4 MB</AttachmentDescription>
      </AttachmentContent>
      {children}
    </Attachment>
  )
}

const ownLayers = (a: Element) => Array.from(a.querySelectorAll(':scope > svg[data-ink="attachment"] > g[data-layer]')).map((g) => g.getAttribute("data-layer"))

describe("Attachment parts", () => {
  it("keeps upstream's parts and slots and their data attributes", () => {
    const { container } = render(
      <AttachmentGroup>
        <Attachment size="sm" orientation="vertical" state="uploading">
          <AttachmentMedia variant="image">
            <img alt="" src="x.png" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>a.png</AttachmentTitle>
            <AttachmentDescription>1 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentTrigger aria-label="Open a.png" />
          <AttachmentActions>
            <AttachmentAction aria-label="Remove a.png">x</AttachmentAction>
          </AttachmentActions>
        </Attachment>
      </AttachmentGroup>,
    )
    for (const slot of ["attachment-group", "attachment", "attachment-media", "attachment-content", "attachment-title", "attachment-description", "attachment-actions", "attachment-action", "attachment-trigger"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
    const a = container.querySelector('[data-slot="attachment"]') as HTMLElement
    expect(a).toHaveAttribute("data-state", "uploading")
    expect(a).toHaveAttribute("data-size", "sm")
    expect(a).toHaveAttribute("data-orientation", "vertical")
    expect(container.querySelector('[data-slot="attachment-media"]')).toHaveAttribute("data-variant", "image")
    expect(a).toHaveClass("group/attachment", "relative", "flex", "max-w-full", "min-w-0", "shrink-0", "flex-wrap", "w-28", "flex-col")
  })

  it("defaults: done, default size, horizontal", () => {
    const { container } = render(<Chip />)
    const a = container.querySelector('[data-slot="attachment"]') as HTMLElement
    expect(a).toHaveAttribute("data-state", "done")
    expect(a).toHaveAttribute("data-size", "default")
    expect(a).toHaveAttribute("data-orientation", "horizontal")
    expect(a).toHaveClass("w-fit", "min-w-40", "items-center")
  })

  it("the group scrolls sideways and snaps", () => {
    const { container } = render(<AttachmentGroup />)
    expect(container.firstElementChild).toHaveClass("flex", "snap-x", "snap-mandatory", "overflow-x-auto", "gap-3")
  })

  it("title and description truncate with room for the hand font's overhang", () => {
    const { getByText } = render(<Chip />)
    expect(getByText("field-notes.pdf")).toHaveClass("truncate", "ll-ink-room", "font-bold")
    expect(getByText("2.4 MB")).toHaveClass("truncate", "ll-ink-room", "text-muted-foreground")
  })

  it("a Doodle or Sticker in the media keeps the size it was given (only bare glyphs are held to 16 / 24 px)", () => {
    const { container } = render(<Chip />)
    const media = container.querySelector('[data-slot="attachment-media"]') as HTMLElement
    expect(media.className).toContain("[&_svg:not(.absolute):not([data-ink=doodle]):not([data-ink=sticker]):not([class*='size-'])]:size-4")
    expect(media.className).not.toContain("[&_svg:not(.absolute):not([class*='size-'])]")
  })

  it("the hover wash only exists when there is something to press", () => {
    const { container } = render(<Chip />)
    const a = container.querySelector('[data-slot="attachment"]') as HTMLElement
    expect(a.className).toContain("not-has-[[data-slot=attachment-trigger]]:[&>svg_[data-layer=hover]]:hidden")
  })
})

describe("Attachment ink", () => {
  it("a finished chip: a slip sheet behind, a traced outline, a paper clip", () => {
    const { container } = render(<Chip />)
    const a = container.querySelector('[data-slot="attachment"]') as HTMLElement
    expect(a).toHaveAttribute("data-ink-host")
    expect(a).toHaveAttribute("data-ink-focus", "within")
    expect(a.querySelector('[data-slot="attachment-sheet"] [data-slot="paper"]')).toHaveAttribute("data-stock", "slip")
    expect(a.querySelector('[data-slot="fastener"]')).toHaveAttribute("data-kind", "clip")
    expect(a.querySelector('svg[data-ink="attachment"]')).not.toBeNull()
    expect(ownLayers(a)).toEqual(["rest", "hover"])
    expect(a.querySelector('[data-slot="attachment-sheet"]')).toHaveAttribute("aria-hidden", "true")
  })

  it("idle is an empty slot: dashes on bare page, no sheet, no clip", () => {
    const { container } = render(<Chip state="idle" />)
    const a = container.querySelector('[data-slot="attachment"]') as HTMLElement
    expect(a.querySelector('[data-slot="attachment-sheet"]')).toBeNull()
    expect(a.querySelector('[data-slot="fastener"]')).toBeNull()
    expect(a.querySelector('svg[data-ink="attachment"]')).not.toBeNull()
  })

  it("error is red pencil, uploading and processing carry no clip", () => {
    expect(render(<Chip state="error" />).container.querySelector('svg[data-ink="attachment"]')!.innerHTML).toContain("var(--ll-red)")
    for (const state of ["uploading", "processing"] as const) {
      const { container } = render(<Chip state={state} />)
      expect(container.querySelector('[data-slot="fastener"]')).toBeNull()
      expect(container.querySelector('[data-slot="attachment-sheet"]')).not.toBeNull()
    }
  })

  it("a vertical print is a photo stock under a strip of tape", () => {
    const { container } = render(<Chip orientation="vertical" />)
    expect(container.querySelector('[data-slot="attachment-sheet"] [data-slot="paper"]')).toHaveAttribute("data-stock", "photo")
    expect(container.querySelector('[data-slot="tape"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="fastener"]')).toBeNull()
  })

  it("the title pulses while the file is in transit", () => {
    const { getByText } = render(<Chip state="uploading" />)
    expect(getByText("field-notes.pdf").className).toContain("group-data-[state=uploading]/attachment:animate-pulse")
  })

  it("media is its own small drawing, red in the error state", () => {
    const { container } = render(<Chip state="error" />)
    const m = container.querySelector('[data-slot="attachment-media"]') as HTMLElement
    expect(m).toHaveAttribute("data-ink-host")
    expect(m.querySelector('svg[data-ink="media"]')!.innerHTML).toContain("var(--ll-red)")
    expect(m.className).toContain("group-data-[state=error]/attachment:text-red")
  })

  it("the same seed draws the same chip", () => {
    const html = (seed: string) => {
      const { container, unmount } = render(<Chip seed={seed} />)
      const s = container.querySelector('svg[data-ink="attachment"]')!.innerHTML
      unmount()
      return s
    }
    expect(html("a")).toBe(html("a"))
    expect(html("a")).not.toBe(html("b"))
  })

  it("calm density hides the props", () => {
    const { container } = render(<Chip />)
    expect(container.querySelector('[data-slot="fastener"]')!.getAttribute("class")).toContain("calm:hidden")
  })
})

describe("AttachmentProgress", () => {
  it("is a progressbar with its value, and sets the CSS variable the fill is clipped by", () => {
    const { getByRole } = render(<AttachmentProgress value={42} aria-label="Upload" />)
    const p = getByRole("progressbar", { name: "Upload" })
    expect(p).toHaveAttribute("aria-valuenow", "42")
    expect(p).toHaveAttribute("aria-valuemin", "0")
    expect(p).toHaveAttribute("aria-valuemax", "100")
    expect(p).toHaveAttribute("data-state", "loading")
    expect(p.style.getPropertyValue("--ll-progress")).toBe("42%")
    expect(p.querySelector('svg[data-ink="progress"] [data-part="bar"]')).not.toBeNull()
  })

  it("clamps, honours max, and completes", () => {
    const over = render(<AttachmentProgress value={140} aria-label="x" />).getByLabelText("x")
    expect(over.style.getPropertyValue("--ll-progress")).toBe("100%")
    expect(over).toHaveAttribute("data-state", "complete")
    const under = render(<AttachmentProgress value={-5} aria-label="y" />).getByLabelText("y")
    expect(under.style.getPropertyValue("--ll-progress")).toBe("0%")
    const max = render(<AttachmentProgress value={5} max={20} aria-label="z" />).getByLabelText("z")
    expect(max.style.getPropertyValue("--ll-progress")).toBe("25%")
    expect(max).toHaveAttribute("aria-valuemax", "20")
  })

  it("without a value it is indeterminate: no aria-valuenow, pulsing", () => {
    const p = render(<AttachmentProgress aria-label="Processing" />).getByRole("progressbar")
    expect(p).not.toHaveAttribute("aria-valuenow")
    expect(p).toHaveAttribute("data-state", "indeterminate")
    expect(p.className).toContain("data-[state=indeterminate]:[&>svg_[data-part=bar]]:animate-pulse")
  })

  it("moving the value never redraws the bar", () => {
    const { rerender, getByRole } = render(<AttachmentProgress value={10} aria-label="a" />)
    const before = getByRole("progressbar").querySelector("svg")!.innerHTML
    rerender(<AttachmentProgress value={90} aria-label="a" />)
    expect(getByRole("progressbar").querySelector("svg")!.innerHTML).toBe(before)
  })

  it("the fill runs the other way in right-to-left", () => {
    const { getByRole } = render(<AttachmentProgress value={10} aria-label="a" />)
    expect(getByRole("progressbar").className).toContain("rtl:[&>svg_[data-part=bar]]:[clip-path:inset(-15%_-3%_-15%_calc(100%-var(--ll-progress)))]")
  })
})

describe("Attachment interaction", () => {
  it("the trigger is a real button laid over the whole attachment", async () => {
    const onClick = vi.fn()
    const { getByRole, user } = renderUI(
      <Chip>
        <AttachmentTrigger aria-label="Open field-notes.pdf" onClick={onClick} />
      </Chip>,
    )
    const t = getByRole("button", { name: "Open field-notes.pdf" })
    expect(t).toHaveAttribute("type", "button")
    expect(t).toHaveClass("absolute", "inset-0", "z-10", "outline-hidden")
    await user.tab()
    expect(t).toHaveFocus()
    await user.keyboard("{Enter}")
    await user.keyboard(" ")
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it("the trigger can be a link", () => {
    const { getByRole } = render(
      <Chip>
        <AttachmentTrigger asChild>
          <a href="/f.pdf">Open</a>
        </AttachmentTrigger>
      </Chip>,
    )
    expect(getByRole("link", { name: "Open" })).toHaveAttribute("data-slot", "attachment-trigger")
    expect(getByRole("link")).not.toHaveAttribute("type")
  })

  it("actions are ghost icon buttons above the trigger, separately focusable", async () => {
    const onRemove = vi.fn()
    const { getByRole, user } = renderUI(
      <Attachment>
        <AttachmentContent>
          <AttachmentTitle>a.pdf</AttachmentTitle>
        </AttachmentContent>
        <AttachmentTrigger aria-label="Open a.pdf" />
        <AttachmentActions>
          <AttachmentAction aria-label="Remove a.pdf" onClick={onRemove}>
            <Icon name="x" />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>,
    )
    const b = getByRole("button", { name: "Remove a.pdf" })
    expect(b).toHaveAttribute("data-slot", "attachment-action")
    expect(b).toHaveAttribute("data-variant", "ghost")
    expect(b).toHaveAttribute("data-size", "icon-xs")
    await user.tab()
    await user.tab()
    expect(b).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})

describe("attachment recipes", () => {
  const req = { seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }

  it("every state x orientation is sane and cheap", () => {
    for (const state of attachmentStateList) {
      for (const orientation of ["horizontal", "vertical"] as const) {
        for (const box of [{ w: 160, h: 56 }, { w: 320, h: 64 }, { w: 132, h: 190 }]) {
          const f = runRecipe(attachmentRecipe, { ...req, params: { state, orientation, interactive: true }, box, lazy: ["focus"] })
          const all = Object.values(f.parts).join("")
          expect(all, `${state}/${orientation}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
          expect(nodes(f.parts.rest ?? ""), `${state}/${orientation}`).toBeLessThanOrEqual(12)
          expect((f.parts.rest ?? "").length, `${state}/${orientation}`).toBeLessThanOrEqual(9000)
        }
      }
    }
  })

  it("rest, a hover wash for the pressable, a lazy focus ring", () => {
    const f = runRecipe(attachmentRecipe, { ...req, params: { state: "done", orientation: "horizontal", interactive: true }, box: { w: 200, h: 56 }, lazy: ["focus"] })
    expect(f.layers).toEqual(["rest", "hover", "focus"])
    expect(f.lazyLayers).toEqual(["focus"])
  })

  it("media and progress are one layer each", () => {
    for (const state of attachmentStateList) {
      for (const variant of ["icon", "image"] as const) {
        const f = runRecipe(attachmentMediaRecipe, { ...req, params: { state, variant }, box: { w: 40, h: 40 } })
        expect(f.layers).toEqual(["rest"])
        expect(nodes(f.parts.rest ?? "")).toBeLessThanOrEqual(12)
      }
    }
    const p = runRecipe(attachmentProgressRecipe, { ...req, params: {}, box: { w: 160, h: 10 } })
    expect(p.layers).toEqual(["rest"])
    expect(p.parts.rest).toContain('data-part="bar"')
    expect(p.parts.rest).toContain('data-part="track"')
  })

  it("calm density traces a hairline", () => {
    const calm = runRecipe(attachmentRecipe, { ...req, params: { state: "uploading", orientation: "horizontal" }, box: { w: 200, h: 56 }, density: "calm" })
    const comfy = runRecipe(attachmentRecipe, { ...req, params: { state: "uploading", orientation: "horizontal" }, box: { w: 200, h: 56 } })
    expect((calm.parts.rest ?? "").length).toBeLessThan((comfy.parts.rest ?? "").length)
  })
})

describe("Attachment on the server", () => {
  it("is deterministic and hydrates without a warning", async () => {
    restore()
    const tree = () => (
      <Chip state="uploading" seed="ssr">
        <AttachmentProgress value={30} aria-label="p" />
      </Chip>
    )
    const html = renderToString(tree())
    expect(html).toContain("field-notes.pdf")
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

  it("has no axe violations in any state", async () => {
    const { container } = render(
      <AttachmentGroup>
        {attachmentStateList.map((state) => (
          <Attachment key={state} state={state}>
            <AttachmentMedia>
              <Icon name="file-text" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{state}.pdf</AttachmentTitle>
              <AttachmentDescription>1 MB</AttachmentDescription>
              {state === "uploading" ? <AttachmentProgress value={40} aria-label="Upload progress" /> : null}
            </AttachmentContent>
            <AttachmentTrigger aria-label={`Open ${state}.pdf`} />
            <AttachmentActions>
              <AttachmentAction aria-label={`Remove ${state}.pdf`}>
                <Icon name="x" />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        ))}
        <Attachment orientation="vertical">
          <AttachmentMedia variant="image">
            <img alt="A harbour" src="h.jpg" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>harbour.jpg</AttachmentTitle>
          </AttachmentContent>
        </Attachment>
      </AttachmentGroup>,
    )
    await axeCheck(container)
  })
})

describe("review: names and the clip", () => {
  it("a progress bar inside an attachment is named by its title unless you name it, and axe is content", async () => {
    const r = render(
      <div>
        <Attachment state="uploading">
          <AttachmentContent>
            <AttachmentTitle>tags-list.tsx</AttachmentTitle>
            <AttachmentProgress value={42} />
          </AttachmentContent>
        </Attachment>
        <Attachment state="processing">
          <AttachmentContent>
            <AttachmentTitle>recipes.csv</AttachmentTitle>
            <AttachmentProgress aria-label="Reading the rows" />
          </AttachmentContent>
        </Attachment>
      </div>,
    )
    expect(r.getByRole("progressbar", { name: "tags-list.tsx" })).toHaveAttribute("aria-valuenow", "42")
    expect(r.getByRole("progressbar", { name: "Reading the rows" })).not.toHaveAttribute("aria-labelledby")
    await axeCheck(r.container)
  })

  it("a bare progress bar (no attachment, no title) does not point at an id that is not there", () => {
    const r = render(<AttachmentProgress value={10} />)
    expect(r.getByRole("progressbar")).not.toHaveAttribute("aria-labelledby")
  })

  it("the title keeps clear of the paper clip when there is no action beside it", () => {
    const { container } = render(<Chip />)
    const a = container.querySelector('[data-slot="attachment"]') as HTMLElement
    expect(a).toHaveAttribute("data-clip")
    expect(a.className).toContain("data-[clip]:not-has-[[data-slot=attachment-actions]]:[&>[data-slot=attachment-content]]:pe-3")
    expect(render(<Chip state="uploading" />).container.querySelector('[data-slot="attachment"]')).not.toHaveAttribute("data-clip")
    expect(render(<Chip size="sm" />).container.querySelector('[data-slot="attachment"]')).not.toHaveAttribute("data-clip")
  })
})
