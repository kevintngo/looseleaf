import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupTextarea } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"

export const meta = {
  title: "Input group",
  description:
    "Official `spinner-input-group`: a disabled field with a spinner at its end, and a disabled textarea whose footer says \"Validating...\" beside a send button. The group draws itself dashed because its control is disabled. Only change: the controls get an `aria-label`.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <InputGroup>
        <InputGroupInput placeholder="Send a message..." aria-label="Send a message" disabled />
        <InputGroupAddon align="inline-end">
          <Spinner />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea placeholder="Send a message..." aria-label="Send a message, long form" disabled />
        <InputGroupAddon align="block-end">
          <Spinner /> Validating...
          <InputGroupButton className="ms-auto" variant="default">
            <Icon name="arrow-up" />
            <span className="sr-only">Send</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
