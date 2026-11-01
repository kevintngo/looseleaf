export interface NavLink {
  title: string
  url: string
  isActive?: boolean
}

export interface NavSection {
  title: string
  url: string
  items: NavLink[]
}

export interface AppNavItem {
  title: string
  url: string
  icon: string
  isActive?: boolean
  badge?: string
  items?: NavLink[]
}

export interface Team {
  name: string
  icon: string
  plan: string
}

export interface Project {
  name: string
  url: string
  icon: string
}

export interface Person {
  name: string
  email: string
}

export const docsVersions = ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"]

export const docsNav: NavSection[] = [
  {
    title: "Getting started",
    url: "#getting-started",
    items: [
      { title: "Welcome", url: "#welcome" },
      { title: "Sharpen your first pencil", url: "#sharpen-your-first-pencil" },
    ],
  },
  {
    title: "Writing on paper",
    url: "#writing-on-paper",
    items: [
      { title: "Pens & pencils", url: "#pens-and-pencils" },
      { title: "Paper stocks", url: "#paper-stocks" },
      { title: "Margins", url: "#margins", isActive: true },
      { title: "Sticky notes", url: "#sticky-notes" },
      { title: "Tape & pins", url: "#tape-and-pins" },
      { title: "Stamps", url: "#stamps" },
      { title: "Doodles", url: "#doodles" },
      { title: "Highlighting", url: "#highlighting" },
      { title: "Erasing", url: "#erasing" },
      { title: "Printing", url: "#printing" },
      { title: "Sharing", url: "#sharing" },
      { title: "Archiving", url: "#archiving" },
    ],
  },
  {
    title: "Pen reference",
    url: "#pen-reference",
    items: [
      { title: "Felt tip", url: "#felt-tip" },
      { title: "Fineliner", url: "#fineliner" },
      { title: "Graphite", url: "#graphite" },
      { title: "Highlighter", url: "#highlighter" },
      { title: "Brush pen", url: "#brush-pen" },
      { title: "Chalk", url: "#chalk" },
    ],
  },
  {
    title: "Behind the scenes",
    url: "#behind-the-scenes",
    items: [
      { title: "How lines wobble", url: "#how-lines-wobble" },
      { title: "Reading order", url: "#reading-order" },
      { title: "Density", url: "#density" },
      { title: "Keyboard", url: "#keyboard" },
    ],
  },
  {
    title: "Pen pals",
    url: "#pen-pals",
    items: [{ title: "How to contribute", url: "#how-to-contribute" }],
  },
]

export const docsTrail = ["Writing on paper", "Margins"]

export const pageOutline: NavSection[] = [
  {
    title: "Why margins",
    url: "#why-margins",
    items: [
      { title: "Room to think", url: "#room-to-think" },
      { title: "Room to disagree", url: "#room-to-disagree" },
    ],
  },
  {
    title: "Drawing a margin",
    url: "#drawing-a-margin",
    items: [
      { title: "The pencil rule", url: "#the-pencil-rule", isActive: true },
      { title: "Wide, narrow, none", url: "#wide-narrow-none" },
      { title: "Left-handers and right-to-left", url: "#left-handers-and-right-to-left" },
    ],
  },
  {
    title: "Notes in the margin",
    url: "#notes-in-the-margin",
    items: [
      { title: "Stars and asterisks", url: "#stars-and-asterisks" },
      { title: "Arrows that point somewhere", url: "#arrows-that-point-somewhere" },
    ],
  },
  {
    title: "Going further",
    url: "#going-further",
    items: [{ title: "Sticky notes", url: "#sticky-notes" }],
  },
]

export const appUser: Person = { name: "Jo Delacroix", email: "jo@looseleaf.example" }

export const appTeams: Team[] = [
  { name: "Looseleaf Studio", icon: "book-open", plan: "Notebook" },
  { name: "Pen Pals Co.", icon: "pencil", plan: "Team" },
  { name: "Attic Press", icon: "bookmark", plan: "Free" },
]

export const appNav: AppNavItem[] = [
  {
    title: "Sketchbook",
    url: "#sketchbook",
    icon: "pencil",
    isActive: true,
    items: [
      { title: "Recent", url: "#recent" },
      { title: "Starred", url: "#starred" },
      { title: "Drafts", url: "#drafts" },
    ],
  },
  {
    title: "Paper stocks",
    url: "#paper-stocks",
    icon: "file-text",
    items: [
      { title: "Cream", url: "#cream" },
      { title: "Kraft", url: "#kraft" },
      { title: "Graph", url: "#graph" },
      { title: "Ledger", url: "#ledger" },
    ],
  },
  {
    title: "Field guide",
    url: "#field-guide",
    icon: "book-open",
    items: [
      { title: "Introduction", url: "#introduction" },
      { title: "Get started", url: "#get-started" },
      { title: "Tutorials", url: "#tutorials" },
      { title: "Changelog", url: "#changelog" },
    ],
  },
  {
    title: "Studio settings",
    url: "#studio-settings",
    icon: "settings-2",
    items: [
      { title: "General", url: "#general" },
      { title: "Team", url: "#team" },
      { title: "Billing", url: "#billing" },
      { title: "Limits", url: "#limits" },
    ],
  },
]

export const appProjects: Project[] = [
  { name: "Spring catalogue", url: "#spring-catalogue", icon: "frame" },
  { name: "Postcard club", url: "#postcard-club", icon: "mail" },
  { name: "Field trip", url: "#field-trip", icon: "map" },
]

export const appSecondary = [
  { title: "Support", url: "#support", icon: "life-buoy" },
  { title: "Feedback", url: "#feedback", icon: "send" },
]

export interface NotesPage {
  name: string
  url: string
  icon: string
}

export interface NotesWorkspace {
  name: string
  icon: string
  pages: NotesPage[]
}

export const notesNav: AppNavItem[] = [
  { title: "Search", url: "#search", icon: "search" },
  { title: "Ask Stubby", url: "#ask-stubby", icon: "sparkles" },
  { title: "Home", url: "#home", icon: "house", isActive: true },
  { title: "Inbox", url: "#inbox", icon: "inbox", badge: "10" },
]

export const notesSecondary: AppNavItem[] = [
  { title: "Calendar", url: "#calendar", icon: "calendar" },
  { title: "Settings", url: "#settings", icon: "settings-2" },
  { title: "Templates", url: "#templates", icon: "layout-grid" },
  { title: "Trash", url: "#trash", icon: "trash" },
  { title: "Help", url: "#help", icon: "life-buoy" },
]

export const notesFavorites: NotesPage[] = [
  { name: "Project plan & to-dos", url: "#project-plan-and-to-dos", icon: "chart-column" },
  { name: "Family recipe box", url: "#family-recipe-box", icon: "heart" },
  { name: "Reading list", url: "#reading-list", icon: "book-open" },
  { name: "Garden diary", url: "#garden-diary", icon: "sun" },
  { name: "Trip to Lisbon", url: "#trip-to-lisbon", icon: "map" },
]

export const notesWorkspaces: NotesWorkspace[] = [
  {
    name: "Home life",
    icon: "house",
    pages: [
      { name: "Daily journal", url: "#daily-journal", icon: "pencil" },
      { name: "Health & wellness", url: "#health-and-wellness", icon: "heart" },
      { name: "Things to learn", url: "#things-to-learn", icon: "lightbulb" },
    ],
  },
  {
    name: "Work",
    icon: "folder",
    pages: [
      { name: "Career milestones", url: "#career-milestones", icon: "flag" },
      { name: "Training log", url: "#training-log", icon: "timer" },
      { name: "People I met", url: "#people-i-met", icon: "users" },
    ],
  },
  {
    name: "Making things",
    icon: "sparkles",
    pages: [
      { name: "Story outlines", url: "#story-outlines", icon: "file-text" },
      { name: "Portfolio", url: "#portfolio", icon: "image" },
      { name: "Practice log", url: "#practice-log", icon: "music" },
    ],
  },
]

export const pageActions: { label: string; icon: string }[][] = [
  [
    { label: "Customize page", icon: "settings-2" },
    { label: "Turn into wiki", icon: "file-text" },
  ],
  [
    { label: "Copy link", icon: "link" },
    { label: "Duplicate", icon: "copy" },
    { label: "Move to", icon: "arrow-right" },
    { label: "Move to trash", icon: "trash" },
  ],
  [
    { label: "Undo", icon: "undo-2" },
    { label: "View analytics", icon: "chart-line" },
    { label: "Version history", icon: "rotate-ccw-clock" },
    { label: "Show delete pages", icon: "eye" },
    { label: "Notifications", icon: "bell" },
  ],
  [
    { label: "Import", icon: "upload" },
    { label: "Export", icon: "download" },
  ],
]

export type MailFolder = "Inbox" | "Drafts" | "Sent" | "Junk" | "Trash"

export interface Mail {
  id: string
  name: string
  email: string
  subject: string
  date: string
  teaser: string
  folder: MailFolder
  unread?: boolean
}

export const mailFolders: { title: MailFolder; icon: string }[] = [
  { title: "Inbox", icon: "inbox" },
  { title: "Drafts", icon: "file" },
  { title: "Sent", icon: "send" },
  { title: "Junk", icon: "archive" },
  { title: "Trash", icon: "trash" },
]

export const mails: Mail[] = [
  {
    id: "m1",
    name: "Ada Lovelace",
    email: "ada@looseleaf.example",
    subject: "Meeting tomorrow",
    date: "09:34",
    teaser: "Hi team, a reminder about tomorrow at ten.\nPlease bring your sketchbooks and one good pen.",
    folder: "Inbox",
    unread: true,
  },
  {
    id: "m2",
    name: "Mika Kobayashi",
    email: "mika@looseleaf.example",
    subject: "Re: Postcard proofs",
    date: "Yesterday",
    teaser: "The proofs look lovely. The blue is a touch loud on kraft.\nCan we try the graphite version too?",
    folder: "Inbox",
    unread: true,
  },
  {
    id: "m3",
    name: "Sam Reyes",
    email: "sam@looseleaf.example",
    subject: "Weekend plans",
    date: "2 days ago",
    teaser: "Thinking of a sketch walk on Saturday.\nHills or harbour, you choose. Bring a flask.",
    folder: "Inbox",
  },
  {
    id: "m4",
    name: "Emily Davis",
    email: "emily@looseleaf.example",
    subject: "Re: Question about the budget",
    date: "2 days ago",
    teaser: "I went through the numbers you sent.\nCould we have a quick call about the paper costs?",
    folder: "Inbox",
  },
  {
    id: "m5",
    name: "Michael Wilson",
    email: "michael@looseleaf.example",
    subject: "Big announcement",
    date: "1 week ago",
    teaser: "All hands on Friday at three.\nThere is news about the new studio, and there will be cake.",
    folder: "Inbox",
    unread: true,
  },
  {
    id: "m6",
    name: "Sarah Brown",
    email: "sarah@looseleaf.example",
    subject: "Feedback on the proposal",
    date: "1 week ago",
    teaser: "Thank you for the proposal. I have a few thoughts.\nCould we meet so I can walk you through them?",
    folder: "Inbox",
  },
  {
    id: "m7",
    name: "You",
    email: "jo@looseleaf.example",
    subject: "Draft: Spring catalogue intro",
    date: "Tuesday",
    teaser: "Every spring the studio opens its windows, and the pens come out of their tins.\nThis year we made something a bit different.",
    folder: "Drafts",
  },
  {
    id: "m8",
    name: "You",
    email: "jo@looseleaf.example",
    subject: "Draft: Thank-you notes",
    date: "Last week",
    teaser: "Dear all, thank you for a wonderful season.\nA list of what we learned is enclosed.",
    folder: "Drafts",
  },
  {
    id: "m9",
    name: "To: Ada Lovelace",
    email: "ada@looseleaf.example",
    subject: "Re: Meeting tomorrow",
    date: "09:41",
    teaser: "Ten is perfect. I will bring the kraft pad and the good pen.",
    folder: "Sent",
  },
  {
    id: "m10",
    name: "To: Mika Kobayashi",
    email: "mika@looseleaf.example",
    subject: "Postcard proofs",
    date: "Monday",
    teaser: "Attached are the proofs for the spring run.\nTell me what you think of the wobble on the border.",
    folder: "Sent",
  },
  {
    id: "m11",
    name: "Stationery Deals",
    email: "deals@example.com",
    subject: "You have won a lifetime of ink",
    date: "3 days ago",
    teaser: "Click here to claim your free lifetime supply of ink.\nOffer ends tonight.",
    folder: "Junk",
  },
  {
    id: "m12",
    name: "Old Newsletter",
    email: "news@example.com",
    subject: "Last month at the paper mill",
    date: "2 weeks ago",
    teaser: "A roundup of what happened at the mill.\nYou are receiving this because you signed up in 2019.",
    folder: "Trash",
  },
]

export interface CalendarGroup {
  name: string
  items: { name: string; tone: string }[]
}

export const calendarGroups: CalendarGroup[] = [
  {
    name: "My calendars",
    items: [
      { name: "Personal", tone: "text-ink-you" },
      { name: "Work", tone: "text-orange-text" },
      { name: "Family", tone: "text-green" },
    ],
  },
  {
    name: "Favorites",
    items: [
      { name: "Holidays", tone: "text-red" },
      { name: "Birthdays", tone: "text-grape" },
    ],
  },
  {
    name: "Other",
    items: [
      { name: "Travel", tone: "text-ink-you" },
      { name: "Reminders", tone: "text-orange-text" },
      { name: "Deadlines", tone: "text-red" },
    ],
  },
]

export interface FileNode {
  name: string
  children?: FileNode[]
}

export const fileChanges = [
  { file: "README.md", state: "M" },
  { file: "api/hello/route.ts", state: "U" },
  { file: "app/layout.tsx", state: "M" },
]

export const fileTree: FileNode[] = [
  {
    name: "app",
    children: [
      { name: "api", children: [{ name: "hello", children: [{ name: "route.ts" }] }] },
      { name: "page.tsx" },
      { name: "layout.tsx" },
      { name: "blog", children: [{ name: "page.tsx" }] },
    ],
  },
  {
    name: "components",
    children: [{ name: "ui", children: [{ name: "button.tsx" }, { name: "card.tsx" }] }, { name: "header.tsx" }, { name: "footer.tsx" }],
  },
  { name: "lib", children: [{ name: "util.ts" }] },
  { name: "public", children: [{ name: "favicon.ico" }, { name: "pencil.svg" }] },
  { name: ".eslintrc.json" },
  { name: ".gitignore" },
  { name: "next.config.js" },
  { name: "tailwind.config.js" },
  { name: "package.json" },
  { name: "README.md" },
]

export interface SettingsSection {
  name: string
  icon: string
  intro: string
  toggles: { id: string; label: string; hint: string; on: boolean }[]
}

export const settingsSections: SettingsSection[] = [
  {
    name: "Notifications",
    icon: "bell",
    intro: "Decide what is worth a tap on the shoulder.",
    toggles: [
      { id: "n-mentions", label: "Mentions", hint: "When somebody writes your name in the margin.", on: true },
      { id: "n-replies", label: "Replies", hint: "When a thread you started gets an answer.", on: true },
      { id: "n-digest", label: "Friday digest", hint: "One postcard with the week in it.", on: false },
    ],
  },
  {
    name: "Appearance",
    icon: "sun",
    intro: "How the notebook looks on your desk.",
    toggles: [
      { id: "a-tilt", label: "Tilt the paper", hint: "Sheets sit at a slight angle. Text never does.", on: true },
      { id: "a-grain", label: "Paper grain", hint: "Turn off for a flatter, calmer page.", on: true },
      { id: "a-motion", label: "Reduce motion", hint: "No swishing pages or drawn-on lines.", on: false },
    ],
  },
  {
    name: "Messages & media",
    icon: "message-circle",
    intro: "What arrives with a message, and what does not.",
    toggles: [
      { id: "m-previews", label: "Link previews", hint: "Show a small card under links.", on: true },
      { id: "m-autoplay", label: "Play stickers", hint: "Let animated stickers move.", on: false },
      { id: "m-images", label: "Show images inline", hint: "Otherwise they arrive as a paperclip.", on: true },
    ],
  },
  {
    name: "Language & region",
    icon: "globe",
    intro: "Words, dates and which way the page reads.",
    toggles: [
      { id: "l-24h", label: "24-hour clock", hint: "Show 17:30 instead of 5:30 pm.", on: false },
      { id: "l-week", label: "Weeks start on Monday", hint: "Your calendars follow along.", on: true },
      { id: "l-rtl", label: "Write right to left", hint: "Mirror the notebook for Arabic and Hebrew.", on: false },
    ],
  },
  {
    name: "Accessibility",
    icon: "command",
    intro: "Make it easy on your eyes and your hands.",
    toggles: [
      { id: "x-contrast", label: "Heavier pens", hint: "Thicker lines and darker ink.", on: false },
      { id: "x-focus", label: "Always show focus", hint: "Draw a ring on whatever the keyboard is on.", on: true },
      { id: "x-keys", label: "Single-key shortcuts", hint: "Press ? anywhere to see them.", on: true },
    ],
  },
  {
    name: "Privacy & visibility",
    icon: "lock",
    intro: "Who can read over your shoulder.",
    toggles: [
      { id: "p-online", label: "Show when I am online", hint: "A small dot next to your name.", on: true },
      { id: "p-read", label: "Read receipts", hint: "Let people know you saw their note.", on: false },
      { id: "p-index", label: "Appear in search", hint: "Let teammates find you by name.", on: true },
    ],
  },
]

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export const formatDay = (date: Date) => `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`

export const formatMonth = (date: Date) => `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
