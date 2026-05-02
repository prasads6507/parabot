import React, { useState } from 'react';
import Paraphraser from './tools/Paraphraser';
import Summarizer from './tools/Summarizer';
import GrammarChecker from './tools/GrammarChecker';
import CitationGenerator from './tools/CitationGenerator';
import ToneDetector from './tools/ToneDetector';
import AIDetector from './tools/AIDetector';

const tools = [
  { id: 'paraphraser', label: 'Paraphraser', icon: '✍️' },
  { id: 'summarizer', label: 'Summarizer', icon: '📝' },
  { id: 'grammar', label: 'Grammar', icon: '✅' },
  { id: 'citation', label: 'Citations', icon: '📚' },
  { id: 'tone', label: 'Tone', icon: '🎭' },
  { id: 'ai-detect', label: 'AI Detect', icon: '🤖' },
];

function App() {
  const [activeTool, setActiveTool] = useState('paraphraser');

  const renderTool = () => {
    switch (activeTool) {
      case 'paraphraser': return <Paraphraser />;
      case 'summarizer': return <Summarizer />;
      case 'grammar': return <GrammarChecker />;
      case 'citation': return <CitationGenerator />;
      case 'tone': return <ToneDetector />;
      case 'ai-detect': return <AIDetector />;
      default: return <Paraphraser />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* ═══ HEADER ═══ */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(10, 14, 26, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99, 102, 241, 0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              <span className="text-white font-black text-lg">P</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none">ParaBot</h1>
              <p className="text-[9px] font-bold uppercase tracking-[3px]" style={{ color: 'rgba(168, 85, 247, 0.7)' }}>AI Writing Suite</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-medium" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>Powered by Groq · Llama 3.1</span>
          </div>
        </div>
      </header>

      {/* ═══ NAVIGATION ═══ */}
      <nav className="sticky top-[56px] z-40" style={{ background: 'rgba(10, 14, 26, 0.6)', backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(99, 102, 241, 0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-1 overflow-x-auto py-2.5" style={{ scrollbarWidth: 'none' }}>
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`nav-tab ${activeTool === tool.id ? 'nav-tab-active' : ''}`}
              >
                <span className="text-base">{tool.icon}</span>
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ═══ CONTENT ═══ */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="fade-in" key={activeTool}>
          {renderTool()}
        </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="text-center py-6 mt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[4px]" style={{ color: 'rgba(148, 163, 184, 0.25)' }}>
          Built with ♥ using Groq AI
        </p>
      </footer>
    </div>
  );
}

export default App;
