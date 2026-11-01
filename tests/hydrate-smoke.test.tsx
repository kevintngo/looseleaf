import { describe, expect, test } from "vitest"

import { examples, smokeSlug, uiComponents } from "./_glob"
import { hydrationProblems } from "./_hydrate-lib"
import { checkSource, formatProblems, smokeUiModule } from "./_ssr-lib"

const skip = process.env.HYDRATE_SMOKE === "0"

describe.skipIf(skip)("hydration smoke", () => {
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
        if (checkSource(await item.source()).length) return
        const problems = await hydrationProblems(item.load)
        expect(problems, `${item.path}${formatProblems(problems)}`).toEqual([])
      })
    })

  if (uiComponents.length)
    describe("ui components", () => {
      test.each(uiComponents.map((u) => [u.path.replace("/src/components/ui/", ""), u] as const))("%s", async (_name, item) => {
        if (checkSource(await item.source()).length) return
        const { rendered } = await smokeUiModule(item)
        const problems = []
        for (const name of rendered) {
          const found = await hydrationProblems(async () => ({ default: (await item.load())[name] }))
          problems.push(...found.map((p) => ({ ...p, message: `<${name}/> ${p.message}` })))
        }
        expect(problems, `${item.path}${formatProblems(problems)}`).toEqual([])
      })
    })
})
