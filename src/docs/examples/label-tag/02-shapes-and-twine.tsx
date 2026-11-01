import { LabelTag, LabelTagDescription, LabelTagPrice, LabelTagTitle } from "@/components/ui/label-tag"

export const meta = {
  title: "Shapes, stocks, string",
  description: "Price tag, arched, and a luggage tag; kraft, white and coloured card; natural or coloured twine; a brass eyelet, a steel one, or a bare hole.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-12 gap-y-16 p-6">
      <LabelTag stock="paper" twine="tomato" eyelet="steel" seed="a" tilt={2}>
        <LabelTagTitle>Gift</LabelTagTitle>
        <LabelTagDescription>for Ada</LabelTagDescription>
      </LabelTag>
      <LabelTag stock="sticky-yellow" shape="round" twine="grass" seed="b" tilt={-2}>
        <LabelTagTitle>New</LabelTagTitle>
        <LabelTagDescription>this week</LabelTagDescription>
        <LabelTagPrice>4.50</LabelTagPrice>
      </LabelTag>
      <LabelTag stock="sticky-pink" twine="grape" eyelet="none" seed="c" tilt={3}>
        <LabelTagTitle>Hi!</LabelTagTitle>
        <LabelTagDescription>a bare hole</LabelTagDescription>
      </LabelTag>
      <LabelTag shape="luggage" string={60} seed="d" tilt={1.4}>
        <div>
          <LabelTagTitle>Ada Lovelace</LabelTagTitle>
          <LabelTagDescription>Gate 7 - seat 14A</LabelTagDescription>
        </div>
      </LabelTag>
    </div>
  )
}
