"use client"

import * as React from "react"

const COLUMNS = [
  { title: "Product", links: ["Notebooks", "Tasks", "Templates", "Changelog", "Pricing"] },
  { title: "Company", links: ["About", "Careers", "Press kit", "Contact"] },
  { title: "Resources", links: ["Guides", "Help center", "API docs", "Status", "Community"] },
]

function Footer01Links() {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 @xl:grid-cols-3">
      {COLUMNS.map((col) => (
        <FooterColumn key={col.title} title={col.title} links={col.links} />
      ))}
    </div>
  )
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  const id = React.useId()
  return (
    <nav aria-labelledby={id}>
      <h2 id={id} className="font-script text-2xl leading-none font-bold text-ink">
        {title}
      </h2>
      <ul role="list" className="mt-3 grid list-none gap-0.5">
        {links.map((l) => (
          <li key={l}>
            <a href={`#${l.toLowerCase().replace(/\s+/g, "-")}`} className="-mx-2 inline-block px-2 py-1 text-base text-ink hover:ll-swipe">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { Footer01Links, COLUMNS }
