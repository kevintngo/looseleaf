import { defineArt } from "@/lib/ink/art/types"

export const marks = defineArt({
  check: { grid: 24, parts: [["s", "M 5.2 12.4 L 9.8 17.1 L 18.9 6.8"]] },
  x: {
    grid: 24,
    parts: [
      ["s", "M 6.1 5.8 L 18.2 18.3"],
      ["s", "M 17.8 5.4 L 6.4 18.6"],
    ],
  },
})
