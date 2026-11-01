export function pngSize(file: string): { w: number; h: number }
export function pickSource(slug: string, slugs: ReadonlySet<string>, files?: { components: string[]; art: string[] }): string | null
export function cropFor(size: { w: number; h: number }): { w: number; h: number; x: number; y: number } | null
