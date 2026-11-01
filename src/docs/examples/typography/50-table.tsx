import { Prose } from "@/components/ui/typography"

export const meta = {
  title: "A plain table in prose",
  description:
    "Official `typography-table` without its classes: a bare `<table>` inside Prose. The head is written in the script face over a felt rule and every row has a pencil line under it. Reach for the Table component when the table is data rather than text.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <Prose className="w-full">
      <table>
        <thead>
          <tr>
            <th>King&apos;s Treasury</th>
            <th>People&apos;s happiness</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Empty</td>
            <td>Overflowing</td>
          </tr>
          <tr>
            <td>Modest</td>
            <td>Satisfied</td>
          </tr>
          <tr>
            <td>Full</td>
            <td>Ecstatic</td>
          </tr>
        </tbody>
      </table>
    </Prose>
  )
}
