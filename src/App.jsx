import { useState } from 'react'
import InputPanel from './components/InputPanel.jsx'
import PosterPanel from './components/PosterPanel.jsx'
import MediaPanel from './components/MediaPanel.jsx'

// Vercel automatically routes /api/* to the functions in the /api folder.
// No configuration needed — this just works in both dev (vercel dev) and production.
const API_URL = '/api/generateContent'

export default function App() {
  const [rawText, setRawText] = useState('')
  const [mode, setMode]       = useState('structured') // 'structured' | 'creative'
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [poster, setPoster]   = useState(null)
  const [media, setMedia]     = useState(null)

  async function handleGenerate() {
    if (!rawText.trim()) {
      setError('Please enter some event details first.')
      return
    }

    setLoading(true)
    setError('')
    setPoster(null)
    setMedia(null)

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Content Generator</h1>
        <p className="app-subtitle">College Content Team · Event to Post in seconds</p>
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

      <footer className="app-footer">
        Built for college content teams · Powered by GPT-4o mini
      </footer>
    </div>
  )
}
