import { useState } from 'react';

import API from '../config';


export default function CitationGenerator() {
  const [text, setText] = useState('');
  const [style, setStyle] = useState('APA');
  const [citation, setCitation] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const go = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/cite`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, style }),
      });
      const d = await r.json();
      setCitation(d.citation || d.error || 'Error');
    } catch { alert('Cannot reach server.'); }
    finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(citation); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="space-y-6">
      <div className="apple-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="section-label">Format</span>
          <div className="flex gap-1 p-1 rounded-full" style={{ background: '#f5f5f7' }}>
            {['APA', 'MLA', 'Chicago'].map((s) => (
              <button key={s} onClick={() => setStyle(s)}
                className={`apple-pill ${style === s ? 'apple-pill-active' : ''}`}>{s}</button>
            ))}
          </div>
        </div>
        <button onClick={go} disabled={loading || !text.trim()} className="apple-btn apple-btn-primary min-w-[180px]">
          {loading ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Generating…</>) : 'Generate Citation'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <span className="section-label px-1">Source Description</span>
          <textarea className="textarea-panel" placeholder="Describe the source (title, author, year, publisher)…" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between px-1">
            <span className="section-label">Citation — {style}</span>
            {citation && <button onClick={copy} className="text-[12px] font-semibold text-[#4f56ff] hover:text-[#3b40e8] transition-colors">{copied ? '✓ Copied' : 'Copy'}</button>}
          </div>
          <div className="apple-card p-8 min-h-[220px] flex items-center justify-center">
            {citation ? (
              <p className="text-[15px] leading-relaxed text-[#1d1d1f]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{citation}</p>
            ) : (
              <p className="text-[14px] text-[#aeaeb2]">Your citation will appear here…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
