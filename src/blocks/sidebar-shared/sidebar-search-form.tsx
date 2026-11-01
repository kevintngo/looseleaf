"use client"

import * as React from "react"

import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import { SidebarGroup, SidebarGroupContent, SidebarInput } from "@/components/ui/sidebar"

type SearchFormProps = Omit<React.ComponentProps<"form">, "children"> & {
  placeholder?: string
  label?: string
  variant?: "sidebar" | "bar"
}

export function SearchForm({ placeholder = "Search the guide...", label = "Search", variant = "sidebar", className, onSubmit, ...props }: SearchFormProps) {
  const id = React.useId()
  const box = (
    <>
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <SidebarInput id={id} type="search" placeholder={placeholder} className={variant === "bar" ? "h-8 ps-7" : "ps-8"} />
      <Icon name="search" className="pointer-events-none absolute start-2 top-1/2 -translate-y-1/2 opacity-60 select-none" />
    </>
  )

  return (
    <form
      role="search"
      className={className}
      onSubmit={(event) => {
        onSubmit?.(event)
        if (!onSubmit) event.preventDefault()
      }}
      {...props}
    >
      {variant === "bar" ? (
        <div className="relative">{box}</div>
      ) : (
        <SidebarGroup className="py-0">
          <SidebarGroupContent className="relative">{box}</SidebarGroupContent>
        </SidebarGroup>
      )}
    </form>
  )
}
