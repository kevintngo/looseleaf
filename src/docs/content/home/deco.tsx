import { Stamp } from "@/components/ui/stamp"
import { Sticker } from "@/components/ui/sticker"

export type DecoItem =
  | { kind: "sticker"; name: string; size: number; rotate: number; className: string; seed?: string }
  | {
      kind: "stamp"
      name: string
      className: string
      rotate?: number
      text?: string
      sub?: string
      size?: number
      shape?: "rect" | "round" | "burst" | "void"
      ink?: "red" | "ink-you" | "green" | "ink"
      w?: number
      h?: number
    }

export default function Deco({ items }: { items: readonly DecoItem[] }) {
  return (
    <>
      {items.map((item) =>
        item.kind === "sticker" ? (
          <Sticker key={`${item.name}|${item.className}`} name={item.name} size={item.size} rotate={item.rotate} seed={item.seed ?? item.name} className={`absolute z-(--ll-z-prop) ${item.className}`} />
        ) : (
          <Stamp
            key={`${item.name}|${item.className}`}
            name={item.name}
            text={item.text}
            sub={item.sub}
            size={item.size}
            shape={item.shape}
            ink={item.ink}
            w={item.w}
            h={item.h}
            tilt={item.rotate}
            aria-hidden="true"
            className={`absolute z-(--ll-z-prop) ${item.className}`}
          />
        ),
      )}
    </>
  )
}
