import * as React from "react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(200, 36)
})
afterEach(() => restore())

describe("Field orientation=responsive", () => {
  it("lets the children go back to their natural width in a wide FieldGroup", () => {
    const { container } = renderUI(
      <Field orientation="responsive">
        <FieldContent>
          <FieldLabel htmlFor="r">Name</FieldLabel>
        </FieldContent>
        <input id="r" />
      </Field>,
    )
    const cls = container.querySelector<HTMLElement>('[data-slot="field"]')!.className
    expect(cls).toContain("[&>*:not([data-slot=toggle-group])]:w-full")
    expect(cls).toContain("@md/field-group:[&>*:not([data-slot=toggle-group])]:w-auto")
    expect(cls).not.toMatch(/(^|\s)@md\/field-group:\[&>\*\]:w-auto/)
  })
})
