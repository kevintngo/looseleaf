"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Circled } from "@/components/ui/circled"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"
import { Mascot } from "@/components/ui/mascot"
import { Sticker } from "@/components/ui/sticker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type EmptyInboxProps = {
  onCompose?: () => void
  onRefresh?: () => void
}

export default function EmptyInbox({ onCompose, onRefresh }: EmptyInboxProps) {
  const titleId = React.useId()
  const [checks, setChecks] = React.useState(0)
  return (
    <section aria-labelledby={titleId} className="@container w-full">
      <div className="px-7 py-10 @xl:px-8 @xl:py-14">
        <Card tape="top" tapeKind="washi-dots" seed="empty-inbox" className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>
              <h2 id={titleId}>Inbox</h2>
            </CardTitle>
            <CardDescription role="status">{checks === 0 ? "Checked just now" : "Checked again. Still nothing new."}</CardDescription>
            <CardAction>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Check for new mail"
                onClick={() => {
                  setChecks((n) => n + 1)
                  onRefresh?.()
                }}
              >
                <Icon name="rotate-cw" />
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="all" className="gap-2">
              <TabsList variant="line" aria-label="Filter mail">
                <TabsTrigger value="all">All mail</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="starred">Starred</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia className="mb-1 gap-1">
                      <Circled tone="red" weight="brush" seed="inbox-zero" className="mx-2 px-1 font-script text-5xl leading-none font-bold" aria-hidden="true">
                        0
                      </Circled>
                      <Mascot pose="celebrate" size={112} />
                      <Sticker name="done" size={50} rotate={9} className="-ms-3 mt-8" />
                    </EmptyMedia>
                    <EmptyTitle>Inbox zero</EmptyTitle>
                    <EmptyDescription>You have read everything. Go stretch, or put the kettle on.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
                      <Button type="button" onClick={onCompose}>
                        <Icon name="pencil" />
                        Write a message
                      </Button>
                      <Button asChild variant="ghost">
                        <a href="#archive">Visit the archive</a>
                      </Button>
                    </div>
                  </EmptyContent>
                </Empty>
              </TabsContent>

              <TabsContent value="unread">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia pose="sleep" size={124} />
                    <EmptyTitle>All quiet</EmptyTitle>
                    <EmptyDescription>Nothing unread. Enjoy it while it lasts.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TabsContent>

              <TabsContent value="starred">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia pose="peek" size={124} />
                    <EmptyTitle>Nothing starred yet</EmptyTitle>
                    <EmptyDescription>Star a message to keep it close. It will wait for you here.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export type { EmptyInboxProps }
