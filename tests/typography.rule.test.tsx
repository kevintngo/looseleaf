import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { H1, H2 } from "@/components/ui/typography"

describe("heading rules", () => {
  it("draws a straight ruled line under H1 and H2, and rule={false} turns it off", () => {
    const { getByText } = render(
      <>
        <H1>Title</H1>
        <H2>Section</H2>
        <H2 rule={false}>Plain</H2>
      </>,
    )
    expect(getByText("Title").className).toContain("after:h-[2px]")
    expect(getByText("Section").className).toContain("after:h-[2px]")
    expect(getByText("Plain").className).not.toContain("after:h-[2px]")
    expect(getByText("Section").className).not.toContain("mask-image")
  })
})
