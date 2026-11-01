import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const meta = {
  title: "Article card",
  description: "A card taped at the corners with a torn bottom edge, for something you would pin above your desk.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <Card tape="both" tapeKind="washi-dots" edge={{ bottom: "torn" }} seed="article" className="mx-auto w-full max-w-md pb-8">
      <CardHeader>
        <CardDescription>Notebook - 4 min read</CardDescription>
        <CardTitle className="text-3xl">Why the margin is the best part</CardTitle>
      </CardHeader>
      <CardContent className="text-[15px] leading-relaxed">
        <p>Most of what I remember from a book is in the margins: an arrow, a question mark, a small argument with a dead author.</p>
      </CardContent>
      <CardFooter>
        <Button variant="link" size="sm" className="-ml-3">
          Keep reading
        </Button>
      </CardFooter>
    </Card>
  )
}
