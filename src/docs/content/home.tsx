import { lazy } from "react"
import { Desk, type DeskObject } from "@/components/ui/desk"
import { useDeskKnob } from "../shell/desk-knob"
import { Footer } from "./home/footer"
import { Hero } from "./home/hero"
import { How } from "./home/how"
import { LazyOnView } from "./home/lazy-on-view"
import { Stats } from "./home/stats"
import { Why } from "./home/why"

const ChartCard = lazy(() => import("./home/chart-card"))
const PrefsCard = lazy(() => import("./home/prefs-card"))
const Annotated = lazy(() => import("./home/annotated"))
const Planner = lazy(() => import("./home/planner"))
const ChatCard = lazy(() => import("./home/chat-card"))
const TabsCard = lazy(() => import("./home/tabs-card"))
const ToastCard = lazy(() => import("./home/toast-card"))

const ON_THE_DESK: readonly DeskObject[] = ["clips", "ruler"]

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
          <h2 id="live" className="font-script text-4xl leading-tight font-bold text-balance text-ink @xl:text-5xl">
            This desk is made of real components.
          </h2>

          <div className="mt-10 grid gap-y-14">
            <div className={`${ROW} @2xl:grid-cols-2 @4xl:grid-cols-12`}>
              <LazyOnView height={22} order={0} className="min-w-0 @4xl:col-span-7">
                <ChartCard />
              </LazyOnView>
              <LazyOnView height={15} order={1} className="min-w-0 @4xl:col-span-5">
                <PrefsCard />
              </LazyOnView>
            </div>

            <div className={`${ROW} @2xl:grid-cols-2 @4xl:grid-cols-12`}>
              <LazyOnView height={17} order={2} className="min-w-0 @4xl:col-span-7">
                <Annotated />
              </LazyOnView>
              <LazyOnView height={25} order={3} className="min-w-0 @4xl:col-span-5">
                <Planner />
              </LazyOnView>
            </div>

            <div className={`${ROW} @2xl:grid-cols-2 @4xl:grid-cols-12`}>
              <LazyOnView height={17} order={4} className="min-w-0 @4xl:col-span-5">
                <ChatCard />
              </LazyOnView>
              <LazyOnView height={17} order={5} className="min-w-0 @4xl:col-span-4">
                <TabsCard />
              </LazyOnView>
              <LazyOnView height={9} order={6} className="min-w-0 @2xl:col-span-2 @4xl:col-span-3">
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
