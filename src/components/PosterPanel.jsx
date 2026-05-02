// PosterPanel — Panel 2
// Displays generated poster content with field-level copy buttons

import CopyButton from './CopyButton.jsx'

export default function PosterPanel({ poster, loading }) {
  const fields = [
    { key: 'title',         label: 'Title' },
    { key: 'achievement',   label: 'Achievement' },
    { key: 'teamName',      label: 'Team Name' },
    { key: 'members',       label: 'Members' },
    { key: 'location',      label: 'Location' },
    { key: 'highlightLine', label: 'Highlight Line' },
  ]

  const allText = poster
    ? fields.map(f => `${f.label}: ${poster[f.key] ?? ''}`).join('\n')
    : ''

  return (
    <section className="panel panel-poster">
      <div className="panel-header">
        <h2 className="panel-title">POSTER CONTEXT</h2>
        <span className="panel-tag">Output</span>
      </div>

      {loading && (
        <div className="loading-state">Generating poster content...</div>
      )}

      {!loading && !poster && (
        <div className="empty-state">
          Poster fields will appear here after generation.
        </div>
      )}

      {!loading && poster && (
        <>
          <div className="fields-list">
            {fields.map(({ key, label }) => (
              <div className="field-row" key={key}>
                <div className="field-meta">
                  <span className="field-label">{label}</span>
                  <CopyButton text={poster[key] ?? ''} />
                </div>
                <div className="field-value">
                  {poster[key] ?? <span className="field-empty">—</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="copy-all-row">
            <CopyButton text={allText} label="Copy All Fields" />
          </div>
        </>
      )}
    </section>
  )
}
