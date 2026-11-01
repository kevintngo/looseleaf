import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icon } from "@/components/ui/icon"
import { IndexCard, IndexCardContent, IndexCardFooter, IndexCardHeader, IndexCardTitle } from "@/components/ui/index-card"
import { PRONOUNS, TIME_ZONES, type ProfileValues } from "@/blocks/settings-profile/components/settings-profile-schema"

export function SettingsProfileCard({ values, photo }: { values: ProfileValues; photo?: string }) {
  const name = values.name.trim() || "Your name"
  const pronouns = PRONOUNS.find((p) => p.value === values.pronouns)
  const zone = TIME_ZONES.find((z) => z.value === values.timezone)
  return (
    <IndexCard hole flag="grape" seed="profile-card" tilt={-0.2} aria-label="Preview of your profile card" role="group" className="min-h-[254px] max-w-none">
      <IndexCardHeader>
        <IndexCardTitle>{name}</IndexCardTitle>
        <Avatar size="sm" ring="none">
          {photo ? <AvatarImage src={photo} alt="" /> : null}
          <AvatarFallback name={name} />
        </Avatar>
      </IndexCardHeader>
      <IndexCardContent className="text-[15px]">
        <p className="ll-num text-muted-foreground">
          @{values.username.trim() || "username"}
          {pronouns && pronouns.value !== "none" ? ` · ${pronouns.label}` : ""}
        </p>
        <p className="line-clamp-3 wrap-break-word">{values.bio.trim() || "A line or two about you goes here."}</p>
      </IndexCardContent>
      <IndexCardFooter className="flex-wrap content-start justify-start gap-x-4">
        {values.website ? (
          <span className="inline-flex h-[30px] max-w-full min-w-0 items-center gap-1.5">
            <Icon name="link" size={14} className="shrink-0" />
            <span className="truncate">{values.website.replace(/^https?:\/\//, "")}</span>
          </span>
        ) : null}
        {zone ? (
          <span className="inline-flex h-[30px] items-center gap-1.5">
            <Icon name="globe" size={14} className="shrink-0" />
            {zone.label}
          </span>
        ) : null}
        {!values.discoverable ? <span className="h-[30px] text-ink-soft">not in search</span> : null}
      </IndexCardFooter>
    </IndexCard>
  )
}
