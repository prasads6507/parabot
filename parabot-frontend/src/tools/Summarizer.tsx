import React, { useState } from 'react';

const API = 'http://localhost:5000';

export default function Summarizer() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [mode, setMode] = useState('paragraph');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const go = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/summarize`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode }),
      });
      const d = await r.json();
      setSummary(d.summary || d.error || 'Error');
    } catch { alert('Cannot reach server.'); }
    finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(summary); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const wc = (s: string) => s.trim() ? s.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6">
      <div className="apple-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="section-label">Style</span>
          <div className="flex gap-1 p-1 rounded-full" style={{ background: '#f5f5f7' }}>
            {['paragraph', 'keypoints'].map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`apple-pill ${mode === m ? 'apple-pill-active' : ''}`}>
                {m === 'paragraph' ? 'Paragraph' : 'Key Points'}
              </button>
            ))}
          </div>
        </div>
        <button onClick={go} disabled={loading || !text.trim()} className="apple-btn apple-btn-primary min-w-[180px]">
          {loading ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Summarizing…</>) : 'Summarize'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div className="flex justify-between px-1">
            <span className="section-label">Original</span>
            <span className="text-[11px] text-[#aeaeb2]">{wc(text)} words</span>
          </div>
          <textarea className="textarea-panel" placeholder="Paste text to summarize…" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between px-1">
            <span className="section-label">Summary</span>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#aeaeb2]">{wc(summary)} words</span>
              {summary && <button onClick={copy} className="text-[12px] font-semibold text-[#4f56ff] hover:text-[#3b40e8] transition-colors">{copied ? '✓ Copied' : 'Copy'}</button>}
            </div>
          </div>
          <textarea className="textarea-panel" style={{ background: '#ffffff' }} placeholder="Summary appears here…" readOnly value={summary} />
        </div>
      </div>
    </div>
  );
}
