// InputPanel — Panel 1
// Collects raw event text, mode toggle, and triggers generation

export default function InputPanel({
  rawText,
  onTextChange,
  mode,
  onModeChange,
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

      {/* Mode Toggle */}
      <div className="mode-row">
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
        disabled={loading || !rawText.trim()}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>

      <p className="input-hint">Ctrl + Enter to generate</p>
    </section>
  )
}
