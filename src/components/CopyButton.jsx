// CopyButton — reusable copy-to-clipboard button
import { useState } from 'react'

export default function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <button
      className={`btn-copy ${copied ? 'btn-copy-done' : ''}`}
      onClick={handleCopy}
      disabled={!text}
      title={copied ? 'Copied!' : `Copy ${label}`}
    >
      {copied ? 'Copied!' : label}
    </button>
  )
}
