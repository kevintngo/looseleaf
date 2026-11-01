import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

export const meta = {
  title: "Every control",
  description: "FormControl hands its id, aria-describedby and aria-invalid to whatever it wraps, so a Select, a Radio Group, a Checkbox, a Switch and a Slider go red the same way an Input does. A slider is not a labelable element: its FormLabel gets an id and the Slider points at it with aria-labelledby.",
  layout: "stack" as const,
  height: 460,
}

const schema = z.object({
  role: z.string().min(1, "Pick a role."),
  plan: z.enum(["starter", "studio"], { message: "Choose a plan." }),
  terms: z.boolean().refine((v) => v, "You must accept the terms."),
  digest: z.boolean(),
  pages: z.array(z.number()).refine((v) => v[0] >= 5, "Aim for at least 5 pages a day."),
})

export default function Example() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { role: "", terms: false, digest: true, pages: [20] },
  })
  const [saved, setSaved] = React.useState("")
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => setSaved(`Saved: ${v.role}, ${v.plan}, ${v.pages[0]} pages`))} className="grid w-full max-w-sm gap-5" noValidate>
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pick a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper">
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="gap-2.5" aria-label="Plan">
                  {["starter", "studio"].map((v) => (
                    <FormItem key={v} className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value={v} />
                      </FormControl>
                      <FormLabel className="capitalize">{v}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pages"
          render={({ field }) => (
            <FormItem>
              <FormLabel id="pages-label">Pages per day: {field.value[0]}</FormLabel>
              <FormControl>
                <Slider min={1} max={60} value={field.value} onValueChange={field.onChange} aria-labelledby="pages-label" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="digest"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-4">
              <div className="grid gap-1">
                <FormLabel>Weekly digest</FormLabel>
                <FormDescription>Sunday, in pencil.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>I accept the small print</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-3">
          <Button type="submit">Save</Button>
          <span role="status" className="text-sm text-ink-muted">
            {saved}
          </span>
        </div>
      </form>
    </Form>
  )
}
