"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Page, PageDescription, PageHeader, PageTitle } from "@/components/ui/page"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sticker } from "@/components/ui/sticker"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { SettingsProfileCard } from "@/blocks/settings-profile/components/settings-profile-card"
import { SettingsProfilePhoto } from "@/blocks/settings-profile/components/settings-profile-photo"
import { BIO_MAX, DEFAULT_PROFILE, PRONOUNS, TIME_ZONES, profileSchema, type ProfileValues } from "@/blocks/settings-profile/components/settings-profile-schema"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  defaultValues?: ProfileValues
  onSave?: (values: ProfileValues) => void | Promise<void>
}

const demoSave = () => new Promise<void>((resolve) => window.setTimeout(resolve, 450))

export default function SettingsProfile({ className, defaultValues = DEFAULT_PROFILE, onSave = demoSave }: Props) {
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues, mode: "onTouched" })
  const values = form.watch()
  const [photo, setPhoto] = React.useState<string>()
  const [saved, setSaved] = React.useState(false)
  const [failure, setFailure] = React.useState("")
  const { isDirty, isSubmitting } = form.formState
  const titleId = React.useId()

  React.useEffect(() => {
    const sub = form.watch(() => {
      setSaved(false)
      setFailure("")
    })
    return () => sub.unsubscribe()
  }, [form])
  React.useEffect(() => () => (photo ? URL.revokeObjectURL(photo) : undefined), [photo])

  const submit = form.handleSubmit(async (v) => {
    try {
      await onSave(v)
    } catch (err) {
      setFailure(err instanceof Error && err.message ? err.message : "Your changes were not saved. Nothing was lost, so try again in a moment.")
      return
    }
    setFailure("")
    form.reset(v)
    setSaved(true)
  })

  return (
    <div className="w-full overflow-x-clip px-2">
      <Page as="section" width="xl" holes reinforced seed="settings-profile" aria-labelledby={titleId} className={cn("my-6", className)}>
        <PageHeader>
          <PageTitle as="h2" id={titleId} seed="profile-title">
            Profile
          </PageTitle>
          <PageDescription>This is how you sign the pages you share. Nothing changes for anyone until you save.</PageDescription>
        </PageHeader>

        <div className="@container/settings">
          <div className="grid items-start gap-10 @3xl/settings:grid-cols-[minmax(0,1fr)_17rem]">
            <Form {...form}>
              <form noValidate onSubmit={submit} aria-label="Profile settings" className="@container/form grid gap-6">
                <SettingsProfilePhoto name={values.name} photo={photo} onPhoto={setPhoto} />
                <Separator variant="dashed" />

                <div className="grid gap-6 @lg/form:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input autoComplete="name" placeholder="Ada Lovelace" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <InputGroup>
                          <InputGroupAddon>
                            <InputGroupText>@</InputGroupText>
                          </InputGroupAddon>
                          <FormControl>
                            <InputGroupInput autoComplete="username" spellCheck={false} placeholder="ada_writes" {...field} />
                          </FormControl>
                        </InputGroup>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" placeholder="ada@notes.dev" {...field} />
                      </FormControl>
                      <FormDescription>Receipts and sign-in links go here. It is never shown on your card.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="A line or two, in your own words."
                          showCount={({ length }) => (
                            <span className={cn("ll-num", length > BIO_MAX && "font-bold text-red")}>
                              {length}/{BIO_MAX}
                            </span>
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 @lg/form:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="pronouns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pronouns</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Rather not say" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper">
                            {PRONOUNS.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time zone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Pick a time zone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper">
                            {TIME_ZONES.map((z) => (
                              <SelectItem key={z.value} value={z.value}>
                                {z.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input type="url" inputMode="url" autoComplete="url" placeholder="https://" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator variant="dashed" />

                <FormField
                  control={form.control}
                  name="discoverable"
                  render={({ field }) => (
                    <FormItem className="flex items-start justify-between gap-6">
                      <div className="grid gap-1">
                        <FormLabel>Show me in search</FormLabel>
                        <FormDescription>Anyone can find your card by name. Turn it off and only people with the link can.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" aria-busy={isSubmitting}>
                    {isSubmitting ? "Saving…" : "Save changes"}
                  </Button>
                  {isDirty ? (
                    <Button type="button" variant="ghost" onClick={() => form.reset()}>
                      Undo changes
                    </Button>
                  ) : null}
                  <p role="status" className="flex items-center gap-2 text-sm font-bold text-green">
                    {saved ? (
                      <>
                        <Icon name="circle-check" />
                        Saved. Your card is up to date.
                      </>
                    ) : null}
                  </p>
                  {failure ? (
                    <p role="alert" className="flex basis-full items-center gap-2 text-sm font-bold text-red">
                      <Icon name="circle-alert" />
                      {failure}
                    </p>
                  ) : null}
                </div>
              </form>
            </Form>

            <aside aria-label="Preview" className="relative grid gap-3 @3xl/settings:sticky @3xl/settings:top-6">
              <p className="font-script text-2xl leading-none font-semibold">How others see you</p>
              <SettingsProfileCard values={values} photo={photo} />
              {saved ? <Sticker name="done" size={64} rotate={8} className="absolute -end-2 -bottom-8" /> : null}
            </aside>
          </div>
        </div>
      </Page>
    </div>
  )
}
