import { Mascot } from "@/components/ui/mascot"
import { Stamp } from "@/components/ui/stamp"

function Footer01Brand() {
  return (
    <div className="flex flex-wrap items-start gap-x-6 gap-y-4 @3xl:flex-col">
      <div className="max-w-xs">
        <a href="#top" className="flex items-center gap-2 font-script text-4xl leading-none font-bold text-ink">
          <Mascot pose="idle" size={40} />
          penmark
        </a>
        <p className="mt-3 text-base/7 text-ink">Notes and tasks for small teams, drawn by hand in Lisbon and kept in a drawer in Porto.</p>
      </div>
      <Stamp shape="round" text="hand made" ring="PENMARK * DRAWN IN LISBON *" ink="ink-you" size={112} tilt={-9} seed="footer-stamp" label="Stamp: hand made, drawn in Lisbon" />
    </div>
  )
}

export { Footer01Brand }
