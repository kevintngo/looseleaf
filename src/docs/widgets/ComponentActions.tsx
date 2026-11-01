import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { ComponentEntry } from "../core/catalog"
import { useAnnounce } from "../core/announcer"
import { useCopy } from "../core/hooks"
import { addCommand } from "../core/install"
import { useSettings } from "../core/settings"
import { CodeBlock, Skeleton, Callout } from "../kit"
import { useLoaded } from "./use-loaded"

export function ComponentActions({ entry }: { entry: ComponentEntry }) {
  const { packageManager } = useSettings()
  const { copied, copy } = useCopy()
  const announce = useAnnounce()
  const command = addCommand(packageManager, entry.slug)
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        data-copied={copied || undefined}
        onClick={async () => {
          if (await copy(command)) announce("Copied to clipboard")
        }}
      >
        <Icon name={copied ? "check" : "terminal"} />
        {copied ? "Copied" : "Copy install command"}{" "}
        <span className="font-normal text-ink-muted max-sm:hidden">{packageManager}</span>
        <span className="sr-only">: {command}</span>
      </Button>
      {entry.uiSource ? <ViewSource entry={entry} /> : null}
    </>
  )
}

function ViewSource({ entry }: { entry: ComponentEntry }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon name="file-code" />
          View source
        </Button>
      </SheetTrigger>
      <SheetContent side="right" binding="holes" className="w-[95vw] sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>{entry.slug}.tsx</SheetTitle>
          <SheetDescription>
            components/ui/{entry.slug}.tsx: the file the CLI copies into your project. Change it freely, it is yours.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-5 pb-6">
          <SourceBody entry={entry} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SourceBody({ entry }: { entry: ComponentEntry }) {
  const state = useLoaded(entry.uiSource)
  if (state.status === "loading") return <Skeleton height={240} label="Loading the source" />
  if (state.status === "error") {
    return (
      <Callout tone="error" title="Could not load the source">
        <p>{state.error.message}</p>
      </Callout>
    )
  }
  return <CodeBlock code={state.value} lang="tsx" title={`components/ui/${entry.slug}.tsx`} lineNumbers />
}
