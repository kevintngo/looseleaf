import { TearOff, TearOffBody, TearOffStub } from "@/components/ui/tear-off"

export const meta = {
  title: "Stub below",
  description: "orientation=\"vertical\" hangs the stub under the ticket, like the free coffee on a punch card. Kraft stock, and it is pulled down.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 330,
}

export default function Example() {
  return (
    <TearOff orientation="vertical" tornMessage="One free coffee, redeemed.">
      <TearOffBody stock="kraft" className="w-56 px-5 py-4">
        <p className="font-script text-3xl leading-none">Coffee card</p>
        <p className="mt-2 text-sm">nine stamped, one free</p>
      </TearOffBody>
      <TearOffStub stock="sticky-yellow" className="h-20 w-56">
        <span className="font-script text-3xl leading-none">free coffee</span>
      </TearOffStub>
    </TearOff>
  )
}
