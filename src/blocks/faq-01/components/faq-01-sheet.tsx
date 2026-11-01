import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Paper } from "@/components/ui/paper"

const QUESTIONS = [
  {
    id: "free",
    q: "Is there a free plan?",
    a: "Yes. Teams of up to five can use everything, free, for as long as they like. Past five it is $6 a person a month. No card to start.",
  },
  {
    id: "import",
    q: "Can I bring my notes from other apps?",
    a: "Drag in a folder of Markdown, or a Notion or Evernote export, and your pages and links come across, pictures too. A hundred pages takes about a minute.",
  },
  {
    id: "offline",
    q: "Does it work offline?",
    a: "It does. Keep writing on the train and everything syncs when you are back. If two people changed the same line, you get both versions side by side.",
  },
  {
    id: "privacy",
    q: "Who can see my notebooks?",
    a: "Only the people you invite. A page is private until you share it, and a shared link can be switched off whenever you like.",
  },
  {
    id: "backups",
    q: "How are my pages backed up?",
    a: "Every change is saved and every version is kept for a year. We also take nightly backups in two places, and you can download everything as plain files.",
  },
  {
    id: "cancel",
    q: "Can I cancel any time?",
    a: "In two clicks. Your notebooks stay readable and downloadable afterwards.",
  },
]

function Faq01Sheet() {
  return (
    <Paper stock="paper" rules="ruled" tape="corner" tapeKind="masking" seed="faq-sheet" className="pt-4 pe-5 pb-7 ps-14 text-[17px] leading-7 rtl:[&>[data-slot=paper-rules]]:-scale-x-100">
      <p className="font-type text-sm leading-7 text-pencil-text">Frequently asked</p>
      <Accordion type="single" collapsible defaultValue="free" className="w-full">
        {QUESTIONS.map((item) => (
          <AccordionItem key={item.id} value={item.id} className="pb-0 [&>[data-slot=accordion-rule]]:hidden">
            <AccordionTrigger className="min-h-14 items-end pt-7 pb-0 text-[17px] leading-7 [&:not(:focus-visible)]:outline-transparent [&>[data-chevron]]:mt-0 [&>[data-chevron]]:mb-1.5">{item.q}</AccordionTrigger>
            <AccordionContent className="pb-0 text-[17px] leading-7">
              <p>{item.a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Paper>
  )
}

export { Faq01Sheet, QUESTIONS }
