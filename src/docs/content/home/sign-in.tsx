import { useEffect, useRef, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignIn() {
  const [done, setDone] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setDone(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setDone(false), 2400)
  }

  return (
    <Card data-home="sign-in" stock="paper" tape="both" tapeKind="masking" seed="home-sign-in" className="relative w-full max-w-md gap-5 py-7 @4xl:justify-self-end">
      <CardHeader>
        <CardTitle className="text-4xl">Welcome back</CardTitle>
        <CardDescription>sign in to pick up where you left off.</CardDescription>
      </CardHeader>
      <form onSubmit={submit} className="flex flex-col gap-5" aria-label="Sign in">
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="home-email">Email</Label>
            <Input id="home-email" name="demo-email" type="email" autoComplete="off" defaultValue="ada@looseleaf.dev" />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="home-password">Password</Label>
              <Button type="button" variant="link" size="xs">
                Forgot password?
              </Button>
            </div>
            <Input id="home-password" name="demo-password" type="password" autoComplete="off" defaultValue="pencil-case" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="home-remember" defaultChecked />
            <Label htmlFor="home-remember">Remember me on this desk</Label>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3">
          <Button type="submit" size="lg">
            {done ? <Icon name="check" /> : null}
            {done ? "Signed in" : "Sign in"}
          </Button>
          <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            New here?
            <Button type="button" variant="link" size="sm">
              Make an account
            </Button>
          </p>
          <span role="status" className="sr-only">
            {done ? "Signed in as ada@looseleaf.dev (a demo: nothing was sent)" : ""}
          </span>
        </CardFooter>
      </form>
    </Card>
  )
}
