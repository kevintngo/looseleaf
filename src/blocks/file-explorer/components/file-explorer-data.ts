export type Kind = "folder" | "doc" | "pdf" | "image" | "sheet" | "audio" | "video" | "code" | "archive"

export type FileNode = {
  id: string
  parent: string
  name: string
  kind: Kind
  size?: number
  modified: string
}

export const ROOTS: ReadonlyArray<{ id: string; name: string }> = [
  { id: "projects", name: "Projects" },
  { id: "receipts", name: "Receipts" },
  { id: "photos", name: "Photos" },
  { id: "music", name: "Music" },
]

export const KIND_ICON: Record<Kind, string> = {
  folder: "folder",
  doc: "file-text",
  pdf: "file",
  image: "image",
  sheet: "table",
  audio: "music",
  video: "video",
  code: "file-code",
  archive: "archive",
}

export const KIND_LABEL: Record<Kind, string> = {
  folder: "Folder",
  doc: "Document",
  pdf: "PDF",
  image: "Image",
  sheet: "Spreadsheet",
  audio: "Audio",
  video: "Video",
  code: "Code",
  archive: "Archive",
}

const KB = 1024
const MB = 1024 * KB

export const nodes: FileNode[] = [
  { id: "f1", parent: "projects", name: "Autumn drop", kind: "folder", modified: "2026-09-25" },
  { id: "f2", parent: "projects", name: "Journal", kind: "folder", modified: "2026-09-22" },
  { id: "n1", parent: "projects", name: "brand-guide.pdf", kind: "pdf", size: 5.8 * MB, modified: "2026-09-02" },
  { id: "n2", parent: "projects", name: "notes-2026.txt", kind: "doc", size: 18 * KB, modified: "2026-09-24" },
  { id: "n3", parent: "f1", name: "price-tags.pdf", kind: "pdf", size: 1.2 * MB, modified: "2026-09-27" },
  { id: "n4", parent: "f1", name: "sticker-sheet-v3.png", kind: "image", size: 3.4 * MB, modified: "2026-09-25" },
  { id: "n5", parent: "f1", name: "newsletter-draft.doc", kind: "doc", size: 48 * KB, modified: "2026-09-25" },
  { id: "n6", parent: "f1", name: "launch-plan.xlsx", kind: "sheet", size: 96 * KB, modified: "2026-09-21" },
  { id: "n7", parent: "f2", name: "why-the-margin.md", kind: "doc", size: 7 * KB, modified: "2026-09-22" },
  { id: "n8", parent: "f2", name: "cover-sketches.zip", kind: "archive", size: 12.4 * MB, modified: "2026-09-10" },
  { id: "f3", parent: "receipts", name: "2026", kind: "folder", modified: "2026-09-30" },
  { id: "n9", parent: "receipts", name: "invoice-118.pdf", kind: "pdf", size: 210 * KB, modified: "2026-09-18" },
  { id: "n10", parent: "receipts", name: "washi-tape-order.pdf", kind: "pdf", size: 134 * KB, modified: "2026-09-14" },
  { id: "n11", parent: "f3", name: "september.pdf", kind: "pdf", size: 322 * KB, modified: "2026-09-25" },
  { id: "n12", parent: "f3", name: "august.pdf", kind: "pdf", size: 290 * KB, modified: "2026-08-31" },
  { id: "n13", parent: "f3", name: "july.pdf", kind: "pdf", size: 305 * KB, modified: "2026-07-31" },
  { id: "f4", parent: "photos", name: "Notebooks", kind: "folder", modified: "2026-09-24" },
  { id: "f5", parent: "photos", name: "Studio", kind: "folder", modified: "2026-09-12" },
  { id: "n14", parent: "photos", name: "ada-birthday.jpg", kind: "image", size: 2.9 * MB, modified: "2026-09-26" },
  { id: "n15", parent: "f4", name: "notebook-01.jpg", kind: "image", size: 3.1 * MB, modified: "2026-09-24" },
  { id: "n16", parent: "f4", name: "notebook-02.jpg", kind: "image", size: 2.8 * MB, modified: "2026-09-24" },
  { id: "n17", parent: "f4", name: "notebook-03.jpg", kind: "image", size: 3.4 * MB, modified: "2026-09-24" },
  { id: "n18", parent: "f5", name: "kiln-day.jpg", kind: "image", size: 4.2 * MB, modified: "2026-09-10" },
  { id: "n19", parent: "f5", name: "desk-in-the-morning.jpg", kind: "image", size: 3.7 * MB, modified: "2026-09-12" },
  { id: "n20", parent: "music", name: "Sunday morning.mp3", kind: "audio", size: 6.1 * MB, modified: "2026-08-16" },
  { id: "n21", parent: "music", name: "Field recording, rain.wav", kind: "audio", size: 41 * MB, modified: "2026-09-03" },
  { id: "n22", parent: "music", name: "kiln-playlist.m3u", kind: "code", size: 2 * KB, modified: "2026-09-10" },
  { id: "n23", parent: "music", name: "studio-tour.mov", kind: "video", size: 212 * MB, modified: "2026-09-19" },
]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function formatSize(bytes: number): string {
  if (bytes < KB) return `${Math.round(bytes)} B`
  if (bytes < MB) return `${Math.round(bytes / KB)} KB`
  const mb = bytes / MB
  return `${mb >= 100 ? Math.round(mb) : Math.round(mb * 10) / 10} MB`
}

export function formatDay(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${MONTHS[Number(m) - 1] ?? m} ${Number(d)}${y === "2026" ? "" : `, ${y}`}`
}

export function withDescendants(list: readonly FileNode[], id: string): Set<string> {
  const out = new Set<string>([id])
  let grew = true
  while (grew) {
    grew = false
    for (const n of list) if (!out.has(n.id) && out.has(n.parent)) (out.add(n.id), (grew = true))
  }
  return out
}

export const countIn = (list: readonly FileNode[], id: string): number => list.filter((n) => n.parent === id).length
