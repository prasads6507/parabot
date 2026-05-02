import { useState } from 'react';

import API from '../config';

interface ToneResult { primary: string; secondary: string; confidence: number; }

const toneEmojis: Record<string, string> = {
  Formal: '🎩', Informal: '👋', Joyful: '😄', Sad: '😢', Optimistic: '☀️',
  Pessimistic: '🌧️', Assertive: '💪', Aggressive: '🔥', Confident: '😎',
  Insecure: '😰', Friendly: '🤝', Hostile: '⚔️', Humorous: '😂',
  Serious: '🧐', Sarcastic: '😏', Empathetic: '💖', Neutral: '😐',
};

export default function ToneDetector() {
  const [text, setText] = useState('');
  const [tone, setTone] = useState<ToneResult | null>(null);
  const [loading, setLoading] = useState(false);

  const go = async () => {
    if (!text.trim()) return;
    setLoading(true); setTone(null);
    try {
      const r = await fetch(`${API}/api/tone`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      setTone(await r.json());
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="apple-card p-6 flex items-center justify-between">
        <p className="text-[14px] text-[#86868b]">Analyze the emotional tone of your writing.</p>
        <button onClick={go} disabled={loading || !text.trim()} className="apple-btn apple-btn-primary min-w-[180px]">
          {loading ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Detecting…</>) : 'Detect Tone'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <span className="section-label px-1">Your Text</span>
          <textarea className="textarea-panel" placeholder="Paste text to analyze…" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="space-y-3">
          <span className="section-label px-1">Analysis</span>
          <div className="apple-card p-8 min-h-[220px] flex items-center justify-center">
            {!tone && !loading && <p className="text-[14px] text-[#aeaeb2]">Results appear here…</p>}
            {tone && (
              <div className="w-full space-y-6 fade-in">
                {/* Primary */}
                <div className="text-center">
                  <span className="text-5xl block mb-3">{toneEmojis[tone.primary] || '🎭'}</span>
                  <p className="section-label mb-1">Primary Tone</p>
                  <p className="text-[24px] font-bold text-[#1d1d1f] tracking-tight">{tone.primary}</p>
                </div>
                {/* Secondary */}
                <div className="text-center py-4 rounded-2xl" style={{ background: '#f5f5f7' }}>
                  <span className="text-2xl">{toneEmojis[tone.secondary] || '🎭'}</span>
                  <p className="section-label mt-1">Secondary</p>
                  <p className="text-[17px] font-bold text-[#1d1d1f]">{tone.secondary}</p>
                </div>
                {/* Confidence */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="section-label">Confidence</span>
                    <span className="text-[13px] font-bold text-[#1d1d1f]">{tone.confidence}%</span>
                  </div>
                  <div className="w-full rounded-full h-[6px] overflow-hidden" style={{ background: '#e8e8ed' }}>
                    <div className="h-full rounded-full progress-fill" style={{ width: `${tone.confidence}%`, background: '#1d1d1f' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
