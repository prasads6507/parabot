import React, { useState } from 'react';

const API_URL = 'http://localhost:5000';

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

  const handleDetect = async () => {
    if (!text.trim()) return;
    setLoading(true); setTone(null);
    try {
      const res = await fetch(`${API_URL}/api/tone`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setTone(await res.json());
    } catch (err: any) { alert(`Tone detection failed: ${err.message}`); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="glass-card p-5 flex items-center justify-between">
        <p className="text-sm" style={{ color: 'rgba(148,163,184,0.6)' }}>
          <span className="font-bold text-cyan-400">Analyze the emotional tone</span> of your writing.
        </p>
        <button onClick={handleDetect} disabled={loading || !text.trim()}
          className="glow-btn text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 min-w-[180px] disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #0891b2, #06b6d4)' }}>
          {loading ? (<><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> Detecting…</>) : '🎭 Detect Tone'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: 'rgba(148,163,184,0.4)' }}>Your Text</label>
          <textarea className="textarea-panel" placeholder="Paste your text here to analyze its tone…" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: 'rgba(148,163,184,0.4)' }}>Tone Analysis</label>
          <div className="glass-card p-6 min-h-[240px] flex items-center justify-center">
            {!tone && !loading && <p className="text-sm" style={{ color: 'rgba(148,163,184,0.3)' }}>Results will appear here…</p>}
            {tone && (
              <div className="w-full space-y-6 fade-in">
                {/* Primary */}
                <div className="text-center">
                  <span className="text-5xl block mb-3">{toneEmojis[tone.primary] || '🎭'}</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(148,163,184,0.4)' }}>Primary Tone</p>
                  <p className="text-2xl font-black text-white">{tone.primary}</p>
                </div>
                {/* Secondary */}
                <div className="text-center py-4 rounded-xl" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.1)' }}>
                  <span className="text-2xl">{toneEmojis[tone.secondary] || '🎭'}</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(148,163,184,0.4)' }}>Secondary Tone</p>
                  <p className="text-lg font-bold text-cyan-300">{tone.secondary}</p>
                </div>
                {/* Confidence */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>
                    <span>Confidence</span>
                    <span className="text-cyan-400">{tone.confidence}%</span>
                  </div>
                  <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(6,182,212,0.1)' }}>
                    <div className="h-full rounded-full progress-fill" style={{ width: `${tone.confidence}%`, background: 'linear-gradient(90deg, #06b6d4, #22d3ee)' }} />
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
