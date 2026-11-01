import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export const meta = {
  title: "Server errors",
  description: "An error does not have to come from the schema: after a pretend request `setError` puts \"already taken\" on the field, and the same label, box and underline appear. Change the text and it clears itself.",
  layout: "stack" as const,
}

const schema = z.object({ handle: z.string().min(3, "At least 3 characters.").regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers and _ only.") })
const taken = ["ada", "grace", "notes"]

export default function Example() {
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { handle: "notes" }, mode: "onChange" })
  const [pending, setPending] = React.useState(false)
  const [done, setDone] = React.useState("")

  async function onSubmit(v: z.infer<typeof schema>) {
    if (pending) return
    setPending(true)
    setDone("")
    await new Promise((r) => setTimeout(r, 400))
    setPending(false)
    if (taken.includes(v.handle)) form.setError("handle", { message: `@${v.handle} is already taken.` })
    else setDone(`@${v.handle} is yours.`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full max-w-sm gap-4" noValidate>
        <FormField
          control={form.control}
          name="handle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Handle</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormDescription>Try "notes" (taken), then something else.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-3">
          <Button type="submit" aria-busy={pending}>
            {pending ? "Checking" : "Claim it"}
          </Button>
          <span role="status" className="text-sm text-ink-muted">
            {done}
          </span>
        </div>
      </form>
    </Form>
  )
}
