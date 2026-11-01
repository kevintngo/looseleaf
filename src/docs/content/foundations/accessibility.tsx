import { useAnchorHref } from "@/docs/core/router"
import { Callout, CodeBlock, InlineCode, Kbd, Prose, Section } from "@/docs/kit"
import { ContrastSection, FocusSpecimens, JitterDemo, KeyboardStrip, MotionCompare, RtlCompare, ScreenReaderProbe, TargetsDemo } from "./_shared-b/a11y-demos"
import { CONTRAST_ROWS } from "./_shared-b/contrast-data.generated"
import { CaveatCard, DataTable } from "./_shared-b/layout"

const ratio = (fg: string, bg: string): string => {
  const row = CONTRAST_ROWS.find((r) => r.fg === fg && r.bg === bg)
  return row ? row.ratio.toFixed(1) : "?"
}

interface Guarantee {
  area: string
  href: string
  promise: string
  how: string
  check: string
}

const GUARANTEES: readonly Guarantee[] = [
  {
    area: "Keyboard",
    href: "keyboard",
    promise: "Every control can be reached and used from the keyboard, with the keys shadcn/ui uses.",
    how: "Radix primitives or native elements do the work. The drawing is a decorative layer on top that never takes focus or a click.",
    check: "Component tests press the keys and run axe.",
  },
  {
    area: "Focus",
    href: "focus",
    promise: `A visible, drawn focus mark on every focusable part: ${ratio("ring", "card")} : 1 on paper, ${ratio("ring", "background")} : 1 on the desk.`,
    how: "A blue rounded-rectangle ring with corner ticks is drawn on :focus-visible, above everything, without moving the layout.",
    check: "The token check measures the ring against every surface.",
  },
  {
    area: "Contrast",
    href: "contrast",
    promise: `Body text is AAA on paper (${ratio("card-foreground", "card")} : 1); every text pair is at least AA except the known limits listed below.`,
    how: "Color is tokens only. Stationery colors live in the decoration layer, not in text.",
    check: `node tools/check-tokens.mjs measures ${CONTRAST_ROWS.length} pairs and fails on a regression.`,
  },
  {
    area: "Reduced motion",
    href: "motion",
    promise: "Nothing animates when the system asks for less, or when the viewer picks calm ink. Nothing is left half drawn.",
    how: "One token, --ll-motion, collapses every duration; a global rule cuts CSS animations and transitions; boil and jitter switch themselves off.",
    check: "A rule in the stylesheet; components use duration tokens, never literal milliseconds.",
  },
  {
    area: "Forced colors",
    href: "forced-colors",
    promise: "Controls keep real borders and a system-color focus outline; the overlay drawing steps aside.",
    how: "An @media (forced-colors: active) block hides overlay ink and gives hosts real outlines.",
    check: "The rules are in the stylesheet. Not yet looked at in a real browser: see the caveats.",
  },
  {
    area: "Right to left",
    href: "rtl",
    promise: "Layout mirrors: logical properties throughout, direction glyphs flip themselves, moving parts have rtl twins.",
    how: "ms-*, pe-*, start and end in class lists; rtl: variants for anything physical.",
    check: "A direction audit scans every component's class lists for physical utilities.",
  },
  {
    area: "Touch targets",
    href: "targets",
    promise: "Controls are built so their hit area is at least 24 px, with one known exception (see the limits). Buttons, inputs and icon buttons are 36 px tall, 32 in compact and 28 in calm; the small drawn controls (checkbox, radio, switch, slider thumb) grow their target to 28 px or more. The drawing may be smaller than its target, never larger.",
    how: "Heights are set per density on the component; small controls extend their hit area with an ::after. --ll-hit-min (24 px) is the floor for anything you build, and --ll-hit (40, 32, 28) is a token for your own controls.",
    check: "By construction, and the density page measures the boxes in your browser. axe's target-size rule needs real layout, so jsdom cannot run it.",
  },
  {
    area: "Screen readers",
    href: "screen-readers",
    promise: "The drawing is silent. Text is real text, so what is read out is what a plain page would say.",
    how: "Every ink layer is aria-hidden, focusable=false and pointer-events none. Named art (an icon with a label, a stamp) is role=img.",
    check: "The linter rejects ink without aria-hidden; every component's test asserts the ink conventions.",
  },
  {
    area: "Handwritten text",
    href: "jitter",
    promise: "Jittered text is ordinary text: it wraps, selects, copies, searches and reads as typed.",
    how: "Words are inline-blocks with real spaces between them, moved by a transform. Calm density and reduced motion turn the jitter off.",
    check: "Handwritten's tests compare the text content with the source.",
  },
]

const KEYS: readonly { keys: string[]; does: string }[] = [
  { keys: ["Tab", "Shift + Tab"], does: "Move between controls. A radio group, toggle group, tab list, menu bar or slider is one stop, and the arrow keys move inside it." },
  { keys: ["Enter", "Space"], does: "Press a button, toggle a switch or a checkbox, open a trigger." },
  { keys: ["Arrow keys"], does: "Move inside a group, a menu, a calendar or a list; change a slider by one step (with Shift, or Page Up and Page Down, by ten)." },
  { keys: ["Home", "End"], does: "Jump to the first or last item of a group, a slider's ends, the first and last tile in the galleries of these pages." },
  { keys: ["Esc"], does: "Close a dialog, sheet, popover or menu. Focus goes back to the control that opened it." },
]

const TEST = `import axe from "axe-core"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "@/components/ui/button"

test("Save is a button that can be pressed with the keyboard", async () => {
  const onClick = vi.fn()
  const { container, getByRole } = render(<Button onClick={onClick}>Save</Button>)

  await userEvent.tab()
  expect(getByRole("button", { name: "Save" })).toHaveFocus()
  await userEvent.keyboard("{Enter}")
  expect(onClick).toHaveBeenCalled()

  const results = await axe.run(container, { rules: { "color-contrast": { enabled: false }, "target-size": { enabled: false } } })
  expect(results.violations).toEqual([])
})`

const QA = `node tools/qa.mjs button            # lint, class check, tokens, types, registry scan, the component's tests, SSR + hydration smoke
node tools/check-tokens.mjs        # every contrast pair, in the default theme and each [data-theme]
node tools/heavy.mjs -- vitest run tests/button.test.tsx`

const CSP = `Content-Security-Policy:
  img-src        'self' data:;             /* the grain masks and paper tiles are data: images */
  style-src      'self' 'nonce-…';         /* the paper tiles are inline <style> blocks: give them the nonce */
  style-src-attr 'unsafe-inline';          /* only when you render on the server: a nonce does not cover style="" attributes in HTML */
  font-src       'self';                   /* the hand fonts are ordinary files (@fontsource) */`

export default function AccessibilityBody() {
  return (
    <>
      <Section id="guarantees" title="What is guaranteed" description="Nine promises, how each is kept and how it is checked. Where a check is missing, the table says so.">
        <DataTable label="The nine promises" minWidth="46rem">
          <thead>
            <tr>
              <th scope="col">Area</th>
              <th scope="col">The promise</th>
              <th scope="col">How it is kept</th>
              <th scope="col">Checked by</th>
            </tr>
          </thead>
          <tbody>
            {GUARANTEES.map((g) => (
              <tr key={g.area}>
                <th scope="row">
                  <SectionLink id={g.href}>{g.area}</SectionLink>
                </th>
                <td>{g.promise}</td>
                <td>{g.how}</td>
                <td>{g.check}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Section>

      <Section id="keyboard" title="Keyboard" description="Underneath every part is a Radix primitive or a native element, exactly as in shadcn/ui, so the keys are the ones people already know.">
        <KeyboardStrip />
        <DataTable label="Keys" minWidth="30rem">
          <thead>
            <tr>
              <th scope="col">Keys</th>
              <th scope="col">What they do</th>
            </tr>
          </thead>
          <tbody>
            {KEYS.map((k) => (
              <tr key={k.keys.join()}>
                <td className="whitespace-nowrap">
                  {k.keys.map((key, i) => (
                    <span key={key}>
                      {i ? " " : null}
                      <Kbd>{key}</Kbd>
                    </span>
                  ))}
                </td>
                <td>{k.does}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
        <Prose>
          <p>
            A press on a drawn control has no different keyboard path from a plain button: the drawing is an <InlineCode>aria-hidden</InlineCode> svg with <InlineCode>pointer-events: none</InlineCode> laid over the element, so it cannot be tabbed to,
            clicked or read. The hit area is the element&apos;s own box.
          </p>
        </Prose>
      </Section>

      <Section id="focus" title="Focus" description="A hand-drawn ring in blue felt: the color that means you and anything you can act on.">
        <FocusSpecimens />
        <Prose>
          <p>
            The ring is a rounded rectangle, 2.2 px, 4 px off the control, with a tick at each corner. It shows for <InlineCode>:focus-visible</InlineCode> only (keyboard, not a mouse click), sits above the drawing, and reaches 8 to 12 px past the
            box without changing the layout. Round controls get an ellipse. On paper it is {ratio("ring", "card")} : 1; on the bare desk {ratio("ring", "background")} : 1, above the 3 : 1 that non-text marks need. The specimens above are forced with{" "}
            <InlineCode>data-focus-visible</InlineCode>, the same layer the keyboard shows.
          </p>
          <p>
            Because it reaches past the box, a parent with <InlineCode>overflow: hidden</InlineCode>, <InlineCode>auto</InlineCode> or <InlineCode>clip</InlineCode> will cut it off. Pad scroll containers by 12 px, as <InlineCode>ScrollArea</InlineCode> does.
          </p>
        </Prose>
      </Section>

      <Section id="contrast" title="Contrast" description="Every color is a token, and every pair that carries text or a mark is measured on the real values.">
        <ContrastSection />
        <Prose>
          <ul>
            <li>
              <strong>Ink on paper is {ratio("card-foreground", "card")} : 1.</strong> Text straight on the desk is limited to ink, soft ink and muted text ({ratio("foreground", "background")}, {ratio("--ll-ink-soft", "--ll-desk")} and {ratio("muted-foreground", "background")} : 1); the colored inks are for paper.
            </li>
            <li>
              <strong>Drawn lines are marks, not text.</strong> Outlines and field edges are {ratio("border", "card")} : 1 (above the 3 : 1 that WCAG asks of a control&apos;s boundary). Ruled lines and shadows are decorative and deliberately fainter.
            </li>
            <li>
              <strong>Stationery colors never carry text.</strong> They live in stickers, tape, badges and chart fills. Ink on a tomato or grape sticker is {ratio("--ll-ink", "--ll-tomato")} : 1, so words on those stay large or bold, or move to another color.
            </li>
            <li>
              <strong>Disabled controls are exempt</strong> from contrast, as WCAG allows. They are drawn dashed and pale, and a graphite wash keeps them findable.
            </li>
          </ul>
        </Prose>
      </Section>

      <Section id="motion" title="Reduced motion" description="The system setting and the docs' own calm-ink switch (in the settings menu at the top) do the same thing.">
        <MotionCompare />
        <Prose>
          <p>
            <InlineCode>prefers-reduced-motion</InlineCode> and <InlineCode>[data-motion=&quot;reduced&quot;]</InlineCode> both set <InlineCode>--ll-motion</InlineCode> to 0, which collapses every duration token, and end every animation and transition at once. Animations fill forwards, so the
            end state is the drawn one: a tick that would have been written on is simply there. The right-hand specimen above is a{" "}
            <InlineCode>motion=&quot;reduced&quot;</InlineCode> island. If your system is already set to reduce motion, both sides are still.
          </p>
          <p>
            Boiling lines, per-word jitter and hover tilt are decoration and stop with it. What a state means never depends on motion: hover is a drawn offset and drop-lines, not only a movement.
          </p>
        </Prose>
      </Section>

      <Section id="forced-colors" title="Forced colors" description="Windows high contrast replaces colors, shadows and svg fills with a handful of system colors. A drawing built from fills would become solid blobs, so it steps aside.">
        <DataTable label="What changes in forced colors" minWidth="36rem">
          <thead>
            <tr>
              <th scope="col">Part</th>
              <th scope="col">Normally</th>
              <th scope="col">In forced colors</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Controls, fields, toggles (overlay ink)</td>
              <td>A hand-drawn outline and marker fill</td>
              <td>The drawing is hidden; the host gets a 1 px ButtonBorder outline.</td>
            </tr>
            <tr>
              <td>Focus</td>
              <td>The blue drawn ring</td>
              <td>A 3 px Highlight outline, 2 px off the control.</td>
            </tr>
            <tr>
              <td>Paper (cards, sheets)</td>
              <td>Tooth, light and a warm shadow</td>
              <td>A 1 px CanvasText outline.</td>
            </tr>
            <tr>
              <td>Highlighted text</td>
              <td>A highlighter swipe</td>
              <td>The system Mark colors.</td>
            </tr>
            <tr>
              <td>Icons, doodles, stickers, stamps, tape, Stubby</td>
              <td>Drawn art in ink and color</td>
              <td>Kept, because it is the content. Expect it in system colors.</td>
            </tr>
            <tr>
              <td>Charts</td>
              <td>Drawn marks with a hatch per series</td>
              <td>The visually hidden data table is the way in.</td>
            </tr>
          </tbody>
        </DataTable>
        <Prose>
          <p>
            To try it without Windows, use Chrome or Edge DevTools: Rendering, then <em>Emulate CSS media feature forced-colors</em> set to <em>active</em>.
          </p>
        </Prose>
      </Section>

      <Section id="rtl" title="Right to left" description="The page direction is whatever dir says; the layout, the moving parts and the direction glyphs follow.">
        <RtlCompare />
        <Prose>
          <p>
            Class lists use logical properties (<InlineCode>ms-*</InlineCode>, <InlineCode>pe-*</InlineCode>, <InlineCode>start</InlineCode>, <InlineCode>end</InlineCode>) and an <InlineCode>rtl:</InlineCode> twin for anything that has to be physical, such as a switch thumb.
            Chevrons, arrows and side panels carry a flag so they turn themselves round. Two things are yours: wrap the app in Radix&apos;s <InlineCode>DirectionProvider</InlineCode> so arrow keys and sliders read the direction, and remember Kevin Sans covers Latin only: Arabic and Hebrew fall back to whatever
            your system has.
          </p>
        </Prose>
      </Section>

      <Section id="targets" title="Touch targets" description="The size of a hit area comes from the component and the density, and never goes under 24 px.">
        <TargetsDemo />
        <DataTable label="Hit areas by density" minWidth="34rem">
          <thead>
            <tr>
              <th scope="col">Density</th>
              <th scope="col">Button, input, icon button</th>
              <th scope="col">Checkbox, radio, switch</th>
              <th scope="col">Meant for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>comfortable</td>
              <td>36 px tall</td>
              <td>28 px or more</td>
              <td>Pages, forms, touch screens (the default).</td>
            </tr>
            <tr>
              <td>compact</td>
              <td>32 px tall</td>
              <td>28 px or more</td>
              <td>Toolbars and dense forms on a pointer.</td>
            </tr>
            <tr>
              <td>calm</td>
              <td>28 px tall</td>
              <td>28 px or more</td>
              <td>Data tables and admin screens: hairline rules, no wobble.</td>
            </tr>
          </tbody>
        </DataTable>
        <Prose>
          <p>
            The floor is <InlineCode>--ll-hit-min: 24px</InlineCode>, WCAG 2.5.8 (the <InlineCode>xs</InlineCode> button sits exactly on it). Text floors do not move with the density: 14 px labels, 16 px input text on
            touch screens, 12 px chart axes. A checkbox is drawn 16 px, a radio 16 px and a switch 24 px tall (20 in calm), and each grows its target with a pseudo-element, so the target is bigger than what you see.
            <InlineCode> --ll-hit</InlineCode> (40, 32 and 28 px) is there for controls you build yourself, as <InlineCode>h-hit</InlineCode> or <InlineCode>size-hit</InlineCode>; the library&apos;s own controls do not read it.
          </p>
        </Prose>
      </Section>

      <Section id="screen-readers" title="What a screen reader gets" description="The svg below each drawing is read straight from the DOM of the row, not written by hand.">
        <ScreenReaderProbe />
        <Prose>
          <ul>
            <li>
              <strong>Icons, doodles, stickers and Stubby are decorative until you name them.</strong> Pass <InlineCode>label</InlineCode> when the picture is the message.
            </li>
            <li>
              <strong>Stamps and seals are the words on them.</strong> A stamp is a message by nature, so it is <InlineCode>role=&quot;img&quot;</InlineCode> with its text as the name. Use <InlineCode>decorative</InlineCode> on a seal that repeats nearby text.
            </li>
            <li>
              <strong>Ink layers are never in the tree.</strong> Every drawing that decorates a control is <InlineCode>aria-hidden</InlineCode>, <InlineCode>focusable=&quot;false&quot;</InlineCode> and <InlineCode>pointer-events: none</InlineCode>.
            </li>
            <li>
              <strong>Charts ship a table.</strong> Each chart has its data as a visually hidden table next to the drawing, one tab stop with arrow-key navigation, and a spoken summary.
            </li>
            <li>
              <strong>Empty-state scenes are decoration.</strong> The words in <InlineCode>Empty</InlineCode> are real text and carry the meaning.
            </li>
          </ul>
        </Prose>
      </Section>

      <Section id="jitter" title="Handwritten text" description="Per-word jitter is a transform on ordinary words, not a picture of words.">
        <JitterDemo />
        <Prose>
          <p>
            <InlineCode>Handwritten</InlineCode> sets each word in an inline-block with a small, seeded offset and turn. The spaces between are real, so the text wraps, selects, copies, is found by the browser&apos;s search and is read as one sentence. Code, keys, links,
            form controls and media inside it are left exactly as typed. Calm density and reduced motion set the strength to zero.
          </p>
        </Prose>
      </Section>

      <Section id="limits" title="What is not guaranteed" description="Places where the library is honest about its edges.">
        <Callout tone="warn" title="Read these before you ship">
          <Prose>
            <ul>
              <li>
                <strong>Real assistive technology.</strong> The checks are axe and Testing Library in jsdom. No screen-reader run (VoiceOver, NVDA, JAWS, TalkBack) is recorded for the library; test your own pages with one.
              </li>
              <li>
                <strong>Legibility of a hand.</strong> Handwriting faces are not equally easy for everyone to read. They start at 14 px (labels) and 16 px (inputs on touch), the script role is for titles and numbers only, and the font tokens can be pointed at any face. Calm density is the quietest setting.
              </li>
              <li>
                <strong>Known contrast limits.</strong> Red pencil on paper-shade is {ratio("--ll-red", "--ll-paper-shade")} : 1 (errors belong on paper); ink on tomato and grape stickers is {ratio("--ll-ink", "--ll-tomato")} : 1; drawn graphite on paper-shade is {ratio("--ll-pencil", "--ll-paper-shade")} : 1, for marks and not for small text.
              </li>
              <li>
                <strong>Target size is by construction, not by a test.</strong> The smallest <InlineCode>Rating</InlineCode> (20 px stars) and any rating that allows half stars (each half is a button 10 to 16 px wide) are under the 24 px floor; use a larger
                size where people will tap them.
              </li>
              <li>
                <strong>Focus after a dialog with no trigger.</strong> A dialog, alert dialog or sheet opened without its own <InlineCode>Trigger</InlineCode> (opened from state, a menu item or a shortcut) drops focus on the page when it closes. Send it back yourself until the parts do.
              </li>
              <li>
                <strong>A clipped ring.</strong> A focus ring inside an <InlineCode>overflow: hidden</InlineCode> parent is cut off (see Focus).
              </li>
              <li>
                <strong>Zoom and reflow.</strong> Text is real text in flex and grid layouts, and drawings redraw when their box changes, but 400 percent zoom has not been walked through screen by screen.
              </li>
              <li>
                <strong>Other scripts.</strong> The hand fonts cover Latin; other scripts fall back to system fonts, which changes the look and the metrics the drawings were made for.
              </li>
            </ul>
          </Prose>
        </Callout>
      </Section>

      <Section id="testing" title="How to test" description="What runs here, what to run in your app, and a manual pass that takes ten minutes.">
        <CodeBlock code={TEST} lang="tsx" title="button.a11y.test.tsx" />
        <CodeBlock code={QA} lang="bash" title="In this repository" copy={false} />
        <Prose>
          <p>
            In jsdom nothing has a size, so drawn hosts stay in their plain fallback and your assertions see ordinary elements: that is what you want for roles, names and keys. (This repository&apos;s own tests give hosts a box first to check the drawing too.) The manual pass:
          </p>
          <ol>
            <li>Put the mouse away and do the task with the keyboard. Can you see where you are at every step?</li>
            <li>Turn on a screen reader and go through the same page. Is every control named, and is nothing read twice?</li>
            <li>
              In DevTools, Rendering: emulate <em>prefers-reduced-motion</em>, then <em>forced-colors</em>. Does anything vanish or keep moving?
            </li>
            <li>
              Set <InlineCode>document.documentElement.dir = &quot;rtl&quot;</InlineCode>. Does the layout mirror, and do arrows point the right way?
            </li>
            <li>
              Set <InlineCode>data-density=&quot;calm&quot;</InlineCode> on the root. Is everything still 24 px or more?
            </li>
            <li>Zoom to 200 and then 400 percent. Does text reflow without sideways scrolling?</li>
          </ol>
        </Prose>
      </Section>

      <Section id="browsers" title="Known browser caveats" description="The drawing was built and checked with rendered sheets and jsdom, not in every engine. These are the places we would look first, and what happens if they fail.">
        <ul role="list" className="m-0 grid list-none gap-4 p-0 [grid-template-columns:repeat(auto-fill,minmax(min(19rem,100%),1fr))]">
          <CaveatCard title="Many masked drawings on one page" status="Not measured in Safari or Firefox">
            <p>Every stroke group carries a grain mask, so a page with hundreds of drawn controls costs compositing time.</p>
            <p>If it drags: use calm density, fewer drawn hosts (rows in a long list use a highlighter background, not a drawing) and the default low tier.</p>
          </CaveatCard>
          <CaveatCard title="State layers use :has()" status="Firefox 121+, Safari 15.4+, Chromium 105+">
            <p>Hover, focus, checked and open are separate drawn layers that CSS shows from the host&apos;s state, with :has().</p>
            <p>An engine without it shows the resting drawing and no state changes; the real element and its attributes still work.</p>
          </CaveatCard>
          <CaveatCard title="Svg features that are new to some engines" status="Unverified in engines">
            <p>Animating a child of a mask, clip-path: inset() on svg groups (the slider range, the write-on wipe) and translate or rotate on a g element.</p>
            <p>If one fails, the mark appears whole instead of being written on.</p>
          </CaveatCard>
          <CaveatCard title="Drop shadows on svg children" status="Patchy in WebKit">
            <p>Scene shadows are CSS filter: drop-shadow() on groups inside one svg.</p>
            <p>Where it is ignored, papers and stickers lie flat with their hairline edge.</p>
          </CaveatCard>
          <CaveatCard title="Auto-growing textareas" status="field-sizing: content is missing in Firefox">
            <p>The textarea keeps its minimum height instead of growing with its text.</p>
            <p>Set rows, or grow it with a few lines of script.</p>
          </CaveatCard>
          <CaveatCard title="Multiply blending" status="Judge it on your own backgrounds">
            <p>Markers and highlighters darken the paper under them with mix-blend-mode. On a busy or dark background they turn muddy.</p>
            <p>Draw on paper, not straight on the desk, or set --ll-blend to normal in your theme.</p>
          </CaveatCard>
        </ul>
      </Section>

      <Section id="csp" title="Content-Security-Policy" description="Nothing is fetched at runtime, but two things are inline.">
        <Prose>
          <ul>
            <li>
              The grain masks are <InlineCode>&lt;image href=&quot;data:image/png;base64,…&quot;&gt;</InlineCode> inside the page&apos;s svg defs, and the paper tiles and heading rules are <InlineCode>url(data:…)</InlineCode> images. That needs{" "}
              <InlineCode>img-src data:</InlineCode>.
            </li>
            <li>
              Paper tiles arrive as inline <InlineCode>&lt;style&gt;</InlineCode> blocks (React hoists one per tile, once), and many parts set custom properties in style attributes. A style nonce covers the blocks. It does not cover a{" "}
              <InlineCode>style=&quot;&quot;</InlineCode> attribute in server-rendered HTML, which needs <InlineCode>style-src-attr &apos;unsafe-inline&apos;</InlineCode> (or <InlineCode>&apos;unsafe-inline&apos;</InlineCode> for <InlineCode>style-src</InlineCode>); a client-rendered
              React app sets styles through the CSSOM, which a policy allows.
            </li>
            <li>
              The fonts are files from your own origin. There are no scripts to allow, no eval and no remote calls.
            </li>
          </ul>
        </Prose>
        <CodeBlock code={CSP} lang="text" title="Content-Security-Policy" copy={false} />
        <Callout tone="tip" title="Trim what you do not use">
          <p>
            <InlineCode>InkProvider</InlineCode> adds about 100 KB of masks once; each <InlineCode>Paper</InlineCode> adds only the tiles of its stock. A page with no drawn control can pass <InlineCode>defs=&#123;false&#125;</InlineCode>.
          </p>
        </Callout>
      </Section>
    </>
  )
}

function SectionLink({ id, children }: { id: string; children: string }) {
  return <a href={useAnchorHref(id)}>{children}</a>
}
