import { lazy } from "react"
import { Callout } from "@/components/ui/callout"
import { Desk, type DeskObject } from "@/components/ui/desk"
import { useDeskKnob } from "../shell/desk-knob"
import { Footer } from "./home/footer"
import { Hero } from "./home/hero"
import { How } from "./home/how"
import { LazyOnView } from "./home/lazy-on-view"
import SignIn from "./home/sign-in"
import { Stats } from "./home/stats"
import { Why } from "./home/why"

const ChartCard = lazy(() => import("./home/chart-card"))
const PrefsCard = lazy(() => import("./home/prefs-card"))
const Annotated = lazy(() => import("./home/annotated"))
const StickerDesk = lazy(() => import("./home/sticker-desk"))
const SketchCorner = lazy(() => import("./home/sketch-corner"))
const Planner = lazy(() => import("./home/planner"))
const ChatCard = lazy(() => import("./home/chat-card"))
const TabsCard = lazy(() => import("./home/tabs-card"))
const ToastCard = lazy(() => import("./home/toast-card"))

const ON_THE_DESK: readonly DeskObject[] = ["clips", "coffee", "ruler", "pins"]

const ROW = "grid items-start gap-x-10 gap-y-14"

export default function Home() {
  const { clutter } = useDeskKnob()
  return (
    <Desk
      objects={clutter ? ON_THE_DESK : false}
      seed="home-desk"
      data-home="desk"
      className="-mx-4 -mt-6 -mb-20 overflow-x-clip overflow-y-visible lg:-mx-10 lg:-mt-9 lg:-mb-24"
    >
      <div className="@container mx-auto w-full max-w-[72rem] px-6 pt-8 pb-16 sm:px-10 sm:pt-16">
        <Hero />

        <section aria-labelledby="live" className="mt-16">
          <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
            <h2 id="live" className="font-script text-5xl leading-[1.02] font-bold text-balance text-ink @xl:text-6xl">
              Everything on this desk is live.
            </h2>
            <Callout direction="left" curve="curved" tone="ink" className="hidden @2xl:inline-flex [&_[data-slot=callout-text]]:text-ink" seed="live-note">
              go on, poke it
            </Callout>
          </div>

          <div className="mt-10 grid gap-y-14">
            <div className={`${ROW} @2xl:grid-cols-2 @4xl:grid-cols-12`}>
              <div className="flex min-w-0 flex-col gap-14 @4xl:col-span-5">
                <SignIn />
                <LazyOnView height={15} order={1}>
                  <PrefsCard />
                </LazyOnView>
              </div>
              <div className="flex min-w-0 flex-col gap-14 @4xl:col-span-7 @4xl:mt-6">
                <LazyOnView height={22} order={0}>
                  <ChartCard />
                </LazyOnView>
                <LazyOnView height={17} order={2}>
                  <Annotated />
                </LazyOnView>
              </div>
            </div>

            <div className={`${ROW} @2xl:grid-cols-2 @5xl:grid-cols-3`}>
              <LazyOnView height={21} order={3} className="min-w-0">
                <StickerDesk />
              </LazyOnView>
              <LazyOnView height={21} order={4} className="min-w-0 @5xl:mt-8">
                <SketchCorner />
              </LazyOnView>
              <LazyOnView height={25} order={5} className="min-w-0 @2xl:col-span-2 @5xl:col-span-1">
                <Planner />
              </LazyOnView>
            </div>

            <div className={`${ROW} @2xl:grid-cols-2 @4xl:grid-cols-12`}>
              <LazyOnView height={17} order={6} className="min-w-0 @4xl:col-span-5">
                <ChatCard />
              </LazyOnView>
              <LazyOnView height={17} order={7} className="min-w-0 @4xl:col-span-4 @4xl:mt-8">
                <TabsCard />
              </LazyOnView>
              <LazyOnView height={9} order={8} className="min-w-0 @2xl:col-span-2 @4xl:col-span-3 @4xl:mt-2">
                <ToastCard />
              </LazyOnView>
            </div>
          </div>
        </section>

        <Why />
        <How />
        <Stats />
        <Footer />
      </div>
    </Desk>
  )
}
