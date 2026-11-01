"use client"

import * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const MAX_BYTES = 2 * 1024 * 1024

export function SettingsProfilePhoto({ name, photo, onPhoto }: { name: string; photo?: string; onPhoto: (url: string | undefined) => void }) {
  const input = React.useRef<HTMLInputElement>(null)
  const [error, setError] = React.useState("")
  const help = React.useId()

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!file.type.startsWith("image/")) return setError("Choose an image: JPG, PNG or GIF.")
    if (file.size > MAX_BYTES) return setError("That picture is over 2 MB. Try a smaller one.")
    setError("")
    onPhoto(URL.createObjectURL(file))
  }

  return (
    <div className="flex items-center gap-5">
      <Avatar size="xl" seed="profile-photo" className="data-[size=xl]:size-20">
        {photo ? <AvatarImage src={photo} alt="" /> : null}
        <AvatarFallback name={name || "You"} className="group-data-[size=xl]/avatar:text-3xl" />
      </Avatar>
      <div className="grid gap-2">
        <p className="text-[15px] font-bold">Photo</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
            {photo ? "Choose another" : "Upload a photo"}
          </Button>
          {photo ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setError("")
                onPhoto(undefined)
              }}
            >
              Remove
            </Button>
          ) : null}
        </div>
        <p id={help} className="text-sm text-muted-foreground">
          JPG, PNG or GIF, up to 2 MB. Without one you get your initials.
        </p>
        {error ? (
          <p role="alert" className="text-sm font-bold text-red">
            {error}
          </p>
        ) : null}
        <input ref={input} type="file" accept="image/*" hidden onChange={onFile} aria-describedby={help} />
      </div>
    </div>
  )
}
