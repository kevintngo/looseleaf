import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export const meta = {
  title: "Or continue with",
  description:
    "Children turn the separator into a labeled divider: two rules and a word. Here it splits a sign-in card in two, the way every sign-in card does.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-sm" seed="signin">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Pick up where you left off.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input type="email" placeholder="you@example.com" aria-label="Email" />
        <Button>Send me a link</Button>
        <Separator variant="dashed">or continue with</Separator>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline">Notebook</Button>
          <Button variant="outline">Sketchpad</Button>
        </div>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">No password. The link lasts an hour.</CardFooter>
    </Card>
  )
}
