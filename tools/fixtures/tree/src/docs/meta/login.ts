import type { ComponentDoc } from "../types"

export default {
  slug: "login",
  title: "Login slip",
  category: "Forms",
  description: "A sign-in card with an email field and a button, ready to drop on a page.",
  parts: [{ name: "LoginBlock" }],
  usage: `import { LoginBlock } from "@/components/blocks/login"\n\n<LoginBlock onSubmit={(email) => signIn(email)} />`,
} satisfies ComponentDoc
