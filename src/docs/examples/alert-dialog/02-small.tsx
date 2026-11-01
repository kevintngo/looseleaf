import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Small",
  description: "size=\"sm\": a narrow, centered sheet with the two answers in equal columns. Good for quick confirmations.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Discard draft</Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm" seed="discard">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Icon name="circle-question-mark" />
          </AlertDialogMedia>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>You have unsaved edits. They will be lost.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction>Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
