import * as React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const meta = {
  title: "In a form",
  description: "A controlled select and a native-form select in one form: `name` puts the chosen value in FormData (Radix keeps a hidden native select in sync), `required` blocks the submit.",
  layout: "stack" as const,
  height: 340,
}

const roles = ["Author", "Editor", "Proofreader", "Illustrator"]

export default function Example() {
  const [role, setRole] = React.useState("Editor")
  const [sent, setSent] = React.useState("")
  return (
    <form
      className="grid w-full max-w-sm gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        setSent(`Filed: ${data.get("role")} on the ${data.get("shift") ?? "no"} shift`)
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="role">Your role</Label>
        <Select name="role" value={role} onValueChange={setRole}>
          <SelectTrigger id="role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {roles.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="shift" required>
          Shift
        </Label>
        <Select name="shift" required>
          <SelectTrigger id="shift" className="w-full">
            <SelectValue placeholder="Morning, evening or night" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="morning">Morning</SelectItem>
            <SelectItem value="evening">Evening</SelectItem>
            <SelectItem value="night">Night</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit">File it</Button>
        <span role="status" className="text-sm text-ink-muted">
          {sent}
        </span>
      </div>
    </form>
  )
}
