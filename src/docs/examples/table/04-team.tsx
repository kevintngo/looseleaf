import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const meta = {
  title: "Team billing",
  description: "A real screen: a card holding a table of people with faces, roles, a presence dot and what each seat costs, a highlighted row for the person you are looking at, a row button, and a footer with the total.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const seats = [
  { name: "Ada Lovelace", email: "ada@looseleaf.dev", role: "Owner", status: "online", price: 25 },
  { name: "Jo Okafor", email: "jo@looseleaf.dev", role: "Admin", status: "busy", price: 25 },
  { name: "Mika Kobayashi", email: "mika@looseleaf.dev", role: "Member", status: "away", price: 12 },
  { name: "Sam Reyes", email: "sam@looseleaf.dev", role: "Member", status: "offline", price: 12 },
] as const

export default function Example() {
  const total = seats.reduce((sum, s) => sum + s.price, 0)
  return (
    <Card seed="team-billing" className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Seats</CardTitle>
        <CardDescription>Everyone who can open the notebook, and what they cost this month.</CardDescription>
        <CardAction>
          <Button size="sm">
            <Icon name="plus" />
            Add a seat
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Person</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-end">Per month</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seats.map((s, i) => (
              <TableRow key={s.email} data-state={i === 1 ? "selected" : undefined} className="h-14">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback name={s.name} />
                      <AvatarBadge status={s.status}>
                        <span className="sr-only">{s.status}</span>
                      </AvatarBadge>
                    </Avatar>
                    <div className="grid leading-tight">
                      <span className="font-bold">{s.name}</span>
                      <span className="text-sm text-muted-foreground">{s.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{s.role}</TableCell>
                <TableCell className="ll-num text-end">${s.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-sm" aria-label={`More for ${s.name}`}>
                    <Icon name="ellipsis" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="ll-num text-end">${total.toFixed(2)}</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
      <CardFooter className="justify-between text-sm text-muted-foreground">
        <span>Billed on the first of the month.</span>
        <Button variant="link" size="sm">
          View invoices
        </Button>
      </CardFooter>
    </Card>
  )
}
