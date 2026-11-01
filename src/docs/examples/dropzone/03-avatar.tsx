import * as React from "react"

import { Dropzone, DropzoneArea, DropzoneDescription, DropzoneIcon, DropzoneTitle, useDropzone } from "@/components/ui/dropzone"

export const meta = {
  title: "One file: a profile picture",
  description: "multiple={false}: one file, a new one replaces the old. A narrow zone whose own content follows the state through useDropzone (here: the chosen picture as a taped polaroid).",
  layout: "center" as const,
  stage: "desk" as const,
  height: 380,
}

function Preview() {
  const { files } = useDropzone()
  const [url, setUrl] = React.useState<string | null>(null)
  const file = files[0]
  React.useEffect(() => {
    if (!file) return
    let u: string
    try {
      u = URL.createObjectURL(file)
    } catch {
      return
    }
    setUrl(u)
    return () => {
      URL.revokeObjectURL(u)
      setUrl(null)
    }
  }, [file])
  if (!file) return null
  return (
    <span className="relative -my-1 grid size-24 -rotate-3 place-items-center border-4 border-photo bg-photo shadow-[0_2px_4px_rgb(var(--ll-shade)/.35)]">
      {url ? <img src={url} alt={`Preview of ${file.name}`} className="size-full object-cover" /> : <span className="font-hand text-sm">{file.name}</span>}
    </span>
  )
}

function Content() {
  const { files } = useDropzone()
  return files.length === 0 ? (
    <>
      <DropzoneIcon />
      <DropzoneTitle>
        Drop a photo or <span className="text-ink-you underline decoration-wavy decoration-1 underline-offset-4">browse</span>
      </DropzoneTitle>
      <DropzoneDescription />
    </>
  ) : (
    <>
      <Preview />
      <DropzoneDescription>{files[0].name} (drop another to replace it)</DropzoneDescription>
    </>
  )
}

export default function Example() {
  return (
    <div className="w-72">
      <Dropzone multiple={false} accept="image/png,image/jpeg" maxSize={1024 * 1024}>
        <DropzoneArea className="min-h-56 p-4">
          <Content />
        </DropzoneArea>
      </Dropzone>
    </div>
  )
}
