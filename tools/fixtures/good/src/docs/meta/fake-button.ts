import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "fake-button",
  title: "Fake button",
  category: "Actions",
  description: "A fixture button used to prove the QA tooling.",
  parts: [{ name: "FakeButton" }],
  usage: `import { FakeButton } from "@/components/ui/fake-button"

<FakeButton>Save</FakeButton>`,
} satisfies ComponentDoc
