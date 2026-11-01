import * as React from "react"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useFormReset } from "@/hooks/use-form-reset"

function Probe({ onReset, id = "field" }: { onReset: () => void; id?: string }) {
  const ref = React.useRef<HTMLInputElement>(null)
  useFormReset(() => ref.current, onReset)
  return <input ref={ref} id={id} />
}

describe("useFormReset", () => {
  it("runs when the form that holds the element is reset, and only then", () => {
    const mine = vi.fn()
    const other = vi.fn()
    const { container } = render(
      <>
        <form id="a">
          <Probe onReset={mine} />
        </form>
        <form id="b">
          <Probe onReset={other} id="other" />
        </form>
      </>,
    )
    act(() => (container.querySelector("#a") as HTMLFormElement).reset())
    expect(mine).toHaveBeenCalledTimes(1)
    expect(other).not.toHaveBeenCalled()
  })

  it("follows a control that belongs to a form by its `form` attribute, and reads the callback that is current", () => {
    const first = vi.fn()
    const second = vi.fn()
    function Outside({ cb }: { cb: () => void }) {
      const ref = React.useRef<HTMLInputElement>(null)
      useFormReset(() => ref.current, cb)
      return <input ref={ref} form="far" />
    }
    const { rerender, container } = render(
      <>
        <form id="far" />
        <Outside cb={first} />
      </>,
    )
    rerender(
      <>
        <form id="far" />
        <Outside cb={second} />
      </>,
    )
    act(() => (container.querySelector("#far") as HTMLFormElement).reset())
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it("stops listening when the component goes, and is silent on the server", () => {
    const cb = vi.fn()
    const { container, unmount } = render(
      <form id="a">
        <Probe onReset={cb} />
      </form>,
    )
    const form = container.querySelector("#a") as HTMLFormElement
    unmount()
    form.reset()
    expect(cb).not.toHaveBeenCalled()
    expect(() => renderToString(<Probe onReset={cb} />)).not.toThrow()
  })
})
