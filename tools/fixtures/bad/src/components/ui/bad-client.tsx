import * as React from "react"

const Ctx = React.createContext(0)

export function BadClient(props: React.ComponentProps<"button">) {
  const [n, setN] = React.useState(0)
  return (
    <button data-slot="bad-client" onClick={() => setN(n + 1)} {...props}>
      {n + React.useContext(Ctx)}
    </button>
  )
}
