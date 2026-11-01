import { Button } from "@/components/ui/button"
import { Mascot } from "@/components/ui/mascot"

const links = ["Product", "Pricing", "Notes", "Sign in"]

function AnnouncementBarHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-5 [--ll-blend:normal]">
      <a href="#top" className="flex items-center gap-2 font-script text-3xl leading-none font-bold text-ink">
        <Mascot pose="idle" size={32} />
        penmark
      </a>
      <nav aria-label="Main" className="hidden items-center gap-6 text-base text-ink @lg:flex">
        {links.map((l) => (
          <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, "-")}`} className="underline-offset-4 hover:underline">
            {l}
          </a>
        ))}
      </nav>
      <Button size="sm">Start free</Button>
    </header>
  )
}

export { AnnouncementBarHeader }
