import { Icon } from "@/components/ui/icon"
import { NotebookCover, NotebookCoverLabel } from "@/components/ui/notebook"
import { Sticker } from "@/components/ui/sticker"
import { BADGES, SHELF, type Badge, type ShelfNotebook } from "@/blocks/profile-page/components/profile-page-data"
import { cn } from "@/lib/utils"

export function ProfilePageNotebooks({ shelf = SHELF }: { shelf?: ShelfNotebook[] }) {
  return (
    <ul aria-label="Notebooks" className="flex flex-wrap justify-center gap-x-8 gap-y-10 @md/profile:justify-start">
      {shelf.map((n) => (
        <li key={n.name} className="grid justify-items-center gap-3">
          <NotebookCover tone={n.tone} band={n.name !== "Letters"} seed={n.name} role="group" aria-label={`${n.name} notebook`}>
            <NotebookCoverLabel>{n.name}</NotebookCoverLabel>
          </NotebookCover>
          <span className="ll-num text-sm text-muted-foreground">{n.pages} pages</span>
        </li>
      ))}
    </ul>
  )
}

export function ProfilePageStickers({ badges = BADGES }: { badges?: Badge[] }) {
  const earned = badges.filter((b) => b.earned).length
  return (
    <div className="grid gap-4">
      <p className="text-muted-foreground">
        <b className="ll-num text-foreground">{earned}</b> of {badges.length} stickers earned.
      </p>
      <ul aria-label="Stickers" className="grid grid-cols-2 gap-x-6 gap-y-8 @lg/profile:grid-cols-3 @3xl/profile:grid-cols-4">
        {badges.map((b) => (
          <li key={b.id} className="grid justify-items-center gap-2 text-center">
            <Sticker name={b.sticker} size={88} seed={b.id} shadow={!!b.earned} className={cn(!b.earned && "opacity-35 grayscale")} />
            <p className="font-bold">{b.name}</p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              {b.earned ? (
                <>
                  <Icon name="check" size={14} />
                  Earned {b.earned}
                </>
              ) : (
                <>
                  <Icon name="lock" size={14} />
                  {b.how}
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
