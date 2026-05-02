import React, { useState, useEffect } from 'react';
import CopyButton from '../components/CopyButton.jsx';

export default function SharePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const id = window.location.pathname.split('/share/')[1];
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    fetch(`/api/share/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  if (error || !data) {
    return (
      <div className="empty-state">
        Generation not found. <a href="/">Go back home</a>
      </div>
    );
  }

  const { rawText, mode, poster, media, savedAt } = data;

  const posterFields = [
    { label: 'Title', value: poster?.title },
    { label: 'Name(s)', value: poster?.names || poster?.members },
    { label: 'Description', value: poster?.description },
    { label: 'Achievement', value: poster?.achievement },
    { label: 'Event', value: poster?.eventName },
    { label: 'Date', value: poster?.eventDate },
    { label: 'Venue', value: poster?.venue || poster?.location },
    { label: 'Prize', value: poster?.prize },
    { label: 'Project', value: poster?.projectName },
    { label: 'Department', value: poster?.department },
    { label: 'Institution', value: poster?.institution },
    { label: 'Highlight', value: poster?.highlightLine }
  ].filter(f => f.value && f.value.trim() !== '');

  const mediaFields = [
    { label: 'Full Caption', value: media?.fullCaption || media?.instagramCaption },
    { label: 'Short Caption', value: media?.shortCaption },
    { label: 'Story Caption', value: media?.storyCaption },
    { label: 'Hashtags', value: media?.hashtags }
  ].filter(f => f.value && f.value.trim() !== '');

  return (
    <div className="app">
      <div className="page-header">
        <h1>Saved Generation</h1>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">SOURCE EVENT</span>
            {mode && <span className="mode-badge">{mode}</span>}
          </div>
          <textarea 
            className="raw-input" 
            value={rawText} 
            readOnly 
            rows={10} 
          />
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">POSTER CONTENT</span>
          </div>
          <div className="fields-list">
            {posterFields.map((f, i) => (
              <div key={i} className="field-row">
                <div className="field-meta">
                  <span className="field-label">{f.label}</span>
                  <CopyButton textToCopy={f.value} />
                </div>
                <div className={f.value ? "field-value" : "field-value field-empty"}>
                  {f.value || 'None'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">MEDIA CAPTIONS</span>
          </div>
          <div className="captions-list">
            {mediaFields.map((f, i) => (
              <div key={i} className="caption-block">
                <div className="field-meta">
                  <span className="field-label">{f.label}</span>
                  <CopyButton textToCopy={f.value} />
                </div>
                <div className={f.value ? "caption-value" : "caption-value field-empty"}>
                  {f.value || 'None'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>
        Saved on: {new Date(savedAt).toLocaleString()}
      </div>

      <div className="page-nav">
        <span onClick={() => window.location.href = '/'}>Generate your own &rarr;</span>
        <span onClick={() => window.location.href = '/explore'}>Browse all &rarr;</span>
      </div>
    </div>
  );
}
