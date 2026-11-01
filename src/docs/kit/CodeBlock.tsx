import type { ComponentProps } from "react"
import {
  CodeBlock as CodeSlip,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopy,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block"
import { InlineCode as CodeChip } from "@/components/ui/typography"
import { Kbd as KeyCap } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"
import { Glyph } from "./glyphs"
import { useAnnounce } from "../core/announcer"
import { useCopy } from "../core/hooks"

export interface CodeBlockProps {
  code: string
  lang?: string
  title?: string
  lineNumbers?: boolean
  copy?: boolean
  maxHeight?: number
  className?: string
}

export function CodeBlock({ code, lang = "tsx", title, lineNumbers = false, copy = true, maxHeight, className }: CodeBlockProps) {
  const trimmed = code.replace(/\n+$/, "")
  const name = title ?? lang
  return (
    <CodeSlip code={trimmed} language={lang} filename={title ?? lang} lineNumbers={lineNumbers} className={cn("my-2", className)}>
      <CodeBlockHeader>
        <CodeBlockTitle />
        {copy ? (
          <CodeBlockActions>
            <CodeBlockCopy />
          </CodeBlockActions>
        ) : null}
      </CodeBlockHeader>
      <CodeBlockContent
        role="group"
        aria-label={`Code: ${name}`}
        style={maxHeight ? { maxHeight } : undefined}
        className={maxHeight ? "overflow-y-auto" : undefined}
      />
    </CodeSlip>
  )
}

export function CopyButton({ text, label = "Copy code", className }: { text: string; label?: string; className?: string }) {
  const { copied, copy } = useCopy()
  const announce = useAnnounce()
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-hit-min items-center gap-1.5 px-2 font-type text-[13px] tracking-wide text-ink-muted hover:ll-swipe hover:text-ink data-copied:text-green",
        className,
      )}
      onClick={async () => {
        if (await copy(text)) announce("Copied to clipboard")
      }}
      aria-label={copied ? "Copied" : label}
      data-copied={copied || undefined}
    >
      <Glyph name={copied ? "check" : "copy"} size={16} />
      <span aria-hidden="true">{copied ? "copied" : "copy"}</span>
    </button>
  )
}

export function InlineCode({ className, ...props }: ComponentProps<"code">) {
  return <CodeChip className={className} {...props} />
}

export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return <KeyCap className={className} {...props} />
}
