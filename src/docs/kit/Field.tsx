import type { ComponentProps } from "react"
import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

export interface SearchInputProps extends Omit<ComponentProps<"input">, "type"> {
  label: string
}

export function SearchInput({ label, className, ...props }: SearchInputProps) {
  return (
    <InputGroup className={className}>
      <InputGroupAddon>
        <Icon name="search" size={18} />
      </InputGroupAddon>
      <InputGroupInput type="search" aria-label={label} autoComplete="off" spellCheck={false} {...props} />
    </InputGroup>
  )
}
