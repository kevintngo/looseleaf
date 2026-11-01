import * as React from "react"

export function BadTokens(props: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bad-tokens"
      style={{
        color: "var(--ll-undefined-thing)",
        borderColor: "var(--ll-ink)",
        outlineColor: "var(--ll-soft, tomato)",
        width: "var(--radix-popover-trigger-width)",
        "--ll-local": "4px",
        height: "var(--ll-local)",
      }}
      className="bg-(--ll-not-a-token) text-brand"
      {...props}
    />
  )
}
