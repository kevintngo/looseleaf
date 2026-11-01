import { SignaturePad } from "@/components/ui/signature-pad"

export const meta = {
  title: "Type instead",
  description: "The typed fallback: the name is hand lettering with a brush swash under it. Anyone who cannot draw gets a signature that is still an image.",
  layout: "stack" as const,
}

export default function Example() {
  return <SignaturePad className="max-w-lg" defaultMode="type" />
}
