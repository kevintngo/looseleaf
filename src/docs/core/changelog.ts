export interface ChangelogEntry {
  version: string
  date: string
  title: string
  notes: string[]
}

export const CHANGELOG: readonly ChangelogEntry[] = [
  {
    version: "Unreleased",
    date: "Unreleased",
    title: "Building the notebook",
    notes: [
      "Documentation site: getting started, foundations, component pages with live examples and code, blocks, search (press / or Ctrl K).",
      "The Notebook theme: cream paper, felt-tip ink, marker and highlighter, defined once as --ll-* tokens.",
      "Components arrive as their docs and examples are written; each is listed on its own page as soon as it exists.",
    ],
  },
]
