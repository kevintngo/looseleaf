import { LabelTag, LabelTagTitle } from "@/components/ui/label-tag"

export const meta = {
  title: "Tags that link",
  description: "`asChild` makes the tag a link (or a button). It keeps its native focus and keyboard behavior and swings on its eyelet when you hover it.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const tags = [
  { href: "#sale", label: "Sale", twine: "tomato", stock: "kraft" },
  { href: "#new", label: "New", twine: "grass", stock: "sticky-yellow" },
  { href: "#gifts", label: "Gifts", twine: "sky", stock: "paper" },
] as const

export default function Example() {
  return (
    <nav aria-label="Shop sections" className="flex flex-wrap justify-center gap-x-10 gap-y-14 p-6">
      {tags.map((t) => (
        <LabelTag key={t.label} asChild stock={t.stock} twine={t.twine} shape="round" seed={t.label} className="min-h-28 w-28">
          <a href={t.href}>
            <LabelTagTitle className="text-center">{t.label}</LabelTagTitle>
          </a>
        </LabelTag>
      ))}
    </nav>
  )
}
