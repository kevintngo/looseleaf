import { Paper } from "@/components/ui/paper"
import { Stamp } from "@/components/ui/stamp"
import { Link } from "../core/router"
import { paths } from "../core/router-core"
import { GITHUB_URL } from "./TopBar"

export function SiteFooter() {
  return (
    <footer className="dk-footer mx-auto flex w-full max-w-[100rem] justify-center px-4 pb-12 sm:px-6">
      <Paper stock="slip" tilt={0.6} rules="none" shadow="slip" className="flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-8 py-5">
        <Stamp text="HAND DRAWN" sub="no pixels harmed" ink="ink-you" w={196} h={72} tilt={-4} label="Hand drawn: no pixels harmed" />
        <div className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
          <p className="text-[15px] leading-snug text-ink-soft">
            Looseleaf is shadcn/ui, drawn by hand. Every page here is built from the library it documents, so what you see is what you get.
          </p>
          <p className="mt-1 text-[15px] leading-snug text-ink-soft">Made by Kevin T. Ngo. Say hi on X:</p>
          <a href="https://x.com/kevin_t_ngo" target="_blank" rel="noreferrer noopener" className="w-fit font-script text-4xl leading-tight font-bold text-link no-underline hover:text-link-hover">
            @kevin_t_ngo<span className="sr-only"> on X (opens in a new tab)</span>
          </a>
          <ul role="list" className="flex flex-wrap gap-x-4 gap-y-1 font-bold">
            <li>
              <Link to={paths.gettingStarted}>Getting started</Link>
            </li>
            <li>
              <Link to={paths.changelog}>Changelog</Link>
            </li>
            <li>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener">
                GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>
      </Paper>
    </footer>
  )
}
