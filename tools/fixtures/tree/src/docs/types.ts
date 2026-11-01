export type Category =
  | "Actions"
  | "Forms"
  | "Feedback"
  | "Overlays"
  | "Navigation"
  | "Layout"
  | "Data display"
  | "Charts"
  | "Paper"
  | "Marks"
  | "Stickers & doodles"
  | "Chat"
  | "Interactive"
  | "Typography"
  | "Icons"

export interface PropDoc {
  name: string
  type: string
  default?: string
  description: string
  required?: boolean
}

export interface PartDoc {
  name: string
  description?: string
  props?: PropDoc[]
}

export interface ComponentDoc {
  slug: string
  title: string
  category: Category
  description: string
  status?: "stable" | "new" | "experimental"
  upstream?: string
  parts: PartDoc[]
  a11y?: string[]
  usage: string
  related?: string[]
}

export interface ExampleMeta {
  title: string
  description?: string
  layout?: "center" | "stack" | "full"
  height?: number
}

export interface ExampleModule {
  default: React.ComponentType
  meta: ExampleMeta
}
