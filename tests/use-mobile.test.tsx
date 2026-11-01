import * as React from "react"
import { renderToString } from "react-dom/server"
import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { useIsMobile } from "@/hooks/use-mobile"

function Probe() {
  return <output>{String(useIsMobile())}</output>
}

function setWidth(px: number) {
  Object.defineProperty(window, "innerWidth", { value: px, configurable: true, writable: true })
}

describe("useIsMobile", () => {
  const original = window.matchMedia
  let fire: () => void = () => {}
  let removed = 0
  beforeEach(() => {
    removed = 0
    window.matchMedia = ((q: string) => ({
      matches: false,
      media: q,
      onchange: null,
      addEventListener: (_: string, cb: () => void) => {
        fire = cb
      },
      removeEventListener: () => {
        removed++
      },
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  })
  afterEach(() => {
    window.matchMedia = original
    setWidth(1024)
  })

  it("is false on the server and on the first render, so hydration agrees", () => {
    setWidth(400)
    expect(renderToString(<Probe />)).toContain("false")
  })

  it("is true under 768 px once the window is measured, and false above", () => {
    setWidth(500)
    const a = render(<Probe />)
    expect(screen.getByRole("status")).toHaveTextContent("true")
    a.unmount()
    setWidth(768)
    render(<Probe />)
    expect(screen.getByRole("status")).toHaveTextContent("false")
  })

  it("follows the window when it is resized, and lets go of the listener on unmount", () => {
    setWidth(1000)
    const { unmount } = render(<Probe />)
    expect(screen.getByRole("status")).toHaveTextContent("false")
    act(() => {
      setWidth(600)
      fire()
    })
    expect(screen.getByRole("status")).toHaveTextContent("true")
    act(() => {
      setWidth(900)
      fire()
    })
    expect(screen.getByRole("status")).toHaveTextContent("false")
    unmount()
    expect(removed).toBe(1)
  })
})
