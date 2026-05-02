import React, { useState } from 'react';

const API_URL = 'http://localhost:5000';

interface Correction { error: string; correction: string; explanation: string; }

export default function GrammarChecker() {
  const [text, setText] = useState('');
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleCheck = async () => {
    if (!text.trim()) return;
    setLoading(true); setChecked(false);
    try {
      const res = await fetch(`${API_URL}/api/grammar-check`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const data = await res.json();
      setCorrections(data.corrections || []); setChecked(true);
    } catch (err: any) { alert(`Grammar check failed: ${err.message}`); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="glass-card p-5 flex items-center justify-between">
        <p className="text-sm" style={{ color: 'rgba(148,163,184,0.6)' }}>
          <span className="font-bold text-amber-400">Paste your text</span> and click Check to find grammar, spelling, and punctuation errors.
        </p>
        <button onClick={handleCheck} disabled={loading || !text.trim()}
          className="glow-btn text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 min-w-[180px] disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
          {loading ? (<><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> Checking…</>) : '✅ Check Grammar'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: 'rgba(148,163,184,0.4)' }}>Your Text</label>
          <textarea className="textarea-panel" placeholder="Paste your text here…" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: 'rgba(148,163,184,0.4)' }}>
            Issues Found {checked && <span className="text-amber-400 normal-case">({corrections.length})</span>}
          </label>
          <div className="glass-card p-4 min-h-[240px] overflow-y-auto max-h-[400px]">
            {!checked && !loading && <p className="text-sm text-center mt-20" style={{ color: 'rgba(148,163,184,0.3)' }}>Results will appear here…</p>}
            {checked && corrections.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-5xl mb-3">🎉</span>
                <p className="text-lg font-bold text-emerald-400">No errors found!</p>
                <p className="text-sm mt-1" style={{ color: 'rgba(148,163,184,0.4)' }}>Your text looks great.</p>
              </div>
            )}
            {corrections.map((c, i) => (
              <div key={i} className="correction-card mb-3 last:mb-0">
                <div className="flex items-start gap-3">
                  <span className="text-amber-400 text-lg mt-0.5">⚠</span>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="line-through font-medium px-2 py-0.5 rounded" style={{ color: '#fb7185', background: 'rgba(244,63,94,0.1)' }}>{c.error}</span>
                      <span style={{ color: 'rgba(148,163,184,0.3)' }}>→</span>
                      <span className="font-bold px-2 py-0.5 rounded" style={{ color: '#34d399', background: 'rgba(16,185,129,0.1)' }}>{c.correction}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.5)' }}>{c.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
