import React, { useState } from 'react';

const API_URL = 'http://localhost:5000';

export default function Summarizer() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [mode, setMode] = useState('paragraph');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode }),
      });
      const data = await res.json();
      setSummary(data.summary || data.error || 'Error');
    } catch { alert('Backend not reachable.'); }
    finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(summary); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const wc = (s: string) => s.trim() ? s.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-5">
      <div className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>Summary Style</span>
          <div className="flex gap-2">
            {['paragraph', 'keypoints'].map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`mode-pill ${mode === m ? 'mode-pill-active' : ''}`}
                style={mode === m ? { background: 'linear-gradient(135deg, #059669, #10b981)' } : {}}>
                {m === 'paragraph' ? '📄 Paragraph' : '📌 Key Points'}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleSummarize} disabled={loading || !text.trim()}
          className="glow-btn text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 min-w-[180px] disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
          {loading ? (<><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> Summarizing…</>) : '📝 Summarize'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <div className="flex justify-between px-1">
            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>Original Text</label>
            <span className="text-[10px]" style={{ color: 'rgba(148,163,184,0.3)' }}>{wc(text)} words</span>
          </div>
          <textarea className="textarea-panel" placeholder="Paste the text you want to summarize…" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between px-1">
            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>Summary</label>
            <div className="flex items-center gap-3">
              <span className="text-[10px]" style={{ color: 'rgba(148,163,184,0.3)' }}>{wc(summary)} words</span>
              {summary && <button onClick={copy} className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition">{copied ? '✓ Copied!' : '📋 Copy'}</button>}
            </div>
          </div>
          <textarea className="textarea-panel" style={{ background: 'rgba(16,185,129,0.03)' }} placeholder="Summary will appear here…" readOnly value={summary} />
        </div>
      </div>
    </div>
  );
}
