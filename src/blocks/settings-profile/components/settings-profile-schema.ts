import { z } from "zod"

export const TAKEN_USERNAMES = ["ada", "admin", "jo", "nell", "stubby"]

export const BIO_MAX = 160

export const TIME_ZONES = [
  { value: "Europe/Lisbon", label: "Lisbon (WET)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "America/New_York", label: "New York (ET)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
]

export const PRONOUNS = [
  { value: "none", label: "Rather not say" },
  { value: "she", label: "she / her" },
  { value: "he", label: "he / him" },
  { value: "they", label: "they / them" },
]

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Your name needs at least 2 letters.").max(40, "Keep your name to 40 letters or fewer."),
  username: z
    .string()
    .trim()
    .min(3, "Usernames need at least 3 characters.")
    .max(20, "Usernames are 20 characters or fewer.")
    .regex(/^[a-z0-9_]+$/i, "Use letters, numbers and underscores only.")
    .refine((v) => !TAKEN_USERNAMES.includes(v.toLowerCase()), "That username is taken. Try another."),
  email: z.email("Enter an address like ada@notes.dev."),
  bio: z.string().max(BIO_MAX, `Bios are ${BIO_MAX} characters or fewer.`),
  website: z.union([z.literal(""), z.url("Start with https:// so the link works.")]),
  pronouns: z.string(),
  timezone: z.string().min(1, "Pick a time zone."),
  discoverable: z.boolean(),
})

export type ProfileValues = z.infer<typeof profileSchema>

export const DEFAULT_PROFILE: ProfileValues = {
  name: "Jo Delacroix",
  username: "jo_writes",
  email: "jo@looseleaf.example",
  bio: "I write in the margins. Letterpress on weekends, tea all week.",
  website: "https://jo.looseleaf.example",
  pronouns: "she",
  timezone: "Europe/Lisbon",
  discoverable: true,
}
