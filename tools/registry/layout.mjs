export const INK_DIR = 'ink'

export const INK_FILE_ITEMS = [
  { test: (sub) => /^textures-paper\.generated\.tsx?$/.test(sub), item: 'ink-paper-textures' },
  { test: (sub) => /^textures\.generated\.tsx?$/.test(sub), item: 'ink-grain-textures' },
  { test: (sub) => /^charts\//.test(sub), ui: 'chart' },
  { test: (sub) => /^typography-tiles\.generated\.tsx?$/.test(sub), ui: 'typography' },
  { test: (sub) => /^paper\//.test(sub) || /^recipes\/paper-set-ink\.tsx?$/.test(sub), item: 'ink-paper' },
  { test: (sub) => /^art\/[^/]+\.tsx?$/.test(sub) || /^art-draw\.tsx?$/.test(sub), item: 'ink-art' },
]

const ART_FILE = /^art\/([^/]+)\/.+/

export const LIB_ITEM_INFO = {
  ink: {
    title: 'Ink engine',
    description: "Looseleaf's hand-drawing engine: seeded randomness, pens, shapes, fills, the <Ink> layer, the provider and the grain and paper textures shared by every drawn component.",
  },
  'ink-recipes': {
    title: 'Ink recipes',
    description: 'Drawing recipes shared by several components: field and select frames, draw-on and reveal helpers, pencil tiles, margin brackets and text marks. Components that use one depend on it.',
  },
  'ink-paper': {
    title: 'Ink paper',
    description: 'Paper for the ink engine: stocks, hand-cut edges, shadows, tape and desk props, and the layers a drawn sheet is built from. Paper, Card, Tape and the paper set import it.',
  },
  'ink-art': {
    title: 'Ink art renderer',
    description: 'What draws the art kits: the art DSL and types, drawSkeleton, the hand-lettering glyph font, rubber stamps and badges. Icon, Doodle, Sticker, Stamp and Mascot import it, and every ink-* art kit builds on it.',
  },
  'ink-paper-textures': {
    title: 'Ink paper textures',
    description: 'Baked paper, fibre, linen and kraft tiles (base64 PNG inside a .ts file). The ink engine imports them; a bundler drops the tiles an app never draws.',
  },
  'ink-grain-textures': {
    title: 'Ink grain textures',
    description: 'Baked pen-grain masks (felt, marker, graphite, waxy, stamp) as base64 PNG inside a .ts file, mounted once per page by <InkDefs>.',
  },
  'ink-icons': { title: 'Ink icons', description: 'The hand-drawn icon set (lucide-compatible names, 16 and 24 px drawings) behind <Icon>.' },
  'ink-doodles': { title: 'Ink doodles', description: 'Margin doodles: the hand-drawn flourishes, arrows and small pictures used by <Doodle> and decorative components.' },
  'ink-stickers': { title: 'Ink stickers', description: 'Die-cut stickers, badges and rubber stamps behind <Sticker>, <Badge> and <Stamp>.' },
  'ink-mascots': { title: 'Ink mascots', description: 'Stubby the pencil stub, in every pose, for empty states, 404 pages and spinners.' },
  'ink-props': { title: 'Ink props', description: 'Paper stocks, tape, clips, pins and other desk props for Paper, Card and friends.' },
  'ink-scenes': { title: 'Ink scenes', description: 'Composed empty-state and hero illustrations built from the doodles, stickers and mascot.' },
}

export function libItemInfo(name) {
  if (LIB_ITEM_INFO[name]) return LIB_ITEM_INFO[name]
  const kind = name.replace(/^ink-/, '')
  if (name.startsWith('ink-')) return { title: `Ink ${kind}`, description: `Hand-drawn ${kind} art for the Looseleaf ink engine.` }
  return null
}

export function ownerOfLibFile(dir, sub, ctx) {
  if (dir !== INK_DIR) return { kind: 'lib', item: dir }
  for (const rule of INK_FILE_ITEMS) {
    if (!rule.test(sub)) continue
    if (rule.item) return { kind: 'lib', item: rule.item }
    if (ctx.uiSlugs.has(rule.ui)) return { kind: 'ui', item: rule.ui }
    break
  }
  const art = ART_FILE.exec(sub)
  if (art) return { kind: 'lib', item: `ink-${art[1]}` }
  const recipe = /^recipes\/([^/]+?)(?:\.(?:tsx?|jsx?|mjs)|\/.+)$/.exec(sub)
  if (recipe) {
    const stem = recipe[1]
    const slug = stem.endsWith('-ink') && ctx.uiSlugs.has(stem.slice(0, -'-ink'.length)) ? stem.slice(0, -'-ink'.length) : ctx.uiSlugs.has(stem) ? stem : null
    if (slug) return { kind: 'ui', item: slug }
    if (stem !== 'index') return { kind: 'lib', item: 'ink-recipes' }
  }
  return { kind: 'lib', item: INK_DIR }
}

export const BLOCK_CATEGORY_RULES = [
  { category: 'authentication', name: /^(?:login|signup|forgot-password|reset-password|otp)(?:-|$)/ },
  { category: 'sidebar', name: /^sidebar(?:-|$)/ },
  { category: 'dashboard', name: /^dashboard(?:-|$)/ },
  { category: 'settings', name: /^settings(?:-|$)/ },
  { category: 'commerce', name: /^checkout(?:-|$)/ },
  { category: 'feedback', tags: ['empty state', 'error'] },
  { category: 'marketing', tags: ['marketing'] },
]

export function blockCategory(name, meta) {
  if (typeof meta?.category === 'string' && meta.category) return meta.category
  const tags = new Set((Array.isArray(meta?.tags) ? meta.tags : []).map((t) => String(t).toLowerCase()))
  for (const rule of BLOCK_CATEGORY_RULES) {
    if (rule.name?.test(name)) return rule.category
    if (rule.tags?.some((t) => tags.has(t))) return rule.category
  }
  return 'app'
}
