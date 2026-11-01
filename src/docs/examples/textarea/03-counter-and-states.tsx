import * as React from "react"

import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "Counter and states",
  description: "showCount with maxLength; the second field turns red when it is too short. Disabled and read-only fields are drawn as such.",
  layout: "stack" as const,
}

export default function Example() {
  const [bio, setBio] = React.useState("")
  const short = bio.length > 0 && bio.length < 20
  return (
    <div className="grid w-full max-w-md gap-5">
      <Textarea
        aria-label="Bio"
        placeholder="A few words about you (20 or more)"
        maxLength={140}
        showCount
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        aria-invalid={short}
      />
      <Textarea aria-label="Locked" disabled defaultValue="Nothing to add." />
      <Textarea aria-label="Read only" readOnly defaultValue="Printed in the margin: this one cannot be edited, only selected." />
    </div>
  )
}
