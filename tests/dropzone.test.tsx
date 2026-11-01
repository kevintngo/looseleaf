import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, cleanup, fireEvent, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  Dropzone,
  DropzoneArea,
  DropzoneDescription,
  DropzoneIcon,
  DropzoneItem,
  DropzoneList,
  DropzoneRejections,
  DropzoneTitle,
  formatBytes,
  matchesAccept,
  useDropzone,
} from "@/components/ui/dropzone"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { dropzoneItemRecipe, dropzoneRecipe } from "@/lib/ink/recipes/dropzone-ink"
import AttachExample from "@/docs/examples/dropzone/02-attach-with-progress"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(420, 176)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const file = (name: string, bytes = 1000, type = "") => new File(["x".repeat(bytes)], name, { type })
const png = (name = "a.png", bytes = 2048) => file(name, bytes, "image/png")
const input = () => document.querySelector('input[type="file"]') as HTMLInputElement
const area = () => document.querySelector('[data-slot="dropzone-area"]') as HTMLElement
const items = () => Array.from(document.querySelectorAll('[data-slot="dropzone-item"]'))
const layers = (el: Element) => Array.from(el.querySelectorAll(":scope > svg > g[data-layer]")).map((g) => g.getAttribute("data-layer"))
const dt = (files: File[] = [], types: string[] = ["Files"]) => ({ dataTransfer: { files, types, dropEffect: "none" } })

describe("helpers", () => {
  it("formatBytes", () => {
    expect([0, 999, 1024, 1536, 10 * 1024, 5 * 1024 * 1024, 1.5 * 1024 ** 3].map(formatBytes)).toEqual(["0 B", "999 B", "1 KB", "1.5 KB", "10 KB", "5 MB", "1.5 GB"])
  })
  it("matchesAccept reads extensions, wildcards and exact types, in a string or an array", () => {
    expect(matchesAccept({ name: "a.PNG", type: "" }, ".png")).toBe(true)
    expect(matchesAccept({ name: "a.png", type: "image/png" }, "image/*")).toBe(true)
    expect(matchesAccept({ name: "a.pdf", type: "application/pdf" }, "image/*,.doc")).toBe(false)
    expect(matchesAccept({ name: "a.pdf", type: "application/pdf" }, ["image/*", "application/pdf"])).toBe(true)
    expect(matchesAccept({ name: "a", type: "" }, undefined)).toBe(true)
    expect(matchesAccept({ name: "a", type: "" }, "")).toBe(true)
  })
})

describe("Dropzone structure", () => {
  it("is a label round a hidden file input, with the default icon, title, description, and the upstream-style slots", () => {
    const { container } = renderUI(<Dropzone accept="image/png,.jpg" maxSize={5 * 1024 * 1024} />)
    expect(container.querySelector('[data-slot="dropzone"]')).not.toBeNull()
    const a = area()
    expect(a.tagName).toBe("LABEL")
    expect(input().parentElement).toBe(a)
    expect(input()).toHaveClass("sr-only")
    expect(input()).toHaveAttribute("accept", "image/png,.jpg")
    expect(input()).toHaveAttribute("multiple")
    expect(a.querySelector('[data-slot="dropzone-icon"] svg[data-icon="upload"]')).not.toBeNull()
    expect(a.querySelector('[data-slot="dropzone-title"]')).toHaveTextContent("Drop files here or browse")
    expect(a.querySelector('[data-slot="dropzone-description"]')).toHaveTextContent("PNG, JPG up to 5 MB each")
  })

  it("the description states the limits: kinds, size, count", () => {
    const { rerender } = renderUI(<Dropzone accept="image/*" maxSize={2 * 1024 * 1024} maxFiles={3} />)
    expect(document.querySelector('[data-slot="dropzone-description"]')).toHaveTextContent("Images up to 2 MB each at most 3 files")
    rerender(<Dropzone multiple={false} accept=".pdf" maxSize={1024 * 1024} />)
    expect(document.querySelector('[data-slot="dropzone-description"]')).toHaveTextContent("PDF up to 1 MB")
    expect(document.querySelector('[data-slot="dropzone-title"]')).toHaveTextContent("Drop a file here or browse")
    rerender(<Dropzone />)
    expect(document.querySelector('[data-slot="dropzone-description"]')).toBeNull()
  })

  it("the zone is one ink host with a drawn stitched patch (aria-hidden); the click target is the whole label", () => {
    renderUI(<Dropzone />)
    const a = area()
    expect(a).toHaveAttribute("data-ink-host")
    expect(a).toHaveAttribute("data-ink-focus", "within")
    const svg = a.querySelector(":scope > svg[data-ink='field']")
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(layers(a)).toEqual(["rest"])
  })

  it("custom parts compose; useDropzone exposes the state and throws outside", () => {
    function Peek() {
      const z = useDropzone()
      return <span data-testid="peek">{`${z.files.length}|${z.multiple}|${z.isDragOver}`}</span>
    }
    renderUI(
      <Dropzone>
        <DropzoneArea>
          <DropzoneIcon>
            <b>icon</b>
          </DropzoneIcon>
          <DropzoneTitle>Drop your résumé</DropzoneTitle>
          <DropzoneDescription>PDF only</DropzoneDescription>
        </DropzoneArea>
        <Peek />
      </Dropzone>,
    )
    expect(screen.getByText("Drop your résumé")).toBeInTheDocument()
    expect(screen.getByTestId("peek")).toHaveTextContent("0|true|false")
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderUI(<Peek />)).toThrow(/inside <Dropzone>/)
    err.mockRestore()
  })
})

describe("Dropzone picking and validation", () => {
  it("picking files lists them (name, size) and reports them; the whole list is reported each time", async () => {
    const onFilesChange = vi.fn()
    const onDrop = vi.fn()
    const { user } = renderUI(<Dropzone onFilesChange={onFilesChange} onDrop={onDrop} />)
    await user.upload(input(), [png("a.png", 2048), file("b.txt", 10, "text/plain")])
    expect(items().map((i) => i.querySelector("span.font-bold")?.textContent)).toEqual(["a.png", "b.txt"])
    expect(items()[0]).toHaveTextContent("2 KB")
    expect(onFilesChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: "a.png" }), expect.objectContaining({ name: "b.txt" })])
    expect(onDrop).toHaveBeenCalledWith([expect.any(File), expect.any(File)], [])
    await user.upload(input(), png("c.png"))
    expect(items()).toHaveLength(3)
  })

  it("without `multiple` a new file replaces the old and extra files in one pick are refused", async () => {
    const { user } = renderUI(<Dropzone multiple={false} />)
    await user.upload(input(), png("a.png"))
    await user.upload(input(), png("b.png"))
    expect(items()).toHaveLength(1)
    expect(items()[0]).toHaveTextContent("b.png")
    expect(input()).not.toHaveAttribute("multiple")
  })

  it("accept refuses other types with a reason; the list and the alert say so", async () => {
    const onReject = vi.fn()
    const { user } = renderUI(<Dropzone accept="image/*" onReject={onReject} />, { user: { applyAccept: false } })
    await user.upload(input(), [png("ok.png"), file("holiday.exe", 10, "application/x-msdownload")])
    expect(items()).toHaveLength(1)
    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("holiday.exe is not a file type we take.")
    expect(onReject).toHaveBeenCalledWith([expect.objectContaining({ errors: [expect.objectContaining({ code: "file-invalid-type" })] })])
  })

  it("maxSize, minSize, maxFiles and a validator each give their own reason (and messages translates them)", async () => {
    const { user } = renderUI(
      <Dropzone
        maxSize={1500}
        minSize={100}
        maxFiles={2}
        validator={(f) => (f.name.startsWith("x") ? { code: "validator", message: `${f.name} starts with x.` } : null)}
        messages={{ "file-too-large": (f) => `${f.name} pèse trop.` }}
      >
        <DropzoneArea />
        <DropzoneRejections />
        <DropzoneList />
      </Dropzone>,
    )
    await user.upload(input(), [file("big.bin", 4000), file("tiny.bin", 10), file("xray.bin", 500), file("one.bin", 500), file("two.bin", 500), file("three.bin", 500)])
    const text = screen.getByRole("alert").textContent ?? ""
    expect(text).toContain("big.bin pèse trop.")
    expect(text).toContain("tiny.bin is smaller than 100 B.")
    expect(text).toContain("xray.bin starts with x.")
    expect(text).toContain("Only 2 files at a time.")
    expect(items().map((i) => i.textContent)).toEqual([expect.stringContaining("one.bin"), expect.stringContaining("two.bin")])
    await user.upload(input(), file("four.bin", 500))
    expect(screen.getByRole("alert")).toHaveTextContent("Only 2 files at a time.")
    expect(items()).toHaveLength(2)
  })

  it("a clean pick clears the old reasons", async () => {
    const { user } = renderUI(<Dropzone accept="image/*" />, { user: { applyAccept: false } })
    await user.upload(input(), file("a.txt", 10, "text/plain"))
    expect(screen.getByRole("alert")).toBeInTheDocument()
    await user.upload(input(), png("ok.png"))
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("controlled: the files come from props", async () => {
    const onFilesChange = vi.fn()
    const { user, rerender } = renderUI(<Dropzone files={[]} onFilesChange={onFilesChange} />)
    await user.upload(input(), png("a.png"))
    expect(items()).toHaveLength(0)
    expect(onFilesChange).toHaveBeenCalled()
    rerender(<Dropzone files={[png("a.png")]} onFilesChange={onFilesChange} />)
    expect(items()).toHaveLength(1)
  })

  it("removing a file (its x) takes it off the list and reports the rest", async () => {
    const onFilesChange = vi.fn()
    const { user } = renderUI(<Dropzone defaultFiles={[png("a.png"), png("b.png")]} onFilesChange={onFilesChange} />)
    await user.click(screen.getByRole("button", { name: "Remove a.png" }))
    expect(items()).toHaveLength(1)
    expect(onFilesChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: "b.png" })])
  })

  it("the accepted files are put in the real input (DataTransfer), so a plain <form> submits them", async () => {
    const seen: File[][] = []
    class FakeDataTransfer {
      list: File[] = []
      items = { add: (f: File) => void this.list.push(f) }
      get files() {
        return this.list as unknown as FileList
      }
    }
    vi.stubGlobal("DataTransfer", FakeDataTransfer)
    const { user } = renderUI(
      <form>
        <Dropzone name="attachments" />
      </form>,
    )
    Object.defineProperty(input(), "files", { configurable: true, get: () => null, set: (v: FileList) => void seen.push(Array.from(v as unknown as File[])) })
    await user.upload(input(), [png("a.png"), png("b.png")])
    expect(seen.at(-1)?.map((f) => f.name)).toEqual(["a.png", "b.png"])
    vi.unstubAllGlobals()
  })
})

describe("Dropzone dragging", () => {
  it("a file over the zone lights it (data-drag-over, the open layer, Stubby with a sheet) and leaving puts it back, even through child elements", () => {
    renderUI(<Dropzone />)
    fireEvent.dragEnter(area(), dt([png()]))
    expect(area()).toHaveAttribute("data-drag-over")
    expect(layers(area())).toEqual(["open"])
    expect(area().querySelector('svg[data-slot="mascot"]')).toHaveAttribute("data-pose", "carry")
    fireEvent.dragEnter(area().querySelector('[data-slot="dropzone-title"]')!, dt([png()]))
    fireEvent.dragLeave(area(), dt())
    expect(area()).toHaveAttribute("data-drag-over")
    fireEvent.dragLeave(area().querySelector('[data-slot="dropzone-title"]')!, dt())
    expect(area()).not.toHaveAttribute("data-drag-over")
    expect(layers(area())[0]).toBe("rest")
    expect(area().querySelector('svg[data-slot="mascot"]')).toBeNull()
  })

  it("dropping adds the files and ends the drag; dragover allows the drop", () => {
    const onDrop = vi.fn()
    renderUI(<Dropzone accept="image/*" onDrop={onDrop} />)
    const over = new Event("dragover", { bubbles: true, cancelable: true }) as Event & { dataTransfer?: unknown }
    Object.assign(over, dt([png()]))
    area().dispatchEvent(over)
    expect(over.defaultPrevented).toBe(true)
    fireEvent.dragEnter(area(), dt([png()]))
    fireEvent.drop(area(), dt([png("d.png"), file("d.txt", 1, "text/plain")]))
    expect(area()).not.toHaveAttribute("data-drag-over")
    expect(items()).toHaveLength(1)
    expect(onDrop).toHaveBeenCalledWith([expect.objectContaining({ name: "d.png" })], [expect.objectContaining({ file: expect.objectContaining({ name: "d.txt" }) })])
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })

  it("things that are not files (text, links) do not light it", () => {
    renderUI(<Dropzone />)
    fireEvent.dragEnter(area(), dt([], ["text/plain"]))
    expect(area()).not.toHaveAttribute("data-drag-over")
  })

  it("disabled ignores drags and drops", () => {
    renderUI(<Dropzone disabled />)
    fireEvent.dragEnter(area(), dt([png()]))
    expect(area()).not.toHaveAttribute("data-drag-over")
    fireEvent.drop(area(), dt([png()]))
    expect(items()).toHaveLength(0)
  })
})

describe("Dropzone keyboard and states", () => {
  it("the hidden input is a tab stop (Enter / Space open the picker natively); open() clicks it", async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {})
    function Opener() {
      const z = useDropzone()
      return <button onClick={z.open}>open</button>
    }
    const { user } = renderUI(
      <Dropzone>
        <DropzoneArea />
        <Opener />
      </Dropzone>,
    )
    await user.tab()
    expect(input()).toHaveFocus()
    await user.click(screen.getByRole("button", { name: "open" }))
    expect(click).toHaveBeenCalledTimes(1)
    click.mockRestore()
  })

  it("invalid draws the red thread and marks the input; disabled draws the pale one and disables it", () => {
    const { rerender } = renderUI(<Dropzone invalid />)
    expect(layers(area())[0]).toBe("invalid")
    expect(input()).toHaveAttribute("aria-invalid", "true")
    rerender(<Dropzone disabled />)
    expect(layers(area())).toEqual(["disabled"])
    expect(input()).toBeDisabled()
    expect(area()).toHaveAttribute("data-disabled")
  })

  it("required needs a file until one is chosen", async () => {
    const { user } = renderUI(<Dropzone required />)
    expect(input()).toBeRequired()
    await user.upload(input(), png())
    expect(input()).not.toBeRequired()
  })

  it("hoists one stylesheet with the wiggle (stopped under reduced motion)", () => {
    renderUI(
      <>
        <Dropzone />
        <Dropzone />
      </>,
    )
    const styles = document.querySelectorAll('style[data-href="ll-dropzone"]')
    expect(styles).toHaveLength(1)
    expect(styles[0].textContent).toContain("ll-dz-wiggle")
    expect(styles[0].textContent).toContain("prefers-reduced-motion")
  })
})

describe("DropzoneItem", () => {
  const f = png("garden.png", 3 * 1024 * 1024)
  it("shows a progress line while uploading, a tick when done, a red note on error", () => {
    const { rerender } = renderUI(
      <Dropzone>
        <DropzoneList>{(x) => <DropzoneItem file={x} status="uploading" progress={64} />}</DropzoneList>
      </Dropzone>,
    )
    expect(document.querySelector('[data-slot="dropzone-list"]')).toBeNull()
    cleanup()
    renderUI(
      <Dropzone defaultFiles={[f]}>
        <DropzoneList>{(x) => <DropzoneItem file={x} status="uploading" progress={64} />}</DropzoneList>
      </Dropzone>,
    )
    const bar = screen.getByRole("progressbar", { name: "Uploading garden.png" })
    expect(bar).toHaveAttribute("aria-valuenow", "64")
    expect(items()[0]).toHaveTextContent("3 MB, 64%")
    cleanup()
    renderUI(
      <Dropzone defaultFiles={[f]}>
        <DropzoneList>{(x) => <DropzoneItem file={x} status="done" />}</DropzoneList>
      </Dropzone>,
    )
    expect(items()[0]).toHaveTextContent("3 MB, done")
    expect(layers(items()[0])).toEqual(["rest"])
    cleanup()
    renderUI(
      <Dropzone defaultFiles={[f]}>
        <DropzoneList>{(x) => <DropzoneItem file={x} status="error" error="The server said no." />}</DropzoneList>
      </Dropzone>,
    )
    expect(items()[0]).toHaveTextContent("The server said no.")
    expect(layers(items()[0])).toEqual(["invalid"])
    void rerender
  })

  it("an image gets a polaroid thumbnail (an object URL, revoked on unmount); other files an icon", () => {
    const create = vi.fn(() => "blob:mock")
    const revoke = vi.fn()
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke })
    const { unmount } = renderUI(<Dropzone defaultFiles={[f, file("notes.pdf", 10, "application/pdf")]} />)
    const media = document.querySelectorAll('[data-slot="dropzone-item-media"]')
    expect(media[0].querySelector("img")).toHaveAttribute("src", "blob:mock")
    expect(media[1].querySelector("svg[data-icon='file-text']")).not.toBeNull()
    unmount()
    expect(revoke).toHaveBeenCalledWith("blob:mock")
    Object.assign(URL, { createObjectURL: undefined, revokeObjectURL: undefined })
  })

  it("onRemove replaces the default removal; the x is named for the file", async () => {
    const onRemove = vi.fn()
    const { user } = renderUI(
      <Dropzone defaultFiles={[f]}>
        <DropzoneList>{(x) => <DropzoneItem file={x} onRemove={onRemove} removeLabel="Discard garden.png" />}</DropzoneList>
      </Dropzone>,
    )
    await user.click(screen.getByRole("button", { name: "Discard garden.png" }))
    expect(onRemove).toHaveBeenCalled()
    expect(items()).toHaveLength(1)
  })
})

describe("Dropzone recipes, accessibility, rendering", () => {
  const req = { seed: "s", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length

  it("the patch is two cheap paths in every state, density and size (<= 12 nodes, <= 8 KB, lazy layers too)", () => {
    for (const params of [{}, { over: true }, { invalid: true }, { disabled: true }]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const dir of ["ltr", "rtl"] as const) {
          for (const box of [{ w: 420, h: 176 }, { w: 1200, h: 220 }, { w: 120, h: 80 }, { w: 40, h: 40 }]) {
            const f = runRecipe(dropzoneRecipe, { ...req, density, dir, params, box, lazy: ["focus", "hover"] })
            for (const [layer, markup] of Object.entries(f.parts)) {
              expect(nodes(markup ?? ""), `${layer}`).toBeLessThanOrEqual(12)
              expect((markup ?? "").length, `${layer} ${JSON.stringify(box)}`).toBeLessThanOrEqual(8000)
            }
            expect(Object.values(f.parts).join("")).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
          }
        }
      }
    }
    expect(runRecipe(dropzoneRecipe, { ...req, params: { over: true }, box: { w: 420, h: 176 } }).layers).toEqual(["open"])
    expect(runRecipe(dropzoneRecipe, { ...req, params: { over: true, disabled: true }, box: { w: 420, h: 176 } }).layers).toEqual(["disabled"])
  })

  it("the row rule: pencil, or red and wavy for an error", () => {
    expect(runRecipe(dropzoneItemRecipe, { ...req, params: { status: "idle" }, box: { w: 400, h: 48 } }).layers).toEqual(["rest"])
    expect(runRecipe(dropzoneItemRecipe, { ...req, params: { status: "done" }, box: { w: 400, h: 48 } }).layers).toEqual(["rest"])
    expect(runRecipe(dropzoneItemRecipe, { ...req, params: { status: "error" }, box: { w: 400, h: 48 } }).layers).toEqual(["invalid"])
  })

  it("has no axe violations (empty, with files and rejections, invalid, disabled, dragging)", async () => {
    const { container, user, rerender } = renderUI(<Dropzone accept="image/*" />, { user: { applyAccept: false } })
    await axeCheck(container)
    await user.upload(input(), [png("a.png"), file("b.txt", 10, "text/plain")])
    await axeCheck(container)
    fireEvent.dragEnter(area(), dt([png()]))
    await axeCheck(container)
    rerender(<Dropzone invalid />)
    await axeCheck(container)
    rerender(<Dropzone disabled />)
    await axeCheck(container)
  })

  it("renders on the server twice the same and hydrates cleanly, bare and in a provider", async () => {
    const el = <Dropzone accept="image/*" maxSize={1024 * 1024} defaultFiles={[png("a.png"), file("b.pdf", 10, "application/pdf")]} />
    const a = renderToString(el)
    expect(renderToString(el)).toBe(a)
    expect(a).not.toMatch(/NaN|undefined|\[object/)
    expect(a).toContain("a.png")
    for (const wrap of [(x: React.ReactElement) => x, (x: React.ReactElement) => <InkProvider>{x}</InkProvider>]) {
      cleanup()
      const host = document.createElement("div")
      document.body.appendChild(host)
      host.innerHTML = renderToString(wrap(el))
      const err = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(el))
      })
      expect(err.mock.calls.map((c) => String(c[0])).filter((m) => !/act\(/.test(m))).toEqual([])
      err.mockRestore()
      host.remove()
    }
    void within
  })
})

describe("Dropzone review fixes (hand stitches, focus after removal, cheap thumbnails)", () => {
  const req = { seed: "s", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const dashes = (f: ReturnType<typeof runRecipe>) => (Object.values(f.parts).join("").match(/stroke-dasharray="([^"]+)"/g) ?? []).map((m) => m.slice(18, -1))

  it("the stitches are never all the same length (a plain dash and gap reads as a CSS border), repeat for a seed, and are even in calm", () => {
    const rest = runRecipe(dropzoneRecipe, { ...req, params: {}, box: { w: 420, h: 176 } })
    const [pattern] = dashes(rest)
    const numbers = pattern.split(" ").map(Number)
    expect(numbers.length).toBeGreaterThanOrEqual(16)
    expect(new Set(numbers.filter((_, i) => i % 2 === 0)).size).toBeGreaterThan(4)
    expect(new Set(numbers.filter((_, i) => i % 2 === 1)).size).toBeGreaterThan(4)
    expect(numbers.every((x) => x > 0)).toBe(true)
    expect(dashes(runRecipe(dropzoneRecipe, { ...req, params: {}, box: { w: 420, h: 176 } }))).toEqual(dashes(rest))
    expect(dashes(runRecipe(dropzoneRecipe, { ...req, seed: "another", params: {}, box: { w: 420, h: 176 } }))).not.toEqual(dashes(rest))
    expect(dashes(runRecipe(dropzoneRecipe, { ...req, density: "calm", params: {}, box: { w: 420, h: 176 } }))).toEqual(["5 5"])
    expect(dashes(runRecipe(dropzoneRecipe, { ...req, params: { over: true }, box: { w: 420, h: 176 } }))[0].split(" ").length).toBeGreaterThanOrEqual(16)
  })

  it("removing a file keeps the keyboard on the zone (the row and its button are gone)", async () => {
    const { user } = renderUI(<Dropzone defaultFiles={[png("a.png"), png("b.png")]} />)
    const x = screen.getByRole("button", { name: "Remove a.png" })
    x.focus()
    await user.keyboard("{Enter}")
    expect(items()).toHaveLength(1)
    expect(input()).toHaveFocus()
  })

  it("a custom onRemove also hands the focus to the zone", async () => {
    const onRemove = vi.fn()
    const { user } = renderUI(
      <Dropzone defaultFiles={[png("a.png")]}>
        <DropzoneArea />
        <DropzoneList>{(f) => <DropzoneItem key={f.name} file={f} onRemove={onRemove} />}</DropzoneList>
      </Dropzone>,
    )
    await user.click(screen.getByRole("button", { name: "Remove a.png" }))
    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(input()).toHaveFocus()
  })

  it("thumbnails decode off the main thread and load lazily (a folder of large photos must not decode all at once)", () => {
    const create = vi.fn(() => "blob:x")
    const original = URL.createObjectURL
    URL.createObjectURL = create
    URL.revokeObjectURL = vi.fn()
    try {
      renderUI(<Dropzone defaultFiles={[png("a.png")]} />)
      const img = document.querySelector('[data-slot="dropzone-item-media"] img') as HTMLImageElement
      expect(img).toHaveAttribute("decoding", "async")
      expect(img).toHaveAttribute("loading", "lazy")
    } finally {
      URL.createObjectURL = original
    }
  })
})

describe("the attach-with-progress example (real-world code people copy)", () => {
  it("a second file added while the first is uploading does not stop the first: both finish, Save comes back", () => {
    vi.useFakeTimers()
    try {
      renderUI(<AttachExample />)
      const pick = (f: File) => act(() => void fireEvent.change(input(), { target: { files: [f] } }))
      pick(png("first.png", 2000))
      act(() => void vi.advanceTimersByTime(480))
      expect(screen.getByRole("progressbar", { name: "Uploading first.png" })).toBeInTheDocument()
      pick(png("second.png", 2100))
      act(() => void vi.advanceTimersByTime(6000))
      expect(screen.queryByRole("progressbar")).toBeNull()
      expect(items().map((li) => li.getAttribute("data-status"))).toEqual(["done", "done"])
      expect(screen.getByRole("button", { name: "Save note" })).toBeEnabled()
      pick(png("third.png", 2200))
      act(() => void vi.advanceTimersByTime(240))
      act(() => void screen.getByRole("button", { name: "Remove third.png" }).click())
      expect(screen.getByRole("button", { name: "Save note" })).toBeEnabled()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe("Form reset", () => {
  it("a reset button empties the list with the input (or goes back to defaultFiles) and clears the reasons; a controlled zone stays with its parent", async () => {
    const { user, container } = renderUI(
      <form>
        <Dropzone name="docs" accept=".pdf" defaultFiles={[file("keep.pdf", 10, "application/pdf")]} />
        <button type="reset">Reset</button>
      </form>,
      { user: { applyAccept: false } },
    )
    await user.upload(input(), [file("new.pdf", 10, "application/pdf"), file("bad.exe")])
    expect(items().map((li) => li.textContent)).toHaveLength(2)
    expect(screen.getByRole("alert")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Reset" }))
    expect(items()).toHaveLength(1)
    expect(items()[0]).toHaveTextContent("keep.pdf")
    expect(screen.queryByRole("alert")).toBeNull()
    expect(container.querySelector("form")).not.toBeNull()
  })

  it("without defaultFiles a reset empties the list", async () => {
    const { user } = renderUI(
      <form>
        <Dropzone />
        <button type="reset">Reset</button>
      </form>,
    )
    await user.upload(input(), [png("a.png")])
    expect(items()).toHaveLength(1)
    await user.click(screen.getByRole("button", { name: "Reset" }))
    expect(items()).toHaveLength(0)
  })
})
