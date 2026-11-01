import * as React from "react"

import { Button } from "@/components/ui/button"
import { Polaroid, PolaroidCaption, PolaroidImage } from "@/components/ui/polaroid"

export const meta = {
  title: "Developing",
  description: "`develop` starts the picture milky and clears it. Change the key and it happens again; with reduced motion the picture is just there.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  const [n, setN] = React.useState(0)
  return (
    <div className="flex flex-col items-center gap-8 p-4">
      <Polaroid key={n} seed="dev" tape="top">
        <PolaroidImage scene="sea" develop seed="dev-img" />
        <PolaroidCaption>wait for it</PolaroidCaption>
      </Polaroid>
      <Button variant="secondary" onClick={() => setN((v) => v + 1)}>
        Take another
      </Button>
    </div>
  )
}
