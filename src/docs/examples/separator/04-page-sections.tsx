import { Separator } from "@/components/ui/separator"

export const meta = {
  title: "Between the sections of a page",
  description:
    "A torn strip where a page changes subject, a stitch where two things are joined, tape for the fold. Real headings and paragraphs stay real; the dividers are decoration.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <article className="mx-auto flex max-w-md flex-col gap-5">
      <section className="flex flex-col gap-1">
        <h3 className="font-script text-3xl font-bold">Saturday market</h3>
        <p className="text-[15px] leading-snug">Tomatoes that were still warm, a bag of plums, and a man selling only string.</p>
      </section>
      <Separator variant="torn" decorative={false} aria-label="End of the market notes" />
      <section className="flex flex-col gap-1">
        <h3 className="font-script text-3xl font-bold">Sunday, indoors</h3>
        <p className="text-[15px] leading-snug">Rain all morning. Mended the blue coat with orange thread and no regrets.</p>
      </section>
      <Separator variant="stitched" />
      <section className="flex flex-col gap-1">
        <h3 className="font-script text-3xl font-bold">Monday</h3>
        <p className="text-[15px] leading-snug">Back to the desk. Fold here.</p>
      </section>
      <Separator variant="tape" />
      <section className="flex flex-col gap-1">
        <h3 className="font-script text-3xl font-bold">Tuesday</h3>
        <p className="text-[15px] leading-snug">Nothing happened. Wrote it all down anyway.</p>
      </section>
    </article>
  )
}
