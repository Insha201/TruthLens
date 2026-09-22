import React, { useState } from 'react';
import { MainAppPage, SystemMetrics } from '../types';
import { Activity, Download, FileText, GitBranch, Loader2, Menu, Moon, Play, Search, Sun, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activePage: MainAppPage;
  setActivePage: (p: MainAppPage) => void;
  metrics: SystemMetrics;
  onOpenIngestModal?: () => void;
  onPullLive?: () => void;
  isProcessing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  metrics,
  onOpenIngestModal,
  onPullLive,
  isProcessing,
}) => {
  const [open, setOpen] = useState(false);
  const tabs: Array<{ id: MainAppPage; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'live_claims', label: 'Live Claims', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'investigation', label: 'Investigation', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'spread_intelligence', label: 'Spread', icon: <GitBranch className="w-3.5 h-3.5" /> },
    { id: 'evidence_review', label: 'Evidence', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'counter_narrative', label: 'Counter-Narrative', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <nav className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          <button className="flex items-center gap-3 group" onClick={() => setActivePage('home')}>
            <div className="relative flex items-center justify-center">
              <img
                src="/logo.png"
                alt="TruthLens Logo"
                className="w-9 h-9 md:w-10 md:h-10 object-contain drop-shadow-[0_0_12px_rgba(23,195,160,0.4)] group-hover:scale-105 transition-transform"
              />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#17C3A0] rounded-full animate-ping opacity-75" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#17C3A0] rounded-full" />
            </div>
            <div className="text-left flex flex-col">
              <span className="font-editorial text-xl md:text-2xl font-bold tracking-tight text-[#F5F6FA] group-hover:text-[#17C3A0] transition-colors leading-none">
                TruthLens
              </span>
              <span className="text-[9px] font-sans-display tracking-[0.2em] text-[#9AA3B2] uppercase font-semibold mt-1">
                Agentic AI Ecosystem
              </span>
            </div>
          </button>

          <div className="hidden xl:flex items-center gap-1 flex-1 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePage(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold tracking-[0.12em] uppercase transition-all ${
                  activePage === tab.id
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block text-[10px] font-mono text-slate-500 mr-1">
              Queue {metrics.gatedReviewQueueLength}
            </div>
            <ThemeToggle />
            <button
              onClick={onPullLive}
              disabled={isProcessing}
              title="Fetch fresh posts from NewsAPI, YouTube and RSS, then run the pipeline"
              className="flex items-center gap-2 px-3 py-2 rounded-md font-bold text-[10px] tracking-[0.14em] uppercase border border-emerald-400/50 text-emerald-300 hover:bg-emerald-400 hover:text-slate-950 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Download className="w-3 h-3" />
              )}
              {isProcessing ? 'Pulling' : 'Pull live'}
            </button>
            <button
              onClick={onOpenIngestModal}
              disabled={isProcessing}
              className="flex items-center gap-2 px-3 py-2 rounded-md font-bold text-[10px] tracking-[0.14em] uppercase border border-cyan-400/50 text-cyan-300 hover:bg-cyan-400 hover:text-slate-950 transition-all disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              Inject signal
            </button>
            <button className="xl:hidden p-2 text-slate-300" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="xl:hidden pb-3 grid grid-cols-2 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActivePage(tab.id);
                  setOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-md text-xs ${
                  activePage === tab.id ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

/** Dark <-> light switch. Reads and writes the existing ThemeProvider. */
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 rounded-md text-slate-400 hover:text-cyan-300 border border-transparent hover:border-cyan-500/40 transition-all"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};
