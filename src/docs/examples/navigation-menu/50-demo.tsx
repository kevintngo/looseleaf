import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import { Icon } from "@/components/ui/icon"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export const meta = {
  title: "Six items (as written)",
  description:
    "shadcn's `navigation-menu-demo` line for line: `viewport={isMobile}` from `useIsMobile()`, `navigationMenuTriggerStyle()` on a plain link, `flex-wrap` on the list, the last three panels hidden below `md`, and a ListItem helper. Link is an `<a>` here (shadcn's uses next/link).",
  layout: "center" as const,
  height: 460,
}

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "#alert-dialog",
    description: "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "#hover-card",
    description: "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "#progress",
    description: "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "#scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "#tabs",
    description: "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "#tooltip",
    description: "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
]

export default function Example() {
  const isMobile = useIsMobile()

  return (
    <NavigationMenu viewport={isMobile} aria-label="Main">
      <NavigationMenuList className="flex-wrap">
        <NavigationMenuItem>
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a className="flex h-full w-full flex-col justify-end bg-linear-to-b from-muted/50 to-muted p-4 no-underline outline-hidden select-none md:p-6" href="#home">
                    <div className="mb-2 text-lg font-medium sm:mt-4">Looseleaf</div>
                    <p className="text-sm leading-tight text-muted-foreground">Beautifully designed components built with Tailwind CSS.</p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="#docs" title="Introduction">
                Re-usable components built using Radix UI and Tailwind CSS.
              </ListItem>
              <ListItem href="#installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="#typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <ListItem key={component.title} title={component.title} href={component.href}>
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <a href="#docs">Docs</a>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuTrigger>List</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <a href="#components">
                    <div className="font-medium">Components</div>
                    <div className="text-muted-foreground">Browse all components in the library.</div>
                  </a>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <a href="#documentation">
                    <div className="font-medium">Documentation</div>
                    <div className="text-muted-foreground">Learn how to use the library.</div>
                  </a>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <a href="#blog">
                    <div className="font-medium">Blog</div>
                    <div className="text-muted-foreground">Read our latest blog posts.</div>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuTrigger>Simple</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <a href="#components">Components</a>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <a href="#documentation">Documentation</a>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <a href="#blocks">Blocks</a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuTrigger>With Icon</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <a href="#backlog" className="flex-row items-center gap-2">
                    <Icon name="circle-question-mark" />
                    Backlog
                  </a>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <a href="#to-do" className="flex-row items-center gap-2">
                    <Icon name="circle" />
                    To Do
                  </a>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <a href="#done" className="flex-row items-center gap-2">
                    <Icon name="circle-check" />
                    Done
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function ListItem({ title, children, href, ...props }: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <a href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  )
}
