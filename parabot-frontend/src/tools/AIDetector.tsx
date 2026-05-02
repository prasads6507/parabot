import React, { useState } from 'react';

const API_URL = 'http://localhost:5000';

interface AnalysisResult { aiPercentage: number; humanPercentage: number; }

export default function AIDetector() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true); setAnalysis(null);
    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setAnalysis(await res.json());
    } catch (err: any) { alert(`Analysis failed: ${err.message}`); }
    finally { setLoading(false); }
  };

  const verdict = analysis
    ? analysis.aiPercentage >= 80 ? { label: 'Likely AI-Generated', color: '#fb7185', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.2)', icon: '🤖' }
    : analysis.aiPercentage >= 50 ? { label: 'Mixed Content', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', icon: '⚠️' }
    : { label: 'Likely Human-Written', color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', icon: '✍️' }
    : null;

  return (
    <div className="space-y-5">
      <div className="glass-card p-5 flex items-center justify-between">
        <p className="text-sm" style={{ color: 'rgba(148,163,184,0.6)' }}>
          <span className="font-bold text-rose-400">Detect AI-generated content</span> using forensic text analysis.
        </p>
        <button onClick={handleAnalyze} disabled={loading || !text.trim()}
          className="glow-btn text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 min-w-[180px] disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}>
          {loading ? (<><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> Analyzing…</>) : '🔍 Detect AI'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: 'rgba(148,163,184,0.4)' }}>Text to Analyze</label>
          <textarea className="textarea-panel" placeholder="Paste the text you want to check for AI content…" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: 'rgba(148,163,184,0.4)' }}>Detection Results</label>
          <div className="glass-card p-6 min-h-[240px] flex items-center justify-center">
            {!analysis && !loading && <p className="text-sm" style={{ color: 'rgba(148,163,184,0.3)' }}>Results will appear here…</p>}
            {analysis && verdict && (
              <div className="w-full space-y-6 fade-in">
                {/* Verdict */}
                <div className="text-center py-5 rounded-xl" style={{ background: verdict.bg, border: `1px solid ${verdict.border}` }}>
                  <span className="text-4xl block mb-2">{verdict.icon}</span>
                  <p className="text-xl font-black" style={{ color: verdict.color }}>{verdict.label}</p>
                </div>
                {/* AI Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold flex items-center gap-2" style={{ color: 'rgba(226,232,240,0.7)' }}>🤖 AI-Generated</span>
                    <span className="text-sm font-black text-rose-400">{analysis.aiPercentage}%</span>
                  </div>
                  <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(244,63,94,0.1)' }}>
                    <div className="h-full rounded-full progress-fill" style={{ width: `${analysis.aiPercentage}%`, background: 'linear-gradient(90deg, #e11d48, #fb7185)' }} />
                  </div>
                </div>
                {/* Human Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold flex items-center gap-2" style={{ color: 'rgba(226,232,240,0.7)' }}>✍️ Human-Written</span>
                    <span className="text-sm font-black text-emerald-400">{analysis.humanPercentage}%</span>
                  </div>
                  <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <div className="h-full rounded-full progress-fill" style={{ width: `${analysis.humanPercentage}%`, background: 'linear-gradient(90deg, #059669, #34d399)' }} />
                  </div>
                </div>
                <p className="text-[9px] text-center uppercase tracking-[4px] font-bold pt-2" style={{ color: 'rgba(148,163,184,0.2)' }}>Forensic Analysis by ParaBot</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
