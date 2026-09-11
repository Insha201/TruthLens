import React, { useState } from 'react';
import { MainAppPage, SystemMetrics } from '../types';
import { Activity, Cpu, FileText, GitBranch, Menu, Play, Search, ShieldAlert, X } from 'lucide-react';

interface NavbarProps {
  activePage: MainAppPage;
  setActivePage: (p: MainAppPage) => void;
  metrics: SystemMetrics;
  onOpenIngestModal?: () => void;
  isProcessing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  metrics,
  onOpenIngestModal,
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
            <div className="w-10 h-10 rounded-lg bg-[#1c140a] border border-cyan-400/50 flex items-center justify-center shadow-[0_0_18px_rgba(212,165,76,0.22)]">
              <ShieldAlert className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-[13px] tracking-[0.14em] text-slate-100 uppercase leading-none">
                Misinfo Containment
              </div>
              <div className="text-[10px] text-cyan-400/80 tracking-[0.18em] uppercase mt-1 font-medium">
                Multi-agent intelligence
              </div>
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
