import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Seal } from "@/components/ui/seal"

export const meta = {
  title: "Verified, awarded, sealed",
  description: "In ordinary UI: a verified mark beside a name at 20 px, a best-seller seal pinned to a card corner, and a certificate with a rosette, a ringed seal and a wax seal.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-3xl gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Card className="gap-3 p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>MC</AvatarFallback>
            </Avatar>
            <div>
              <p className="flex items-center gap-1.5 text-lg font-bold">
                Maya Chen
                <Seal mark="check" tone="sky" size={20} label="Verified" shadow={false} />
              </p>
              <p className="text-muted-foreground">Illustrator, Lisbon</p>
            </div>
          </div>
        </Card>
        <Card className="relative">
          <Seal variant="rosette" text="Best" tone="lemon" ribbon="tomato" size={72} tilt={8} className="absolute -top-5 -right-3" />
          <CardHeader>
            <CardTitle>Twelve felt tips</CardTitle>
            <CardDescription>Assorted, water based, no bleed.</CardDescription>
          </CardHeader>
          <CardContent className="ll-num">$ 14.00</CardContent>
        </Card>
      </div>
      <Card className="relative items-center gap-2 p-6 text-center">
        <p className="font-type text-xs text-pencil-text">Certificate of</p>
        <h3 className="font-script text-4xl">Good Handwriting</h3>
        <p className="max-w-[16rem] text-muted-foreground">Awarded to Maya Chen for lettering that stays on the line, mostly.</p>
        <div className="mt-3 flex items-end gap-4">
          <Seal variant="ring" text="Signed" tone="sky" ring="Official seal" size={112} label="Official seal" />
          <Seal variant="wax" text="M" tone="red" size={84} tilt={-6} label="Wax seal" />
        </div>
      </Card>
    </div>
  )
}
