import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { PropDoc } from "../types"

export interface ApiTableProps {
  props: readonly PropDoc[]
  caption: string
}

function Chip({ children, tone }: { children: string; tone: "type" | "default" }) {
  return (
    <code
      className={
        "inline-block max-w-[30ch] px-1.5 py-0.5 align-baseline font-mono text-[0.8125rem] leading-snug break-words whitespace-normal [border-radius:2px_6px_3px_5px/5px_2px_6px_3px] " +
        (tone === "type" ? "bg-hi-select/45 text-ink" : "bg-muted text-ink")
      }
    >
      {children}
    </code>
  )
}

export function ApiTable({ props, caption }: ApiTableProps) {
  return (
    <div role="group" tabIndex={0} aria-label={caption} className="-m-3 overflow-x-auto p-3 outline-offset-[-4px]">
      <Table containerClassName="overflow-x-visible" className="min-w-[36rem]">
        <caption className="sr-only">{caption}</caption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Prop</TableHead>
            <TableHead scope="col">Type</TableHead>
            <TableHead scope="col">Default</TableHead>
            <TableHead scope="col">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.map((prop) => (
            <TableRow key={prop.name} className="h-auto">
              <TableHead
                scope="row"
                className="py-3 align-top font-mono text-[0.9375rem] font-semibold tracking-normal whitespace-normal text-ink calm:font-mono calm:text-[0.9375rem] calm:font-semibold calm:text-ink"
              >
                <code>{prop.name}</code>
                {prop.required ? (
                  <>
                    <span className="ms-0.5 text-red" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only"> (required)</span>
                  </>
                ) : null}
              </TableHead>
              <TableCell className="py-3 align-top whitespace-normal">
                <Chip tone="type">{prop.type}</Chip>
              </TableCell>
              <TableCell className="py-3 align-top whitespace-normal">
                {prop.default ? <Chip tone="default">{prop.default}</Chip> : <span aria-label="no default">-</span>}
              </TableCell>
              <TableCell className="min-w-[16rem] py-3 align-top text-[15px] leading-snug whitespace-normal">{prop.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
