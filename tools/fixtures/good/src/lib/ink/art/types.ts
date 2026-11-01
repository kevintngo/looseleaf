export interface ArtDef {
  grid: number
  parts: readonly (readonly (string | number)[])[]
  small?: readonly (readonly (string | number)[])[]
}

export function defineIcons<T extends Record<string, ArtDef>>(defs: T): T {
  return defs
}
