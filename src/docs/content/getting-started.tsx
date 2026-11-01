import type { ReactNode } from "react"
import { addCommand, componentsJsonSnippet, initCommand, packagesCommand, registerNamespaceCommand, registryBase } from "../core/install"
import { Link, useAnchorHref } from "../core/router"
import { paths } from "../core/router-core"
import { AnchorHeading, Callout, CodeBlock, InlineCode, Prose, Section } from "../kit"
import { CommandTabs } from "../widgets/CommandTabs"

const JUMPS = [
  { id: "requirements", label: "Requirements" },
  { id: "install", label: "Install" },
  { id: "vite", label: "Vite" },
  { id: "nextjs", label: "Next.js" },
  { id: "manual", label: "Manual" },
  { id: "fonts", label: "Fonts" },
  { id: "tokens", label: "Tokens" },
  { id: "provider", label: "Provider" },
  { id: "ssr", label: "Server rendering" },
  { id: "csp", label: "CSP" },
  { id: "troubleshooting", label: "Troubleshooting" },
]

function Jump({ id, children }: { id: string; children: string }) {
  return (
    <a className="dk-chip-link" href={useAnchorHref(id)}>
      {children}
    </a>
  )
}

const FONT_PACKAGES = ["@fontsource/ibm-plex-mono"]

const FONT_IMPORTS = `@import url("https://kevintngo.github.io/looseleaf/fonts/kevin-sans.css");
@import "@fontsource/ibm-plex-mono/400.css";
@import "@fontsource/ibm-plex-mono/500.css";`

const FONT_TOKENS = `@theme inline {
  --font-hand: "Kevin Sans Hand", "Kevin Sans", cursive;
  --font-script: "Kevin Sans Script", "Kevin Sans", cursive;
  --font-type: "Kevin Sans Type", "Kevin Sans", cursive;
  --font-mono: "IBM Plex Mono", monospace;
}`

const VITE_SETUP = `npm create vite@latest my-app -- --template react-ts
cd my-app
npm install tailwindcss @tailwindcss/vite
npm install -D @types/node`

const VITE_CSS = `/* src/index.css */
@import "tailwindcss";`

const VITE_CONFIG = `// vite.config.ts
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
})`

const VITE_TSCONFIG = `// tsconfig.json AND tsconfig.app.json (Vite splits them; both need it)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}`

const VITE_MAIN = `// src/main.tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { InkProvider } from "@/lib/ink/react"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import App from "./App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <InkProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
      <Toaster />
    </InkProvider>
  </StrictMode>,
)`

const NEXT_SETUP = `npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
npx shadcn@latest init`

const NEXT_PROVIDERS = `// app/providers.tsx
"use client"

import { InkProvider } from "@/lib/ink/react"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <InkProvider>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster />
    </InkProvider>
  )
}`

const NEXT_LAYOUT = `// app/layout.tsx
import { Providers } from "./providers"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}`

const VERIFY = `import { Button } from "@/components/ui/button"

export default function App() {
  return <Button>Hello, paper</Button>
}`

const PATH_ALIAS = `{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}`

const TOKEN_USE = `<div className="bg-paper text-ink font-hand p-4">
  <h2 className="font-script text-2xl text-ink-you">Notes</h2>
</div>`

const TOKEN_OVERRIDE = `:root {
  --ll-marker: #2f7d6b;   /* the primary action color */
  --ll-hi: #f4d35e;       /* highlighter */
}`

const PROVIDER = `import { InkProvider } from "@/lib/ink/react"

export function Root({ children }: { children: React.ReactNode }) {
  return (
    <InkProvider tier="lo" density="comfortable">
      {children}
    </InkProvider>
  )
}`

const ATTRIBUTES = `<html lang="en" data-density="compact" data-motion="reduced">`

const DESK = `<InkProvider textures={["linen"]}>
  <div className="ll-desk min-h-screen">{children}</div>
</InkProvider>`

const SCOPE = `import { useInkScope } from "@/lib/ink/react"

<PopoverPrimitive.Content {...useInkScope()} />`

const SSR = `<InkProvider>{children}</InkProvider>                 // grain masks, once (about 100 KB of HTML)
<InkProvider defs={false}>{children}</InkProvider>    // you mount <InkDefs /> yourself, once, near the top of <body>
<InkProvider patterns={["relief", "fibre"]}>...       // paper tiles as SVG patterns, so torn sheets are drawn in the server HTML`

const SIZE = `<Paper stock="paper" edge="torn" size={[360, 220]}>...</Paper>   // a drawn edge is in the server markup when you say how big it is`

const CSP = `Content-Security-Policy:
  img-src 'self' data:;                 /* the grain masks and paper tiles are data: images */
  style-src 'self' 'nonce-...';         /* the paper tiles are inline <style> blocks: give them the nonce */
  style-src-attr 'unsafe-inline';       /* only when you render on the server: a nonce does not cover style="" attributes in HTML */`

const PROBLEMS: { id: string; symptom: string; fix: ReactNode }[] = [
  {
    id: "plain-outlines",
    symptom: "Controls show a plain pencil outline and never get their drawing",
    fix: (
      <>
        The drawing is measured in the browser, so the server (and the very first paint) shows a pencil outline. If it stays: mount <InlineCode>InkProvider</InlineCode> once near the root,
        check the console for a failed <InlineCode>@/lib/ink</InlineCode> import, and make sure no ancestor is <InlineCode>display: none</InlineCode> at mount, because a box with no size cannot be drawn.
      </>
    ),
  },
  {
    id: "wrong-fonts",
    symptom: "Everything is in the browser's default font",
    fix: (
      <>
        The four faces come from Fontsource. Install the packages, import the weights (see <Link to="#fonts">Fonts</Link>) and check that <InlineCode>--font-hand</InlineCode> and friends are
        defined in an <InlineCode>@theme inline</InlineCode> block. Through the registry, <InlineCode>looseleaf</InlineCode> does all of this; a single component does not.
      </>
    ),
  },
  {
    id: "colors",
    symptom: "The colors are wrong, or my shadcn palette disappeared",
    fix: (
      <>
        Installing <InlineCode>looseleaf</InlineCode> or <InlineCode>looseleaf-theme</InlineCode> overwrites the color tokens with the Notebook palette (the CLI asks first). Add single components to keep yours;
        missing Looseleaf tokens are added, the ones you have are left alone. The Notebook theme is a light theme: there is no <InlineCode>.dark</InlineCode> block yet.
      </>
    ),
  },
  {
    id: "unknown-class",
    symptom: "Classes like ll-desk, text-ink or font-script do nothing",
    fix: (
      <>
        Those come from the theme file. Look in the CSS file that <InlineCode>components.json</InlineCode> names under <InlineCode>tailwind.css</InlineCode>: it should contain the{" "}
        <InlineCode>--ll-*</InlineCode> tokens and the <InlineCode>@utility</InlineCode> blocks. If it does not, run <InlineCode>{addCommand("npm", "looseleaf-theme")}</InlineCode>.
      </>
    ),
  },
  {
    id: "alias",
    symptom: "Cannot find module '@/lib/ink/react' (or '@/components/ui/button')",
    fix: (
      <>
        The <InlineCode>@/*</InlineCode> alias must exist in both the TypeScript config (<InlineCode>paths</InlineCode>) and the bundler (Vite: <InlineCode>resolve.alias</InlineCode>; Next.js reads{" "}
        <InlineCode>paths</InlineCode> itself). Vite projects have two tsconfig files; add it to both.
      </>
    ),
  },
  {
    id: "hydration",
    symptom: "Hydration mismatch warnings",
    fix: (
      <>
        Every drawing is seeded from <InlineCode>useId()</InlineCode> or a <InlineCode>seed</InlineCode> prop, so server and client agree as long as they run the same React 19 build. Do not build a seed
        from <InlineCode>Math.random()</InlineCode> or the time; pass a string. A <InlineCode>svg</InlineCode> inside <InlineCode>table</InlineCode>, <InlineCode>tbody</InlineCode> or <InlineCode>tr</InlineCode> is
        invalid: use the Looseleaf <InlineCode>Table</InlineCode>, which keeps its rules out of those elements.
      </>
    ),
  },
  {
    id: "flat-paper",
    symptom: "Paper is flat on the server, or a torn edge is straight until hydration",
    fix: (
      <>
        A sheet brings its own texture tiles as a hoisted <InlineCode>&lt;style href&gt;</InlineCode>, which needs React 19. A drawn edge (torn, deckle, scallop) is measured, so give the sheet a{" "}
        <InlineCode>size</InlineCode>, or add <InlineCode>patterns</InlineCode> to the provider.
      </>
    ),
  },
  {
    id: "no-textures",
    symptom: "No paper grain, or the images are blocked in production",
    fix: (
      <>
        Almost always a Content-Security-Policy: the textures are <InlineCode>data:</InlineCode> images and inline <InlineCode>style</InlineCode> blocks. See <Link to="#csp">CSP</Link>.
      </>
    ),
  },
  {
    id: "toast",
    symptom: "toast() does nothing",
    fix: (
      <>
        Mount <InlineCode>&lt;Toaster /&gt;</InlineCode> once (from <InlineCode>@/components/ui/sonner</InlineCode>) and import <InlineCode>toast</InlineCode> from the same file. Two Toasters need distinct{" "}
        <InlineCode>id</InlineCode>s and <InlineCode>toast(..., &#123; toasterId &#125;)</InlineCode>.
      </>
    ),
  },
  {
    id: "tooltip",
    symptom: "Tooltip must be used within TooltipProvider",
    fix: (
      <>
        Like upstream's source, Looseleaf's <InlineCode>Tooltip</InlineCode> is a bare Radix root. Wrap the app in <InlineCode>TooltipProvider</InlineCode> (from <InlineCode>@/components/ui/tooltip</InlineCode>) once, next to{" "}
        <InlineCode>InkProvider</InlineCode>, as in the recipes above.
      </>
    ),
  },
  {
    id: "portals",
    symptom: "A dialog or menu ignores calm density or the theme",
    fix: (
      <>
        Portals mount under <InlineCode>body</InlineCode>, outside the provider's wrapper. Looseleaf's own portalled parts repeat its scope; spread <InlineCode>useInkScope()</InlineCode> on your own.
      </>
    ),
  },
  {
    id: "slow",
    symptom: "A screen with hundreds of controls feels heavy",
    fix: (
      <>
        Set <InlineCode>density="calm"</InlineCode> on the provider (hairline pencil rules, no jitter, the light tier), keep <InlineCode>tier</InlineCode> at <InlineCode>"lo"</InlineCode> and leave rows of a table to plain CSS: the table
        parts do not draw one svg per row.
      </>
    ),
  },
  {
    id: "contrast",
    symptom: "Windows high contrast looks different",
    fix: <>On purpose: the overlay drawings hide and real borders show, so every control keeps an edge. Sticker, doodle, stamp and mascot art is kept.</>,
  },
]

export default function GettingStartedBody() {
  const base = registryBase()
  return (
    <>
      <nav aria-label="Sections of this page">
        <ul className="dk-chips" role="list">
          {JUMPS.map((j) => (
            <li key={j.id}>
              <Jump id={j.id}>{j.label}</Jump>
            </li>
          ))}
        </ul>
      </nav>

      <Prose>
        <p>
          Looseleaf is made by Kevin T. Ngo. Questions, ideas, or something you built with it? Say hi on X at{" "}
          <a href="https://x.com/kevin_t_ngo" target="_blank" rel="noreferrer noopener">
            @kevin_t_ngo<span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </p>
      </Prose>

      <Section id="requirements" title="Requirements">
        <Prose>
          <ul>
            <li>
              <strong>React 19.</strong> Sheets hoist their texture tiles with React 19's <InlineCode>&lt;style href precedence&gt;</InlineCode>, and <InlineCode>ref</InlineCode> is an ordinary prop throughout.
            </li>
            <li>
              <strong>Tailwind CSS v4.</strong> The theme is a Tailwind v4 stylesheet (<InlineCode>@theme inline</InlineCode>, <InlineCode>@utility</InlineCode>, <InlineCode>@custom-variant</InlineCode>).
            </li>
            <li>
              <strong>shadcn CLI 4.x</strong> and a project set up with <InlineCode>shadcn init</InlineCode>. Looseleaf keeps shadcn's file layout, aliases and component APIs, so its files land where shadcn's would.
            </li>
            <li>
              <strong>The <InlineCode>@/*</InlineCode> import alias.</strong> Installed files import each other through it.
            </li>
            <li>
              <strong>A modern browser.</strong> The drawings use <InlineCode>:has()</InlineCode>, <InlineCode>clip-path</InlineCode> on SVG groups and <InlineCode>mix-blend-mode</InlineCode>; anything from the last two years is fine.
            </li>
          </ul>
        </Prose>
        <CommandTabs command={initCommand} />
      </Section>

      <Section id="install" title="Install with the registry" description="The fastest route: the CLI adds the files, the packages, the theme and the fonts.">
        <AnchorHeading id="registry" level={3}>
          1. Register the namespace
        </AnchorHeading>
        <p className="dk-hint">Once per project. Either run the command, or add the entry to components.json.</p>
        <CommandTabs command={(pm) => registerNamespaceCommand(pm, base)} />
        <CodeBlock code={componentsJsonSnippet(base)} lang="json" title="components.json" />
        <p className="dk-hint">
          Without the namespace, every item also works by URL: <InlineCode>{addCommand("npm", "button", "url", base)}</InlineCode>.
        </p>

        <AnchorHeading id="add" level={3}>
          2. Add what you need
        </AnchorHeading>
        <CommandTabs command={(pm) => addCommand(pm, "looseleaf")} title="Everything" />
        <Callout tone="warn" title="This one overwrites your color tokens">
          <p>
            <InlineCode>looseleaf</InlineCode> is the umbrella: theme, fonts, the ink engine and every component. Installing it replaces your shadcn color tokens with the Notebook palette (the CLI asks first).
            To keep your own palette, add single components instead.
          </p>
        </Callout>
        <CommandTabs command={(pm) => addCommand(pm, "button")} title="One component" />
        <p className="dk-hint">
          A component install keeps color tokens you already have and adds the Looseleaf ones you are missing. It brings the drawing engine (<InlineCode>ink</InlineCode>) and its own recipe with it, but not the sticker book:
          art is separate (<InlineCode>ink-icons</InlineCode>, <InlineCode>ink-stickers</InlineCode>, <InlineCode>ink-doodles</InlineCode>, <InlineCode>ink-mascot</InlineCode>) and arrives only with the components that draw it. Blocks land under{" "}
          <InlineCode>components/blocks/</InlineCode>: <InlineCode>{addCommand("npm", "login-01")}</InlineCode>.
        </p>

        <AnchorHeading id="verify" level={3}>
          3. Check it worked
        </AnchorHeading>
        <CodeBlock code={VERIFY} lang="tsx" title="App.tsx" />
        <p className="dk-hint">
          A button with a solid terracotta fill inside a clean felt-tip outline. If it is a plain outlined box, read <Link to="#troubleshooting">Troubleshooting</Link>.
        </p>

        <AnchorHeading id="vite" level={3}>
          Recipe: Vite
        </AnchorHeading>
        <CodeBlock code={VITE_SETUP} lang="bash" title="Terminal" />
        <CodeBlock code={VITE_CSS} lang="css" title="src/index.css" />
        <CodeBlock code={VITE_CONFIG} lang="ts" title="vite.config.ts" />
        <CodeBlock code={VITE_TSCONFIG} lang="json" title="tsconfig" />
        <p className="dk-hint">Then run the three steps above (init, register, add) and wrap the app once:</p>
        <CodeBlock code={VITE_MAIN} lang="tsx" title="main.tsx" />

        <AnchorHeading id="nextjs" level={3}>
          Recipe: Next.js (App Router)
        </AnchorHeading>
        <CodeBlock code={NEXT_SETUP} lang="bash" title="Terminal" />
        <p className="dk-hint">
          Then register and add. In a Next.js project the CLI wires the fonts with <InlineCode>next/font/google</InlineCode> in <InlineCode>app/layout.tsx</InlineCode>. The provider is a client component: give it a client file of its own.
        </p>
        <CodeBlock code={NEXT_PROVIDERS} lang="tsx" title="app/providers.tsx" />
        <CodeBlock code={NEXT_LAYOUT} lang="tsx" title="app/layout.tsx" />
        <p className="dk-hint">
          Server components can render Looseleaf parts that have no state (<InlineCode>Card</InlineCode>, <InlineCode>Paper</InlineCode>, <InlineCode>Badge</InlineCode>); anything interactive already carries{" "}
          <InlineCode>"use client"</InlineCode>. More about what lands in the HTML is under <Link to="#ssr">Server rendering</Link>.
        </p>
      </Section>

      <Section id="manual" title="Manual installation" description="No CLI? Copy the pieces yourself.">
        <Prose>
          <ol>
            <li>
              Install the shared packages: <InlineCode>radix-ui</InlineCode>, <InlineCode>class-variance-authority</InlineCode>, <InlineCode>clsx</InlineCode>, <InlineCode>tailwind-merge</InlineCode> and{" "}
              <InlineCode>tw-animate-css</InlineCode>. Each component page lists anything extra it imports (<InlineCode>sonner</InlineCode>, <InlineCode>cmdk</InlineCode>, <InlineCode>react-day-picker</InlineCode>...).
            </li>
            <li>
              Copy <InlineCode>src/styles/looseleaf.css</InlineCode> and <InlineCode>src/styles/fonts.css</InlineCode> into your project and import the first from your entry file, once. It starts with{" "}
              <InlineCode>@import "tailwindcss"</InlineCode> and <InlineCode>@import "tw-animate-css"</InlineCode>.
            </li>
            <li>
              Copy <InlineCode>src/lib/ink/</InlineCode> (the drawing engine) and <InlineCode>src/lib/utils.ts</InlineCode> (<InlineCode>cn()</InlineCode>).
            </li>
            <li>
              Copy the components you want into <InlineCode>src/components/ui/</InlineCode>, with the recipe each one imports from <InlineCode>src/lib/ink/recipes/&lt;name&gt;-ink.ts</InlineCode>. Every component page has a
              Manual tab with its exact source.
            </li>
          </ol>
        </Prose>
        <CodeBlock code={PATH_ALIAS} lang="json" title="tsconfig.json" />
      </Section>

      <Section id="fonts" title="Fonts" description="Kevin Sans in three tuned roles, and IBM Plex Mono for code.">
        <Prose>
          <p>
            <InlineCode>font-hand</InlineCode> (UI text), <InlineCode>font-script</InlineCode> (titles and notes) and <InlineCode>font-type</InlineCode> (stamps and kickers) are all Kevin Sans, each tuned for its job; <InlineCode>font-mono</InlineCode> (IBM Plex Mono) is code. Through the registry they arrive with the theme; by hand, load the hosted Kevin Sans faces and Plex Mono:
          </p>
        </Prose>
        <CommandTabs command={(pm) => packagesCommand(pm, FONT_PACKAGES)} />
        <CodeBlock code={FONT_IMPORTS} lang="css" title="index.css" />
        <CodeBlock code={FONT_TOKENS} lang="css" title="index.css" />
        <p className="dk-hint">
          Handwriting faces run wide: labels start at 14 px and touch inputs at 16 px. More on the <Link to={paths.foundations("typography")}>typography</Link> page.
        </p>
      </Section>

      <Section id="tokens" title="Tokens" description="Every color, width and duration is a CSS custom property, so theming never touches component code.">
        <Prose>
          <p>
            The palette lives in <InlineCode>--ll-*</InlineCode> variables. shadcn's semantic names (<InlineCode>--background</InlineCode>, <InlineCode>--primary</InlineCode>, <InlineCode>--ring</InlineCode>, ...) alias them,
            and Tailwind sees them as utilities:
          </p>
        </Prose>
        <CodeBlock code={TOKEN_USE} lang="tsx" title="Using the palette" />
        <CodeBlock code={TOKEN_OVERRIDE} lang="css" title="Overriding a token" />
        <p className="dk-hint">
          The full list, with contrast notes, is on <Link to={paths.foundations("color")}>color</Link>; how a second theme is built is on <Link to={paths.foundations("theming")}>theming</Link>.
        </p>
      </Section>

      <Section id="provider" title="Provider" description="One wrapper for the drawing layer: quality tier, density, motion and direction.">
        <CodeBlock code={PROVIDER} lang="tsx" title="root.tsx" />
        <Prose>
          <p>
            The props: <InlineCode>tier</InlineCode> (<InlineCode>"lo"</InlineCode> by default; <InlineCode>"hi"</InlineCode> is for hero art and screenshots), <InlineCode>density</InlineCode> (
            <InlineCode>comfortable</InlineCode>, <InlineCode>compact</InlineCode> or <InlineCode>calm</InlineCode>: hairline pencil rules for dense screens), <InlineCode>motion</InlineCode> (<InlineCode>"reduced"</InlineCode> stops the
            hover tilt and the draw-on), <InlineCode>theme</InlineCode>, <InlineCode>dir</InlineCode> (default: the <InlineCode>dir</InlineCode> of the page, followed when it changes), <InlineCode>knobs</InlineCode> (override pen
            numbers), <InlineCode>defs</InlineCode> (the grain masks, on by default), <InlineCode>textures</InlineCode> (paper and desk tiles, off by default) and <InlineCode>patterns</InlineCode> (tiles as SVG patterns for drawn edges).
            Try them live in the <Link to={paths.playground}>playground</Link>.
          </p>
          <p>
            Density and motion can also be set with attributes on any ancestor (usually <InlineCode>html</InlineCode>). The Notebook theme is a light theme; the <InlineCode>dark</InlineCode> variant exists for a second theme to use.
          </p>
          <p>
            Two more things belong at the root of an app that uses them: <InlineCode>TooltipProvider</InlineCode> (from <InlineCode>@/components/ui/tooltip</InlineCode>) for every <InlineCode>Tooltip</InlineCode>, and one{" "}
            <InlineCode>Toaster</InlineCode> (from <InlineCode>@/components/ui/sonner</InlineCode>) for <InlineCode>toast()</InlineCode>. The recipes above mount both.
          </p>
        </Prose>
        <CodeBlock code={ATTRIBUTES} lang="text" title="index.html" copy={false} />
        <AnchorHeading id="desk" level={3}>
          The desk
        </AnchorHeading>
        <p className="dk-hint">
          Paper needs nothing. The desk, the linen the pages lie on, is opt-in: it is the <InlineCode>ll-desk</InlineCode> utility plus its two tiles (the <InlineCode>Desk</InlineCode> component does both).
        </p>
        <CodeBlock code={DESK} lang="tsx" title="root.tsx" />
        <AnchorHeading id="portals" level={3}>
          Portals
        </AnchorHeading>
        <p className="dk-hint">
          A Radix portal mounts under <InlineCode>body</InlineCode>, outside the provider's wrapper. Looseleaf's own popovers, menus and dialogs already repeat its scope; if you write your own, spread{" "}
          <InlineCode>useInkScope()</InlineCode> on the portalled root.
        </p>
        <CodeBlock code={SCOPE} lang="tsx" title="my-popover.tsx" />
      </Section>

      <Section id="ssr" title="Server rendering" description="Next.js, Remix and friends: what ends up in the HTML.">
        <Prose>
          <p>
            Every drawing is seeded from <InlineCode>useId()</InlineCode> or a <InlineCode>seed</InlineCode> prop, so the server and the client draw the same hand and hydration is exact. Controls are measured in the browser, so on
            the server they show a plain pencil outline until they mount. Intrinsic art (icons, stickers, stamps, tape, Stubby) needs no measuring and is complete in the server HTML.
          </p>
          <p>
            <strong>Textures.</strong> The grain masks are baked bitmaps (<InlineCode>data:</InlineCode> URLs). <InlineCode>InkProvider</InlineCode> adds them once per page, about 100 KB of HTML. Each{" "}
            <InlineCode>Paper</InlineCode> adds the tiles of its own stock once, not per sheet, as a hoisted <InlineCode>style</InlineCode> block: a page with a card and a few slips is about 170 KB in all, and a page with no
            Paper pays for none. If a page has no drawn control at all, pass <InlineCode>defs=&#123;false&#125;</InlineCode> and mount <InlineCode>InkDefs</InlineCode> only where you need it.
          </p>
        </Prose>
        <CodeBlock code={SSR} lang="tsx" title="layout.tsx" copy={false} />
        <CodeBlock code={SIZE} lang="tsx" title="a sheet with a drawn edge" copy={false} />

        <AnchorHeading id="csp" level={3}>
          Content-Security-Policy
        </AnchorHeading>
        <Callout tone="warn" title="A strict policy needs three allowances">
          <p>
            The grain masks are <InlineCode>data:</InlineCode> images and the paper tiles are inline <InlineCode>style</InlineCode> blocks. Allow <InlineCode>img-src data:</InlineCode> and a style nonce (or{" "}
            <InlineCode>'unsafe-inline'</InlineCode> for <InlineCode>style-src</InlineCode>). Nothing is fetched from another origin, and no script is inlined.
          </p>
          <p>
            A nonce covers <InlineCode>style</InlineCode> elements, not the <InlineCode>style=""</InlineCode> attributes that server-rendered HTML carries (the tilt of a sheet, the size of a drawing). Those need{" "}
            <InlineCode>style-src-attr 'unsafe-inline'</InlineCode>. A page rendered in the browser sets its styles through the CSSOM, which the policy allows, so only server rendering asks for it.
          </p>
        </Callout>
        <CodeBlock code={CSP} lang="text" title="Content-Security-Policy" copy={false} />
        <p className="dk-hint">
          The tiles are hoisted <InlineCode>style</InlineCode> tags. If your framework does not put the nonce on them, allow <InlineCode>'unsafe-inline'</InlineCode> for <InlineCode>style-src</InlineCode>; the images stay <InlineCode>data:</InlineCode> either way.
        </p>
      </Section>

      <Section id="troubleshooting" title="Troubleshooting" description="The things people actually run into, with the fix.">
        <dl className="grid gap-5">
          {PROBLEMS.map((p) => (
            <div key={p.id} id={p.id}>
              <dt className="font-script text-2xl leading-tight font-bold">{p.symptom}</dt>
              <dd className="m-0 mt-1 max-w-3xl text-ink-soft">{p.fix}</dd>
            </div>
          ))}
        </dl>
        <p className="dk-hint">
          Something not here? The look-dev notes travel with the source (<InlineCode>notes/</InlineCode>), and every component page has an Accessibility section with its keyboard behavior.
        </p>
      </Section>

      <Section id="next-steps" title="Next steps">
        <Prose>
          <ul>
            <li>
              Browse the <Link to={paths.components()}>components</Link> and open one: each has live examples with their code.
            </li>
            <li>
              Turn the knobs in the <Link to={paths.playground}>playground</Link> and copy the provider snippet.
            </li>
            <li>
              Start from a <Link to={paths.blocks()}>block</Link> if you would rather begin with a whole page.
            </li>
            <li>
              Read the <Link to={paths.foundations()}>foundations</Link> to see why things are drawn the way they are, or the <Link to={paths.changelog}>changelog</Link> to see what is new.
            </li>
          </ul>
        </Prose>
      </Section>
    </>
  )
}
