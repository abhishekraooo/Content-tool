// InputPanel — Panel 1
// Collects raw event text, mode toggle, and triggers generation

export default function InputPanel({
  rawText,
  onTextChange,
  file,
  onFileChange,
  mode,
  onModeChange,
  outputType,
  onOutputTypeChange,
  onGenerate,
  loading,
  error
}) {
  function handleKeyDown(e) {
    // Ctrl+Enter or Cmd+Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      onGenerate()
    }
  }

  return (
    <section className="panel panel-input">
      <div className="panel-header">
        <h2 className="panel-title">RAW CONTEXT</h2>
        <span className="panel-tag">Input</span>
      </div>

      <textarea
        className="raw-input"
        value={rawText}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Team ABC won 1st place at XYZ Hackathon in Bangalore. Members: John, Sarah, Alex."
        rows={8}
        disabled={loading}
      />

      {/* File Upload Row */}
      <div className="file-upload-row" style={{ marginTop: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer', color: 'var(--text-mid)' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
          {file ? file.name : 'Attach brochure or event PDF'}
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => onFileChange(e.target.files[0])}
            style={{ display: 'none' }}
            disabled={loading}
          />
        </label>
        {file && (
          <button
            onClick={() => onFileChange(null)}
            disabled={loading}
            style={{ marginLeft: '12px', background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
          >
            Remove
          </button>
        )}
      </div>

      {/* Output Type Toggle */}
      <div className="output-type-row" style={{ marginTop: '16px' }}>
        <span className="mode-label" style={{ display: 'block', marginBottom: '6px' }}>Generate for:</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['both', 'poster', 'media'].map(type => (
            <button
              key={type}
              onClick={() => onOutputTypeChange(type)}
              disabled={loading}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                textTransform: 'capitalize',
                border: `1px solid ${outputType === type ? 'var(--text)' : 'var(--border)'}`,
                background: outputType === type ? 'var(--text)' : 'var(--bg)',
                color: outputType === type ? 'var(--surface)' : 'var(--text-mid)',
                borderRadius: 'var(--radius)',
                cursor: loading ? 'not-allowed' : 'pointer',
                flex: 1
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="mode-row" style={{ marginTop: '16px' }}>
        <span className="mode-label">Structured Mode</span>
        <button
          className={`toggle ${mode === 'structured' ? 'toggle-on' : 'toggle-off'}`}
          onClick={() => onModeChange(mode === 'structured' ? 'creative' : 'structured')}
          disabled={loading}
          aria-pressed={mode === 'structured'}
        >
          <span className="toggle-thumb" />
        </button>
        <span className="mode-hint">
          {mode === 'structured' ? 'Predictable output' : 'Slightly creative'}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        className="btn-generate"
        onClick={onGenerate}
        disabled={loading || (!rawText.trim() && !file)}
      >
        {loading ? (file ? 'Parsing & Generating...' : 'Generating...') : 'Generate'}
      </button>

      <p className="input-hint">Ctrl + Enter to generate</p>
    </section>
  )
}
