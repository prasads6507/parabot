import React, { useState } from 'react';

const API = 'http://localhost:5000';
interface Result { aiPercentage: number; humanPercentage: number; }

export default function AIDetector() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const go = async () => {
    if (!text.trim()) return;
    setLoading(true); setAnalysis(null);
    try {
      const r = await fetch(`${API}/api/analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      setAnalysis(await r.json());
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  const verdict = analysis
    ? analysis.aiPercentage >= 80
      ? { label: 'Likely AI-Generated', color: '#e11d48', bg: '#fff1f2', icon: '🤖' }
      : analysis.aiPercentage >= 50
        ? { label: 'Mixed Content', color: '#d97706', bg: '#fffbeb', icon: '⚠️' }
        : { label: 'Likely Human-Written', color: '#059669', bg: '#ecfdf5', icon: '✍️' }
    : null;

  return (
    <div className="space-y-6">
      <div className="apple-card p-6 flex items-center justify-between">
        <p className="text-[14px] text-[#86868b]">Detect AI-generated content using forensic text analysis.</p>
        <button onClick={go} disabled={loading || !text.trim()} className="apple-btn apple-btn-primary min-w-[180px]">
          {loading ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Analyzing…</>) : 'Detect AI'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <span className="section-label px-1">Text to Analyze</span>
          <textarea className="textarea-panel" placeholder="Paste text to check…" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="space-y-3">
          <span className="section-label px-1">Results</span>
          <div className="apple-card p-8 min-h-[220px] flex items-center justify-center">
            {!analysis && !loading && <p className="text-[14px] text-[#aeaeb2]">Results appear here…</p>}
            {analysis && verdict && (
              <div className="w-full space-y-6 fade-in">
                {/* Verdict */}
                <div className="text-center py-6 rounded-2xl" style={{ background: verdict.bg }}>
                  <span className="text-4xl block mb-2">{verdict.icon}</span>
                  <p className="text-[20px] font-bold" style={{ color: verdict.color }}>{verdict.label}</p>
                </div>
                {/* AI */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">🤖 AI-Generated</span>
                    <span className="text-[13px] font-bold text-rose-600">{analysis.aiPercentage}%</span>
                  </div>
                  <div className="w-full rounded-full h-[6px] overflow-hidden" style={{ background: '#fce7f3' }}>
                    <div className="h-full rounded-full progress-fill" style={{ width: `${analysis.aiPercentage}%`, background: '#e11d48' }} />
                  </div>
                </div>
                {/* Human */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">✍️ Human-Written</span>
                    <span className="text-[13px] font-bold text-emerald-600">{analysis.humanPercentage}%</span>
                  </div>
                  <div className="w-full rounded-full h-[6px] overflow-hidden" style={{ background: '#d1fae5' }}>
                    <div className="h-full rounded-full progress-fill" style={{ width: `${analysis.humanPercentage}%`, background: '#059669' }} />
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
