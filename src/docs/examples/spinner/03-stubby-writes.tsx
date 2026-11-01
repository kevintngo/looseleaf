import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

export const meta = {
  title: "Stubby is writing",
  description:
    "For a page or a panel that is loading rather than a button: Stubby writes in three frames, flipped like a flip book, and the words say what they are waiting for. The role=status carries the name. With reduced motion he holds still with the scribble finished.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6 sm:grid-cols-2">
      <Card seed="fetching">
        <CardHeader>
          <CardTitle>Fetching your notes</CardTitle>
          <CardDescription>Stubby is finding the right page.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-2">
          <Spinner variant="write" size={80} aria-label="Fetching your notes" />
        </CardContent>
      </Card>
      <Card stock="index-card" seed="binding">
        <CardHeader>
          <CardTitle>Binding the book</CardTitle>
          <CardDescription>This takes a minute. Pencils are slow, and careful.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-2">
          <Spinner variant="write" size={112} aria-label="Binding the book" />
        </CardContent>
      </Card>
    </div>
  )
}
