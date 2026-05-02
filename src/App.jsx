import { useState, useEffect } from 'react'
import InputPanel from './components/InputPanel.jsx'
import PosterPanel from './components/PosterPanel.jsx'
import MediaPanel from './components/MediaPanel.jsx'
import SaveBar from './components/SaveBar.jsx'
import SharePage from './pages/SharePage.jsx'
import ExplorePage from './pages/ExplorePage.jsx'

// Vercel automatically routes /api/* to the functions in the /api folder.
// No configuration needed — this just works in both dev (vercel dev) and production.
const API_URL = '/api/generateContent'

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  const [rawText, setRawText] = useState('')
  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('structured') // 'structured' | 'creative'
  const [outputType, setOutputType] = useState('both') // 'both' | 'poster' | 'media'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [poster, setPoster] = useState(null)
  const [media, setMedia] = useState(null)
  const [niche, setNiche] = useState(null)

  const [saveId, setSaveId] = useState(null)
  const [saving, setSaving] = useState(false)

  if (currentPath.startsWith('/share/')) {
    return <SharePage />
  }

  if (currentPath === '/explore') {
    return <ExplorePage />
  }

  async function handleGenerate() {
    if (!rawText.trim() && !file) {
      setError('Please enter some event details or attach a file.')
      return
    }

    setLoading(true)
    setError('')
    setPoster(null)
    setMedia(null)
    setNiche(null)
    setSaveId(null)

    try {
      let combinedText = rawText.trim()

      if (file) {
        try {
          const { parseFile } = await import('./utils/fileParser.js')
          const extractedText = await parseFile(file)
          if (extractedText && extractedText.trim()) {
            combinedText += '\n\n--- Extracted Details from Attachment ---\n' + extractedText.trim()
          }
        } catch (err) {
          throw new Error('Failed to process the attached file: ' + err.message)
        }
      }

      if (!combinedText.trim()) {
        throw new Error('No readable text found in the input or attachment.')
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: combinedText, mode, outputType })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Server error: ${res.status}`)
      }

      const data = await res.json()

      if ((outputType === 'both' || outputType === 'poster') && !data.poster) {
        throw new Error('Unexpected response format from server (missing poster).')
      }
      if ((outputType === 'both' || outputType === 'media') && !data.media) {
        throw new Error('Unexpected response format from server (missing media).')
      }

      if (data.poster) setPoster(data.poster)
      if (data.media) setMedia(data.media)
      setNiche(data.niche)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, mode, poster, media })
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      setSaveId(data.id)
    } catch (err) {
      setError('Could not save the generation. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Determine grid template based on outputType
  // For mobile, panels scale automatically due to media queries, but on desktop we adjust the columns.
  const gridStyle = outputType === 'both' ? { gridTemplateColumns: '1fr 1fr 1fr' } : { gridTemplateColumns: '1fr 1fr' }

  return (
    <div className="app">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Content Generator</h1>
          <p className="app-subtitle">Event to Post in seconds</p>
        </div>
        <button
          onClick={() => setCurrentPath('/explore')}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '8px 16px',
            borderRadius: 'var(--radius)',
            color: 'var(--text)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-mono)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--text-mid)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          Browse Saved &rarr;
        </button>
      </header>

      <SaveBar
        poster={poster}
        media={media}
        saveId={saveId}
        saving={saving}
        onSave={handleSave}
      />

      <main className="panels" style={gridStyle}>
        <InputPanel
          rawText={rawText}
          onTextChange={setRawText}
          file={file}
          onFileChange={setFile}
          mode={mode}
          onModeChange={setMode}
          outputType={outputType}
          onOutputTypeChange={setOutputType}
          onGenerate={handleGenerate}
          loading={loading}
          error={error}
        />
        {(outputType === 'both' || outputType === 'poster') && (
          <PosterPanel poster={poster} loading={loading} niche={niche} />
        )}
        {(outputType === 'both' || outputType === 'media') && (
          <MediaPanel media={media} loading={loading} niche={niche} />
        )}
      </main>

      <footer className="app-footer">
        Built by Abhishek Rao
      </footer>
    </div>
  )
}
