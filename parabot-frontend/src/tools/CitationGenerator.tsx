import React, { useState } from 'react';

const API_URL = 'http://localhost:5000';

export default function CitationGenerator() {
  const [text, setText] = useState('');
  const [style, setStyle] = useState('APA');
  const [citation, setCitation] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cite`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, style }),
      });
      const data = await res.json();
      setCitation(data.citation || data.error || 'Error');
    } catch { alert('Backend not reachable.'); }
    finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(citation); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="space-y-5">
      <div className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>Citation Style</span>
          <div className="flex gap-2">
            {['APA', 'MLA', 'Chicago'].map((s) => (
              <button key={s} onClick={() => setStyle(s)}
                className={`mode-pill ${style === s ? 'mode-pill-active' : ''}`}
                style={style === s ? { background: 'linear-gradient(135deg, #7c3aed, #a855f7)' } : {}}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading || !text.trim()}
          className="glow-btn text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 min-w-[180px] disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
          {loading ? (<><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> Generating…</>) : '📚 Generate Citation'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: 'rgba(148,163,184,0.4)' }}>Source Text or Description</label>
          <textarea className="textarea-panel" placeholder="Paste the source text or describe the work (title, author, year, publisher)…" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between px-1">
            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>Generated Citation ({style})</label>
            {citation && <button onClick={copy} className="text-[11px] font-bold text-violet-400 hover:text-violet-300 transition">{copied ? '✓ Copied!' : '📋 Copy'}</button>}
          </div>
          <div className="glass-card p-6 min-h-[240px] flex items-center justify-center pulse-glow">
            {citation ? (
              <p className="text-base leading-relaxed italic" style={{ color: 'rgba(196, 181, 253, 0.9)', fontFamily: 'Georgia, serif' }}>{citation}</p>
            ) : (
              <p className="text-sm text-center" style={{ color: 'rgba(148,163,184,0.3)' }}>Your citation will appear here…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
