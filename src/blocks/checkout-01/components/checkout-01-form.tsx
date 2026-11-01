"use client"

import * as React from "react"
import type { UseFormReturn } from "react-hook-form"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { COUNTRIES, FIELD_LABELS, METHODS, formatCardNumber, formatExpiry, money, type CheckoutValues, type MethodId } from "@/blocks/checkout-01/components/checkout-01-data"

type Props = {
  form: UseFormReturn<CheckoutValues>
  id: string
  onSubmit: (e?: React.BaseSyntheticEvent) => void
  shipping: Record<MethodId, number>
}

function Heading({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h3 className="flex items-baseline gap-3 font-script text-3xl leading-none font-semibold">
      <span className="ll-num text-ink-you">{n}</span>
      {children}
    </h3>
  )
}

function ErrorSummary({ form }: { form: UseFormReturn<CheckoutValues> }) {
  const { errors, submitCount } = form.formState
  const names = (Object.keys(errors) as (keyof CheckoutValues)[]).filter((k) => errors[k]?.message)
  if (!submitCount || names.length === 0) return null
  return (
    <Alert variant="destructive">
      <Icon name="circle-alert" />
      <AlertTitle>{names.length === 1 ? "One thing needs a look" : `${names.length} things need a look`}</AlertTitle>
      <AlertDescription>
        <ul className="grid gap-1">
          {names.map((k) => (
            <li key={k}>
              <button type="button" className="text-start underline decoration-wavy underline-offset-4 outline-offset-2 focus-visible:outline-2 focus-visible:outline-focus" onClick={() => form.setFocus(k)}>
                {FIELD_LABELS[k] ?? k}: {errors[k]?.message}
              </button>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

export function Checkout01Form({ form, id, onSubmit, shipping }: Props) {
  const method = form.watch("method")
  const pickup = method === "pickup"
  return (
    <Form {...form}>
      <form id={id} noValidate onSubmit={onSubmit} aria-label="Checkout" className="@container/form grid gap-8">
        <ErrorSummary form={form} />

        <section aria-labelledby={`${id}-contact`} className="grid gap-5">
          <div id={`${id}-contact`}>
            <Heading n={1}>Who is it for?</Heading>
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="Ada Lovelace" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Separator variant="dashed" />

        <section aria-labelledby={`${id}-delivery`} className="grid gap-5">
          <div id={`${id}-delivery`}>
            <Heading n={2}>Where does it go?</Heading>
          </div>
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} aria-label="Delivery" className="gap-3">
                    {METHODS.map((m) => (
                      <FieldLabel key={m.id} htmlFor={`${id}-m-${m.id}`}>
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>
                              {m.name}
                              <span className="ll-num ms-auto font-normal">{shipping[m.id] === 0 ? "free" : `€${money(shipping[m.id])}`}</span>
                            </FieldTitle>
                            <FieldDescription>{m.help}</FieldDescription>
                          </FieldContent>
                          <RadioGroupItem value={m.id} id={`${id}-m-${m.id}`} />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          {pickup ? (
            <p className="text-sm text-muted-foreground">We will write to you when it is on the counter. Bring the email.</p>
          ) : (
            <>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street and number</FormLabel>
                    <FormControl>
                      <Input autoComplete="street-address" placeholder="12 rue de l'Eau" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-5 @md/form:grid-cols-[1fr_9rem]">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Town or city</FormLabel>
                      <FormControl>
                        <Input autoComplete="address-level2" placeholder="Lisbon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal code</FormLabel>
                      <FormControl>
                        <Input autoComplete="postal-code" placeholder="1100-148" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <NativeSelect autoComplete="country-name" className="w-full" {...field}>
                        {COUNTRIES.map((c) => (
                          <NativeSelectOption key={c} value={c}>
                            {c}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </section>

        <Separator variant="dashed" />

        <section aria-labelledby={`${id}-pay`} className="grid gap-5">
          <div id={`${id}-pay`}>
            <Heading n={3}>How are you paying?</Heading>
          </div>
          <FormField
            control={form.control}
            name="cardName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name on card</FormLabel>
                <FormControl>
                  <Input autoComplete="cc-name" placeholder="Ada Lovelace" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card number</FormLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <Icon name="credit-card" />
                  </InputGroupAddon>
                  <FormControl>
                    <InputGroupInput inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" {...field} onChange={(e) => field.onChange(formatCardNumber(e.target.value))} />
                  </FormControl>
                </InputGroup>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="expiry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expires</FormLabel>
                  <FormControl>
                    <Input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" {...field} onChange={(e) => field.onChange(formatExpiry(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cvc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Security code</FormLabel>
                  <FormControl>
                    <Input inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                  </FormControl>
                  <FormLabel className="min-w-0 font-normal leading-snug">I have read the small print: returns within 30 days, in their box.</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>
      </form>
    </Form>
  )
}
