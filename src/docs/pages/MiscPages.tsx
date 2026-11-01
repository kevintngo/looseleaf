import { CHANGELOG } from "../core/changelog"
import { Callout, Page, Prose } from "../kit"
import { ContentSlot } from "../widgets/ContentSlot"

export function PlaygroundPage() {
  return (
    <Page kicker="More" title="Playground" description="A place to try components without leaving the docs.">
      <ContentSlot
        contentKey="playground"
        fallback={
          <Callout tone="todo" title="The playground is still being drawn">
            <p>For now, every example on a component page shows its full source: copy it into your own project to play.</p>
          </Callout>
        }
      />
    </Page>
  )
}

export function ChangelogPage() {
  return (
    <Page kicker="More" title="Changelog" description="What changed, newest first." toc="auto">
      <ContentSlot
        contentKey="changelog"
        fallback={
          <div className="dk-changelog">
            {CHANGELOG.map((entry) => (
              <section key={entry.version} className="dk-release" aria-labelledby={`release-${entry.version}`}>
                <h2 id={`release-${entry.version}`} className="dk-heading" data-level={2}>
                  {entry.version} <span className="dk-release-title">{entry.title}</span>
                </h2>
                {entry.date !== entry.version ? <p className="dk-hint">{entry.date}</p> : null}
                <Prose>
                  <ul>
                    {entry.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </Prose>
              </section>
            ))}
          </div>
        }
      />
    </Page>
  )
}
