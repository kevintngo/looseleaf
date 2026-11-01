import { Marquee, MarqueeItem } from "@/components/ui/marquee"

export const meta = {
  title: "Announcement bar",
  description: "A real use: the strip above a site header, with links in it. Only the first copy can be tabbed to, and the ticker holds still while a link has focus.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <header className="flex w-full max-w-3xl flex-col gap-3">
      <Marquee label="Announcements" speed={55} tape="washi-stripes" color="tangerine">
        <MarqueeItem>
          <a href="#sale" className="underline decoration-wavy underline-offset-4 hover:text-ink-you">
            Spring sale: everything ten off
          </a>
        </MarqueeItem>
        <MarqueeItem>
          <a href="#shipping" className="underline decoration-wavy underline-offset-4 hover:text-ink-you">
            Free shipping over 40
          </a>
        </MarqueeItem>
        <MarqueeItem>New: the felt-tip collection</MarqueeItem>
      </Marquee>
      <nav aria-label="Main" className="flex items-center gap-6 px-2 font-script text-2xl">
        <span className="text-3xl">Looseleaf &amp; Co.</span>
        <a href="#shop">Shop</a>
        <a href="#journal">Journal</a>
        <a href="#about">About</a>
      </nav>
    </header>
  )
}
