"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Polaroid, PolaroidCaption, PolaroidImage } from "@/components/ui/polaroid"
import { Paper } from "@/components/ui/paper"
import { Tally } from "@/components/ui/tally"
import { STATS, STREAK_DAYS, type Profile } from "@/blocks/profile-page/components/profile-page-data"

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("")

export function ProfilePageHeader({ profile, following, onFollow, onMessage }: { profile: Profile; following: boolean; onFollow: (next: boolean) => void; onMessage?: () => void }) {
  const followers = profile.followers + (following ? 1 : 0)
  const stats = profile.stats ?? STATS
  const streak = profile.streakDays ?? STREAK_DAYS
  return (
    <div className="grid gap-10">
      <div className="grid items-center gap-8 @2xl/profile:grid-cols-[auto_minmax(0,1fr)] @2xl/profile:gap-12">
        <Polaroid tape="top" tilt={-2.5} seed="profile-polaroid" className="w-60 justify-self-center @2xl/profile:justify-self-start">
          <PolaroidImage date="'26 9 25" seed="profile-window">
            {profile.photo ? (
              <img src={profile.photo} alt="" className="size-full object-cover" />
            ) : (
              <span aria-hidden className="grid size-full place-items-center bg-hi/60 font-script text-8xl leading-none font-bold text-ink">
                {initials(profile.name)}
              </span>
            )}
          </PolaroidImage>
          <PolaroidCaption>{profile.name.split(/\s+/)[0]}, at the desk</PolaroidCaption>
        </Polaroid>

        <div className="grid gap-4">
          <div className="grid gap-1">
            <h2 className="ll-riso font-script text-5xl leading-none font-bold text-balance @lg/profile:text-6xl">{profile.name}</h2>
            <p className="ll-num text-muted-foreground">
              @{profile.handle} · {profile.pronouns}
            </p>
          </div>
          <p className="max-w-prose text-lg text-pretty">{profile.bio}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground" aria-label="About">
            <li className="flex items-center gap-1.5">
              <Icon name="map" size={16} />
              {profile.place}
            </li>
            <li className="flex items-center gap-1.5">
              <Icon name="calendar" size={16} />
              Writing here since {profile.joined}
            </li>
            <li className="flex items-center gap-1.5">
              <Icon name="link" size={16} />
              {profile.website}
            </li>
          </ul>
          <ul className="flex flex-wrap gap-2" aria-label="Writes about">
            {profile.topics.map((t) => (
              <li key={t}>
                <Badge variant="secondary">{t}</Badge>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <Button aria-pressed={following} variant={following ? "outline" : "default"} onClick={() => onFollow(!following)}>
              <Icon name={following ? "check" : "user-plus"} />
              {following ? "Following" : "Follow"}
            </Button>
            <Button variant="outline" onClick={onMessage}>
              <Icon name="message-square" />
              Message
            </Button>
            <p className="ll-num text-sm text-muted-foreground">
              <b className="text-foreground">{followers}</b> followers · <b className="text-foreground">{profile.following}</b> following
            </p>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 @xl/profile:gap-5 @5xl/profile:grid-cols-4">
        {stats.map((s, i) => (
          <Paper key={s.id} stock={i === 1 ? "index-card" : "slip"} rules={i === 1 ? "none" : undefined} seed={`stat-${s.id}`} className="grid content-start gap-1 px-4 py-4 @xl/profile:px-5">
            <dt className="text-sm text-muted-foreground">{s.label}</dt>
            <dd className="ll-num font-script text-4xl leading-none font-bold @xl/profile:text-5xl">{s.value}</dd>
            <dd className="text-sm text-pretty text-muted-foreground">{s.note}</dd>
          </Paper>
        ))}
        <Paper stock="slip" seed="stat-streak" className="grid content-start gap-1 px-4 py-4 @xl/profile:px-5">
          <dt className="text-sm text-muted-foreground">Writing streak</dt>
          <dd className="ll-num font-script text-4xl leading-none font-bold @xl/profile:text-5xl">{streak} days</dd>
          <dd>
            <Tally count={streak} size="sm" tone="marker" label={`${streak} days in a row`} seed="streak" />
          </dd>
        </Paper>
      </dl>
    </div>
  )
}
