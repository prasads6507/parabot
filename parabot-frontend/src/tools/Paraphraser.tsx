import { useState } from 'react';

import API from '../config';

const modes = ['fluency', 'formal', 'creative', 'expand', 'shorten', 'humanize'];

export default function Paraphraser() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [selected, setSelected] = useState<string[]>(['fluency']);
  const [synonymLevel, setSynonymLevel] = useState(50);
  const [grammarOnly, setGrammarOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const go = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/paraphrase`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, modes: selected, synonymLevel, grammarOnly }),
      });
      const d = await r.json();
      setResult(d.paraphrasedText || d.error || 'Error');
    } catch { alert('Cannot reach server.'); }
    finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const wc = (s: string) => s.trim() ? s.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6">
      {/* ─ Controls ─ */}
      <div className="apple-card p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Mode pills */}
          <div className="flex flex-wrap gap-1 p-1 rounded-full" style={{ background: '#f5f5f7' }}>
            {modes.map((m) => (
              <button key={m} disabled={grammarOnly}
                onClick={() => setSelected((p) => p.includes(m) ? p.filter((x) => x !== m) : [...p, m])}
                className={`apple-pill ${selected.includes(m) && !grammarOnly ? 'apple-pill-active' : ''}`}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* Grammar toggle */}
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-[#86868b]">Grammar Only</span>
            <button onClick={() => setGrammarOnly(!grammarOnly)} className="apple-toggle"
              style={{ background: grammarOnly ? '#1d1d1f' : '#e8e8ed' }}>
              <div className="apple-toggle-thumb" style={{ transform: grammarOnly ? 'translateX(18px)' : 'translateX(0)' }} />
            </button>
          </div>
        </div>

        {/* Slider + Action */}
        <div className="flex flex-col md:flex-row md:items-center gap-5" style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)', paddingTop: '20px' }}>
          <div className="flex-1 flex items-center gap-4">
            <span className="text-[12px] font-semibold text-[#86868b] whitespace-nowrap">Synonyms</span>
            <span className="text-[11px] text-[#aeaeb2]">Low</span>
            <input type="range" min="0" max="100" value={synonymLevel} disabled={grammarOnly}
              onChange={(e) => setSynonymLevel(+e.target.value)} className="w-full" />
            <span className="text-[11px] text-[#aeaeb2]">High</span>
            <span className="text-[13px] font-bold text-[#1d1d1f] min-w-[36px] text-right">{synonymLevel}%</span>
          </div>
          <button onClick={go} disabled={loading || !text.trim() || (selected.length === 0 && !grammarOnly)}
            className="apple-btn apple-btn-primary min-w-[180px]">
            {loading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Paraphrasing…</>
            ) : 'Paraphrase'}
          </button>
        </div>
      </div>

      {/* ─ Panels ─ */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div className="flex justify-between px-1">
            <span className="section-label">Original</span>
            <span className="text-[11px] text-[#aeaeb2]">{wc(text)} words · {text.length} chars</span>
          </div>
          <textarea className="textarea-panel" placeholder="Paste or type your text here…" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between px-1">
            <span className="section-label">Result</span>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#aeaeb2]">{wc(result)} words</span>
              {result && (
                <button onClick={copy} className="text-[12px] font-semibold text-[#4f56ff] hover:text-[#3b40e8] transition-colors">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>
          <textarea className="textarea-panel" style={{ background: '#ffffff' }} placeholder="Result will appear here…" readOnly value={result} />
        </div>
      </div>
    </div>
  );
}
