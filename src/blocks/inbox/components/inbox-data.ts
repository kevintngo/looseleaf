export type Folder = "inbox" | "archive" | "trash"

export type Mail = {
  id: string
  from: string
  address: string
  subject: string
  date: string
  body: string[]
  unread: boolean
  starred: boolean
  folder: Folder
  attachments: string[]
  replies: string[]
}

export const FOLDERS: ReadonlyArray<{ id: Folder; label: string; icon: string }> = [
  { id: "inbox", label: "Inbox", icon: "inbox" },
  { id: "archive", label: "Archive", icon: "archive" },
  { id: "trash", label: "Trash", icon: "trash" },
]

export const mails: Mail[] = [
  {
    id: "m1",
    from: "Ada Lovelace",
    address: "ada@marigold.example",
    subject: "The sticker sheet, finally",
    date: "9:12",
    body: ["Jo,", "I drew the snail. He is smug, which I think is right. Have a look before we send the sheet to print? I would like to keep the shell as it is.", "Ada"],
    unread: true,
    starred: false,
    folder: "inbox",
    attachments: ["snail-sticker.png"],
    replies: [],
  },
  {
    id: "m2",
    from: "Post Office, rue Cler",
    address: "noreply@laposte.example",
    subject: "Your parcel is waiting for you",
    date: "8:03",
    body: ["A parcel addressed to Marigold Paper Co. is at the counter.", "Please bring a piece of identification. We are open until six, and until noon on Saturdays."],
    unread: true,
    starred: false,
    folder: "inbox",
    attachments: [],
    replies: [],
  },
  {
    id: "m3",
    from: "Mika Kobayashi",
    address: "mika@marigold.example",
    subject: "Photos of the field notebooks",
    date: "Sep 24",
    body: ["Hello!", "The light was lovely at four, so I took the whole set again against the kraft paper. They are in the shared folder, the ones marked with a small star are my favorites.", "M."],
    unread: false,
    starred: true,
    folder: "inbox",
    attachments: ["field-notebooks-contact-sheet.pdf"],
    replies: [],
  },
  {
    id: "m4",
    from: "Sam Reyes",
    address: "sam@marigold.example",
    subject: "Postal code field is fixed",
    date: "Sep 23",
    body: ["It was a stray space after the city name. Nothing more mysterious than that.", "It is live now; two customers who got stuck have been written to."],
    unread: false,
    starred: false,
    folder: "inbox",
    attachments: [],
    replies: [],
  },
  {
    id: "m5",
    from: "Lyon Paper Fair",
    address: "stands@lyonpapier.example",
    subject: "Your stand is confirmed",
    date: "Sep 22",
    body: ["We are delighted to confirm stand 14 (two meters by three) for the first and second of October.", "Set-up begins at 7:30 on the Thursday. There is a coffee cart by the main door, and it is very good."],
    unread: false,
    starred: true,
    folder: "inbox",
    attachments: ["stand-plan.pdf", "set-up-times.pdf"],
    replies: [],
  },
  {
    id: "m6",
    from: "Ada Lovelace",
    address: "ada@marigold.example",
    subject: "Supper on Saturday?",
    date: "Sep 21",
    body: ["Birthday supper at mine, half past seven. Nothing fancy, and please do not bring a present. Bring the good bread if you pass the bakery."],
    unread: false,
    starred: false,
    folder: "inbox",
    attachments: [],
    replies: [],
  },
  {
    id: "m7",
    from: "Bank of the Left Bank",
    address: "statements@bank.example",
    subject: "Your statement is ready",
    date: "Sep 20",
    body: ["Your September statement is ready to read. It is not very exciting, which is how we like it."],
    unread: false,
    starred: false,
    folder: "inbox",
    attachments: [],
    replies: [],
  },
  {
    id: "m8",
    from: "Mum",
    address: "mum@family.example",
    subject: "Did you eat?",
    date: "Sep 19",
    body: ["Just checking. Also the plum tree has gone mad, so there will be jam. Come and get some jam.", "x"],
    unread: false,
    starred: true,
    folder: "inbox",
    attachments: [],
    replies: [],
  },
  {
    id: "m9",
    from: "Pemberton & Sons",
    address: "accounts@pemberton.example",
    subject: "Invoice 118, paid with thanks",
    date: "Sep 18",
    body: ["Payment for invoice 118 has gone out today. A receipt is attached for your files."],
    unread: false,
    starred: false,
    folder: "archive",
    attachments: ["receipt-118.pdf"],
    replies: [],
  },
  {
    id: "m10",
    from: "Stationery Weekly",
    address: "editor@stationeryweekly.example",
    subject: "Ten pens you will not need",
    date: "Sep 12",
    body: ["A list of ten pens, all of which you will want anyway."],
    unread: false,
    starred: false,
    folder: "trash",
    attachments: [],
    replies: [],
  },
]
