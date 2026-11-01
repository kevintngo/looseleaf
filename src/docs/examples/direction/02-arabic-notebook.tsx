import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DirectionProvider } from "@/components/ui/direction"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const meta = {
  title: "Arabic: notebook",
  description:
    "Tabs, a menu with a sub-menu, a slider and a table, in Arabic. Tab and arrow keys run right to left, the sub-menu opens with ArrowLeft, the slider starts at its right edge, the table columns read from the right.",
  layout: "center" as const,
  height: 640,
}

const ROWS = [
  { name: "ليلى", status: "مدفوع", amount: "250.00" },
  { name: "يوسف", status: "قيد الانتظار", amount: "150.00" },
  { name: "مريم", status: "متأخر", amount: "350.00" },
]

export default function Example() {
  return (
    <DirectionProvider direction="rtl">
      <Card lang="ar" seed="direction-arabic" className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>دفتر الحسابات</CardTitle>
          <CardDescription>افتح القائمة، حرّك المنزلق، وتنقّل بين الألسنة بمفاتيح الأسهم.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  الخيارات <Icon name="chevron-down" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start" seed="direction-arabic-menu">
                <DropdownMenuLabel>الصفحة الحالية</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Icon name="pencil" /> تعديل <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icon name="copy" /> نسخ <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Icon name="folder" /> نقل إلى
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>المسودات</DropdownMenuItem>
                    <DropdownMenuItem>الأرشيف</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Icon name="trash" /> حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Slider className="flex-1" defaultValue={[40]} ticks={5} aria-label="حجم الخط" getValueText={(v) => `${v}%`} />
          </div>

          <Tabs defaultValue="paid">
            <TabsList>
              <TabsTrigger value="paid">المدفوعات</TabsTrigger>
              <TabsTrigger value="pending">المعلّقة</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            <TabsContent value="paid">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-end">المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ROWS.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell className="font-bold">{row.name}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell className="ll-num text-end">{row.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="pending">لا توجد مدفوعات معلّقة الآن.</TabsContent>
            <TabsContent value="all">كل الحسابات في دفتر واحد.</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DirectionProvider>
  )
}
