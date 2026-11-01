"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { cardBrand, currentMonth, formatCardNumber, formatExpiry, makeCardSchema, type CardValues, type Month } from "@/blocks/settings-billing/components/settings-billing-data"

export type SavedCard = { brand: string; last4: string; expiry: string }

export function SettingsBillingCardDialog({ onSaved, today, children }: { onSaved: (card: SavedCard) => void; today?: Month; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const form = useForm<CardValues>({
    resolver: (values, context, options) => zodResolver(makeCardSchema(today ?? currentMonth()))(values, context, options),
    defaultValues: { name: "", number: "", expiry: "", cvc: "" },
    mode: "onTouched",
  })
  const brand = cardBrand(form.watch("number").replace(/\s/g, ""))

  const submit = form.handleSubmit((v) => {
    const digits = v.number.replace(/\s/g, "")
    onSaved({ brand: cardBrand(digits), last4: digits.slice(-4), expiry: v.expiry })
    setOpen(false)
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) form.reset()
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent stock="paper" tape="top" seed="replace-card" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Replace your card</DialogTitle>
          <DialogDescription>The next invoice is charged to the new card. The old one is forgotten as soon as you save.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form noValidate onSubmit={submit} className="grid gap-5" aria-label="Card details">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name on card</FormLabel>
                  <FormControl>
                    <Input autoComplete="cc-name" placeholder="Jo Delacroix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card number</FormLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <Icon name="credit-card" />
                    </InputGroupAddon>
                    <FormControl>
                      <InputGroupInput
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="4242 4242 4242 4242"
                        {...field}
                        onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                      />
                    </FormControl>
                    {brand !== "Card" ? (
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>{brand}</InputGroupText>
                      </InputGroupAddon>
                    ) : null}
                  </InputGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save card</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
