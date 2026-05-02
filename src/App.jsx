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
  const [mode, setMode] = useState('structured') // 'structured' | 'creative'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [poster, setPoster] = useState(null)
  const [media, setMedia] = useState(null)

  const [saveId, setSaveId] = useState(null)
  const [saving, setSaving] = useState(false)

  if (currentPath.startsWith('/share/')) {
    return <SharePage />
  }

  if (currentPath === '/explore') {
    return <ExplorePage />
  }

  async function handleGenerate() {
    if (!rawText.trim()) {
      setError('Please enter some event details first.')
      return
    }

    setLoading(true)
    setError('')
    setPoster(null)
    setMedia(null)
    setSaveId(null)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawText.trim(), mode })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Server error: ${res.status}`)
      }

      const data = await res.json()

      if (!data.poster || !data.media) {
        throw new Error('Unexpected response format from server.')
      }

      setPoster(data.poster)
      setMedia(data.media)
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Content Generator</h1>
        <p className="app-subtitle">Content Team · Event to Post in seconds</p>
      </header>

      <main className="panels">
        <InputPanel
          rawText={rawText}
          onTextChange={setRawText}
          mode={mode}
          onModeChange={setMode}
          onGenerate={handleGenerate}
          loading={loading}
          error={error}
        />
        <PosterPanel poster={poster} loading={loading} />
        <MediaPanel media={media} loading={loading} />
      </main>

      <SaveBar
        poster={poster}
        media={media}
        saveId={saveId}
        saving={saving}
        onSave={handleSave}
      />

      <footer className="app-footer">
        Built by Abhishek Rao
      </footer>
    </div>
  )
}
