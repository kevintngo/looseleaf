import { describe, expect, test } from "vitest"

import { examples, smokeSlug, uiComponents } from "./_glob"
import { formatProblems, smokeExample, smokeUiModule } from "./_ssr-lib"

describe("ssr smoke", () => {
  if (!examples.length && !uiComponents.length) {
    test(smokeSlug ? `no docs examples or ui file for "${smokeSlug}"` : "empty tree: no docs examples or ui components yet", () => {
      expect(examples).toHaveLength(0)
      expect(uiComponents).toHaveLength(0)
    })
    return
  }

  if (examples.length)
    describe("docs examples", () => {
      test.each(examples.map((e) => [e.path.replace("/src/docs/examples/", ""), e] as const))("%s", async (_name, item) => {
        const problems = await smokeExample(item)
        expect(problems, `${item.path}${formatProblems(problems)}`).toEqual([])
      })
    })

  if (uiComponents.length)
    describe("ui components", () => {
      test.each(uiComponents.map((u) => [u.path.replace("/src/components/ui/", ""), u] as const))("%s", async (_name, item) => {
        const { problems } = await smokeUiModule(item)
        expect(problems, `${item.path}${formatProblems(problems)}`).toEqual([])
      })
    })
})
