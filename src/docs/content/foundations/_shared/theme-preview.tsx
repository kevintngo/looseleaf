import { useId } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Desk } from "@/components/ui/desk"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Paper } from "@/components/ui/paper"
import { Switch } from "@/components/ui/switch"
import { InkProvider } from "@/lib/ink/react"
import { engineKnobs, scopeStyle, type ThemeState } from "./theme-model"

export function ThemePreview({ state, label, seed = "theme" }: { state: ThemeState; label: string; seed?: string }) {
  const id = useId()
  return (
    <div data-ll-scope="" style={scopeStyle(state)} role="group" aria-label={label} className="min-w-0">
      <InkProvider knobs={engineKnobs(state)} defs={false}>
        <Desk className="grid gap-5 p-4 sm:p-5">
          <Card seed={`${seed}:card`} tape="corner" className="w-full gap-4 py-5">
            <CardHeader>
              <CardTitle>Trip notes</CardTitle>
              <CardDescription>Packed for the weekend.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor={`${id}-where`}>Where to</Label>
                <Input id={`${id}-where`} defaultValue="The pond" />
              </div>
              <div className="flex items-center gap-2.5">
                <Checkbox id={`${id}-umbrella`} defaultChecked />
                <Label htmlFor={`${id}-umbrella`}>Bring the big umbrella</Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Switch id={`${id}-share`} defaultChecked />
                <Label htmlFor={`${id}-share`}>Share with Sam</Label>
              </div>
              <p className="text-[15px] leading-snug text-ink">
                Read <span className="font-bold text-ink-you underline decoration-2 underline-offset-4">the small print</span> or <mark>mark it up</mark>.{" "}
                <span className="text-red">Not saved.</span> <span className="text-green">Saved.</span> <span className="text-muted-foreground">Edited a minute ago.</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge>new</Badge>
                <Badge variant="secondary">draft</Badge>
                <Badge variant="destructive">late</Badge>
                <Badge variant="outline">3 left</Badge>
              </div>
            </CardContent>
            <CardFooter className="flex-wrap gap-2">
              <Button variant="outline" size="sm">
                Cancel
              </Button>
              <Button size="sm">Save</Button>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </CardFooter>
          </Card>
          <div className="flex flex-wrap items-start gap-5">
            <Paper stock="sticky-yellow" seed={`${seed}:sticky`} size={[132, 92]} className="h-[92px] w-[132px] p-3 font-script text-2xl leading-tight font-bold text-ink">
              buy more ink!
            </Paper>
            <Paper stock="slip" seed={`${seed}:slip`} size={[150, 92]} className="h-[92px] w-[150px] p-3 text-[14px] leading-snug text-ink">
              <span className="font-bold">Slip</span> <code className="bg-muted px-1 font-mono text-[12.5px]">--ll-slip</code>
            </Paper>
            <Paper stock="kraft" seed={`${seed}:kraft`} size={[110, 92]} className="h-[92px] w-[110px] p-3 text-[14px] leading-snug text-ink">
              Kraft
            </Paper>
          </div>
        </Desk>
      </InkProvider>
    </div>
  )
}
