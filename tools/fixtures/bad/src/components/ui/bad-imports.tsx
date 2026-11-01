import * as React from "react"
import { describe } from "vitest"
import { thing } from "not-a-dependency"
import { helper } from "./helper"
import { Check } from "lucide-react"

export function BadImports(props: React.ComponentProps<"div">) {
  void describe
  void thing
  void helper
  void Check
  return <div data-slot="bad-imports" {...props} />
}
