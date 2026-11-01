import * as React from "react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { Field, FieldLabel } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(200, 36)
})
afterEach(() => restore())

describe("Field and ToggleGroup", () => {
  it("leaves a ToggleGroup at the width of its buttons, in the vertical and the responsive Field", () => {
    const { container } = renderUI(
      <>
        <Field>
          <FieldLabel id="a">Reading direction</FieldLabel>
          <ToggleGroup type="single" variant="outline" aria-labelledby="a">
            <ToggleGroupItem value="ltr">Left to right</ToggleGroupItem>
            <ToggleGroupItem value="rtl">Right to left</ToggleGroupItem>
          </ToggleGroup>
        </Field>
        <Field orientation="responsive">
          <FieldLabel id="b">Paper</FieldLabel>
          <ToggleGroup type="single" aria-labelledby="b">
            <ToggleGroupItem value="plain">Plain</ToggleGroupItem>
          </ToggleGroup>
        </Field>
      </>,
    )
    const fields = Array.from(container.querySelectorAll<HTMLElement>('[data-slot="field"]'))
    expect(fields).toHaveLength(2)
    for (const f of fields) {
      expect(f.className).toContain("[&>*:not([data-slot=toggle-group])]:w-full")
      expect(f.className).not.toMatch(/(^|\s)\[&>\*\]:w-full/)
      expect(f.querySelector('[data-slot="toggle-group"]')).not.toBeNull()
    }
  })

  it("still stretches the other children of a vertical Field", () => {
    const { container } = renderUI(
      <Field>
        <FieldLabel>Name</FieldLabel>
        <input aria-label="Name" />
      </Field>,
    )
    expect(container.querySelector<HTMLElement>('[data-slot="field"]')!.className).toContain("w-full")
  })
})
