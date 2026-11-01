"use client"

import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfilePageActivity } from "@/blocks/profile-page/components/profile-page-activity"
import { PROFILE, type Profile } from "@/blocks/profile-page/components/profile-page-data"
import { ProfilePageHeader } from "@/blocks/profile-page/components/profile-page-header"
import { ProfilePageNotebooks, ProfilePageStickers } from "@/blocks/profile-page/components/profile-page-shelf"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  profile?: Profile
  defaultFollowing?: boolean
  onFollowChange?: (following: boolean) => void
  onMessage?: () => void
}

export default function ProfilePage({ className, profile = PROFILE, defaultFollowing = false, onFollowChange, onMessage }: Props) {
  const [following, setFollowing] = React.useState(defaultFollowing)
  return (
    <section aria-label={`${profile.name}, profile`} className={cn("@container/profile mx-auto grid w-full max-w-6xl gap-12 px-4 py-12 sm:px-8", className)}>
      <ProfilePageHeader
        profile={profile}
        following={following}
        onFollow={(next) => {
          setFollowing(next)
          onFollowChange?.(next)
        }}
        onMessage={onMessage}
      />
      <Tabs defaultValue="activity" className="gap-6">
        <TabsList variant="line" aria-label="Profile sections">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="notebooks">Notebooks</TabsTrigger>
          <TabsTrigger value="stickers">Stickers</TabsTrigger>
        </TabsList>
        <TabsContent value="activity">
          <ProfilePageActivity weeks={profile.weeks} feed={profile.feed} />
        </TabsContent>
        <TabsContent value="notebooks">
          <ProfilePageNotebooks shelf={profile.shelf} />
        </TabsContent>
        <TabsContent value="stickers">
          <ProfilePageStickers badges={profile.badges} />
        </TabsContent>
      </Tabs>
    </section>
  )
}
