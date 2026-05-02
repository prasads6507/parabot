import { useState } from 'react';
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
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl" style={{ borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div className="max-w-[1120px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1d1d1f' }}>
              <span className="text-white font-extrabold text-sm">P</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[17px] font-bold text-[#1d1d1f] tracking-tight leading-tight">ParaBot</span>
              <span className="text-[10px] font-medium text-[#86868b] leading-tight">parabot.ai</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[6px] h-[6px] rounded-full bg-emerald-500"></div>
            <span className="text-[11px] font-medium text-[#86868b]">Online</span>
          </div>
        </div>
      </header>

      {/* ═══ NAVIGATION ═══ */}
      <nav className="sticky top-[54px] z-40 bg-white/70 backdrop-blur-xl" style={{ borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-2" style={{ scrollbarWidth: 'none' }}>
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`nav-tab ${activeTool === tool.id ? 'nav-tab-active' : ''}`}
              >
                <span className="text-sm">{tool.icon}</span>
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ═══ CONTENT ═══ */}
      <main className="max-w-[1120px] mx-auto px-6 py-8">
        <div className="fade-in" key={activeTool}>
          {renderTool()}
        </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="text-center py-8">
        <p className="text-[11px] font-medium text-[#d1d1d6] tracking-widest uppercase">
          ParaBot &mdash; parabot.ai
        </p>
      </footer>
    </div>
  );
}

export default App;
