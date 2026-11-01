import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "Site header (composed)",
  description: "A real use: the logo, the strip and the account buttons in one header on a sheet of paper. The panels open over the page below; the sign-in button is a normal Button.",
  layout: "center" as const,
  height: 340,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Paper stock="paper" seed="header" className="z-(--ll-z-raised) w-full max-w-3xl self-start px-5 pt-3 pb-4">
      <header className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <a href="#home" className="flex items-center gap-2 self-center font-script text-2xl leading-none font-semibold">
          <Icon name="book-open" size={22} /> Looseleaf
        </a>
        <NavigationMenu aria-label="Main" className="max-w-none flex-none">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger seed="h1">Product</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-60 gap-1">
                  {[
                    ["Notebooks", "Write things down."],
                    ["Stickers", "Mark them up."],
                    ["Templates", "Start from a page."],
                  ].map(([t, d]) => (
                    <li key={t}>
                      <NavigationMenuLink href={`#${t}`}>
                        <span className="font-bold">{t}</span>
                        <span className="text-sm text-muted-foreground">{d}</span>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#pricing" seed="h2">
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#blog" seed="h3" active>
                Blog
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuIndicator />
          </NavigationMenuList>
        </NavigationMenu>
        <div className="ms-auto flex items-center gap-2 self-center">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
          <Button size="sm">Get started</Button>
        </div>
      </header>
    </Paper>
  )
}
