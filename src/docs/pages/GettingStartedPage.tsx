import { addCommand, componentsJsonSnippet, initCommand, packagesCommand, registerNamespaceCommand, registryBase } from "../core/install"
import { Link } from "../core/router"
import { paths } from "../core/router-core"
import { AnchorHeading, Callout, CodeBlock, InlineCode, Page, Prose, Section } from "../kit"
import { CommandTabs } from "../widgets/CommandTabs"
import { ContentSlot } from "../widgets/ContentSlot"

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

const PROVIDER = `import { InkProvider } from "@/lib/ink"

export function Root({ children }: { children: React.ReactNode }) {
  return (
    <InkProvider tier="lo" density="comfortable">
      {/* the desk is optional: put ll-desk on the root and ask for its two tiles */}
      {children}
    </InkProvider>
  )
}`

const DESK = `<InkProvider textures={["linen"]}>
  <div className="ll-desk min-h-screen">{children}</div>
</InkProvider>`

const SCOPE = `import { useInkScope } from "@/lib/ink"

<PopoverPrimitive.Content {...useInkScope()} />`

const SSR = `// every Paper brings the tiles of its own stock (one <style href="ll-tex-relief"> per tile, deduped by React 19),
<InkProvider>{children}</InkProvider>       // grain masks
<InkProvider defs={false}>{children}</InkProvider>   // you mount <InkDefs /> yourself (once, near the top of <body>)`

const CSP = `img-src data:;                     /* the grain masks and paper tiles are data: images */
style-src 'self' 'nonce-…';       /* the paper tiles are inline <style> blocks: give them the nonce */
style-src-attr 'unsafe-inline';   /* only when you render on the server: a nonce does not cover style="" attributes in HTML */`

const ATTRIBUTES = `<html lang="en" data-density="compact" data-motion="reduced" class="dark">`

export function GettingStartedPage() {
  return (
    <Page
      kicker="Start here"
      title="Getting started"
      description="Looseleaf is a shadcn registry: the CLI copies drawn-by-hand components into your project, and you own the code."
      toc="auto"
    >
      <ContentSlot contentKey="getting-started" fallback={<GettingStartedBody />} />
    </Page>
  )
}

function GettingStartedBody() {
  const base = registryBase()
  return (
    <>
      <Section id="requirements" title="Requirements">
        <Prose>
          <ul>
            <li>React 19 and Tailwind CSS v4.</li>
            <li>
              A project set up with <InlineCode>shadcn init</InlineCode> (shadcn CLI 4.x). Looseleaf keeps shadcn's file layout, aliases and
              component APIs, so its files drop in where shadcn's would go.
            </li>
            <li>
              The <InlineCode>@/*</InlineCode> import alias. Installed files import each other through it.
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

        <AnchorHeading id="add" level={3}>
          2. Add what you need
        </AnchorHeading>
        <CommandTabs command={(pm) => addCommand(pm, "looseleaf")} title="Everything" />
        <Callout tone="warn" title="This one overwrites your color tokens">
          <p>
            <InlineCode>looseleaf</InlineCode> is the umbrella: theme, fonts, the ink engine and every component. Installing it replaces your shadcn color
            tokens with the Notebook palette (the CLI asks first). To keep your own palette, add single components instead.
          </p>
        </Callout>
        <CommandTabs command={(pm) => addCommand(pm, "button")} title="One component" />
        <p className="dk-hint">
          A component install keeps color tokens you already have and adds the Looseleaf ones you are missing. Blocks install under{" "}
          <InlineCode>components/blocks/</InlineCode>: <InlineCode>{addCommand("npm", "login")}</InlineCode>. A direct URL works without the
          namespace: <InlineCode>{addCommand("npm", "button", "url", base)}</InlineCode>.
        </p>
      </Section>

      <Section id="manual" title="Manual installation" description="No CLI? Copy the pieces yourself.">
        <Prose>
          <ol>
            <li>
              Install the shared packages: <InlineCode>radix-ui</InlineCode>, <InlineCode>class-variance-authority</InlineCode>, <InlineCode>clsx</InlineCode>,{" "}
              <InlineCode>tailwind-merge</InlineCode> and <InlineCode>tw-animate-css</InlineCode>. Each component page lists anything extra it imports.
            </li>
            <li>
              Copy <InlineCode>src/styles/looseleaf.css</InlineCode> into your project and import it once from your entry file. It already starts with{" "}
              <InlineCode>@import "tailwindcss"</InlineCode>.
            </li>
            <li>
              Copy <InlineCode>src/lib/ink/</InlineCode> (the drawing engine) and <InlineCode>src/lib/utils.ts</InlineCode> (<InlineCode>cn()</InlineCode>).
            </li>
            <li>
              Copy the components you want into <InlineCode>src/components/ui/</InlineCode>. Every component page has a Manual tab with its exact source.
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
          Handwriting faces run wide: labels start at 14 px and touch inputs at 16 px. More on the{" "}
          <Link to={paths.foundations("typography")}>typography</Link> page.
        </p>
      </Section>

      <Section id="tokens" title="Tokens" description="Every color, width and duration is a CSS custom property, so theming never touches component code.">
        <Prose>
          <p>
            The palette lives in <InlineCode>--ll-*</InlineCode> variables. shadcn's semantic names (<InlineCode>--background</InlineCode>,{" "}
            <InlineCode>--primary</InlineCode>, <InlineCode>--ring</InlineCode>, ...) alias them, and Tailwind sees them as utilities:
          </p>
        </Prose>
        <CodeBlock code={TOKEN_USE} lang="tsx" title="Using the palette" />
        <CodeBlock code={TOKEN_OVERRIDE} lang="css" title="Overriding a token" />
        <p className="dk-hint">
          The full list, with contrast notes, is on <Link to={paths.foundations("color")}>color</Link>; how a second theme is built is on{" "}
          <Link to={paths.foundations("theming")}>theming</Link>.
        </p>
      </Section>

      <Section id="provider" title="Provider" description="One wrapper for the drawing layer: quality tier, density, motion and direction.">
        <CodeBlock code={PROVIDER} lang="tsx" title="root.tsx" />
        <Prose>
          <p>
            The props: <InlineCode>tier</InlineCode> (<InlineCode>"lo"</InlineCode> by default; <InlineCode>"hi"</InlineCode> is for hero art and screenshots),{" "}
            <InlineCode>density</InlineCode> (<InlineCode>comfortable</InlineCode>, <InlineCode>compact</InlineCode> or <InlineCode>calm</InlineCode>: hairline pencil rules for dense screens),{" "}
            <InlineCode>motion</InlineCode> (<InlineCode>"reduced"</InlineCode> stops the hover tilt and the draw-on), <InlineCode>theme</InlineCode>,{" "}
            <InlineCode>dir</InlineCode> (default: the <InlineCode>dir</InlineCode> of the page, followed when it changes), <InlineCode>knobs</InlineCode> (override pen numbers),{" "}
            <InlineCode>defs</InlineCode> (the grain masks, on by default) and <InlineCode>textures</InlineCode> (paper and desk tiles, off by default).
          </p>
          <p>
            Density and motion can also be set with attributes on any ancestor (usually <InlineCode>html</InlineCode>). Dark mode is shadcn's own: the{" "}
            <InlineCode>dark</InlineCode> class.
          </p>
        </Prose>
        <CodeBlock code={ATTRIBUTES} lang="text" title="index.html" copy={false} />
        <AnchorHeading id="desk" level={3}>
          The desk
        </AnchorHeading>
        <p className="dk-hint">
          Paper needs nothing. The desk, the linen the pages lie on, is opt-in: it is the <InlineCode>ll-desk</InlineCode> utility plus its two tiles.
        </p>
        <CodeBlock code={DESK} lang="tsx" title="root.tsx" />
        <AnchorHeading id="portals" level={3}>
          Portals
        </AnchorHeading>
        <p className="dk-hint">
          A Radix portal mounts under <InlineCode>body</InlineCode>, outside the provider's wrapper. Looseleaf's own popovers, menus and dialogs already repeat its scope;
          if you write your own, spread <InlineCode>useInkScope()</InlineCode> on the portalled root.
        </p>
        <CodeBlock code={SCOPE} lang="tsx" title="my-popover.tsx" />
      </Section>

      <Section id="ssr" title="Server rendering" description="Next.js, Remix and friends: what ends up in the HTML.">
        <Prose>
          <p>
            Every drawing is seeded from <InlineCode>useId()</InlineCode> or a <InlineCode>seed</InlineCode> prop, so the server and the client draw the same
            hand and hydration is exact. Controls are measured in the browser, so on the server they show a plain pencil outline until they mount; pass{" "}
            <InlineCode>size</InlineCode> to a <InlineCode>Paper</InlineCode> with a drawn edge, and the sheet is in the HTML.
          </p>
          <p>
            The weight: <InlineCode>InkProvider</InlineCode> adds the grain masks (about 100 KB of HTML, once per page). Each <InlineCode>Paper</InlineCode> adds the
            tiles of its stock once, not per sheet: a page with a card and a few slips is about 170 KB in all. If the page has no drawn control at all, pass{" "}
            <InlineCode>defs=&#123;false&#125;</InlineCode> and mount <InlineCode>InkDefs</InlineCode> only where you need it.
          </p>
        </Prose>
        <CodeBlock code={SSR} lang="tsx" title="layout.tsx" copy={false} />
        <Callout tone="warn" title="Content-Security-Policy">
          <p>
            The grain masks are <InlineCode>data:</InlineCode> images and the paper tiles are inline <InlineCode>style</InlineCode> blocks. A strict policy needs{" "}
            <InlineCode>img-src data:</InlineCode> and a style nonce (or <InlineCode>'unsafe-inline'</InlineCode>). A nonce does not cover the{" "}
            <InlineCode>style=""</InlineCode> attributes in server-rendered HTML: those need <InlineCode>style-src-attr 'unsafe-inline'</InlineCode>.
          </p>
        </Callout>
        <CodeBlock code={CSP} lang="text" title="Content-Security-Policy" copy={false} />
      </Section>

      <Section id="next-steps" title="Next steps">
        <Prose>
          <ul>
            <li>
              Browse the <Link to={paths.components()}>components</Link> and open one: each has live examples with their code.
            </li>
            <li>
              Start from a <Link to={paths.blocks()}>block</Link> if you would rather begin with a whole page.
            </li>
            <li>
              Read the <Link to={paths.foundations()}>foundations</Link> to see why things are drawn the way they are.
            </li>
          </ul>
        </Prose>
      </Section>
    </>
  )
}
