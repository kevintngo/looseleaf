import type { ExampleMeta } from "@/docs/types"

export const meta: ExampleMeta = { title: "Crashing example", layout: "full" }

export default function Example(): never {
  throw new Error("boom from example")
}
