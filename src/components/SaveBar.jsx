import React from 'react';
import CopyButton from './CopyButton.jsx';

export default function SaveBar({ poster, media, saveId, saving, onSave }) {
  if (!poster && !media) return null;

  const shareUrl = saveId ? `${window.location.origin}/share/${saveId}` : null;

  return (
    <div className="save-bar">
      <button 
        className="btn-generate" 
        onClick={onSave} 
        disabled={saving || !!saveId}
        style={{ width: 'auto', padding: '8px 16px', margin: 0 }}
      >
        {saving ? 'Saving...' : saveId ? 'Saved!' : 'Save & Share'}
      </button>

      {saveId && (
        <>
          <span className="save-link">{shareUrl}</span>
          <CopyButton textToCopy={shareUrl} label="Copy Link" />
          <div className="save-hint">Anyone with this link can view it</div>
        </>
      )}

      <button className="save-explore-link" onClick={() => window.location.href = '/explore'}>
        Browse all saved generations &rarr;
      </button>
    </div>
  );
}
