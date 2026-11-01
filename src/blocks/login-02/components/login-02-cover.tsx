import { Mascot } from "@/components/ui/mascot"
import { Paper } from "@/components/ui/paper"
import { StickyNote } from "@/components/ui/sticky-note"

function LoginCover() {
  return (
    <div data-slot="login-cover" aria-hidden="true" className="relative h-[30rem] w-[23rem] shrink-0">
      <Paper stock="graph" tilt={-1.5} tape="both" tapeKind="washi-stripes" seed="login-02-sheet" className="absolute start-6 top-10 h-[22rem] w-[18rem] px-6 pt-8">
        <p className="font-script text-[2.75rem] leading-[0.95] font-bold text-ink">hi again!</p>
        <p className="mt-2 max-w-[11rem] font-hand text-base leading-snug text-ink-soft">we kept your page open and the kettle on.</p>
      </Paper>
      <Mascot pose="wave" size={216} seed="login-02-stubby" className="absolute start-[7.5rem] top-[11.5rem] [--ll-blend:normal]" />
      <StickyNote color="yellow" fastener="pin" tilt={-3} seed="login-02-note" className="absolute start-0 top-[13rem] min-h-0 w-28 px-3 pt-6 pb-3 text-lg">
        psst: tab works too
      </StickyNote>
    </div>
  )
}

export { LoginCover }
