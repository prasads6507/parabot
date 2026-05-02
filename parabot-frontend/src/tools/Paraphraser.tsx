import React, { useState } from 'react';

const API_URL = 'http://localhost:5000';
const modesList = ['fluency', 'formal', 'creative', 'expand', 'shorten', 'humanize'];

export default function Paraphraser() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [selectedModes, setSelectedModes] = useState<string[]>(['fluency']);
  const [synonymLevel, setSynonymLevel] = useState(50);
  const [grammarOnly, setGrammarOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleParaphrase = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/paraphrase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, modes: selectedModes, synonymLevel, grammarOnly }),
      });
      const data = await res.json();
      setResult(data.paraphrasedText || data.error || 'Error');
    } catch { alert('Backend not reachable.'); }
    finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const wc = (s: string) => s.trim() ? s.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-5">
      {/* ─── Controls ─── */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {modesList.map((m) => (
              <button
                key={m}
                disabled={grammarOnly}
                onClick={() => setSelectedModes((p) => p.includes(m) ? p.filter((x) => x !== m) : [...p, m])}
                className={`mode-pill ${selectedModes.includes(m) && !grammarOnly ? 'mode-pill-active' : ''}`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold" style={{ color: 'rgba(148,163,184,0.6)' }}>Grammar Only</span>
            <button
              onClick={() => setGrammarOnly(!grammarOnly)}
              className="toggle-track"
              style={{ background: grammarOnly ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(99,102,241,0.15)' }}
            >
              <div className="toggle-thumb" style={{ transform: grammarOnly ? 'translateX(20px)' : 'translateX(0)' }} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4" style={{ borderTop: '1px solid rgba(99,102,241,0.08)', paddingTop: '16px' }}>
          <div className="flex-1 flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>Synonyms</span>
            <span className="text-[10px]" style={{ color: 'rgba(148,163,184,0.3)' }}>Low</span>
            <input type="range" min="0" max="100" value={synonymLevel} disabled={grammarOnly} onChange={(e) => setSynonymLevel(+e.target.value)} className="w-full" />
            <span className="text-[10px]" style={{ color: 'rgba(148,163,184,0.3)' }}>High</span>
            <span className="text-xs font-bold text-primary-400 min-w-[32px] text-right">{synonymLevel}%</span>
          </div>
          <button
            onClick={handleParaphrase}
            disabled={loading || !text.trim() || (selectedModes.length === 0 && !grammarOnly)}
            className="glow-btn text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 min-w-[180px] disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            {loading ? (
              <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> Paraphrasing…</>
            ) : '✨ Paraphrase'}
          </button>
        </div>
      </div>

      {/* ─── Panels ─── */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <div className="flex justify-between px-1">
            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>Original Text</label>
            <span className="text-[10px] font-medium" style={{ color: 'rgba(148,163,184,0.3)' }}>{wc(text)} words · {text.length} chars</span>
          </div>
          <textarea className="textarea-panel" placeholder="Paste or type your text here…" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between px-1">
            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>Paraphrased Text</label>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-medium" style={{ color: 'rgba(148,163,184,0.3)' }}>{wc(result)} words</span>
              {result && <button onClick={copy} className="text-[11px] font-bold text-primary-400 hover:text-primary-300 transition">{copied ? '✓ Copied!' : '📋 Copy'}</button>}
            </div>
          </div>
          <textarea className="textarea-panel" style={{ background: 'rgba(99,102,241,0.03)' }} placeholder="Result will appear here…" readOnly value={result} />
        </div>
      </div>
    </div>
  );
}
