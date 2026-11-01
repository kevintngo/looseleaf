import * as React from "react"
import { waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { renderUI } from "./helpers"

function Demo({ root }: { root?: Partial<React.ComponentProps<typeof Carousel>> }) {
  return (
    <Carousel aria-label="Notes" {...root}>
      <CarouselContent>
        {[1, 2, 3, 4, 5].map((i) => (
          <CarouselItem key={i}>Slide {i}</CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

describe("Carousel on the real Embla", () => {
  it("hands over an API bound to our five slides", async () => {
    let api: CarouselApi
    renderUI(<Demo root={{ setApi: (a) => (api = a) }} />)
    await waitFor(() => expect(api).toBeTruthy())
    expect(api!.slideNodes()).toHaveLength(5)
    expect(api!.containerNode().dataset.slot).toBeUndefined()
    expect(api!.rootNode().getAttribute("data-slot")).toBe("carousel-content")
    expect(typeof api!.scrollNext).toBe("function")
  })

  it("the horizontal axis is x, the vertical one y, and user options pass through", async () => {
    const axes: string[] = []
    for (const orientation of ["horizontal", "vertical"] as const) {
      let api: CarouselApi
      const { unmount } = renderUI(<Demo root={{ orientation, setApi: (a) => (api = a), opts: { loop: true, dragFree: true } }} />)
      await waitFor(() => expect(api).toBeTruthy())
      const o = api!.internalEngine().options
      axes.push(o.axis)
      expect(o.loop).toBe(true)
      expect(o.dragFree).toBe(true)
      unmount()
    }
    expect(axes).toEqual(["x", "y"])
  })
})
