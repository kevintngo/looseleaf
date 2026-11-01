import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Media tones",
  description: "The round patch behind the media says what kind of question this is: highlighter for a plain confirmation, sky for information, red pencil for danger.",
  layout: "center" as const,
}

const kinds = [
  { tone: "default", trigger: "Publish", icon: "circle-check", title: "Publish now?", body: "Everyone with the link will be able to read it. You can unpublish later.", ok: "Publish" },
  { tone: "info", trigger: "Sign out", icon: "info", title: "Sign out everywhere?", body: "You will be signed out of every device, including this one.", ok: "Sign out" },
  { tone: "danger", trigger: "Clear history", icon: "triangle-alert", title: "Clear all history?", body: "Every search and every draft will be removed from this device.", ok: "Clear it" },
] as const

export default function Example() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {kinds.map((k) => (
        <AlertDialog key={k.tone}>
          <AlertDialogTrigger asChild>
            <Button variant="outline">{k.trigger}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent seed={k.tone}>
            <AlertDialogHeader>
              <AlertDialogMedia tone={k.tone}>
                <Icon name={k.icon} />
              </AlertDialogMedia>
              <AlertDialogTitle>{k.title}</AlertDialogTitle>
              <AlertDialogDescription>{k.body}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Not yet</AlertDialogCancel>
              <AlertDialogAction variant={k.tone === "danger" ? "destructive" : "default"}>{k.ok}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </div>
  )
}
