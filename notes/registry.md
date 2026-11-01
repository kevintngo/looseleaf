# Looseleaf registry pipeline

`src/` -> `registry.json` -> `shadcn build` -> `public/r/*.json`. Everything is derived from the source tree; nobody edits
`registry.json` or `public/r/` by hand. Verified against shadcn CLI **4.21.0**, Tailwind **4.3.3**, Node 24, no browser, no network.

| command | what it does |
|---|---|
| `npm run registry:build` | scan, write `registry.json`, run `shadcn build`, patch, validate. Fails (exit 1) before writing anything if the tree is inconsistent. |
| `npm run registry:check` | same, but writes only into `lookdev/_tmp` (removed afterwards). Reports a stale `registry.json` / `public/r` as a note (`--fail-stale` makes it an error). |
| `node tools/registry-build.mjs --explain button` | dry run, then print what `shadcn add button` installs: files, items, npm packages, css. Use it to see what an import costs. |
| `node tools/registry-build.mjs --list` (`npm run registry:list`) | dry run, then one table row per item: type, files, source KB, npm packages, registry dependencies. The quickest way to see how the tree was split. |
| `node tools/registry-build.mjs --check --no-build` | scan only (no `shadcn build`, ~0.2 s on the real tree): what step "registry" of `node tools/qa.mjs <slug>` runs. |
| `npm run registry:test` | consumer install test (below). ~1 min, 305 checks on the fixture tree. `--stable-directives`, `--only A,B`, `--keep`, `--root <tree>`, `--real-css`, `-v`. |
| `npm run registry:test:real` | the same against the real tree (`--root .`): 215 items installed into nine consumers, 1317 checks, ~2-3 min, one heavy slot. `npm run registry:smoke` runs only scenario I (three items, stock Vite typecheck, Tailwind build), ~1.5 min. |
| `npm run registry:selftest` | unit / negative tests of the tooling itself (`node --test`, 28 tests, ~6 s). |
| `node tools/registry-build.mjs --pins on\|off` | `on` (default) writes the five API-sensitive packages as `zod@^4`; `off` writes bare names (see "Pinned dependency ranges"). |
| `node tools/registry-build.mjs --refresh-schema` | re-download the two JSON schemas into `tools/schema/` (needs network; the schemas are otherwise vendored). |

All of them take the machine-wide heavy slot for the `shadcn build` / test part, and do not deadlock when started via
`node tools/heavy.mjs -- …` or from inside `node tools/qa.mjs` (children of a slot holder run with `LOOSELEAF_HEAVY_HELD=1`). `--root <dir>` points any of them at another tree (the tests use `tools/fixtures/tree`).
An empty, missing or half-written tree produces fewer items, never a crash.

## What becomes which item

| source | item name | type | installed to (via `files[].target`) |
|---|---|---|---|
| `src/components/ui/<slug>.tsx` | `<slug>` | `registry:ui` | `@ui/<slug>.tsx` (the consumer's `aliases.ui`) |
| `src/lib/ink/recipes/<slug>-ink.ts` (or `<slug>-ink/**`) when `ui/<slug>.tsx` exists | **the ui item `<slug>`** (file type `registry:lib`) | | `@lib/ink/recipes/<slug>-ink.ts` |
| `src/lib/ink/art/<kind>/**` (barrel included) | `ink-<kind>`: `ink-icons`, `ink-doodles`, `ink-stickers`, `ink-mascots`, `ink-props`, `ink-scenes` | `registry:lib` | `@lib/ink/art/<kind>/…` |
| `src/lib/ink/art/*.ts` (`types`, `dsl`, `glyphs`, `glyph-text`, `rubber-stamp`, `badge-gen`) and `art-draw.ts` | `ink-art` (the art renderer) | `registry:lib` | `@lib/ink/art/…`, `@lib/ink/art-draw.ts` |
| `src/lib/ink/paper/**`, `recipes/paper-set-ink.ts` | `ink-paper` | `registry:lib` | `@lib/ink/paper/…` |
| `src/lib/ink/recipes/*` that no component owns (shared: field frames, draw-on, pencil tiles, …) | `ink-recipes` | `registry:lib` | `@lib/ink/recipes/…` |
| `src/lib/ink/charts/**` | the ui item `chart` (file type `registry:lib`) | | `@lib/ink/charts/…` |
| `src/lib/ink/typography-tiles.generated.ts` | the ui item `typography` | | `@lib/ink/typography-tiles.generated.ts` |
| `src/lib/ink/textures.generated.ts` | `ink-grain-textures` | `registry:lib` | `@lib/ink/textures.generated.ts` |
| `src/lib/ink/textures-paper.generated.ts` | `ink-paper-textures` | `registry:lib` | `@lib/ink/textures-paper.generated.ts` |
| the rest of `src/lib/ink/**` (the core: pens, shapes, fills, builder, geom, rng, `react/`, `textures.ts`, `recipes/index.ts`) | `ink` | `registry:lib` | `@lib/ink/<same relative path>` |
| `src/lib/<dir>/**` (any other directory) | `<dir>` | `registry:lib` | `@lib/<dir>/<same relative path>` |
| `src/lib/<name>.ts` (not `utils`) | `<name>` | `registry:lib` | `@lib/<name>.ts` |
| `src/lib/utils.ts` | `utils` | `registry:lib` | `@lib/utils.ts` |
| `src/hooks/use-*.ts(x)` | `use-…` | `registry:hook` | `@hooks/use-….ts` |
| `src/blocks/<name>/**` | `<name>` | `registry:block` (files are `registry:component`) | `@components/blocks/<name>/<rel>` |
| `src/styles/looseleaf.css` | `looseleaf-theme` | `registry:theme` | merged into the consumer's Tailwind CSS file |
| the four fonts | `font-kalam`, `font-caveat`, `font-special-elite`, `font-ibm-plex-mono` | `registry:font` | CSS variables `--font-hand`, `--font-script`, `--font-type`, `--font-mono` |
| umbrella | `looseleaf` | `registry:style`, `extends: none` | theme + ink + every ink-* + every lib + every hook + every ui component |
| umbrella | `looseleaf-blocks` | `registry:block` | every block (kept out of `looseleaf` on purpose; the built-registry validation fails if one is missing) |

The file layout of the split is one table in `tools/registry/layout.mjs` (`ownerOfLibFile`); everything else about an item is read from the code.

### Item layout (why it looks like this)

`ink` used to be one 583 KB / 59 file item that every component dragged along (`ink.json` 605 KB, past the 400 KB warning). It is split by who
imports what (the scanner reads the imports, `tools/registry/layout.mjs` only says which file belongs where, and a circle is a build error):

| item | KB | files | what | imported by |
|---|---|---|---|---|
| `ink` (core) | 195 | 22 | pens, shapes, fills, builder, geom, rng, `react/` (hooks, provider), `textures.ts`, `recipes/index.ts` | everything drawn |
| `ink-recipes` | 34 | 10 | shared recipes: field frame, select frame, draw-on, reveal nib, pencil tiles, margin bracket, mark reveal, overlay, text marks, field error | the components that use one |
| `ink-paper` | 98 | 10 | `paper/` (stocks, edges, faces, props, shadows, sheet layers) and the paper-set recipe | Paper, Card, Tape, the paper objects, popover, tooltip … |
| `ink-art` | 133 | 7 | the art renderer: DSL + types, `drawSkeleton` (`art-draw`), the lettering glyph font, rubber stamps, badges | Icon, Doodle, Sticker, Stamp, Mascot, Label, Seal, Spinner; every `ink-<kind>` |
| `ink-icons` `-doodles` `-stickers` `-mascots` `-props` `-scenes` | 100 / 61 / 258 / 66 / 0.3 / 41 | | the art data, one item per `art/<kind>/` | `icon`, `doodle`, `sticker`, `mascot`, `empty`, `stamp` … |
| `ink-grain-textures`, `ink-paper-textures` | 92 / 177 | 1 each | baked bitmaps (base64) | `ink` (`textures.ts` imports both statically) |
| `chart` (ui) | 241 | 15 | also carries `lib/ink/charts/**` (the geometry, ~90 KB) | |
| `typography` (ui) | 39 | 2 | also carries `typography-tiles.generated.ts` | |

Measured with `--explain`: `shadcn add button` writes **26 files / 483 KB of source** (it was 37 files / ~870 KB); `input` 37 files, `dialog` 50, `icon` 45
(it needs the art renderer and the icon set), `login-01` 103 files / 1.0 MB, `sidebar-01` 121 files / 1.2 MB, everything (`looseleaf`) 326 files / 2.9 MB.
The largest built JSON is now `ink-stickers` (262 KB); nothing is over the 400 KB warning.

* **Art is opt-in.** 160 icons + 88 stickers + a mascot are ~250 KB of skeleton data; a user who installs `button` gets the engine and the `button` item, not the sticker book. Dependencies are inferred from imports, so `icon` → `ink-icons` + `ink-art` (`@/lib/ink/art/icons`, `@/lib/ink/art-draw`), `sticker` → `ink-stickers`, `empty` → `ink-mascots` + `ink-scenes` (also through `import("@/lib/ink/art/scenes")` and `typeof import(…)`). Every art kit depends on `ink-art` (they import their types from `art/types.ts`) and, through it, on `ink`; `ink` never imports an art kind or `ink-art` (a cycle is a build error: "lib items depend on each other in a circle").
* **Why `ink-art` and not the audit's `ink-lettering`.** The audit proposed `ink-lettering` (glyphs, lettering, dsl). `art-draw.ts` imports the lettering glyphs and `art/types.ts` imports the DSL, and both are needed by every art kit, so anything smaller than "the whole renderer" would make a circle. `ink-art` is that renderer.
* **A component brings its recipe.** `recipes/button-ink.ts` is part of the `button` item: `shadcn add button` writes `ui/button.tsx` and `lib/ink/recipes/button-ink.ts` (verified by the consumer test in every alias layout). The recipe imports `@/lib/ink…`, so `button` depends on `ink` through either file. A recipe that is shared (`recipes/field-frame-ink.ts` used by input, select and textarea) or has no component of its own ships in **`ink-recipes`**; if a *component's* recipe is imported by another component, the second component depends on the first (the scanner follows the import: correct, but heavy, so name shared recipes after the shared thing). The bare `recipes/<slug>.ts` is still assigned to the component, and then refused by the CLI check below. The engine never depends on a component: `ink` (or any lib item) importing a ui item is a build error.
* **Geometry that one component owns travels with it.** `lib/ink/charts/**` is imported only by `chart` and its recipes, `typography-tiles.generated.ts` only by `typography`: both ship inside those ui items (file type `registry:lib`, target `@lib/ink/…`), like a recipe. Without the component (a tree with no `ui/chart.tsx`) they fall back to `ink`.
* **Baked bitmaps are their own items** (`ink-grain-textures` 92 KB, `ink-paper-textures` 177 KB of base64): no item JSON crosses the 400 KB warning line and `--list` shows what the bitmaps cost. `textures.ts` imports both statically, so `ink` depends on them; they are not optional at install time. A bundler still drops the tiles an app never draws (measured in notes/textures.md), so the cost is source size, not bundle size. Making `ink-paper-textures` truly optional (a button install would shed 177 KB) needs `textures.ts` to load it lazily or through a registration call: a change for the textures owner, not the registry.
* **The umbrella is complete.** `looseleaf` lists the theme, every lib item (`ink`, `ink-*`), every hook and every ui component; `looseleaf-blocks` lists every block. The built-registry validation fails if either closure misses an item.
* **A shared kit of blocks is a block.** `src/blocks/<name>/` is always an item, so a helper folder shared by several blocks (`sidebar-shared`) is a kebab-case block with its own preview and `BlockDoc`; a `_shared` folder is refused with that explanation (the docs hide `_` files in `src/docs/content/blocks`, but the registry cannot ship a folder nobody can name).

### The shadcn CLI re-resolves imports by base name (why recipes are `<slug>-ink.ts`)

When it writes files, the shadcn CLI 4.21 rewrites each `@/…` import against the files it is installing: candidates are the exact file plus **every planned file with the same base name**, ordered by extension (`.tsx` before `.ts`) before nearness. Consequences, all measured with the real CLI:

* `import { buttonRecipe } from "@/lib/ink/recipes/button"` next to `ui/button.tsx` was rewritten to `"@/components/ui/button"`. Hence `recipes/<slug>-ink.ts`.
* `import … from "@/lib/ink"` (the barrel `index.ts`) becomes `"@/lib/ink/react/ink"` when a `react/ink.tsx` is installed too. Hence `react/ink-layer.tsx`.
* An art directory barrel `@/lib/ink/art/mascot` (`index.ts`) would be rewritten to a ui component `mascot.tsx`.

`scan.mjs` emulates the pick for every alias import (against all files of the registry, a superset of any install) and fails the build with `the shadcn CLI re-resolves "@/lib/ink/recipes/card" to "@/components/ui/card"`; `lint-house` (`file-name`) says the same earlier for recipes and art directories. Consumer-test scenario H reproduces the rewrite with the real CLI on a deliberately mis-named tree; if a future CLI stops doing it, that scenario prints a note and the naming rule and the scanner check can be relaxed.

Names must be kebab-case (they become URLs); `looseleaf`, `looseleaf-theme`, `looseleaf-blocks`, `utils`, `registry` are reserved.
`@ui/`, `@lib/`, `@hooks/`, `@components/` are the CLI's target placeholders: they resolve through the consumer's
`components.json` aliases, so files land right even when `aliases.ui` is `@/ui/paper` and `aliases.lib` is `@/shared/lib`
(tested). `--no-targets` drops them for a very old CLI, which then falls back to matching path segments.

### Dependencies are read from the code, not written by hand

Every code file is parsed with `@babel/parser` (static, dynamic, `export … from`, `require`, `import()` types; JSX-safe;
a line-anchored regex fallback exists and is cross-checked against ts-morph on ~70 real shadcn files).

* `@/components/ui/<slug>[/…]` -> `registryDependencies` on `<slug>`; `@/lib/<dir>[/…]` -> `<dir>` (`@/lib/ink/paper/stocks` -> `ink-paper`, `@/lib/ink/art-draw` -> `ink-art`, `@/lib/ink/art/icons` -> `ink-icons`, `@/lib/ink/recipes/<slug>-ink` -> the item `<slug>` itself, `@/lib/ink/recipes/field-frame-ink` -> `ink-recipes`, anything else under `@/lib/ink` -> `ink`);
  `@/hooks/<name>` -> that hook; `@/blocks/<n>/…` -> that block. `@/lib/utils` is never a dependency (see below).
* every ui and block item also depends on `looseleaf-theme` (`--theme-dep none` turns that off).
* bare imports -> `dependencies`, as package names (`radix-ui/internal` -> `radix-ui`; never `react`, `react-dom`, node built-ins).
  Each must be a **runtime** dependency in `package.json` (undeclared, or only a devDependency, stops the build). Versions are not written,
  except for the five packages listed in "Pinned dependency ranges" below.
* `@import "pkg"` / `@plugin "pkg"` in the stylesheet -> `devDependencies` (like the official `tw-animate-css`); fontsource -> `dependencies`.
* a relative import must stay inside its own item; reaching into another item's files is an error ("use the @/ alias").
* `@/docs`, `@/styles`, `@/tests`, `@/assets`, `@/registry/…` and anything unresolvable is an error, with the file and specifier.
* code inside blocks may import its siblings as `@/blocks/<name>/x`; the built JSON is rewritten to `@/components/blocks/<name>/x`
  so the CLI's alias rewriting then follows the consumer's `components` alias (tested with `@/ui`).

`registryDependencies` are **URLs by default** (`https://…/r/button.json`). Bare names would be looked up in the *official* shadcn
registry, and `@looseleaf/button` only works if the consumer registered the namespace. URLs work for `shadcn add https://…/r/x.json`
and for `@looseleaf/x` alike. `--deps namespace` (`@looseleaf/button`) and `--deps name` exist; namespace mode is tested.

Base URL, highest first: `--url`, `VITE_REGISTRY_URL` in the environment, `VITE_REGISTRY_URL` in `.env.local` / `.env`, else `https://looseleaf.example/r`.
`homepage` in `registry.json` is that URL without the trailing `/r`. `looseleaf.example` is a placeholder: set the real host before publishing.

### Pinned dependency ranges (`zod@^4`)

The CLI skips a bare package name the project already declares, so a project on zod 3 (still the majority of existing shadcn apps) that installs
`login-01` gets the block and a crash at import (`z.email is not a function`: the schemas are built at module scope). A name with a version
(`zod@^4`) is never recognised as "already installed", so the CLI asks the package manager for it on every add (a no-op when the range is met) and
a project on the wrong major is upgraded, which is the honest outcome: the item cannot work otherwise. `DEFAULT_PINS` in `tools/registry/config.mjs` holds the table:

| package | range | why |
|---|---|---|
| `zod` | `^4` | `z.email()` / `z.url()` (all form blocks, `settings-*`, `checkout-01`) exist only in zod 4 |
| `@hookform/resolvers` | `^5` | v5 is the first to read zod 4 schemas |
| `react-hook-form` | `^7` | `Controller` / `useFormState` as `form.tsx` uses them; resolvers 5 wants >= 7.55 |
| `react-day-picker` | `^10` | `calendar.tsx`, `date-picker.tsx` and the calendar blocks are written and tested against the v10 typings |
| `react-resizable-panels` | `^4` | `resizable.tsx` uses `Group` / `Separator` / `useDefaultLayout` / `useGroupRef` (v3 is `PanelGroup` / `PanelResizeHandle`) |

Only items that import a pinned package carry the pin (`button` stays bare). The scanner fails when `package.json` declares a different major than the pin,
`validate.mjs` compares bare names, block `docs` print `Needs zod@^4, …` after the install, and `--pins off` (or `LOOSELEAF_PINS=off`) writes bare names again.
Everything else stays bare on purpose (radix-ui, cva, cmdk, sonner, vaul, embla, input-otp, date-fns): their majors have been stable across the versions users have,
and each pin costs a package-manager call per add. Adding a package means a line in the table, a reason in the comment, and a fixture that imports it.

### `utils`

A project set up by `shadcn init` already has `lib/utils.ts` (today the official `utils` item is `export { cn } from "cn"`; older
projects have clsx + tailwind-merge). Our components import `cn` from `@/lib/utils`, so they do **not** depend on the `utils`
item: installing it over a project's own file would prompt to overwrite it. The `utils` item (clsx + tailwind-merge, same as
`src/lib/utils.ts`) exists for projects that skipped init; installing it into a project without `lib/utils.ts` is tested.

### `docs`

Printed after install, and concatenated across every item of an install, so it is used sparingly: the `looseleaf` umbrella
(setup notes) and each block (where it landed, the import that works, the pinned packages it needs). Per-component usage is in `meta.usage` of each item
(for `shadcn view`, MCP and search), not in `docs`, so `add looseleaf` does not print 60 snippets.

A block has no index file, its entry is `page.tsx` (default export), so the generated line is
`Import it: import Login01Page from "<your components alias>/blocks/login-01/page"` (a barrel block with `index.tsx` prints `…/blocks/<name>`, a kit of shared parts such as
`sidebar-shared` prints just where it landed). A `usage` string in the block's meta (`src/docs/meta/<name>.ts`, or `BlockDoc.usage` once the docs type allows it) replaces the import line.

## How authors influence the output

Per component, `src/docs/meta/<slug>.ts` (`export default { … } satisfies ComponentDoc`). It is **read statically** (Babel AST;
literals, template strings, `+`, spreads and top-level `const` references; nothing is executed). Properties that are not
literals are skipped. **Blocks** also read the docs shell's own `src/docs/content/blocks/<name>.meta.ts` (`BlockDoc`: `title`, `description`, `tags`), which wins for
those fields (`tags` become `meta.tags`); `src/docs/meta/<name>.ts` is still read for `usage`, `parts`, … and either file alone is enough. The `ink-*` and texture items have built-in
titles and descriptions (`layout.mjs`); a `src/docs/meta/<item>.ts` overrides them.

| meta field | registry field |
|---|---|
| `title` | `title` (default: Title Case of the slug) |
| `description` | `description` (default: "<Title> from Looseleaf.") |
| `category` | `categories: [category]` (blocks: see below) |
| `status`, `upstream`, `related`, `a11y`, `usage` | `meta.*` |
| `parts[].name` | `meta.parts` (and every listed part must be exported by the file, else a warning) |
| `slug` | must equal the file name (warning) |

**Block categories.** A `BlockDoc` has no category, so `blockCategory()` in `layout.mjs` derives one (a `category` in either meta file wins): `authentication` (login, signup, forgot/reset password, otp), `sidebar`,
`dashboard`, `settings`, `commerce` (checkout), `feedback` (tags `empty state` / `error`), `marketing` (tag), else `app` (inbox, chat, notes, kanban, planner, files, profile). Today: 13 / 17 / 3 / 4 / 1 / 4 / 12 / 7.

Everything else comes from the code: add an import and the registry dependency follows; delete it and it goes.
Warnings, not errors: missing meta files (one aggregated line), unknown files, `hooks` not named `use-*`, `ui/` sub-folders.

## The stylesheet

`src/styles/looseleaf.css` (a normal Tailwind v4 entry file) is converted to the item fields the CLI merges into the consumer's CSS:

| in `looseleaf.css` | becomes |
|---|---|
| `@theme` / `@theme inline { --x: … }` | `cssVars.theme` (the CLI puts them in `@theme inline`; `@keyframes` inside are lifted out) |
| `:root { --c: <colour> }`, `.dark { … }` (also inside `@layer base`) | `cssVars.light` / `cssVars.dark`; a colour is a literal colour **or a `var()` chain that ends in one**; `--radius` counts too |
| every other `:root` / `.dark` declaration (shadows, lengths, urls, rgb triplets, `color-scheme`, …) | `css[":root"]`, `css[".dark"]` |
| rules, `@layer …`, `@media`, `@supports`, `@container` | `css`, with nesting flattened (`&:hover`, `.dark &`, nested `@media`) |
| `@utility`, `@keyframes`, `@custom-variant x (…)`, `@plugin` | `css["@utility …"]` etc. |
| `@import "tw-animate-css"` | `css` + `devDependencies` |
| `@import "tailwindcss"`, `@import "./fonts.css"`, `@source`, `@config` | dropped (the consumer has Tailwind; local files are not shipped) |
| `--font-hand/-script/-type/-mono` in `@theme` | become the `family` of the font items instead |
| `@font-face`, `@property`, `--x-*: initial` | dropped with a warning (see quirks) |
| `@variant …` / `@custom-variant …{ }` nested in a rule | build error: write the selector out |

What a consumer gets, in CLI terms (all verified with real installs):

* Installing a **component** (or hook, block): colour tokens the project already has are **kept**; missing ones are added.
  Non-colour Looseleaf tokens in `css` are always written (a re-add resets them).
* Installing **`looseleaf`** (registry:style) or **`looseleaf-theme`** (registry:theme): colour tokens are **overwritten** with the
  Looseleaf palette. The CLI asks for confirmation (`-y` skips it).
* Installing twice changes nothing (byte-identical files and CSS).
* The merged CSS compiles under Tailwind 4.3 and, for every class the theme can generate, produces the same rules (after
  flattening nesting with lightningcss) as compiling `looseleaf.css` itself, and the same `:root` / `.dark` custom properties.

### Fonts

Each font is a `registry:font` item with the Google provider metadata (`import`: `Kalam`, `Caveat`, `Special_Elite`,
`IBM_Plex_Mono`, `weight`, `subsets`, `variable`) and `dependency: @fontsource/…`.
* Vite / other frameworks: the CLI adds `@import "@fontsource/kalam"` and `--font-hand: <family>` to `@theme inline`. It only
  imports weight 400, so the item's `css` adds the other weights (`@import "@fontsource/kalam/700.css"`).
* Next.js: it edits `app/layout.tsx` (`Kalam({ subsets, weight, variable: '--font-hand' })`, `className={cn(kalamHand.variable, …)}`)
  and points `--font-hand` at `var(--font-hand)` (tested with a Next-shaped project). The extra weight imports still land in the
  CSS, so a Next project carries a few unused `@font-face` rules.
* `--font-mono` is a "root" font variable: unmodified, the CLI would put `font-mono` on `<html>` and turn the page monospaced.
  The mono item sets `selector: "code, kbd, samp, pre"`, so `@apply font-mono` goes there only.
* The family string is taken from `looseleaf.css` when it defines the variable (docs app and registry agree), else a built-in default. The **weights** come from the
`@import "@fontsource/<pkg>[/<weight>.css]"` lines of `src/styles/*.css` (`fonts.css`, so the registry ships exactly what the docs app loads: Kalam 400/700, Caveat 400/500/600/700,
Special Elite 400, IBM Plex Mono 400/500); `FONT_TABLE` in `tools/registry/fonts.mjs` holds the same numbers as the fallback (a self-test keeps the two equal).

## Consumer test (`npm run registry:test`)

Offline, no browser, and it cleans up after itself (kept on failure; `--keep` / `--clean`). It builds the fixtures twice
(deps by URL, deps by namespace), serves them from `node:http` on 127.0.0.1, creates consumers under `lookdev/_tmp/consumer-<n>`,
and runs the **real shadcn CLI** with: package-manager shims first on `PATH` (npm, pnpm, yarn, bun, deno, npx: they log and refuse),
`HTTP(S)_PROXY` at a dead port, and `REGISTRY_URL` at the local server (a stray request to ui.shadcn.com fails loudly). Dependencies
are pre-seeded in each consumer's `package.json`: the CLI skips bare names that are already declared, so no install runs at all. The one exception is a
pinned package (`zod@^4`, see above): an add whose closure holds pins runs with the shim in "ok" mode and the test demands that the package manager was asked for **exactly** those
specs and nothing else (`pkgCallsOk`); an add without pins must not reach the package manager at all.

| | consumer | what is proven |
|---|---|---|
| A | standard aliases, modern shadcn CSS, `export { cn } from "cn"` | namespace install; exact file set; no npm call; imports kept; fonts wired; `@theme inline`, keyframes, utilities, rules present once; own tokens kept, new ones added; idempotent; block install; Tailwind compile equals source; `tsc` clean |
| B | `ui: @/ui/paper`, `components: @/ui`, `lib: @/shared/lib`, `hooks: @/shared/hooks`, `utils: @/shared/lib/utils` | umbrella by URL, block by local file path; every import rewritten to those aliases, every `@/` import resolves, nothing in `src/components`; own utils untouched; `tsc` clean |
| C | registry built with `--deps namespace` | `@looseleaf/x` dependencies resolve; fails clearly when the namespace is not registered |
| D | umbrella into a shadcn project | palette overwritten; umbrella docs printed; Tailwind compile equals source, all `:root` vars; `tsc` clean |
| E | empty `package.json`, shim in "record" mode | the exact package list the CLI asks the package manager for equals the item closure (once for a plain component, once for a block with pins); only the configured pins carry a version |
| F | Next.js app router, no `src/`, `rsc: true` | files at `components/ui`, `lib`, `hooks`; `"use client"` kept; `next/font/google` wiring in `layout.tsx` |
| G | `registry add`, `search`, `view`, `--dry-run`, `utils` item | the catalog and items work through the CLI's other commands |
| I | **smoke of a Vite-shaped project with three items**: `button`, `dialog` and a login block | an `App.tsx` that uses the three the way their docs do typechecks under the stock `npm create vite` react-ts tsconfig (`strict`, `verbatimModuleSyntax`, `noUnusedLocals/Parameters`, `erasableSyntaxOnly`, `noUncheckedSideEffectImports`, `types: ["vite/client"]` only); Tailwind's own scanner finds the classes of the installed files (4586 on the real tree) and the merged consumer CSS builds the same 537 rules as `looseleaf.css` for them; every theme `@utility` they use is in the output |
| H | a deliberately mis-named tree (`recipes/button.ts` next to `ui/button.tsx`) | the scanner predicts the CLI's base-name rewrite and refuses it; with the check off the real CLI does rewrite the import (a note, not a failure, if a future CLI stops) |

Every scenario also proves the recipe rule: installing a component writes its `recipes/<slug>-ink.ts` next to the engine, in every alias layout, and every `@/` import in the installed files resolves.
`--real-css` runs the fixture components against the real `src/styles/looseleaf.css` + `fonts.css` (3 `@custom-variant`s, no `.dark` block: the checks count each variant once and skip the `.dark` comparison when the source has none);
`--root .` (`npm run registry:test:real`) installs the real tree (215 items, ~1300 checks, ~3 min) and typechecks it with `types: []`. On the real tree the default build hits the `"use client"` prompt in every incremental add
(244 directive files), so the block and umbrella adds pass `--overwrite` unless `--stable-directives` is given.
`shadcn search --json` prints at most 100 items per page and is cut short when the CLI exits with a full pipe, so scenario G reads it page by page.

## Configuration

| | |
|---|---|
| `VITE_REGISTRY_URL` (env, `.env`, `.env.local`) or `--url` | public base of the built JSON; default `https://looseleaf.example/r` |
| `LOOSELEAF_DEPS` / `--deps` | `url` (default), `namespace`, `name` |
| `LOOSELEAF_NAMESPACE` / `--namespace` | `@looseleaf` |
| `LOOSELEAF_THEME_DEP` / `--theme-dep` | `all` (default) or `none` |
| `LOOSELEAF_PINS` / `--pins` | `on` (default: `zod@^4` …) or `off` (bare package names) |
| `LOOSELEAF_HOMEPAGE` | `homepage` in `registry.json` (default: the URL without `/r`) |
| `LOOSELEAF_STABLE_DIRECTIVES` / `--stable-directives` | see the `"use client"` quirk below |

## README snippet (copy as is; replace the host)

````md
## Install

Looseleaf is a shadcn registry for Tailwind v4 projects (shadcn CLI 4.x). Set the project up with `npx shadcn@latest init` first.

Register the namespace (once):

```bash
npx shadcn@latest registry add "@looseleaf=https://looseleaf.example/r/{name}.json"
```

or add it to `components.json`:

```json
{
  "registries": {
    "@looseleaf": "https://looseleaf.example/r/{name}.json"
  }
}
```

Then:

```bash
npx shadcn@latest add @looseleaf/looseleaf        # everything: theme, fonts, ink engine, all components (overwrites your tokens)
npx shadcn@latest add @looseleaf/button           # one component; keeps your tokens, adds the missing Looseleaf ones
npx shadcn@latest add @looseleaf/login            # a block (installed under components/blocks/login)
npx shadcn@latest add https://looseleaf.example/r/button.json   # no namespace needed
```

Dark mode is shadcn's: put the `dark` class on `<html>`. A second theme is a `[data-theme="…"]` block that overrides the CSS variables.
````

Hosting: publish `public/r/` as static files (`/r/<name>.json`, plus `/r/registry.json` for `search`/`list`).

## Known limits and CLI quirks

* **Text only.** Files must be UTF-8 text; a `.png` / `.woff2` / NUL byte in a registry file is a build error. Textures live as base64
  data URIs in `.ts` / `.css` (`src/lib/ink/textures.generated.ts`). An item JSON over 400 KB warns, over 5 MB fails.
* **Tailwind v4 only**, shadcn CLI recent enough for `registry:font` and the `@ui/` target placeholders (4.21 has both).
  Not tested: Tailwind v3, `tailwind.prefix` (custom classes such as `ll-sheet` would be prefixed by the CLI), monorepos / workspaces,
  Windows, `shadcn init <url>` (init needs the network for its presets), non-`tsx` projects.
* **`@property` is dropped.** The CLI looks an existing `@property` up as a rule but PostCSS parses it as an at-rule, so it appends
  another copy on every add (measured). Declare it in the app CSS instead. **`@font-face`** cannot be expressed either.
* **`--x: var(--x)` noise.** For a token whose value is a `var()` (e.g. `--primary: var(--ink)`) the CLI adds a self-referencing
  `--primary: var(--primary)` line to `@theme inline`. Harmless: Tailwind emits it in `@layer theme`, below the real (unlayered) `:root`.
  Colour literals get the useful `--color-x: var(--x)` mapping, which the theme's own `@theme inline` already defines.
* **Non-colour `:root` tokens are rewritten on every install** (only colours honour "keep the project's value"). `--radius` is the exception (it is a shadcn semantic token).
* **`"use client"` is stripped unreliably from non-RSC projects.** The installed CLI strips the directive with a *global* regex
  (`/^["']use client["']$/g` in `transformRsc`, so `test()` is stateful): after a stripped file, the next directive file keeps it.
  Which files keep it depends on the order of the install, so the same file can differ between two installs and the second one
  asks "The file dialog.tsx already exists. Would you like to overwrite?" although nothing changed. RSC projects (Next) skip the
  transform and keep every directive, as intended. Answer `n`, pass `-o`, or build the registry with **`--stable-directives`**
  (`LOOSELEAF_STABLE_DIRECTIVES=1`): the JSON then carries `"use client";`, which the regex never matches, so every install is
  identical and non-RSC projects keep the (no-op) directive everywhere; Vite 8 prints a `MODULE_LEVEL_DIRECTIVE` warning per
  file for that. Default is off (faithful to how shadcn's own registry behaves). The consumer test is strict about this only
  when at most one file has a directive, or with `--stable-directives`; otherwise it prints a note instead of failing.
* **Imports are re-resolved by base name** (`.tsx` before `.ts`): see "The shadcn CLI re-resolves imports by base name" above. Keep every base name unique across the registry unless the two files share an extension.
* **The CLI drops the comments above the first statement.** An installed `textures.ts` starts at its first `import`: the file-header doc block (`/** … */` or `// …`) of every file that has one is gone (measured with the real CLI: the built JSON has the header, the installed copy starts at the first `import`; it happens in the CLI's own ts-morph transform pipeline). Nothing functional, but a user reading `ink/textures.ts` will not find its doc block; the module docs live in notes/ and on the docs site.
* **Shared `docs`.** The CLI prints the `docs` of every item in the install; keep it short.
* **Keyframes** end up inside `@theme inline`; that is the CLI's placement and Tailwind is fine with it.
* Duplicate declarations inside one rule (fallback pairs) collapse to the last one (JSON cannot repeat a key); the converter warns.
* A `@media` block nested in a rule is flattened *after* the rule's other declarations; only matters if the same property is set on both sides of it.
* The converter flattens nesting itself because the CLI's own handling of nested selectors is shallow. It is checked against an
  independent lowering (lightningcss) in the consumer test, but exotic selector nesting deserves a look in the compiled output.
