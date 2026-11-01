import { render, screen } from "@testing-library/react"
import { cn } from "@/lib/utils"

test("toolchain works: alias, jsx, jsdom, jest-dom", () => {
  render(<p className={cn("a", false && "b", "c")}>hello</p>)
  expect(screen.getByText("hello")).toHaveClass("a", "c")
})
