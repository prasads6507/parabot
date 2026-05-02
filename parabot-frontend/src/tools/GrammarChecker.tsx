import { useState } from 'react';

import API from '../config';

interface Correction { error: string; correction: string; explanation: string; }

export default function GrammarChecker() {
  const [text, setText] = useState('');
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const go = async () => {
    if (!text.trim()) return;
    setLoading(true); setChecked(false);
    try {
      const r = await fetch(`${API}/api/grammar-check`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      const d = await r.json();
      setCorrections(d.corrections || []); setChecked(true);
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="apple-card p-6 flex items-center justify-between">
        <p className="text-[14px] text-[#86868b]">Paste your text to check for grammar, spelling, and punctuation errors.</p>
        <button onClick={go} disabled={loading || !text.trim()} className="apple-btn apple-btn-primary min-w-[180px]">
          {loading ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Checking…</>) : 'Check Grammar'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <span className="section-label px-1">Your Text</span>
          <textarea className="textarea-panel" placeholder="Paste text here…" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between px-1">
            <span className="section-label">Issues</span>
            {checked && <span className="text-[12px] font-bold text-[#1d1d1f]">{corrections.length} found</span>}
          </div>
          <div className="apple-card p-5 min-h-[220px] overflow-y-auto max-h-[380px]">
            {!checked && !loading && <p className="text-[14px] text-[#aeaeb2] text-center mt-20">Results appear here…</p>}
            {checked && corrections.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <span className="text-5xl mb-4">✨</span>
                <p className="text-[17px] font-bold text-[#1d1d1f]">Perfect!</p>
                <p className="text-[13px] text-[#86868b] mt-1">No errors found in your text.</p>
              </div>
            )}
            <div className="space-y-3">
              {corrections.map((c, i) => (
                <div key={i} className="correction-item">
                  <div className="flex items-start gap-3">
                    <span className="text-amber-500 text-sm mt-0.5">●</span>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-[13px]">
                        <span className="line-through text-rose-500 font-medium bg-rose-50 px-2 py-0.5 rounded-md">{c.error}</span>
                        <span className="text-[#aeaeb2]">→</span>
                        <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{c.correction}</span>
                      </div>
                      <p className="text-[12px] text-[#86868b] leading-relaxed">{c.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
