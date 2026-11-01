import * as React from "react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import { axeCheck, mockBox } from "./helpers"
import { InkProvider } from "@/lib/ink/react/provider"

const mods = import.meta.glob("../src/docs/examples/{bubble,message,message-scroller,attachment,marker,prompt-input,typing-indicator,code-block}/*.tsx", { eager: true }) as Record<string, { default: React.ComponentType }>
let restore = () => {}
beforeEach(() => { restore = mockBox(320, 60) })
afterEach(() => restore())
describe("axe on every chat example", () => {
  for (const [path, m] of Object.entries(mods)) {
    it(path.replace("../src/docs/examples/", ""), async () => {
      const C = m.default
      const r = render(<React.StrictMode><InkProvider><C /></InkProvider></React.StrictMode>)
      await axeCheck(r.container)
      r.unmount()
    })
  }
})
