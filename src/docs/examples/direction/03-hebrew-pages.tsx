import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { DirectionProvider } from "@/components/ui/direction"
import { Icon } from "@/components/ui/icon"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"

export const meta = {
  title: "Hebrew: pages",
  description:
    "A breadcrumb, a carousel and a pager, in Hebrew. The separators and arrows are the same drawings as in English: direction glyphs flip themselves, so the first slide sits at the right and ArrowLeft moves on to the next.",
  layout: "center" as const,
  height: 480,
}

const SLIDES = ["הדף הראשון", "רשימת קניות", "מכתב לסבתא", "רעיונות לקיץ"]

export default function Example() {
  return (
    <DirectionProvider direction="rtl">
      <div lang="he" className="grid w-full max-w-sm grid-cols-[minmax(0,1fr)] gap-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#home">בית</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Icon name="chevron-right" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="#notebooks">מחברות</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Icon name="chevron-right" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage seed="direction-hebrew">מחברת הקיץ</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mx-12 min-w-0">
          <Carousel aria-label="דפי המחברת" opts={{ direction: "rtl" }} seed="direction-hebrew-carousel">
            <CarouselContent>
              {SLIDES.map((title, i) => (
                <CarouselItem key={title} aria-label={`${i + 1} מתוך ${SLIDES.length}`}>
                  <Card seed={`direction-hebrew-${i}`}>
                    <CardContent className="grid h-32 place-items-center p-6">
                      <span className="font-script text-3xl font-semibold">{title}</span>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        <Pagination aria-label="עימוד">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#previous" size="default" aria-label="לעמוד הקודם" className="gap-1 px-2.5">
                <Icon name="chevron-left" />
                <span>הקודם</span>
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#1">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#2" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#3">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#next" size="default" aria-label="לעמוד הבא" className="gap-1 px-2.5">
                <span>הבא</span>
                <Icon name="chevron-right" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </DirectionProvider>
  )
}
