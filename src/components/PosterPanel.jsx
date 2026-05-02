// PosterPanel — Panel 2
// Displays generated poster content with field-level copy buttons

import CopyButton from './CopyButton.jsx'

export default function PosterPanel({ poster, loading, niche }) {
  const fields = [
    { key: 'title', label: 'Title' },
    { key: 'names', label: 'Name(s)' },
    { key: 'description', label: 'Description' },
  ]

  const allText = poster
    ? fields
      .filter(f => poster[f.key] && poster[f.key].trim() !== '')
      .map(f => `${f.label}: ${poster[f.key]}`)
      .join('\n')
    : ''

  const displayNiche = niche ? niche.charAt(0).toUpperCase() + niche.slice(1) : null;

  return (
    <section className="panel panel-poster">
      <div className="panel-header">
        <h2 className="panel-title">POSTER CONTEXT</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {displayNiche && <span className="mode-badge">{displayNiche}</span>}
          <span className="panel-tag">Output</span>
        </div>
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
            {fields.map(({ key, label }) => {
              if (!poster[key] || poster[key].trim() === '') return null;
              return (
                <div className="field-row" key={key}>
                  <div className="field-meta">
                    <span className="field-label">{label}</span>
                    <CopyButton text={poster[key] ?? ''} />
                  </div>
                  <div className="field-value">
                    {poster[key]}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="copy-all-row">
            <CopyButton text={allText} label="Copy All Fields" />
          </div>
        </>
      )}
    </section>
  )
}
