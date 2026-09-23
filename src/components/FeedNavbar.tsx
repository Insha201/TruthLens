import React from 'react';
import { Activity, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface FeedNavbarProps {
  onOpenAppView?: () => void;
}

export const FeedNavbar: React.FC<FeedNavbarProps> = ({ onOpenAppView }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 md:px-12 md:py-6 flex items-center justify-between backdrop-blur-md bg-[#0A0F1E]/60 border-b border-white/5 transition-all">
      {/* Brand Mark */}
      <a href="#hero" className="flex items-center gap-3.5 group cursor-pointer">
        <div className="relative flex items-center justify-center">
          <img
            src="/logo.png"
            alt="TruthLens Logo"
            className="w-9 h-9 md:w-10 md:h-10 object-contain drop-shadow-[0_0_12px_rgba(23,195,160,0.4)] group-hover:scale-105 transition-transform"
          />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#17C3A0] rounded-full animate-ping opacity-75" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#17C3A0] rounded-full" />
        </div>
        <div className="flex flex-col">
          <span className="font-editorial text-xl md:text-2xl font-bold tracking-tight text-[#F5F6FA] group-hover:text-[#17C3A0] transition-colors">
            TruthLens
          </span>
          <span className="text-[9px] font-sans-display tracking-[0.2em] text-[#9AA3B2] uppercase font-semibold">
            Agentic AI Ecosystem
          </span>
        </div>
      </a>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        {onOpenAppView && (
          <button
            onClick={onOpenAppView}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-[#17C3A0]/30 hover:border-[#17C3A0] bg-[#17C3A0]/10 hover:bg-[#17C3A0]/20 text-[#17C3A0] font-sans-display text-xs font-bold transition-all cursor-pointer shadow-sm shadow-[#17C3A0]/10"
          >
            <Activity size={14} className="animate-pulse" />
            <span>Operator Dashboard</span>
          </button>
        )}
      </div>
    </header>
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
      className="p-2 rounded-full border border-white/15 hover:border-[#17C3A0] bg-white/5 hover:bg-white/10 text-[#F5F6FA] transition-all cursor-pointer"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};
