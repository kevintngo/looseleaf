import type { ExampleMeta } from "@/docs/types"

export const meta: ExampleMeta = { title: "Default card" }

export default function Example() {
  return <div data-testid="card-example">A card</div>
}
