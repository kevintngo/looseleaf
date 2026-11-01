import { Spinner } from "@/components/ui/spinner"

export const meta = {
  title: "Basic",
  description:
    "Official `spinner-basic`: the bare `<Spinner />`, 16 px by default. It is `role=\"status\"` with the name \"Loading\", and it draws in the current text color.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <Spinner />
    </div>
  )
}
