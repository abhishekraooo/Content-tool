import React, { useState, useEffect } from 'react';

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export default function ExplorePage() {
  const [saves, setSaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/explore')
      .then(res => res.json())
      .then(data => {
        setSaves(data.saves || []);
        setLoading(false);
      })
      .catch(() => {
        setSaves([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  return (
    <div className="app">
      <div className="page-header">
        <h1>Explore Generations</h1>
      </div>

      {saves.length === 0 ? (
        <div className="empty-state">
          Nothing saved yet. Generate something and save it.
        </div>
      ) : (
        <div className="explore-grid">
          {saves.map(save => (
            <div 
              key={save.id} 
              className="explore-card" 
              onClick={() => window.location.href = `/share/${save.id}`}
            >
              <div className="explore-card-title">{save.poster?.title || 'Untitled'}</div>
              <div className="explore-card-achievement">{save.poster?.achievement}</div>
              <div className="explore-card-raw">{save.rawText}</div>
              <div className="explore-card-meta">
                <span className="mode-badge">{save.mode}</span>
                <span>{timeAgo(save.savedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="page-nav">
        <span onClick={() => window.location.href = '/'}>Back to app &rarr;</span>
      </div>
    </div>
  );
}
