import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { IndexCard, IndexCardContent, IndexCardFooter, IndexCardHeader, IndexCardTitle } from "@/components/ui/index-card"
import { Mascot } from "@/components/ui/mascot"

function Faq01Help() {
  return (
    <IndexCard flag="tangerine" seed="faq-help" className="min-h-0 max-w-none">
      <IndexCardHeader>
        <IndexCardTitle>
          <h3 className="inline">Still stuck?</h3>
        </IndexCardTitle>
        <Mascot pose="think" size={44} className="-mb-0.5 me-7" />
      </IndexCardHeader>
      <IndexCardContent>A real person answers, usually before lunch.</IndexCardContent>
      <IndexCardFooter>
        <Button asChild variant="link" size="sm" className="-ms-3">
          <a href="mailto:hello@penmark.example">
            <Icon name="mail" />
            Write to us
          </a>
        </Button>
      </IndexCardFooter>
    </IndexCard>
  )
}

export { Faq01Help }
