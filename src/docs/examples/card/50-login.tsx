import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Login",
  description:
    "The shadcn demo: a title, a description, a link tucked into CardAction, a form of two labelled fields with a \"forgot\" link beside the second label, and a footer of two full-width buttons. Nothing is drawn but the paper, the fields and the buttons.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <Card seed="login" className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
        <CardAction>
          <Button variant="link">Sign up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form id="card-login-form" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="card-login-email">Email</Label>
              <Input id="card-login-email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="card-login-password">Password</Label>
                <a href="#forgot" className="ms-auto inline-block text-sm text-link underline-offset-4 hover:text-link-hover hover:underline">
                  Forgot your password?
                </a>
              </div>
              <Input id="card-login-password" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button type="submit" form="card-login-form" className="w-full">
          Login
        </Button>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  )
}
