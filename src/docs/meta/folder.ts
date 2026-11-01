import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "folder",
  title: "Folder",
  category: "Paper",
  description:
    "A manila file folder that is also a set of tabs: a row of paper tabs standing on a sheet of the same paper. The active tab is the folder's own colour and runs down into the body, so tab and folder are one piece; the others stand a little lower and darker. It is Radix Tabs underneath.",
  status: "new",
  upstream: "tabs",
  parts: [
    {
      name: "Folder",
      description: "The Radix Tabs root, a flex column at most 42 rem wide. It takes the Tabs props (`value`, `defaultValue`, `onValueChange`, `dir`, `activationMode`) except `orientation`: a folder's tabs stand along its top edge, so it is always horizontal (Left / Right move between tabs; Up / Down do not).",
      props: [{ name: "stock", type: "StockName", default: '"kraft"', description: "What tabs and body are made of: kraft (manila), sticky-yellow, paper, index-card ..." }],
    },
    { name: "FolderTabs", description: "The tab strip (`role=\"tablist\"`), standing on the body, above it in stacking. Give it an `aria-label`." },
    {
      name: "FolderTab",
      description: "One tab (`role=\"tab\"`), 2.25 rem high (2 rem compact, 1.75 rem calm), its paper drawn behind the label. The active tab is the front one; a disabled tab is only a dashed pencil outline. Arrow keys, Home and End move between tabs; the label is real text.",
      props: [
        { name: "value", type: "string", required: true, description: "Which panel it opens." },
        { name: "disabled", type: "boolean", description: "Skipped by the arrow keys; drawn as a dashed ghost." },
      ],
    },
    {
      name: "FolderContent",
      description: "The panel a tab opens onto (`role=\"tabpanel\"`), a Paper in the folder's stock, square to the desk. Only the active panel is in the page.",
      props: [
        { name: "value", type: "string", required: true, description: "The tab it belongs to." },
        { name: "crease", type: "boolean", default: "true", description: "The fold across the top of the sheet." },
        { name: "tape / fastener / edge / shadow / seed / tilt", type: "Paper props", description: "As on any sheet (tilt defaults to none, so the tabs stay square to the body)." },
      ],
    },
  ],
  a11y: [
    "Radix Tabs gives the whole pattern: `tablist` / `tab` / `tabpanel` roles, `aria-selected`, `aria-controls`, roving focus with arrow keys, Home and End (Left and Right swap in RTL), and a disabled tab skipped by the keyboard.",
    "The drawn tab paper, the crease and the shadows are aria-hidden. The active tab is also `aria-selected` and bold, so it never depends on colour alone. Tab text is ink: 9:1 on the manila, 7.5:1 on a tab standing behind it.",
    "Windows high contrast replaces the drawn tabs with bordered buttons (the tabs carry a real border until their drawing exists and in forced colours), and the active tab fills with the system highlight colour. The open panel is a tab stop and shows the standard focus ring.",
  ],
  usage: `import { Folder, FolderContent, FolderTab, FolderTabs } from "@/components/ui/folder"

<Folder defaultValue="inbox">
  <FolderTabs aria-label="Mail">
    <FolderTab value="inbox">Inbox</FolderTab>
    <FolderTab value="drafts">Drafts</FolderTab>
  </FolderTabs>
  <FolderContent value="inbox">Three letters are waiting.</FolderContent>
  <FolderContent value="drafts">Two drafts.</FolderContent>
</Folder>`,
  related: ["tabs", "notebook", "index-card", "paper"],
} satisfies ComponentDoc
