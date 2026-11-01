import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Mascot } from "@/components/ui/mascot"
import { Paper } from "@/components/ui/paper"
import { useSidebar } from "@/components/ui/sidebar"
import { Link, useLocation } from "../core/router"
import { paths } from "../core/router-core"
import { Kbd } from "../kit"
import { SettingsMenu } from "./SettingsMenu"

export const GITHUB_URL: string = import.meta.env.VITE_GITHUB_URL ?? "https://github.com/kevintngo/looseleaf"

function useShortcutHint(): string {
  const [hint, setHint] = useState("Ctrl K")
  useEffect(() => {
    const platform = navigator.platform || navigator.userAgent || ""
    if (/Mac|iPhone|iPad/i.test(platform)) setHint("⌘K")
  }, [])
  return hint
}

export interface TopBarProps {
  onSearch: () => void
}

const PRIMARY = [
  { label: "Getting started", to: paths.gettingStarted, match: "getting-started" },
  { label: "Components", to: paths.components(), match: "components" },
  { label: "Blocks", to: paths.blocks(), match: "blocks" },
] as const

export function TopBar({ onSearch }: TopBarProps) {
  const { route } = useLocation()
  const { isMobile, open, openMobile, toggleSidebar } = useSidebar()
  const hint = useShortcutHint()
  const expanded = isMobile ? openMobile : open
  return (
    <div className="dk-topbar-wrap sticky top-0 z-(--ll-z-sticky) h-14 px-2 pt-2 print:hidden sm:px-4">
      <Paper as="header" stock="slip" tilt={false} rules="none" shadow="loose" className="dk-topbar flex h-full items-center gap-1 px-2 sm:gap-2 sm:px-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label={isMobile ? "Menu" : expanded ? "Hide navigation" : "Show navigation"}
          aria-expanded={expanded}
          aria-controls={expanded ? "site-nav" : undefined}
          aria-keyshortcuts={isMobile ? undefined : "Control+B Meta+B"}
          onClick={toggleSidebar}
        >
          <Icon name={isMobile ? "menu" : "panel-left"} size={20} />
        </Button>
        <Link to={paths.home} className="dk-logo group/logo flex shrink-0 items-center gap-1.5 px-1 outline-offset-4">
          <Mascot pose="wave" size={44} className="transition-transform duration-(--ll-dur-pop) ease-pop group-hover/logo:-rotate-6 max-[359px]:hidden" />
          <span className="ll-riso font-script text-[1.9rem] leading-none font-bold text-ink [--ll-riso:var(--ll-marker)]">Looseleaf</span>
        </Link>
        <nav aria-label="Primary" className="dk-topnav ms-3 hidden items-center gap-0.5 lg:flex">
          {PRIMARY.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={route.name === item.match ? "page" : undefined}
              className="dk-topnav-link px-3 py-1.5 font-bold text-ink-soft hover:ll-swipe hover:text-ink aria-[current=page]:ll-swipe aria-[current=page]:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <Button
          variant="outline"
          className="dk-search-trigger min-w-0 justify-start gap-2 text-muted-foreground sm:w-56 lg:w-72"
          onClick={onSearch}
          aria-haspopup="dialog"
          aria-keyshortcuts="Control+K Meta+K"
        >
          <Icon name="search" size={18} />
          <span className="dk-search-label flex-1 truncate text-start max-sm:sr-only">Search</span>
          <Kbd aria-hidden="true" className="max-sm:hidden">
            {hint}
          </Kbd>
        </Button>
        <SettingsMenu />
        <Button variant="ghost" size="icon" asChild className="max-sm:hidden">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener" aria-label="Looseleaf on GitHub (opens in a new tab)">
            <Icon name="git-branch" size={20} />
          </a>
        </Button>
      </Paper>
    </div>
  )
}
