// MediaPanel — Panel 3
// Displays generated social media captions with copy buttons

import CopyButton from './CopyButton.jsx'

export default function MediaPanel({ media, loading, niche }) {
  const sections = [
    { key: 'fullCaption',   label: 'Full Caption (ready to post)' },
    { key: 'shortCaption',  label: 'Short Caption' },
    { key: 'storyCaption',  label: 'Story Caption' },
    { key: 'hashtags',      label: 'Hashtags' },
  ]

  const allText = media
    ? sections.map(s => `${s.label}:\n${media[s.key] ?? ''}`).join('\n\n')
    : ''

  const displayNiche = niche ? niche.charAt(0).toUpperCase() + niche.slice(1) : null;

  return (
    <section className="panel panel-media">
      <div className="panel-header">
        <h2 className="panel-title">MEDIA CONTEXT</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {displayNiche && <span className="mode-badge">{displayNiche}</span>}
          <span className="panel-tag">Output</span>
        </div>
      </div>

      {loading && (
        <div className="loading-state">Generating social media content...</div>
      )}

      {!loading && !media && (
        <div className="empty-state">
          Social media captions will appear here after generation.
        </div>
      )}

      {!loading && media && (
        <>
          <div className="captions-list">
            {sections.map(({ key, label }) => (
              <div className="caption-block" key={key}>
                <div className="field-meta">
                  <span className="field-label">{label}</span>
                  <CopyButton text={media[key] ?? ''} />
                </div>
                <div className="caption-value">
                  {media[key] ?? <span className="field-empty">—</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="copy-all-row">
            <CopyButton text={allText} label="Copy All Captions" />
          </div>
        </>
      )}
    </section>
  )
}
