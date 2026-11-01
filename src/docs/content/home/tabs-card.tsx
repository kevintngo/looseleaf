import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const TASKS = [
  { id: "ship", label: "Ship the sign-in card" },
  { id: "draw", label: "Draw the dashboard" },
  { id: "focus", label: "Fix the focus ring" },
  { id: "water", label: "Water the plant" },
]

const TEAM = ["Ada Lovelace", "Jo Okafor", "Mika Kobayashi", "Sam Reyes", "Priya Nair"]

export default function TabsCard() {
  const [done, setDone] = useState<Record<string, boolean>>({ ship: true, draw: true })
  const count = TASKS.filter((t) => done[t.id]).length
  return (
    <Card data-home="tabs" seed="home-tabs" tape="top" className="w-full gap-3 py-6">
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription>
          {count} of {TASKS.length} done
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="todo">
          <TabsList>
            <TabsTrigger value="todo">To do</TabsTrigger>
            <TabsTrigger value="sprint">Sprint</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          <TabsContent value="todo" className="grid gap-2 pt-3">
            {TASKS.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <Checkbox id={`home-task-${t.id}`} checked={!!done[t.id]} onCheckedChange={(v) => setDone((d) => ({ ...d, [t.id]: v === true }))} />
                <Label htmlFor={`home-task-${t.id}`} className={cn("font-normal text-[16px]", done[t.id] && "text-muted-foreground line-through decoration-red")}>
                  {t.label}
                </Label>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="sprint" className="grid gap-3 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="font-script text-2xl leading-none">Sprint 7 of 10</span>
              <span className="ll-num font-script text-2xl leading-none text-red">70%</span>
            </div>
            <Progress value={70} aria-label="Sprint progress" />
          </TabsContent>
          <TabsContent value="team" className="flex flex-wrap gap-3 pt-4">
            {TEAM.map((name) => (
              <Avatar key={name} size="lg">
                <AvatarFallback name={name} />
              </Avatar>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
