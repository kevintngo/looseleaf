import * as React from "react"

export function BadColors(props: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bad-colors"
      className="bg-red-500 text-white border-[#ff00aa]"
      style={{ color: "#333", background: "rgb(10 20 30)", borderColor: "hsl(210 40% 98%)", outlineColor: "oklch(0.5 0.1 200)" }}
      {...props}
    />
  )
}
