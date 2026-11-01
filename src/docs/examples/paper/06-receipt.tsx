import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "A receipt",
  description: "Thermal paper with pinked top and bottom, a mono print and a dashed total. The `receipt` stock is the same recipe as every other, cut differently.",
  layout: "stack" as const,
}

const rows = [
  ["oat latte", "4.50"],
  ["washi x3", "9.00"],
  ["glue stick", "2.10"],
] as const

export default function Example() {
  return (
    <Paper stock="receipt" seed="till" className="mx-auto w-64 px-5 py-7 font-type text-sm">
      <p className="text-center text-base tracking-widest">LOOSELEAF CAFE</p>
      <ul className="mt-3 border-y border-dashed border-pencil-mark py-2">
        {rows.map(([item, price]) => (
          <li key={item} className="flex justify-between">
            <span>{item}</span>
            <span className="ll-num">{price}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex justify-between text-base">
        <span>TOTAL</span>
        <span className="ll-num text-red">15.60</span>
      </p>
      <p className="mt-3 text-center text-xs text-muted-foreground">thank you - come again</p>
    </Paper>
  )
}
