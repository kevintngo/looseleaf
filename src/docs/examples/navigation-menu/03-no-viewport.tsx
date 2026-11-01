import { Icon } from "@/components/ui/icon"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"

export const meta = {
  title: "A slip under each tab",
  description: "viewport={false}: there is no shared slip, so each panel is a slip of its own set down under its tab, at the size of its contents. Good for short menus of a few links.",
  layout: "center" as const,
  height: 300,
}

const ITEMS = [
  ["Product", ["Notebooks", "Stickers", "Templates"]],
  ["Company", ["About", "Blog", "Careers"]],
] as const

export default function Example() {
  return (
    <NavigationMenu viewport={false} aria-label="Company">
      <NavigationMenuList>
        {ITEMS.map(([label, links]) => (
          <NavigationMenuItem key={label}>
            <NavigationMenuTrigger seed={label}>{label}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-48 gap-1">
                {links.map((l) => (
                  <li key={l}>
                    <NavigationMenuLink href={`#${l}`}>
                      <span className="flex items-center gap-2">
                        <Icon name="chevron-right" /> {l}
                      </span>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
