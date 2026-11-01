import { Clipboard, ClipboardPaper } from "@/components/ui/clipboard"

export const meta = {
  title: "Hardboard and plastic",
  description: "The same board in hardboard and in colored plastic. The paper stays cream, so nothing on it changes contrast.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const tones = ["hardboard", "teal", "tomato"] as const
const lists = [
  ["milk", "eggs", "tea"],
  ["rent", "post", "call"],
  ["jam", "figs", "rye"],
] as const

export default function Example() {
  return (
    <div className="flex flex-wrap justify-center gap-x-8 gap-y-12 p-4">
      {tones.map((tone, i) => (
        <figure key={tone} className="grid w-48 gap-3">
          <Clipboard tone={tone} seed={tone} tilt={i % 2 ? 1 : -1} className="min-h-72">
            <ClipboardPaper seed={`${tone}-p`} className="min-h-40 ps-12 pe-3">
              {lists[i].map((item) => (
                <p key={item} className="font-hand text-[17px] leading-7">
                  {item}
                </p>
              ))}
            </ClipboardPaper>
          </Clipboard>
          <figcaption className="text-center font-type text-sm text-ink">{tone}</figcaption>
        </figure>
      ))}
    </div>
  )
}
