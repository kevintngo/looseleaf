import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const meta = {
  title: "Guest book",
  description: "A form on a guest check: green ledger paper, a perforated top, a dashed footer. The fields are ordinary labelled inputs; the sheet only changes the paper they are written on.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <Card stock="check" seed="guest" className="mx-auto w-full max-w-sm">
      <CardHeader className="border-b" rule="dashed">
        <CardTitle>Sign the guest book</CardTitle>
        <CardDescription>Name, and one line for the wall.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="grid gap-1 text-sm font-bold">
          Name
          <input className="h-9 border-b border-pencil-mark bg-transparent px-1 font-normal text-ink-you outline-none focus-visible:border-focus" placeholder="Ada" />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          A line for the wall
          <input className="h-9 border-b border-pencil-mark bg-transparent px-1 font-normal text-ink-you outline-none focus-visible:border-focus" placeholder="Lovely evening." />
        </label>
      </CardContent>
      <CardFooter className="justify-between border-t" rule="dashed">
        <span className="text-sm text-muted-foreground">No. 0042</span>
        <Button size="sm">Sign</Button>
      </CardFooter>
    </Card>
  )
}
