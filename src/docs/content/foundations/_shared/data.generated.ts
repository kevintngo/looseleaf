import type { ContrastRow, DurationRow, EasingRow, Expr, ForestData, KnobRow, PaletteEntry } from "./data-types"

export const PALETTE: PaletteEntry[] = [
 {
  "token": "--ll-desk",
  "value": "#a8c8bb",
  "role": "clean mint-sage blotter; makes cream paper glow",
  "alias": "",
  "group": "surface",
  "onPaper": 1.66,
  "onDesk": 1,
  "inkOn": 8.49
 },
 {
  "token": "--ll-desk-deep",
  "value": "#93b4a7",
  "role": "vignette, desk edges. Decoration only, never behind text",
  "alias": "",
  "group": "surface",
  "onPaper": 2.07,
  "onDesk": 1.25,
  "inkOn": 6.8
 },
 {
  "token": "--ll-paper",
  "value": "#f8f5ee",
  "role": "main sheet stock, the \"card\" of the notebook",
  "alias": "",
  "group": "surface",
  "onPaper": 1,
  "onDesk": 1.66,
  "inkOn": 14.06
 },
 {
  "token": "--ll-paper-shade",
  "value": "#ece6da",
  "role": "darker cloud of the sheet: muted fills, code chips, \"more\" bands",
  "alias": "",
  "group": "surface",
  "onPaper": 1.14,
  "onDesk": 1.45,
  "inkOn": 12.32
 },
 {
  "token": "--ll-slip",
  "value": "#fbf8f1",
  "role": "scraps: popovers, menus, torn slips",
  "alias": "",
  "group": "surface",
  "onPaper": 1.03,
  "onDesk": 1.7,
  "inkOn": 14.43
 },
 {
  "token": "--ll-card",
  "value": "#fbf6e9",
  "role": "index card stock (Tailwind name: index-card)",
  "alias": "",
  "group": "surface",
  "onPaper": 1.01,
  "onDesk": 1.67,
  "inkOn": 14.19
 },
 {
  "token": "--ll-graph",
  "value": "#f4f7ef",
  "role": "graph / dot-grid paper",
  "alias": "",
  "group": "surface",
  "onPaper": 1.01,
  "onDesk": 1.67,
  "inkOn": 14.14
 },
 {
  "token": "--ll-kraft",
  "value": "#dcc8a3",
  "role": "kraft envelope, stitched border, gummed tape",
  "alias": "",
  "group": "surface",
  "onPaper": 1.5,
  "onDesk": 1.1,
  "inkOn": 9.36
 },
 {
  "token": "--ll-check",
  "value": "#dfe9d8",
  "role": "guest-check ledger green",
  "alias": "",
  "group": "surface",
  "onPaper": 1.15,
  "onDesk": 1.44,
  "inkOn": 12.24
 },
 {
  "token": "--ll-pad",
  "value": "#f8f2de",
  "role": "order pad: the sidebar",
  "alias": "",
  "group": "surface",
  "onPaper": 1.03,
  "onDesk": 1.61,
  "inkOn": 13.67
 },
 {
  "token": "--ll-photo",
  "value": "#fffdf6",
  "role": "polaroid border, sticker border. The whitest thing allowed",
  "alias": "",
  "group": "surface",
  "onPaper": 1.07,
  "onDesk": 1.77,
  "inkOn": 15.04
 },
 {
  "token": "--ll-rule-blue",
  "value": "#8fb0d4",
  "role": "index-card ruling",
  "alias": "",
  "group": "surface",
  "onPaper": 2.07,
  "onDesk": 1.25,
  "inkOn": 6.8
 },
 {
  "token": "--ll-rule-red",
  "value": "#d9776a",
  "role": "index-card header line",
  "alias": "",
  "group": "surface",
  "onPaper": 2.84,
  "onDesk": 1.71,
  "inkOn": 4.96
 },
 {
  "token": "--ll-pad-rule",
  "value": "#b2c3dc",
  "role": "pad ruling. DNA had #bccbe0 (1.47:1 on the pad); darkened to reach 1.5:1 as a drawn line",
  "alias": "",
  "group": "surface",
  "onPaper": 1.64,
  "onDesk": 1.01,
  "inkOn": 8.55
 },
 {
  "token": "--ll-check-rule",
  "value": "#7fa37c",
  "role": "ledger ruling",
  "alias": "",
  "group": "surface",
  "onPaper": 2.59,
  "onDesk": 1.57,
  "inkOn": 5.42
 },
 {
  "token": "--ll-sticky-yellow",
  "value": "#f7e38a",
  "role": "the classic",
  "alias": "",
  "group": "surface",
  "onPaper": 1.18,
  "onDesk": 1.4,
  "inkOn": 11.89
 },
 {
  "token": "--ll-sticky-green",
  "value": "#cfe6a8",
  "role": "sage sticky",
  "alias": "",
  "group": "surface",
  "onPaper": 1.24,
  "onDesk": 1.33,
  "inkOn": 11.33
 },
 {
  "token": "--ll-sticky-orange",
  "value": "#f7c08e",
  "role": "apricot sticky",
  "alias": "",
  "group": "surface",
  "onPaper": 1.5,
  "onDesk": 1.11,
  "inkOn": 9.39
 },
 {
  "token": "--ll-sticky-pink",
  "value": "#f6b8b0",
  "role": "salmon sticky",
  "alias": "",
  "group": "surface",
  "onPaper": 1.56,
  "onDesk": 1.07,
  "inkOn": 9.04
 },
 {
  "token": "--ll-sticky-blue",
  "value": "#bcd8f0",
  "role": "powder-blue sticky",
  "alias": "",
  "group": "surface",
  "onPaper": 1.36,
  "onDesk": 1.22,
  "inkOn": 10.37
 },
 {
  "token": "--ll-ink",
  "value": "#2a2420",
  "role": "brown-black felt tip: body text, the system's voice",
  "alias": "",
  "group": "ink",
  "onPaper": 14.06,
  "onDesk": 8.49,
  "inkOn": 1
 },
 {
  "token": "--ll-ink-soft",
  "value": "#4a423b",
  "role": "secondary text; the lightest text allowed straight on the desk (4.64:1)",
  "alias": "",
  "group": "ink",
  "onPaper": 9.04,
  "onDesk": 5.46,
  "inkOn": 1.56
 },
 {
  "token": "--ll-ink-muted",
  "value": "#4a433c",
  "role": "muted text. DESIGN had #4d4640, measured 4.37:1 on the desk; darkened to 4.59 so muted text passes on paper AND desk",
  "alias": "",
  "group": "ink",
  "onPaper": 8.93,
  "onDesk": 5.39,
  "inkOn": 1.57
 },
 {
  "token": "--ll-ink-you",
  "value": "#2c4f9e",
  "role": "blue felt: you, links, chosen, typed input, focus",
  "alias": "",
  "group": "ink",
  "onPaper": 7.09,
  "onDesk": 4.28,
  "inkOn": 1.98
 },
 {
  "token": "--ll-pencil",
  "value": "#6b6660",
  "role": "graphite for drawn meta marks and large text (5.2:1 on paper)",
  "alias": "",
  "group": "ink",
  "onPaper": 5.22,
  "onDesk": 3.15,
  "inkOn": 2.69
 },
 {
  "token": "--ll-pencil-text",
  "value": "#5a554e",
  "role": "graphite that is safe for small text on every paper stock (5.9:1 on paper-shade)",
  "alias": "",
  "group": "ink",
  "onPaper": 6.78,
  "onDesk": 4.09,
  "inkOn": 2.07
 },
 {
  "token": "--ll-pencil-mark",
  "value": "#8e887f",
  "role": "graphite for lines only, never text (3.2:1 on paper)",
  "alias": "",
  "group": "ink",
  "onPaper": 3.23,
  "onDesk": 1.95,
  "inkOn": 4.36
 },
 {
  "token": "--ll-red",
  "value": "#c2412d",
  "role": "red pencil: correction, danger, error text (4.7:1)",
  "alias": "",
  "group": "ink",
  "onPaper": 4.72,
  "onDesk": 2.85,
  "inkOn": 2.98
 },
 {
  "token": "--ll-green",
  "value": "#3b7a4b",
  "role": "green pencil: ok, added (4.7:1)",
  "alias": "",
  "group": "ink",
  "onPaper": 4.74,
  "onDesk": 2.86,
  "inkOn": 2.97
 },
 {
  "token": "--ll-marker",
  "value": "#df6b3c",
  "role": "terracotta marker: the primary action (ink label 4.6:1)",
  "alias": "",
  "group": "ink",
  "onPaper": 3.06,
  "onDesk": 1.85,
  "inkOn": 4.6
 },
 {
  "token": "--ll-orange-text",
  "value": "#a4502a",
  "role": "working / warm status text (5.1:1); marker itself is fill only",
  "alias": "",
  "group": "ink",
  "onPaper": 5.13,
  "onDesk": 3.1,
  "inkOn": 2.74
 },
 {
  "token": "--ll-hi",
  "value": "#f8dc4c",
  "role": "yellow highlighter: emphasis, selection, active row (fill only)",
  "alias": "",
  "group": "ink",
  "onPaper": 1.26,
  "onDesk": 1.32,
  "inkOn": 11.18
 },
 {
  "token": "--ll-hi-deep",
  "value": "#a87f0c",
  "role": "highlighter as a mark that must be seen on paper (chart series, 3.4:1)",
  "alias": "",
  "group": "ink",
  "onPaper": 3.38,
  "onDesk": 2.04,
  "inkOn": 4.16
 },
 {
  "token": "--ll-focus",
  "value": "#2c4f9e",
  "role": "focus mark colour; one token recolours every ring",
  "alias": "",
  "group": "ink",
  "onPaper": 7.09,
  "onDesk": 4.28,
  "inkOn": 1.98
 },
 {
  "token": "--ll-link-hover",
  "value": "#1f3b7a",
  "role": "darker blue on hover",
  "alias": "",
  "group": "ink",
  "onPaper": 9.82,
  "onDesk": 5.93,
  "inkOn": 1.43
 },
 {
  "token": "--ll-check-ink",
  "value": "#2f6b45",
  "role": "ledger print (5.1:1 on the ledger)",
  "alias": "",
  "group": "ink",
  "onPaper": 5.83,
  "onDesk": 3.52,
  "inkOn": 2.41
 },
 {
  "token": "--ll-check-no",
  "value": "#b23a28",
  "role": "ledger \"no\" red (4.8:1 on the ledger)",
  "alias": "",
  "group": "ink",
  "onPaper": 5.47,
  "onDesk": 3.3,
  "inkOn": 2.57
 },
 {
  "token": "--ll-tomato",
  "value": "#e8483a",
  "role": "ink label 3.95:1: keep sticker text large or dark",
  "alias": "",
  "group": "accent",
  "onPaper": 3.56,
  "onDesk": 2.15,
  "inkOn": 3.95
 },
 {
  "token": "--ll-tangerine",
  "value": "#f59a2f",
  "role": "ink label 7.0:1",
  "alias": "",
  "group": "accent",
  "onPaper": 2.02,
  "onDesk": 1.22,
  "inkOn": 6.96
 },
 {
  "token": "--ll-lemon",
  "value": "#fbd63a",
  "role": "ink label 10.8:1",
  "alias": "",
  "group": "accent",
  "onPaper": 1.3,
  "onDesk": 1.27,
  "inkOn": 10.78
 },
 {
  "token": "--ll-grass",
  "value": "#5db85c",
  "role": "ink label 6.2:1",
  "alias": "",
  "group": "accent",
  "onPaper": 2.28,
  "onDesk": 1.37,
  "inkOn": 6.18
 },
 {
  "token": "--ll-teal",
  "value": "#2fb1a3",
  "role": "ink label 5.8:1",
  "alias": "",
  "group": "accent",
  "onPaper": 2.43,
  "onDesk": 1.47,
  "inkOn": 5.79
 },
 {
  "token": "--ll-sky",
  "value": "#4aa8e8",
  "role": "ink label 5.9:1",
  "alias": "",
  "group": "accent",
  "onPaper": 2.39,
  "onDesk": 1.45,
  "inkOn": 5.87
 },
 {
  "token": "--ll-grape",
  "value": "#8f6fd6",
  "role": "ink label 3.95:1: keep sticker text large or dark",
  "alias": "",
  "group": "accent",
  "onPaper": 3.56,
  "onDesk": 2.15,
  "inkOn": 3.95
 },
 {
  "token": "--ll-bubblegum",
  "value": "#f38bb8",
  "role": "ink label 6.7:1",
  "alias": "",
  "group": "accent",
  "onPaper": 2.1,
  "onDesk": 1.27,
  "inkOn": 6.7
 }
]

export const ROLES: PaletteEntry[] = [
 {
  "token": "--background",
  "value": "#a8c8bb",
  "role": "the desk. Text on it: ink / ink-soft / muted only",
  "alias": "var(--ll-desk)",
  "group": "shadcn",
  "onPaper": 1.66,
  "onDesk": 1,
  "inkOn": 8.49
 },
 {
  "token": "--foreground",
  "value": "#2a2420",
  "role": "",
  "alias": "var(--ll-ink)",
  "group": "shadcn",
  "onPaper": 14.06,
  "onDesk": 8.49,
  "inkOn": 1
 },
 {
  "token": "--card",
  "value": "#f8f5ee",
  "role": "",
  "alias": "var(--ll-paper)",
  "group": "shadcn",
  "onPaper": 1,
  "onDesk": 1.66,
  "inkOn": 14.06
 },
 {
  "token": "--card-foreground",
  "value": "#2a2420",
  "role": "",
  "alias": "var(--ll-ink)",
  "group": "shadcn",
  "onPaper": 14.06,
  "onDesk": 8.49,
  "inkOn": 1
 },
 {
  "token": "--popover",
  "value": "#fbf8f1",
  "role": "",
  "alias": "var(--ll-slip)",
  "group": "shadcn",
  "onPaper": 1.03,
  "onDesk": 1.7,
  "inkOn": 14.43
 },
 {
  "token": "--popover-foreground",
  "value": "#2a2420",
  "role": "",
  "alias": "var(--ll-ink)",
  "group": "shadcn",
  "onPaper": 14.06,
  "onDesk": 8.49,
  "inkOn": 1
 },
 {
  "token": "--primary",
  "value": "#df6b3c",
  "role": "",
  "alias": "var(--ll-marker)",
  "group": "shadcn",
  "onPaper": 3.06,
  "onDesk": 1.85,
  "inkOn": 4.6
 },
 {
  "token": "--primary-foreground",
  "value": "#2a2420",
  "role": "",
  "alias": "var(--ll-ink)",
  "group": "shadcn",
  "onPaper": 14.06,
  "onDesk": 8.49,
  "inkOn": 1
 },
 {
  "token": "--secondary",
  "value": "#f8ecb5",
  "role": "highlighter tint",
  "alias": "color-mix(in srgb, var(--ll-hi) 35%, var(--ll-paper))",
  "group": "shadcn",
  "onPaper": 1.09,
  "onDesk": 1.52,
  "inkOn": 12.87
 },
 {
  "token": "--secondary-foreground",
  "value": "#2a2420",
  "role": "",
  "alias": "var(--ll-ink)",
  "group": "shadcn",
  "onPaper": 14.06,
  "onDesk": 8.49,
  "inkOn": 1
 },
 {
  "token": "--muted",
  "value": "#ece6da",
  "role": "",
  "alias": "var(--ll-paper-shade)",
  "group": "shadcn",
  "onPaper": 1.14,
  "onDesk": 1.45,
  "inkOn": 12.32
 },
 {
  "token": "--muted-foreground",
  "value": "#4a433c",
  "role": "",
  "alias": "var(--ll-ink-muted)",
  "group": "shadcn",
  "onPaper": 8.93,
  "onDesk": 5.39,
  "inkOn": 1.57
 },
 {
  "token": "--accent",
  "value": "#f8e68a",
  "role": "highlighter wash: hover / selected rows",
  "alias": "color-mix(in srgb, var(--ll-hi) 62%, var(--ll-paper))",
  "group": "shadcn",
  "onPaper": 1.16,
  "onDesk": 1.43,
  "inkOn": 12.16
 },
 {
  "token": "--accent-foreground",
  "value": "#2a2420",
  "role": "",
  "alias": "var(--ll-ink)",
  "group": "shadcn",
  "onPaper": 14.06,
  "onDesk": 8.49,
  "inkOn": 1
 },
 {
  "token": "--destructive",
  "value": "#c2412d",
  "role": "",
  "alias": "var(--ll-red)",
  "group": "shadcn",
  "onPaper": 4.72,
  "onDesk": 2.85,
  "inkOn": 2.98
 },
 {
  "token": "--destructive-foreground",
  "value": "#fbf8f1",
  "role": "",
  "alias": "var(--ll-slip)",
  "group": "shadcn",
  "onPaper": 1.03,
  "onDesk": 1.7,
  "inkOn": 14.43
 },
 {
  "token": "--border",
  "value": "#8e887f",
  "role": "the stroke colour of drawn lines",
  "alias": "var(--ll-pencil-mark)",
  "group": "shadcn",
  "onPaper": 3.23,
  "onDesk": 1.95,
  "inkOn": 4.36
 },
 {
  "token": "--input",
  "value": "#8e887f",
  "role": "",
  "alias": "var(--ll-pencil-mark)",
  "group": "shadcn",
  "onPaper": 3.23,
  "onDesk": 1.95,
  "inkOn": 4.36
 },
 {
  "token": "--ring",
  "value": "#2c4f9e",
  "role": "",
  "alias": "var(--ll-focus)",
  "group": "shadcn",
  "onPaper": 7.09,
  "onDesk": 4.28,
  "inkOn": 1.98
 },
 {
  "token": "--chart-1",
  "value": "#df6b3c",
  "role": "",
  "alias": "var(--ll-marker)",
  "group": "shadcn",
  "onPaper": 3.06,
  "onDesk": 1.85,
  "inkOn": 4.6
 },
 {
  "token": "--chart-2",
  "value": "#2c4f9e",
  "role": "",
  "alias": "var(--ll-ink-you)",
  "group": "shadcn",
  "onPaper": 7.09,
  "onDesk": 4.28,
  "inkOn": 1.98
 },
 {
  "token": "--chart-3",
  "value": "#3b7a4b",
  "role": "",
  "alias": "var(--ll-green)",
  "group": "shadcn",
  "onPaper": 4.74,
  "onDesk": 2.86,
  "inkOn": 2.97
 },
 {
  "token": "--chart-4",
  "value": "#a87f0c",
  "role": "",
  "alias": "var(--ll-hi-deep)",
  "group": "shadcn",
  "onPaper": 3.38,
  "onDesk": 2.04,
  "inkOn": 4.16
 },
 {
  "token": "--chart-5",
  "value": "#8f6fd6",
  "role": "",
  "alias": "var(--ll-grape)",
  "group": "shadcn",
  "onPaper": 3.56,
  "onDesk": 2.15,
  "inkOn": 3.95
 },
 {
  "token": "--sidebar",
  "value": "#f8f2de",
  "role": "",
  "alias": "var(--ll-pad)",
  "group": "shadcn",
  "onPaper": 1.03,
  "onDesk": 1.61,
  "inkOn": 13.67
 },
 {
  "token": "--sidebar-foreground",
  "value": "#2a2420",
  "role": "",
  "alias": "var(--ll-ink)",
  "group": "shadcn",
  "onPaper": 14.06,
  "onDesk": 8.49,
  "inkOn": 1
 },
 {
  "token": "--sidebar-primary",
  "value": "#df6b3c",
  "role": "",
  "alias": "var(--ll-marker)",
  "group": "shadcn",
  "onPaper": 3.06,
  "onDesk": 1.85,
  "inkOn": 4.6
 },
 {
  "token": "--sidebar-primary-foreground",
  "value": "#2a2420",
  "role": "",
  "alias": "var(--ll-ink)",
  "group": "shadcn",
  "onPaper": 14.06,
  "onDesk": 8.49,
  "inkOn": 1
 },
 {
  "token": "--sidebar-accent",
  "value": "#f8e9a4",
  "role": "",
  "alias": "color-mix(in srgb, var(--ll-hi) 40%, var(--ll-pad))",
  "group": "shadcn",
  "onPaper": 1.12,
  "onDesk": 1.48,
  "inkOn": 12.53
 },
 {
  "token": "--sidebar-accent-foreground",
  "value": "#2a2420",
  "role": "",
  "alias": "var(--ll-ink)",
  "group": "shadcn",
  "onPaper": 14.06,
  "onDesk": 8.49,
  "inkOn": 1
 },
 {
  "token": "--sidebar-border",
  "value": "#b2c3dc",
  "role": "",
  "alias": "var(--ll-pad-rule)",
  "group": "shadcn",
  "onPaper": 1.64,
  "onDesk": 1.01,
  "inkOn": 8.55
 },
 {
  "token": "--sidebar-ring",
  "value": "#2c4f9e",
  "role": "",
  "alias": "var(--ll-focus)",
  "group": "shadcn",
  "onPaper": 7.09,
  "onDesk": 4.28,
  "inkOn": 1.98
 },
 {
  "token": "--ll-umber",
  "value": "#3a2c1e",
  "role": "colour form of the shade triplet, for color-mix()",
  "alias": "rgb(var(--ll-shade))",
  "group": "paper",
  "onPaper": 12.37,
  "onDesk": 7.47,
  "inkOn": 1.14
 },
 {
  "token": "--ll-line",
  "value": "#8e887f",
  "role": "drawn hairlines",
  "alias": "var(--ll-pencil-mark)",
  "group": "paper",
  "onPaper": 3.23,
  "onDesk": 1.95,
  "inkOn": 4.36
 },
 {
  "token": "--ll-line-soft",
  "value": "rgba(142,136,127,0.55)",
  "role": "fallback borders, table rules",
  "alias": "color-mix(in srgb, var(--ll-pencil-mark) 55%, transparent)",
  "group": "paper",
  "onPaper": 1.79,
  "onDesk": 1.42,
  "inkOn": 8.26
 },
 {
  "token": "--ll-link",
  "value": "#2c4f9e",
  "role": "",
  "alias": "var(--ll-ink-you)",
  "group": "paper",
  "onPaper": 7.09,
  "onDesk": 4.28,
  "inkOn": 1.98
 },
 {
  "token": "--ll-input-ink",
  "value": "#2c4f9e",
  "role": "what you type is blue felt",
  "alias": "var(--ll-ink-you)",
  "group": "paper",
  "onPaper": 7.09,
  "onDesk": 4.28,
  "inkOn": 1.98
 },
 {
  "token": "--ll-caret",
  "value": "#2c4f9e",
  "role": "",
  "alias": "var(--ll-ink-you)",
  "group": "paper",
  "onPaper": 7.09,
  "onDesk": 4.28,
  "inkOn": 1.98
 },
 {
  "token": "--ll-placeholder",
  "value": "#5a554e",
  "role": "",
  "alias": "var(--ll-pencil-text)",
  "group": "paper",
  "onPaper": 6.78,
  "onDesk": 4.09,
  "inkOn": 2.07
 },
 {
  "token": "--ll-hi-select",
  "value": "rgba(248,220,76,0.62)",
  "role": "::selection, <mark>, hover swipes",
  "alias": "color-mix(in srgb, var(--ll-hi) 62%, transparent)",
  "group": "paper",
  "onPaper": 1.16,
  "onDesk": 1.17,
  "inkOn": 12.51
 },
 {
  "token": "--ll-selection-text",
  "value": "#2a2420",
  "role": "must stay dark",
  "alias": "var(--ll-ink)",
  "group": "paper",
  "onPaper": 14.06,
  "onDesk": 8.49,
  "inkOn": 1
 },
 {
  "token": "--ll-riso",
  "value": "#df6b3c",
  "role": "default offset colour of .ll-riso; set it on a title to change it",
  "alias": "var(--ll-marker)",
  "group": "paper",
  "onPaper": 3.06,
  "onDesk": 1.85,
  "inkOn": 4.6
 },
 {
  "token": "--ll-stamp-fill",
  "value": "rgba(223,107,60,0.5)",
  "role": "",
  "alias": "color-mix(in srgb, var(--ll-marker) 50%, transparent)",
  "group": "paper",
  "onPaper": 1.72,
  "onDesk": 1.41,
  "inkOn": 8.58
 },
 {
  "token": "--ll-stamp-fill-red",
  "value": "rgba(194,65,45,0.28)",
  "role": "",
  "alias": "color-mix(in srgb, var(--ll-red) 28%, transparent)",
  "group": "paper",
  "onPaper": 1.49,
  "onDesk": 1.38,
  "inkOn": 10.12
 },
 {
  "token": "--ll-stamp-fill-green",
  "value": "rgba(59,122,75,0.24)",
  "role": "",
  "alias": "color-mix(in srgb, var(--ll-green) 24%, transparent)",
  "group": "paper",
  "onPaper": 1.37,
  "onDesk": 1.26,
  "inkOn": 11.07
 },
 {
  "token": "--ll-diff-add",
  "value": "rgba(59,122,75,0.16)",
  "role": "",
  "alias": "color-mix(in srgb, var(--ll-green) 16%, transparent)",
  "group": "paper",
  "onPaper": 1.23,
  "onDesk": 1.15,
  "inkOn": 12.42
 },
 {
  "token": "--ll-diff-del",
  "value": "rgba(194,65,45,0.14)",
  "role": "",
  "alias": "color-mix(in srgb, var(--ll-red) 14%, transparent)",
  "group": "paper",
  "onPaper": 1.21,
  "onDesk": 1.17,
  "inkOn": 12.48
 },
 {
  "token": "--ll-syn-keyword",
  "value": "#ad3d2b",
  "role": "code colours: red / green / orange pencil pulled toward ink so they pass 4.5:1 on the paper-shade code chip",
  "alias": "color-mix(in srgb, var(--ll-red), var(--ll-ink) 14%)",
  "group": "paper",
  "onPaper": 5.54,
  "onDesk": 3.35,
  "inkOn": 2.54
 },
 {
  "token": "--ll-syn-string",
  "value": "#396e45",
  "role": "",
  "alias": "color-mix(in srgb, var(--ll-green), var(--ll-ink) 14%)",
  "group": "paper",
  "onPaper": 5.53,
  "onDesk": 3.34,
  "inkOn": 2.54
 },
 {
  "token": "--ll-syn-name",
  "value": "#2c4f9e",
  "role": "",
  "alias": "var(--ll-ink-you)",
  "group": "paper",
  "onPaper": 7.09,
  "onDesk": 4.28,
  "inkOn": 1.98
 },
 {
  "token": "--ll-syn-number",
  "value": "#984c29",
  "role": "",
  "alias": "color-mix(in srgb, var(--ll-orange-text), var(--ll-ink) 10%)",
  "group": "paper",
  "onPaper": 5.67,
  "onDesk": 3.42,
  "inkOn": 2.48
 },
 {
  "token": "--ll-syn-comment",
  "value": "#5a554e",
  "role": "",
  "alias": "var(--ll-pencil-text)",
  "group": "paper",
  "onPaper": 6.78,
  "onDesk": 4.09,
  "inkOn": 2.07
 }
]

export const ALIASES: Record<string, Expr> = {
 "--chart-1": "--ll-marker",
 "--chart-2": "--ll-ink-you",
 "--chart-3": "--ll-green",
 "--chart-4": "--ll-hi-deep",
 "--chart-5": "--ll-grape"
}

export const CONTRAST: ContrastRow[] = [
 {
  "fg": "foreground",
  "bg": "background",
  "fgHex": "#2a2420",
  "bgHex": "#a8c8bb",
  "ratio": 8.49,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on the desk (text straight on the desk: ink / ink-soft / muted only)",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-desk"
  }
 },
 {
  "fg": "card-foreground",
  "bg": "card",
  "fgHex": "#2a2420",
  "bgHex": "#f8f5ee",
  "ratio": 14.06,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on paper",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "popover-foreground",
  "bg": "popover",
  "fgHex": "#2a2420",
  "bgHex": "#fbf8f1",
  "ratio": 14.43,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on a slip (menus, popovers)",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-paper-shade",
  "fgHex": "#2a2420",
  "bgHex": "#ece6da",
  "ratio": 12.32,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on paper-shade (code chips, muted fills)",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-paper-shade"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-slip",
  "fgHex": "#2a2420",
  "bgHex": "#fbf8f1",
  "ratio": 14.43,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on slip",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-card",
  "fgHex": "#2a2420",
  "bgHex": "#fbf6e9",
  "ratio": 14.19,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on index card",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-card"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-graph",
  "fgHex": "#2a2420",
  "bgHex": "#f4f7ef",
  "ratio": 14.14,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on graph paper",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-graph"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-kraft",
  "fgHex": "#2a2420",
  "bgHex": "#dcc8a3",
  "ratio": 9.36,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on kraft",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-kraft"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-check",
  "fgHex": "#2a2420",
  "bgHex": "#dfe9d8",
  "ratio": 12.24,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on ledger",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-check"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-pad",
  "fgHex": "#2a2420",
  "bgHex": "#f8f2de",
  "ratio": 13.67,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on pad (sidebar)",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-pad"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-photo",
  "fgHex": "#2a2420",
  "bgHex": "#fffdf6",
  "ratio": 15.04,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on photo border",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-photo"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-sticky-yellow",
  "fgHex": "#2a2420",
  "bgHex": "#f7e38a",
  "ratio": 11.89,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on a yellow sticky note",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-sticky-yellow"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-sticky-green",
  "fgHex": "#2a2420",
  "bgHex": "#cfe6a8",
  "ratio": 11.33,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on a green sticky note",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-sticky-green"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-sticky-orange",
  "fgHex": "#2a2420",
  "bgHex": "#f7c08e",
  "ratio": 9.39,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on an orange sticky note",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-sticky-orange"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-sticky-pink",
  "fgHex": "#2a2420",
  "bgHex": "#f6b8b0",
  "ratio": 9.04,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on a pink sticky note",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-sticky-pink"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-sticky-blue",
  "fgHex": "#2a2420",
  "bgHex": "#bcd8f0",
  "ratio": 10.37,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on a blue sticky note",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-sticky-blue"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-hi",
  "fgHex": "#2a2420",
  "bgHex": "#f8dc4c",
  "ratio": 11.18,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink on highlighter yellow",
  "section": "Body text: ink on every stock (AAA)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-hi"
  }
 },
 {
  "fg": "--ll-selection-text",
  "bg": "--ll-hi-select",
  "fgHex": "#2a2420",
  "bgHex": "#f8e68a",
  "ratio": 12.16,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "selected text on paper (highlighter at 62% flattened onto paper)",
  "section": "Body text: ink on every stock (AAA)",
  "live": null
 },
 {
  "fg": "--ll-selection-text",
  "bg": "--ll-hi-select",
  "fgHex": "#2a2420",
  "bgHex": "#dad476",
  "ratio": 9.96,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "selected text on the desk",
  "section": "Body text: ink on every stock (AAA)",
  "live": null
 },
 {
  "fg": "--ll-ink-soft",
  "bg": "--ll-desk",
  "fgHex": "#4a423b",
  "bgHex": "#a8c8bb",
  "ratio": 5.46,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "ink-soft directly on the desk",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-ink-soft",
   "bg": "--ll-desk"
  }
 },
 {
  "fg": "--ll-ink-soft",
  "bg": "--ll-paper",
  "fgHex": "#4a423b",
  "bgHex": "#f8f5ee",
  "ratio": 9.04,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "ink-soft on paper",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-ink-soft",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "muted-foreground",
  "bg": "background",
  "fgHex": "#4a433c",
  "bgHex": "#a8c8bb",
  "ratio": 5.39,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "muted text on the desk",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-ink-muted",
   "bg": "--ll-desk"
  }
 },
 {
  "fg": "muted-foreground",
  "bg": "card",
  "fgHex": "#4a433c",
  "bgHex": "#f8f5ee",
  "ratio": 8.93,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "muted text on paper",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-ink-muted",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "muted-foreground",
  "bg": "muted",
  "fgHex": "#4a433c",
  "bgHex": "#ece6da",
  "ratio": 7.83,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "muted text on paper-shade",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-ink-muted",
   "bg": "--ll-paper-shade"
  }
 },
 {
  "fg": "muted-foreground",
  "bg": "popover",
  "fgHex": "#4a433c",
  "bgHex": "#fbf8f1",
  "ratio": 9.17,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "muted text on a slip",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-ink-muted",
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-ink-muted",
  "bg": "--ll-pad",
  "fgHex": "#4a433c",
  "bgHex": "#f8f2de",
  "ratio": 8.68,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "muted text on the pad",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-ink-muted",
   "bg": "--ll-pad"
  }
 },
 {
  "fg": "--ll-pencil-text",
  "bg": "--ll-paper",
  "fgHex": "#5a554e",
  "bgHex": "#f8f5ee",
  "ratio": 6.78,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "graphite text on paper",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-pencil-text",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "--ll-pencil-text",
  "bg": "--ll-paper-shade",
  "fgHex": "#5a554e",
  "bgHex": "#ece6da",
  "ratio": 5.94,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "graphite text on paper-shade",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-pencil-text",
   "bg": "--ll-paper-shade"
  }
 },
 {
  "fg": "--ll-pencil-text",
  "bg": "--ll-slip",
  "fgHex": "#5a554e",
  "bgHex": "#fbf8f1",
  "ratio": 6.96,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "graphite text on a slip",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-pencil-text",
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-pencil-text",
  "bg": "--ll-card",
  "fgHex": "#5a554e",
  "bgHex": "#fbf6e9",
  "ratio": 6.84,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "graphite text on an index card",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-pencil-text",
   "bg": "--ll-card"
  }
 },
 {
  "fg": "--ll-pencil",
  "bg": "--ll-paper",
  "fgHex": "#6b6660",
  "bgHex": "#f8f5ee",
  "ratio": 5.22,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "drawn graphite (meta marks, large text) on paper",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-pencil",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "--ll-pencil",
  "bg": "--ll-paper-shade",
  "fgHex": "#6b6660",
  "bgHex": "#ece6da",
  "ratio": 4.57,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "drawn graphite on paper-shade",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-pencil",
   "bg": "--ll-paper-shade"
  }
 },
 {
  "fg": "--ll-placeholder",
  "bg": "--ll-paper",
  "fgHex": "#5a554e",
  "bgHex": "#f8f5ee",
  "ratio": 6.78,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "placeholder on paper",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-pencil-text",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "--ll-placeholder",
  "bg": "--ll-paper-shade",
  "fgHex": "#5a554e",
  "bgHex": "#ece6da",
  "ratio": 5.94,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "placeholder on paper-shade",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-pencil-text",
   "bg": "--ll-paper-shade"
  }
 },
 {
  "fg": "--ll-placeholder",
  "bg": "--ll-slip",
  "fgHex": "#5a554e",
  "bgHex": "#fbf8f1",
  "ratio": 6.96,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "placeholder on a slip",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-pencil-text",
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-input-ink",
  "bg": "--ll-paper",
  "fgHex": "#2c4f9e",
  "bgHex": "#f8f5ee",
  "ratio": 7.09,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "typed text (blue felt) on paper (Notebook 7.09)",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-ink-you",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "--ll-input-ink",
  "bg": "--ll-paper-shade",
  "fgHex": "#2c4f9e",
  "bgHex": "#ece6da",
  "ratio": 6.21,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "typed text on paper-shade",
  "section": "Secondary text (AA)",
  "live": {
   "fg": "--ll-ink-you",
   "bg": "--ll-paper-shade"
  }
 },
 {
  "fg": "--ll-ink-you",
  "bg": "--ll-paper",
  "fgHex": "#2c4f9e",
  "bgHex": "#f8f5ee",
  "ratio": 7.09,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "blue felt (you, links) on paper",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-ink-you",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "--ll-red",
  "bg": "--ll-paper",
  "fgHex": "#c2412d",
  "bgHex": "#f8f5ee",
  "ratio": 4.72,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "red pencil (error text) on paper",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-red",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "--ll-green",
  "bg": "--ll-paper",
  "fgHex": "#3b7a4b",
  "bgHex": "#f8f5ee",
  "ratio": 4.74,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "green pencil (ok text) on paper",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-green",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "--ll-ink-you",
  "bg": "--ll-slip",
  "fgHex": "#2c4f9e",
  "bgHex": "#fbf8f1",
  "ratio": 7.28,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "blue felt (you, links) on a slip",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-ink-you",
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-red",
  "bg": "--ll-slip",
  "fgHex": "#c2412d",
  "bgHex": "#fbf8f1",
  "ratio": 4.84,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "red pencil (error text) on a slip",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-red",
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-green",
  "bg": "--ll-slip",
  "fgHex": "#3b7a4b",
  "bgHex": "#fbf8f1",
  "ratio": 4.86,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "green pencil (ok text) on a slip",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-green",
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-ink-you",
  "bg": "--ll-card",
  "fgHex": "#2c4f9e",
  "bgHex": "#fbf6e9",
  "ratio": 7.16,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "blue felt (you, links) on an index card",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-ink-you",
   "bg": "--ll-card"
  }
 },
 {
  "fg": "--ll-red",
  "bg": "--ll-card",
  "fgHex": "#c2412d",
  "bgHex": "#fbf6e9",
  "ratio": 4.76,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "red pencil (error text) on an index card",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-red",
   "bg": "--ll-card"
  }
 },
 {
  "fg": "--ll-green",
  "bg": "--ll-card",
  "fgHex": "#3b7a4b",
  "bgHex": "#fbf6e9",
  "ratio": 4.78,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "green pencil (ok text) on an index card",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-green",
   "bg": "--ll-card"
  }
 },
 {
  "fg": "--ll-ink-you",
  "bg": "--ll-paper-shade",
  "fgHex": "#2c4f9e",
  "bgHex": "#ece6da",
  "ratio": 6.21,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "blue felt on paper-shade",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-ink-you",
   "bg": "--ll-paper-shade"
  }
 },
 {
  "fg": "--ll-ink-you",
  "bg": "--ll-pad",
  "fgHex": "#2c4f9e",
  "bgHex": "#f8f2de",
  "ratio": 6.89,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "blue felt on the pad",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-ink-you",
   "bg": "--ll-pad"
  }
 },
 {
  "fg": "--ll-ink-you",
  "bg": "--ll-desk",
  "fgHex": "#2c4f9e",
  "bgHex": "#a8c8bb",
  "ratio": 4.28,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "blue felt on the desk: large marks and focus only, never small text",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-ink-you",
   "bg": "--ll-desk"
  }
 },
 {
  "fg": "--ll-red",
  "bg": "--ll-paper-shade",
  "fgHex": "#c2412d",
  "bgHex": "#ece6da",
  "ratio": 4.13,
  "min": 4.5,
  "level": "warn",
  "status": "warn",
  "purpose": "red pencil on paper-shade: errors belong on paper, not on muted fills",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-red",
   "bg": "--ll-paper-shade"
  }
 },
 {
  "fg": "--ll-orange-text",
  "bg": "--ll-paper",
  "fgHex": "#a4502a",
  "bgHex": "#f8f5ee",
  "ratio": 5.13,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "working / warm status text on paper",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-orange-text",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "--ll-link",
  "bg": "--ll-paper",
  "fgHex": "#2c4f9e",
  "bgHex": "#f8f5ee",
  "ratio": 7.09,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "link on paper",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-ink-you",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "--ll-link-hover",
  "bg": "--ll-paper",
  "fgHex": "#1f3b7a",
  "bgHex": "#f8f5ee",
  "ratio": 9.82,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "link on hover, on paper",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-link-hover",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "destructive",
  "bg": "card",
  "fgHex": "#c2412d",
  "bgHex": "#f8f5ee",
  "ratio": 4.72,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "destructive text and icons on paper",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-red",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "--ll-check-ink",
  "bg": "--ll-check",
  "fgHex": "#2f6b45",
  "bgHex": "#dfe9d8",
  "ratio": 5.07,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "ledger print",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-check-ink",
   "bg": "--ll-check"
  }
 },
 {
  "fg": "--ll-check-no",
  "bg": "--ll-check",
  "fgHex": "#b23a28",
  "bgHex": "#dfe9d8",
  "ratio": 4.76,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "ledger 'no' red",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-check-no",
   "bg": "--ll-check"
  }
 },
 {
  "fg": "--ll-syn-keyword",
  "bg": "--ll-slip",
  "fgHex": "#ad3d2b",
  "bgHex": "#fbf8f1",
  "ratio": 5.69,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "code: keyword on a slip",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": [
    "--ll-red",
    86,
    "--ll-ink"
   ],
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-syn-keyword",
  "bg": "--ll-paper-shade",
  "fgHex": "#ad3d2b",
  "bgHex": "#ece6da",
  "ratio": 4.86,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "code: keyword on a code chip (paper-shade)",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": [
    "--ll-red",
    86,
    "--ll-ink"
   ],
   "bg": "--ll-paper-shade"
  }
 },
 {
  "fg": "--ll-syn-string",
  "bg": "--ll-slip",
  "fgHex": "#396e45",
  "bgHex": "#fbf8f1",
  "ratio": 5.67,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "code: string on a slip",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": [
    "--ll-green",
    86,
    "--ll-ink"
   ],
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-syn-string",
  "bg": "--ll-paper-shade",
  "fgHex": "#396e45",
  "bgHex": "#ece6da",
  "ratio": 4.84,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "code: string on a code chip (paper-shade)",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": [
    "--ll-green",
    86,
    "--ll-ink"
   ],
   "bg": "--ll-paper-shade"
  }
 },
 {
  "fg": "--ll-syn-name",
  "bg": "--ll-slip",
  "fgHex": "#2c4f9e",
  "bgHex": "#fbf8f1",
  "ratio": 7.28,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "code: name on a slip",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-ink-you",
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-syn-name",
  "bg": "--ll-paper-shade",
  "fgHex": "#2c4f9e",
  "bgHex": "#ece6da",
  "ratio": 6.21,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "code: name on a code chip (paper-shade)",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-ink-you",
   "bg": "--ll-paper-shade"
  }
 },
 {
  "fg": "--ll-syn-number",
  "bg": "--ll-slip",
  "fgHex": "#984c29",
  "bgHex": "#fbf8f1",
  "ratio": 5.82,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "code: number on a slip",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": [
    "--ll-orange-text",
    90,
    "--ll-ink"
   ],
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-syn-number",
  "bg": "--ll-paper-shade",
  "fgHex": "#984c29",
  "bgHex": "#ece6da",
  "ratio": 4.97,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "code: number on a code chip (paper-shade)",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": [
    "--ll-orange-text",
    90,
    "--ll-ink"
   ],
   "bg": "--ll-paper-shade"
  }
 },
 {
  "fg": "--ll-syn-comment",
  "bg": "--ll-slip",
  "fgHex": "#5a554e",
  "bgHex": "#fbf8f1",
  "ratio": 6.96,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "code: comment on a slip",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-pencil-text",
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-syn-comment",
  "bg": "--ll-paper-shade",
  "fgHex": "#5a554e",
  "bgHex": "#ece6da",
  "ratio": 5.94,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "code: comment on a code chip (paper-shade)",
  "section": "Meaning inks on paper (AA)",
  "live": {
   "fg": "--ll-pencil-text",
   "bg": "--ll-paper-shade"
  }
 },
 {
  "fg": "primary-foreground",
  "bg": "primary",
  "fgHex": "#2a2420",
  "bgHex": "#df6b3c",
  "ratio": 4.6,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "ink label on the terracotta marker (primary button)",
  "section": "Filled controls (labels)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-marker"
  }
 },
 {
  "fg": "secondary-foreground",
  "bg": "secondary",
  "fgHex": "#2a2420",
  "bgHex": "#f8ecb5",
  "ratio": 12.87,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "label on the highlighter tint (secondary button)",
  "section": "Filled controls (labels)",
  "live": {
   "fg": "--ll-ink",
   "bg": [
    "--ll-hi",
    35,
    "--ll-paper"
   ]
  }
 },
 {
  "fg": "accent-foreground",
  "bg": "accent",
  "fgHex": "#2a2420",
  "bgHex": "#f8e68a",
  "ratio": 12.16,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "hover / selected row text on the highlighter wash",
  "section": "Filled controls (labels)",
  "live": {
   "fg": "--ll-ink",
   "bg": [
    "--ll-hi",
    62,
    "--ll-paper"
   ]
  }
 },
 {
  "fg": "destructive-foreground",
  "bg": "destructive",
  "fgHex": "#fbf8f1",
  "bgHex": "#c2412d",
  "ratio": 4.84,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "label on red pencil (destructive button)",
  "section": "Filled controls (labels)",
  "live": {
   "fg": "--ll-slip",
   "bg": "--ll-red"
  }
 },
 {
  "fg": "sidebar-foreground",
  "bg": "sidebar",
  "fgHex": "#2a2420",
  "bgHex": "#f8f2de",
  "ratio": 13.67,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "sidebar text",
  "section": "Filled controls (labels)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-pad"
  }
 },
 {
  "fg": "sidebar-primary-foreground",
  "bg": "sidebar-primary",
  "fgHex": "#2a2420",
  "bgHex": "#df6b3c",
  "ratio": 4.6,
  "min": 4.5,
  "level": "error",
  "status": "ok",
  "purpose": "sidebar primary label",
  "section": "Filled controls (labels)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-marker"
  }
 },
 {
  "fg": "sidebar-accent-foreground",
  "bg": "sidebar-accent",
  "fgHex": "#2a2420",
  "bgHex": "#f8e9a4",
  "ratio": 12.53,
  "min": 7,
  "level": "error",
  "status": "ok",
  "purpose": "sidebar hover / selected text",
  "section": "Filled controls (labels)",
  "live": {
   "fg": "--ll-ink",
   "bg": [
    "--ll-hi",
    40,
    "--ll-pad"
   ]
  }
 },
 {
  "fg": "ring",
  "bg": "background",
  "fgHex": "#2c4f9e",
  "bgHex": "#a8c8bb",
  "ratio": 4.28,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "focus mark on the desk",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-focus",
   "bg": "--ll-desk"
  }
 },
 {
  "fg": "ring",
  "bg": "card",
  "fgHex": "#2c4f9e",
  "bgHex": "#f8f5ee",
  "ratio": 7.09,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "focus mark on paper",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-focus",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "--ll-focus",
  "bg": "--ll-slip",
  "fgHex": "#2c4f9e",
  "bgHex": "#fbf8f1",
  "ratio": 7.28,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "focus mark on a slip",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-focus",
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-focus",
  "bg": "--ll-paper-shade",
  "fgHex": "#2c4f9e",
  "bgHex": "#ece6da",
  "ratio": 6.21,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "focus mark on paper-shade",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-focus",
   "bg": "--ll-paper-shade"
  }
 },
 {
  "fg": "--ll-focus",
  "bg": "--ll-pad",
  "fgHex": "#2c4f9e",
  "bgHex": "#f8f2de",
  "ratio": 6.89,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "focus mark on the pad",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-focus",
   "bg": "--ll-pad"
  }
 },
 {
  "fg": "sidebar-ring",
  "bg": "sidebar",
  "fgHex": "#2c4f9e",
  "bgHex": "#f8f2de",
  "ratio": 6.89,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "sidebar focus mark",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-focus",
   "bg": "--ll-pad"
  }
 },
 {
  "fg": "border",
  "bg": "card",
  "fgHex": "#8e887f",
  "bgHex": "#f8f5ee",
  "ratio": 3.23,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "input boundary / drawn line on paper",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-pencil-mark",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "input",
  "bg": "card",
  "fgHex": "#8e887f",
  "bgHex": "#f8f5ee",
  "ratio": 3.23,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "field outline on paper",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-pencil-mark",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "border",
  "bg": "popover",
  "fgHex": "#8e887f",
  "bgHex": "#fbf8f1",
  "ratio": 3.31,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "drawn line on a slip",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-pencil-mark",
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-line",
  "bg": "--ll-paper",
  "fgHex": "#8e887f",
  "bgHex": "#f8f5ee",
  "ratio": 3.23,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "hairline mark on paper",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-pencil-mark",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "border",
  "bg": "background",
  "fgHex": "#8e887f",
  "bgHex": "#a8c8bb",
  "ratio": 1.95,
  "min": 1.5,
  "level": "error",
  "status": "ok",
  "purpose": "drawn line on the desk (decorative hairline)",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-pencil-mark",
   "bg": "--ll-desk"
  }
 },
 {
  "fg": "border",
  "bg": "muted",
  "fgHex": "#8e887f",
  "bgHex": "#ece6da",
  "ratio": 2.83,
  "min": 1.5,
  "level": "error",
  "status": "ok",
  "purpose": "drawn line on paper-shade (decorative hairline)",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-pencil-mark",
   "bg": "--ll-paper-shade"
  }
 },
 {
  "fg": "--ll-paper",
  "bg": "--ll-desk",
  "fgHex": "#f8f5ee",
  "bgHex": "#a8c8bb",
  "ratio": 1.66,
  "min": 1.3,
  "level": "error",
  "status": "ok",
  "purpose": "paper must read lighter than the desk (Notebook 1.95; the palest Penpal pairing, stone table, is 1.3)",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-paper",
   "bg": "--ll-desk"
  }
 },
 {
  "fg": "--ll-rule-blue",
  "bg": "--ll-card",
  "fgHex": "#8fb0d4",
  "bgHex": "#fbf6e9",
  "ratio": 2.09,
  "min": 1.5,
  "level": "error",
  "status": "ok",
  "purpose": "index-card ruling",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-rule-blue",
   "bg": "--ll-card"
  }
 },
 {
  "fg": "--ll-rule-red",
  "bg": "--ll-card",
  "fgHex": "#d9776a",
  "bgHex": "#fbf6e9",
  "ratio": 2.86,
  "min": 1.5,
  "level": "error",
  "status": "ok",
  "purpose": "index-card header line",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-rule-red",
   "bg": "--ll-card"
  }
 },
 {
  "fg": "--ll-pad-rule",
  "bg": "--ll-pad",
  "fgHex": "#b2c3dc",
  "bgHex": "#f8f2de",
  "ratio": 1.6,
  "min": 1.5,
  "level": "error",
  "status": "ok",
  "purpose": "pad ruling (sidebar-border)",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-pad-rule",
   "bg": "--ll-pad"
  }
 },
 {
  "fg": "sidebar-border",
  "bg": "sidebar",
  "fgHex": "#b2c3dc",
  "bgHex": "#f8f2de",
  "ratio": 1.6,
  "min": 1.5,
  "level": "error",
  "status": "ok",
  "purpose": "sidebar divider",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-pad-rule",
   "bg": "--ll-pad"
  }
 },
 {
  "fg": "--ll-check-rule",
  "bg": "--ll-check",
  "fgHex": "#7fa37c",
  "bgHex": "#dfe9d8",
  "ratio": 2.26,
  "min": 1.5,
  "level": "error",
  "status": "ok",
  "purpose": "ledger ruling",
  "section": "Focus and non-text marks (WCAG 1.4.11)",
  "live": {
   "fg": "--ll-check-rule",
   "bg": "--ll-check"
  }
 },
 {
  "fg": "chart-1",
  "bg": "card",
  "fgHex": "#df6b3c",
  "bgHex": "#f8f5ee",
  "ratio": 3.06,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "chart series 1 on paper",
  "section": "Chart series (3:1 against the surface they are drawn on; a hatch channel carries the rest)",
  "live": {
   "fg": "--chart-1",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "chart-2",
  "bg": "card",
  "fgHex": "#2c4f9e",
  "bgHex": "#f8f5ee",
  "ratio": 7.09,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "chart series 2 on paper",
  "section": "Chart series (3:1 against the surface they are drawn on; a hatch channel carries the rest)",
  "live": {
   "fg": "--chart-2",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "chart-3",
  "bg": "card",
  "fgHex": "#3b7a4b",
  "bgHex": "#f8f5ee",
  "ratio": 4.74,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "chart series 3 on paper",
  "section": "Chart series (3:1 against the surface they are drawn on; a hatch channel carries the rest)",
  "live": {
   "fg": "--chart-3",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "chart-4",
  "bg": "card",
  "fgHex": "#a87f0c",
  "bgHex": "#f8f5ee",
  "ratio": 3.38,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "chart series 4 on paper",
  "section": "Chart series (3:1 against the surface they are drawn on; a hatch channel carries the rest)",
  "live": {
   "fg": "--chart-4",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "chart-5",
  "bg": "card",
  "fgHex": "#8f6fd6",
  "bgHex": "#f8f5ee",
  "ratio": 3.56,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "chart series 5 on paper",
  "section": "Chart series (3:1 against the surface they are drawn on; a hatch channel carries the rest)",
  "live": {
   "fg": "--chart-5",
   "bg": "--ll-paper"
  }
 },
 {
  "fg": "chart-1",
  "bg": "popover",
  "fgHex": "#df6b3c",
  "bgHex": "#fbf8f1",
  "ratio": 3.14,
  "min": 3,
  "level": "error",
  "status": "ok",
  "purpose": "chart series 1 on a slip (tooltips)",
  "section": "Chart series (3:1 against the surface they are drawn on; a hatch channel carries the rest)",
  "live": {
   "fg": "--chart-1",
   "bg": "--ll-slip"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-tomato",
  "fgHex": "#2a2420",
  "bgHex": "#e8483a",
  "ratio": 3.95,
  "min": 4.5,
  "level": "warn",
  "status": "warn",
  "purpose": "ink label on a tomato sticker / badge",
  "section": "Decoration: sticker labels on the stationery accents (informational; stickers are not the only carrier of meaning)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-tomato"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-tangerine",
  "fgHex": "#2a2420",
  "bgHex": "#f59a2f",
  "ratio": 6.96,
  "min": 4.5,
  "level": "warn",
  "status": "ok",
  "purpose": "ink label on a tangerine sticker / badge",
  "section": "Decoration: sticker labels on the stationery accents (informational; stickers are not the only carrier of meaning)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-tangerine"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-lemon",
  "fgHex": "#2a2420",
  "bgHex": "#fbd63a",
  "ratio": 10.78,
  "min": 4.5,
  "level": "warn",
  "status": "ok",
  "purpose": "ink label on a lemon sticker / badge",
  "section": "Decoration: sticker labels on the stationery accents (informational; stickers are not the only carrier of meaning)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-lemon"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-grass",
  "fgHex": "#2a2420",
  "bgHex": "#5db85c",
  "ratio": 6.18,
  "min": 4.5,
  "level": "warn",
  "status": "ok",
  "purpose": "ink label on a grass sticker / badge",
  "section": "Decoration: sticker labels on the stationery accents (informational; stickers are not the only carrier of meaning)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-grass"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-teal",
  "fgHex": "#2a2420",
  "bgHex": "#2fb1a3",
  "ratio": 5.79,
  "min": 4.5,
  "level": "warn",
  "status": "ok",
  "purpose": "ink label on a teal sticker / badge",
  "section": "Decoration: sticker labels on the stationery accents (informational; stickers are not the only carrier of meaning)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-teal"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-sky",
  "fgHex": "#2a2420",
  "bgHex": "#4aa8e8",
  "ratio": 5.87,
  "min": 4.5,
  "level": "warn",
  "status": "ok",
  "purpose": "ink label on a sky sticker / badge",
  "section": "Decoration: sticker labels on the stationery accents (informational; stickers are not the only carrier of meaning)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-sky"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-grape",
  "fgHex": "#2a2420",
  "bgHex": "#8f6fd6",
  "ratio": 3.95,
  "min": 4.5,
  "level": "warn",
  "status": "warn",
  "purpose": "ink label on a grape sticker / badge",
  "section": "Decoration: sticker labels on the stationery accents (informational; stickers are not the only carrier of meaning)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-grape"
  }
 },
 {
  "fg": "--ll-ink",
  "bg": "--ll-bubblegum",
  "fgHex": "#2a2420",
  "bgHex": "#f38bb8",
  "ratio": 6.7,
  "min": 4.5,
  "level": "warn",
  "status": "ok",
  "purpose": "ink label on a bubblegum sticker / badge",
  "section": "Decoration: sticker labels on the stationery accents (informational; stickers are not the only carrier of meaning)",
  "live": {
   "fg": "--ll-ink",
   "bg": "--ll-bubblegum"
  }
 }
]

export const KNOBS: KnobRow[] = [
 {
  "token": "--ll-wobble",
  "value": "1",
  "role": "1 = felt-tip hand; lower is a steadier hand",
  "readBy": "code"
 },
 {
  "token": "--ll-stroke-fine",
  "value": "1.7",
  "role": "fine-liner weight class",
  "readBy": "code"
 },
 {
  "token": "--ll-stroke-brush",
  "value": "3.2",
  "role": "brush weight class",
  "readBy": "reserved"
 },
 {
  "token": "--ll-bleed",
  "value": "6",
  "role": "ink overshoot padding around a control",
  "readBy": "code"
 },
 {
  "token": "--ll-bleed-loop",
  "value": "11",
  "role": "padding for hand-drawn loops and rings",
  "readBy": "reserved"
 },
 {
  "token": "--ll-bleed-focus",
  "value": "10",
  "role": "focus ring bleed; the ring never changes layout",
  "readBy": "reserved"
 },
 {
  "token": "--ll-misreg-sm",
  "value": "3.2",
  "role": "marker fill misses the outline by this much",
  "readBy": "reserved"
 },
 {
  "token": "--ll-misreg-md",
  "value": "4.6",
  "role": "",
  "readBy": "reserved"
 },
 {
  "token": "--ll-misreg-lg",
  "value": "6",
  "role": "",
  "readBy": "reserved"
 },
 {
  "token": "--ll-misreg-k",
  "value": "1",
  "role": "effective misregistration = --ll-misreg-* x this (0 in calm)",
  "readBy": "css+code"
 },
 {
  "token": "--ll-jitter-k",
  "value": "1",
  "role": "per-word jitter strength (0 in calm and reduced motion)",
  "readBy": "css+code"
 },
 {
  "token": "--ll-tilt-max",
  "value": "2deg",
  "role": "no sheet is turned further than this",
  "readBy": "css+code"
 },
 {
  "token": "--ll-tilt-turn",
  "value": "0.6deg",
  "role": "typical turn of a page-sized sheet",
  "readBy": "reserved"
 },
 {
  "token": "--ll-hover-tilt",
  "value": "-0.9deg",
  "role": "what a hovered control's drawing turns by",
  "readBy": "css+code"
 },
 {
  "token": "--ll-hover-misreg",
  "value": "0.35",
  "role": "hover moves each fill further along its misregistration vector by this share (x1.35)",
  "readBy": "css"
 },
 {
  "token": "--ll-press-misreg",
  "value": "-0.78",
  "role": "pressed pulls it back into register (x.22)",
  "readBy": "css"
 },
 {
  "token": "--ll-press-sink",
  "value": "1px",
  "role": "how far a pressed control's drawing sinks",
  "readBy": "css+code"
 },
 {
  "token": "--ll-shadow-k",
  "value": "1",
  "role": "multiplies every shadow alpha (dark themes: ~2.5)",
  "readBy": "css+code"
 },
 {
  "token": "--ll-grain",
  "value": "1",
  "role": "opacity multiplier of pen grain masks",
  "readBy": "reserved"
 },
 {
  "token": "--ll-blend",
  "value": "multiply",
  "role": "marker and highlighter blend mode (dark themes: normal)",
  "readBy": "css+code"
 }
]

export const GEOMETRY: KnobRow[] = [
 {
  "token": "--ll-hit",
  "value": "40px",
  "role": "comfortable hit box; density changes it (32 compact, 28 calm)",
  "readBy": "css+code"
 },
 {
  "token": "--ll-hit-min",
  "value": "24px",
  "role": "the floor for any DOM hit box (WCAG 2.5.8)",
  "readBy": "css"
 },
 {
  "token": "--ll-ink-room",
  "value": "0.2em",
  "role": "hand-font glyphs overhang their advance; clipped labels get this room",
  "readBy": "css"
 },
 {
  "token": "--ll-sheet-radius",
  "value": "1px",
  "role": "a cut sheet: guillotine, not a rounded card",
  "readBy": "css"
 }
]

export const DURATIONS: DurationRow[] = [
 {
  "token": "--ll-dur-press",
  "name": "press",
  "seconds": 0.09,
  "ms": 90,
  "role": ""
 },
 {
  "token": "--ll-dur-hover",
  "name": "hover",
  "seconds": 0.12,
  "ms": 120,
  "role": ""
 },
 {
  "token": "--ll-dur-fade",
  "name": "fade",
  "seconds": 0.15,
  "ms": 150,
  "role": ""
 },
 {
  "token": "--ll-dur-pop",
  "name": "pop",
  "seconds": 0.18,
  "ms": 180,
  "role": ""
 },
 {
  "token": "--ll-dur-sheet",
  "name": "sheet",
  "seconds": 0.3,
  "ms": 300,
  "role": ""
 },
 {
  "token": "--ll-dur-drop",
  "name": "drop",
  "seconds": 0.34,
  "ms": 340,
  "role": ""
 },
 {
  "token": "--ll-dur-toss",
  "name": "toss",
  "seconds": 0.44,
  "ms": 440,
  "role": ""
 },
 {
  "token": "--ll-dur-soak",
  "name": "soak",
  "seconds": 0.52,
  "ms": 520,
  "role": ""
 },
 {
  "token": "--ll-dur-boil",
  "name": "boil",
  "seconds": 0.48,
  "ms": 480,
  "role": ""
 },
 {
  "token": "--ll-dur-draw",
  "name": "draw",
  "seconds": 0.6,
  "ms": 600,
  "role": ""
 }
]

export const EASINGS: EasingRow[] = [
 {
  "token": "--ll-ease-out",
  "name": "out",
  "css": "ease-out",
  "bezier": [
   0,
   0,
   0.58,
   1
  ],
  "role": ""
 },
 {
  "token": "--ll-ease-in",
  "name": "in",
  "css": "ease-in",
  "bezier": [
   0.42,
   0,
   1,
   1
  ],
  "role": ""
 },
 {
  "token": "--ll-ease-settle",
  "name": "settle",
  "css": "cubic-bezier(0.2, 0.9, 0.25, 1.12)",
  "bezier": [
   0.2,
   0.9,
   0.25,
   1.12
  ],
  "role": "overshoots a little, then settles"
 },
 {
  "token": "--ll-ease-pop",
  "name": "pop",
  "css": "cubic-bezier(0.2, 0.9, 0.3, 1.15)",
  "bezier": [
   0.2,
   0.9,
   0.3,
   1.15
  ],
  "role": ""
 },
 {
  "token": "--ll-ease-dialog",
  "name": "dialog",
  "css": "cubic-bezier(0.2, 0.85, 0.25, 1.08)",
  "bezier": [
   0.2,
   0.85,
   0.25,
   1.08
  ],
  "role": ""
 }
]

export const DENSITY: Record<"comfortable" | "compact" | "calm", Record<string, string>> = {
 "comfortable": {
  "--ll-hit": "40px",
  "--ll-wobble": "1",
  "--ll-stroke-fine": "1.7",
  "--ll-stroke-brush": "3.2",
  "--ll-misreg-k": "1",
  "--ll-jitter-k": "1",
  "--ll-tilt-max": "2deg",
  "--ll-tilt-turn": "0.6deg"
 },
 "compact": {
  "--ll-hit": "32px",
  "--ll-wobble": "1",
  "--ll-stroke-fine": "1.7",
  "--ll-stroke-brush": "3.2",
  "--ll-misreg-k": "1",
  "--ll-jitter-k": "1",
  "--ll-tilt-max": "2deg",
  "--ll-tilt-turn": "0.6deg"
 },
 "calm": {
  "--ll-hit": "28px",
  "--ll-wobble": "0.6",
  "--ll-stroke-fine": "1",
  "--ll-stroke-brush": "1.6",
  "--ll-misreg-k": "0",
  "--ll-jitter-k": "0",
  "--ll-tilt-max": "0deg",
  "--ll-tilt-turn": "0deg"
 }
}

export const FONTS: Record<string, number[]> = {
 "kalam": [
  400,
  700
 ],
 "caveat": [
  400,
  500,
  600,
  700
 ],
 "special-elite": [
  400
 ],
 "ibm-plex-mono": [
  400,
  500
 ]
}

export const T0: Record<string, string> = {
 "--ll-desk": "#a8c8bb",
 "--ll-desk-deep": "#93b4a7",
 "--ll-paper": "#f8f5ee",
 "--ll-paper-shade": "#ece6da",
 "--ll-slip": "#fbf8f1",
 "--ll-card": "#fbf6e9",
 "--ll-graph": "#f4f7ef",
 "--ll-kraft": "#dcc8a3",
 "--ll-check": "#dfe9d8",
 "--ll-pad": "#f8f2de",
 "--ll-photo": "#fffdf6",
 "--ll-rule-blue": "#8fb0d4",
 "--ll-rule-red": "#d9776a",
 "--ll-pad-rule": "#b2c3dc",
 "--ll-check-rule": "#7fa37c",
 "--ll-sticky-yellow": "#f7e38a",
 "--ll-sticky-green": "#cfe6a8",
 "--ll-sticky-orange": "#f7c08e",
 "--ll-sticky-pink": "#f6b8b0",
 "--ll-sticky-blue": "#bcd8f0",
 "--ll-ink": "#2a2420",
 "--ll-ink-soft": "#4a423b",
 "--ll-ink-muted": "#4a433c",
 "--ll-ink-you": "#2c4f9e",
 "--ll-pencil": "#6b6660",
 "--ll-pencil-text": "#5a554e",
 "--ll-pencil-mark": "#8e887f",
 "--ll-red": "#c2412d",
 "--ll-green": "#3b7a4b",
 "--ll-marker": "#df6b3c",
 "--ll-orange-text": "#a4502a",
 "--ll-hi": "#f8dc4c",
 "--ll-hi-deep": "#a87f0c",
 "--ll-focus": "#2c4f9e",
 "--ll-link-hover": "#1f3b7a",
 "--ll-check-ink": "#2f6b45",
 "--ll-check-no": "#b23a28",
 "--ll-tomato": "#e8483a",
 "--ll-tangerine": "#f59a2f",
 "--ll-lemon": "#fbd63a",
 "--ll-grass": "#5db85c",
 "--ll-teal": "#2fb1a3",
 "--ll-sky": "#4aa8e8",
 "--ll-grape": "#8f6fd6",
 "--ll-bubblegum": "#f38bb8",
 "--ll-shade": "58 44 30"
}

export const FOREST: ForestData = {
 "steps": [
  {
   "id": "surfaces",
   "title": "Surfaces",
   "note": "Pale sage felt for the desk, warm cream for the paper, a kraft-tinted slip. The rules on ruled stocks follow.",
   "decls": {
    "--ll-desk": "#cdd2bb",
    "--ll-desk-deep": "#b6bea0",
    "--ll-paper": "#f3eee0",
    "--ll-paper-shade": "#e7e0cc",
    "--ll-slip": "#e7dbbf",
    "--ll-card": "#f6f1e1",
    "--ll-graph": "#eef1e2",
    "--ll-kraft": "#d9c39a",
    "--ll-check": "#e3e7cf",
    "--ll-pad": "#f3eddc",
    "--ll-photo": "#fbf8ee",
    "--ll-rule-blue": "#93a983",
    "--ll-rule-red": "#c98a7a",
    "--ll-pad-rule": "#aebc9c",
    "--ll-check-rule": "#8aa47b"
   },
   "check": {
    "pairs": 105,
    "fails": [
     {
      "fg": "--ll-pencil",
      "bg": "--ll-paper-shade",
      "fgHex": "#6b6660",
      "bgHex": "#e7e0cc",
      "ratio": 4.31,
      "min": 4.5,
      "purpose": "drawn graphite on paper-shade"
     },
     {
      "fg": "--ll-red",
      "bg": "--ll-paper",
      "fgHex": "#c2412d",
      "bgHex": "#f3eee0",
      "ratio": 4.43,
      "min": 4.5,
      "purpose": "red pencil (error text) on paper"
     },
     {
      "fg": "--ll-green",
      "bg": "--ll-paper",
      "fgHex": "#3b7a4b",
      "bgHex": "#f3eee0",
      "ratio": 4.45,
      "min": 4.5,
      "purpose": "green pencil (ok text) on paper"
     },
     {
      "fg": "--ll-red",
      "bg": "--ll-slip",
      "fgHex": "#c2412d",
      "bgHex": "#e7dbbf",
      "ratio": 3.74,
      "min": 4.5,
      "purpose": "red pencil (error text) on a slip"
     },
     {
      "fg": "--ll-green",
      "bg": "--ll-slip",
      "fgHex": "#3b7a4b",
      "bgHex": "#e7dbbf",
      "ratio": 3.75,
      "min": 4.5,
      "purpose": "green pencil (ok text) on a slip"
     },
     {
      "fg": "destructive",
      "bg": "card",
      "fgHex": "#c2412d",
      "bgHex": "#f3eee0",
      "ratio": 4.43,
      "min": 4.5,
      "purpose": "destructive text and icons on paper"
     },
     {
      "fg": "--ll-syn-keyword",
      "bg": "--ll-slip",
      "fgHex": "#ad3d2b",
      "bgHex": "#e7dbbf",
      "ratio": 4.39,
      "min": 4.5,
      "purpose": "code: keyword on a slip"
     },
     {
      "fg": "--ll-syn-string",
      "bg": "--ll-slip",
      "fgHex": "#396e45",
      "bgHex": "#e7dbbf",
      "ratio": 4.38,
      "min": 4.5,
      "purpose": "code: string on a slip"
     },
     {
      "fg": "--ll-syn-number",
      "bg": "--ll-slip",
      "fgHex": "#984c29",
      "bgHex": "#e7dbbf",
      "ratio": 4.49,
      "min": 4.5,
      "purpose": "code: number on a slip"
     },
     {
      "fg": "destructive-foreground",
      "bg": "destructive",
      "fgHex": "#e7dbbf",
      "bgHex": "#c2412d",
      "ratio": 3.74,
      "min": 4.5,
      "purpose": "label on red pencil (destructive button)"
     },
     {
      "fg": "border",
      "bg": "popover",
      "fgHex": "#8e887f",
      "bgHex": "#e7dbbf",
      "ratio": 2.56,
      "min": 3,
      "purpose": "drawn line on a slip"
     },
     {
      "fg": "chart-1",
      "bg": "card",
      "fgHex": "#df6b3c",
      "bgHex": "#f3eee0",
      "ratio": 2.87,
      "min": 3,
      "purpose": "chart series 1 on paper"
     },
     {
      "fg": "chart-1",
      "bg": "popover",
      "fgHex": "#df6b3c",
      "bgHex": "#e7dbbf",
      "ratio": 2.42,
      "min": 3,
      "purpose": "chart series 1 on a slip (tooltips)"
     }
    ],
    "warns": 3
   }
  },
  {
   "id": "inks",
   "title": "Inks",
   "note": "The felt tip goes green-black, blue felt becomes petrol teal, and the pencils get a greener grey. Focus follows the blue.",
   "decls": {
    "--ll-ink": "#262c24",
    "--ll-ink-soft": "#454b40",
    "--ll-ink-muted": "#3f453a",
    "--ll-ink-you": "#1f5570",
    "--ll-pencil": "#62625a",
    "--ll-pencil-text": "#57564f",
    "--ll-pencil-mark": "#7d7c73",
    "--ll-red": "#943123",
    "--ll-green": "#385b2e",
    "--ll-orange-text": "#86441a",
    "--ll-focus": "#1f5570",
    "--ll-link-hover": "#163f55",
    "--ll-check-ink": "#3a5b30",
    "--ll-check-no": "#a0352a"
   },
   "check": {
    "pairs": 105,
    "fails": [
     {
      "fg": "primary-foreground",
      "bg": "primary",
      "fgHex": "#262c24",
      "bgHex": "#df6b3c",
      "ratio": 4.3,
      "min": 4.5,
      "purpose": "ink label on the terracotta marker (primary button)"
     },
     {
      "fg": "sidebar-primary-foreground",
      "bg": "sidebar-primary",
      "fgHex": "#262c24",
      "bgHex": "#df6b3c",
      "ratio": 4.3,
      "min": 4.5,
      "purpose": "sidebar primary label"
     },
     {
      "fg": "chart-1",
      "bg": "card",
      "fgHex": "#df6b3c",
      "bgHex": "#f3eee0",
      "ratio": 2.87,
      "min": 3,
      "purpose": "chart series 1 on paper"
     },
     {
      "fg": "chart-1",
      "bg": "popover",
      "fgHex": "#df6b3c",
      "bgHex": "#e7dbbf",
      "ratio": 2.42,
      "min": 3,
      "purpose": "chart series 1 on a slip (tooltips)"
     }
    ],
    "warns": 2
   }
  },
  {
   "id": "marker",
   "title": "Marker and highlighter",
   "note": "A softer terracotta and a straw-coloured highlighter. This is the step the checker will object to.",
   "decls": {
    "--ll-marker": "#cf7a3d",
    "--ll-hi": "#e3c86c",
    "--ll-hi-deep": "#8f6d10"
   },
   "check": {
    "pairs": 105,
    "fails": [
     {
      "fg": "primary-foreground",
      "bg": "primary",
      "fgHex": "#262c24",
      "bgHex": "#cf7a3d",
      "ratio": 4.43,
      "min": 4.5,
      "purpose": "ink label on the terracotta marker (primary button)"
     },
     {
      "fg": "sidebar-primary-foreground",
      "bg": "sidebar-primary",
      "fgHex": "#262c24",
      "bgHex": "#cf7a3d",
      "ratio": 4.43,
      "min": 4.5,
      "purpose": "sidebar primary label"
     },
     {
      "fg": "chart-1",
      "bg": "card",
      "fgHex": "#cf7a3d",
      "bgHex": "#f3eee0",
      "ratio": 2.79,
      "min": 3,
      "purpose": "chart series 1 on paper"
     },
     {
      "fg": "chart-1",
      "bg": "popover",
      "fgHex": "#cf7a3d",
      "bgHex": "#e7dbbf",
      "ratio": 2.35,
      "min": 3,
      "purpose": "chart series 1 on a slip (tooltips)"
     }
    ],
    "warns": 2
   }
  },
  {
   "id": "shade",
   "title": "Shadow colour",
   "note": "Shadows are umber in Notebook. In a green room they are green-black. It is one triplet.",
   "decls": {
    "--ll-shade": "34 42 28"
   },
   "check": {
    "pairs": 105,
    "fails": [
     {
      "fg": "primary-foreground",
      "bg": "primary",
      "fgHex": "#262c24",
      "bgHex": "#cf7a3d",
      "ratio": 4.43,
      "min": 4.5,
      "purpose": "ink label on the terracotta marker (primary button)"
     },
     {
      "fg": "sidebar-primary-foreground",
      "bg": "sidebar-primary",
      "fgHex": "#262c24",
      "bgHex": "#cf7a3d",
      "ratio": 4.43,
      "min": 4.5,
      "purpose": "sidebar primary label"
     },
     {
      "fg": "chart-1",
      "bg": "card",
      "fgHex": "#cf7a3d",
      "bgHex": "#f3eee0",
      "ratio": 2.79,
      "min": 3,
      "purpose": "chart series 1 on paper"
     },
     {
      "fg": "chart-1",
      "bg": "popover",
      "fgHex": "#cf7a3d",
      "bgHex": "#e7dbbf",
      "ratio": 2.35,
      "min": 3,
      "purpose": "chart series 1 on a slip (tooltips)"
     }
    ],
    "warns": 2
   }
  },
  {
   "id": "fix",
   "title": "Fix what the checker found",
   "note": "Lighten the marker until the ink label reads, and give the chart its own darker orange.",
   "decls": {
    "--ll-marker": "#d07d41",
    "--chart-1": "#ac6b38"
   },
   "check": {
    "pairs": 105,
    "fails": [],
    "warns": 2
   }
  }
 ],
 "final": {
  "--ll-desk": "#cdd2bb",
  "--ll-desk-deep": "#b6bea0",
  "--ll-paper": "#f3eee0",
  "--ll-paper-shade": "#e7e0cc",
  "--ll-slip": "#e7dbbf",
  "--ll-card": "#f6f1e1",
  "--ll-graph": "#eef1e2",
  "--ll-kraft": "#d9c39a",
  "--ll-check": "#e3e7cf",
  "--ll-pad": "#f3eddc",
  "--ll-photo": "#fbf8ee",
  "--ll-rule-blue": "#93a983",
  "--ll-rule-red": "#c98a7a",
  "--ll-pad-rule": "#aebc9c",
  "--ll-check-rule": "#8aa47b",
  "--ll-ink": "#262c24",
  "--ll-ink-soft": "#454b40",
  "--ll-ink-muted": "#3f453a",
  "--ll-ink-you": "#1f5570",
  "--ll-pencil": "#62625a",
  "--ll-pencil-text": "#57564f",
  "--ll-pencil-mark": "#7d7c73",
  "--ll-red": "#943123",
  "--ll-green": "#385b2e",
  "--ll-orange-text": "#86441a",
  "--ll-focus": "#1f5570",
  "--ll-link-hover": "#163f55",
  "--ll-check-ink": "#3a5b30",
  "--ll-check-no": "#a0352a",
  "--ll-marker": "#d07d41",
  "--ll-hi": "#e3c86c",
  "--ll-hi-deep": "#8f6d10",
  "--ll-shade": "34 42 28",
  "--chart-1": "#ac6b38"
 },
 "notebook": {
  "--ll-desk": "#a8c8bb",
  "--ll-desk-deep": "#93b4a7",
  "--ll-paper": "#f8f5ee",
  "--ll-paper-shade": "#ece6da",
  "--ll-slip": "#fbf8f1",
  "--ll-card": "#fbf6e9",
  "--ll-graph": "#f4f7ef",
  "--ll-kraft": "#dcc8a3",
  "--ll-check": "#dfe9d8",
  "--ll-pad": "#f8f2de",
  "--ll-photo": "#fffdf6",
  "--ll-rule-blue": "#8fb0d4",
  "--ll-rule-red": "#d9776a",
  "--ll-pad-rule": "#b2c3dc",
  "--ll-check-rule": "#7fa37c",
  "--ll-ink": "#2a2420",
  "--ll-ink-soft": "#4a423b",
  "--ll-ink-muted": "#4a433c",
  "--ll-ink-you": "#2c4f9e",
  "--ll-pencil": "#6b6660",
  "--ll-pencil-text": "#5a554e",
  "--ll-pencil-mark": "#8e887f",
  "--ll-red": "#c2412d",
  "--ll-green": "#3b7a4b",
  "--ll-orange-text": "#a4502a",
  "--ll-focus": "#2c4f9e",
  "--ll-link-hover": "#1f3b7a",
  "--ll-check-ink": "#2f6b45",
  "--ll-check-no": "#b23a28",
  "--ll-marker": "#df6b3c",
  "--ll-hi": "#f8dc4c",
  "--ll-hi-deep": "#a87f0c",
  "--ll-shade": "58 44 30",
  "--chart-1": "#df6b3c"
 },
 "knobs": {
  "wobble": 0.8,
  "edge": "deckle"
 }
}
