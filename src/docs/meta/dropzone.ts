import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "dropzone",
  title: "Dropzone",
  category: "Forms",
  description:
    "A patch of paper, stitched round its edge, that files can be dropped on or picked into. It checks type, size and count and tells you why a file was refused; it hands you File objects and shows them in a ruled list with thumbnails and progress lines. It uploads nothing: that part is yours.",
  status: "new",
  parts: [
    {
      name: "Dropzone",
      description:
        "The state and the layout (a flex column). Without children it is a `DropzoneArea` (icon, title, description), `DropzoneRejections` and `DropzoneList`. The accepted files are `File` objects; uncontrolled (`defaultFiles`) or controlled (`files` + `onFilesChange`, called with the whole list).",
      props: [
        { name: "accept", type: "string | string[]", description: "What the picker offers and what is accepted: `image/*`, `image/png`, `.pdf`, comma separated or an array. Extensions are checked case-insensitively." },
        { name: "multiple", type: "boolean", default: "true", description: "`false`: one file, a new one replaces the old, extra files in one drop are refused." },
        { name: "maxFiles / maxSize / minSize", type: "number", description: "How many files in all, and the size limits in bytes." },
        { name: "validator", type: "(file: File) => FileError | null", description: "Your own check per file; return `{ code, message }` to refuse it." },
        { name: "messages", type: "Partial<Record<code, string | ((file) => string)>>", description: "Your words for the reasons (`file-invalid-type`, `file-too-large`, `file-too-small`, `too-many-files`), for translation." },
        { name: "onDrop / onReject", type: "(accepted, rejected) => void", description: "Called for every drop or pick with what was taken and what was not (each rejection has its `file` and `errors[{ code, message }]`)." },
        { name: "id / name / required", type: "", description: "On the file input (`id` is for a Label). The accepted files are put in it (DataTransfer) so a plain <form> submits them, dropped ones included; a form reset empties the list with the input (or goes back to `defaultFiles`)." },
        { name: "disabled / invalid", type: "boolean", description: "Pale dashed stitches, nothing happens / red stitches on a pink wash (also `aria-invalid` on the input)." },
      ],
    },
    {
      name: "DropzoneArea",
      description:
        "The patch you drop on: a `<label>` (a click anywhere opens the picker) round the real, visually hidden file input (Tab reaches it, Enter and Space open the picker). Drawn as a paper-shade patch with a cut edge and a wavering running stitch a few pixels in (stitches of uneven length, even in calm); the stitches turn blue on a yellow wash while a file is over it, and the drawing wiggles. `inputProps` reaches the input.",
      props: [
        { name: "inputProps", type: "InputHTMLAttributes", description: "`aria-label`, `capture`, `webkitdirectory`..." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always sews the same patch." },
      ],
    },
    { name: "DropzoneIcon", description: "The picture at the top: an upload arrow, or, while a file is over the zone, Stubby carrying a tied-up parcel (the `carry` pose). Pass children to draw your own." },
    { name: "DropzoneTitle", description: "\"Drop files here or browse\", the last word underlined in blue script. Pass your own words as children." },
    { name: "DropzoneDescription", description: "Small print. By default it states the limits the zone was given (\"PNG, JPG up to 5 MB each, at most 3 files\"); nothing is drawn if there are none." },
    { name: "DropzoneRejections", description: "Why files were refused, one line each, in a `role=\"alert\"`. Cleared by the next clean drop." },
    { name: "DropzoneList", description: "The accepted files (`<ul>`, named \"Selected files\"), one `DropzoneItem` each. A function child draws the rows: `{(file, index) => <DropzoneItem file={file} progress={...} />}`. Renders nothing while empty." },
    {
      name: "DropzoneItem",
      description: "One file: a polaroid thumbnail for images (a little crooked) or a file icon, name, size, an optional highlighter progress line and status, and a remove button. The ruled pencil line under the row is the drawing; an error makes it red and wavy.",
      props: [
        { name: "file", type: "File", required: true, description: "The file to show." },
        { name: "progress / status", type: "number 0-100  /  \"idle\" | \"uploading\" | \"done\" | \"error\"", description: "Yours to drive from your upload. Uploading with a progress shows a `progressbar`." },
        { name: "error", type: "string", description: "Shown in red when `status` is \"error\"." },
        { name: "thumbnail", type: "boolean", default: "true", description: "Preview image files." },
        { name: "onRemove / removeLabel", type: "", description: "Replace the default removal; name the x." },
      ],
    },
    { name: "useDropzone", description: "The state for your own parts: `files`, `rejections`, `isDragOver`, `add(files)`, `remove(file)`, `clear()`, `open()`. Also exported: `formatBytes` and `matchesAccept`." },
  ],
  a11y: [
    "The drop target is a `<label>` round a real `<input type=\"file\">`: the input is a tab stop (visually hidden, never `display: none`), Enter and Space open the picker natively, the label's text is its name (override with `inputProps['aria-label']`), and a screen reader user never needs drag and drop.",
    "Keyboard focus shows the blue ring round the whole patch (the input is inside the labeled host). Drag state is only visual: the drop works for pointer users, the picker for everyone.",
    "Refusals are announced: `DropzoneRejections` is a `role=\"alert\"` with one line per file and reason. The list is a named `<ul>`; each remove button is named \"Remove <file>\" and hands the focus to the zone when its row goes; a progress line is a `progressbar` with `aria-valuenow`.",
    "The state is never color alone: over is a thicker blue stitch on yellow with Stubby carrying a parcel; invalid is red stitches, `aria-invalid` and the alert; disabled is pale stitches and a disabled input.",
    "Reduced motion stops the wiggle and the icon's lift. Windows high contrast draws a real dashed border (solid while a file is over).",
    "Touch: the whole patch is the target (at least 160 px tall by default, 128 compact, 96 calm); rows are 40 px with a 28 px remove target.",
  ],
  usage: `import * as React from "react"
import { Dropzone } from "@/components/ui/dropzone"

export function Example() {
  const [files, setFiles] = React.useState<File[]>([])
  return <Dropzone accept="image/*" maxSize={5 * 1024 * 1024} maxFiles={4} files={files} onFilesChange={setFiles} />
}`,
  related: ["input", "progress", "empty", "field"],
} satisfies ComponentDoc
