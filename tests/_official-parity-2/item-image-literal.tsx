import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"

export default function ItemImageLiteral() {
  return (
    <ItemGroup className="gap-4">
      {["a", "b"].map((t) => (
        <Item key={t} variant="outline" asChild role="listitem">
          <a href="#">
            <ItemMedia variant="image">
              <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt={t} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{t}</ItemTitle>
              <ItemDescription>x</ItemDescription>
            </ItemContent>
          </a>
        </Item>
      ))}
    </ItemGroup>
  )
}
