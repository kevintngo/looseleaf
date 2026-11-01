import { describe, expect, it } from "vitest"
import {
  DEFAULT_REGISTRY_URL,
  addCommand,
  componentsJsonSnippet,
  inferDependencies,
  initCommand,
  packageName,
  packagesCommand,
  registerNamespaceCommand,
  registryBase,
  registryInfo,
  registryItemName,
  shadcnRunner,
} from "@/docs/core/install"

describe("commands", () => {
  it("uses each package manager's runner", () => {
    expect(shadcnRunner("npm")).toBe("npx shadcn@latest")
    expect(shadcnRunner("pnpm")).toBe("pnpm dlx shadcn@latest")
    expect(shadcnRunner("yarn")).toBe("yarn dlx shadcn@latest")
    expect(shadcnRunner("bun")).toBe("bunx --bun shadcn@latest")
  })

  it("builds namespace and URL add commands", () => {
    expect(addCommand("npm", "button")).toBe("npx shadcn@latest add @looseleaf/button")
    expect(addCommand("pnpm", "button", "url", "https://x.dev/r")).toBe("pnpm dlx shadcn@latest add https://x.dev/r/button.json")
    expect(initCommand("bun")).toBe("bunx --bun shadcn@latest init")
  })

  it("matches the registry README for namespace registration", () => {
    expect(registerNamespaceCommand("npm", "https://looseleaf.example/r")).toBe(
      'npx shadcn@latest registry add "@looseleaf=https://looseleaf.example/r/{name}.json"',
    )
    expect(JSON.parse(componentsJsonSnippet("https://looseleaf.example/r"))).toEqual({
      registries: { "@looseleaf": "https://looseleaf.example/r/{name}.json" },
    })
  })

  it("installs packages per manager", () => {
    expect(packagesCommand("npm", ["a", "b"])).toBe("npm install a b")
    expect(packagesCommand("pnpm", ["a"])).toBe("pnpm add a")
    expect(packagesCommand("yarn", ["a"])).toBe("yarn add a")
    expect(packagesCommand("bun", ["a"])).toBe("bun add a")
  })

  it("reads the registry URL from VITE_REGISTRY_URL and strips trailing slashes", () => {
    expect(registryBase({})).toBe(DEFAULT_REGISTRY_URL)
    expect(registryBase({ VITE_REGISTRY_URL: "https://acme.dev/r///" })).toBe("https://acme.dev/r")
    expect(registryBase({ VITE_REGISTRY_URL: "" })).toBe(DEFAULT_REGISTRY_URL)
  })
})

describe("inferDependencies", () => {
  const source = `"use client"
import * as React from "react"
import { Slot } from "radix-ui"
import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Ink } from "@/lib/ink"
import { seed } from "@/lib/ink/rng"
import { useSeed } from "@/hooks/use-seed"
import { Button } from "@/components/ui/button"
import { Dialog as D } from "@/components/ui/dialog"
import "@fontsource/kalam"
import { thing } from "@scope/pkg/sub/path"
import { x } from "./local"
import fs from "node:fs"
// import { nope } from "not-imported"
/* import { nope2 } from "also-not" */
const lazy = () => import("recharts")
export { y } from "date-fns"
const url = "https://example.com/import"
`

  it("splits npm packages from registry items", () => {
    const { dependencies, registryDependencies } = inferDependencies(source)
    expect(dependencies).toEqual(["@fontsource/kalam", "@scope/pkg", "class-variance-authority", "date-fns", "radix-ui", "recharts"])
    expect(registryDependencies).toEqual(["button", "dialog", "ink", "use-seed"])
  })

  it("reads an art kind as its own item next to ink, and files at the top of art/ as ink", () => {
    const art = `import { icons } from "@/lib/ink/art/icons"
import type { ArtDef } from "@/lib/ink/art/types"
import { poses } from "@/lib/ink/art/mascots/poses"
import { paintKind } from "@/lib/ink/recipes/button-ink"
const scenes = () => import("@/lib/ink/art/scenes")
`
    expect(inferDependencies(art).registryDependencies).toEqual(["ink", "ink-icons", "ink-mascots", "ink-scenes"])
  })

  it("handles multi-line imports and empty files", () => {
    expect(inferDependencies('import {\n  a,\n  b,\n} from "zod"\n').dependencies).toEqual(["zod"])
    expect(inferDependencies("")).toEqual({ dependencies: [], registryDependencies: [] })
  })

  it("names packages", () => {
    expect(packageName("radix-ui/internal")).toBe("radix-ui")
    expect(packageName("@radix-ui/react-slot/dist")).toBe("@radix-ui/react-slot")
  })
})

describe("registryInfo", () => {
  const registry = JSON.stringify({
    items: [
      {
        name: "button",
        dependencies: ["radix-ui"],
        registryDependencies: ["https://looseleaf.example/r/ink.json", "@looseleaf/looseleaf-theme", "card"],
        files: [{ path: "src/components/ui/button.tsx" }, { nope: 1 }],
      },
    ],
  })

  it("reads one item and normalizes dependency references to names", () => {
    expect(registryInfo(registry, "button")).toEqual({
      dependencies: ["radix-ui"],
      registryDependencies: ["ink", "looseleaf-theme", "card"],
      files: ["src/components/ui/button.tsx"],
    })
  })

  it("returns null for unknown items and bad JSON", () => {
    expect(registryInfo(registry, "card")).toBeNull()
    expect(registryInfo("{not json", "button")).toBeNull()
    expect(registryInfo("{}", "button")).toBeNull()
  })

  it("strips URL and extension from item references", () => {
    expect(registryItemName("https://x/r/dialog.json")).toBe("dialog")
    expect(registryItemName("@looseleaf/dialog")).toBe("dialog")
    expect(registryItemName("dialog")).toBe("dialog")
  })
})
