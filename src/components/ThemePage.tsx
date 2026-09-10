import React, { useState } from 'react';
import { 
  Palette, 
  Sun, 
  Moon, 
  Zap, 
  Sparkles, 
  Check, 
  Play, 
  Layers, 
  GitMerge, 
  ShieldAlert, 
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { UITransitionMode, CascadeTransitionMechanism } from '../types';
import { CASCADE_TRANSITION_TYPES, PIPELINE_STAGE_TRANSITIONS } from '../data/transitionTypesData';
import { motion, AnimatePresence } from 'motion/react';

interface ThemePageProps {
  onNavigateToHome: () => void;
  onNavigateToFeatures: () => void;
}

export const ThemePage: React.FC<ThemePageProps> = ({
  onNavigateToHome,
  onNavigateToFeatures,
}) => {
  const { theme, toggleTheme, setTheme, uiTransition, setUITransition } = useTheme();
  const [testTransitionKey, setTestTransitionKey] = useState(0);
  const [selectedVectorId, setSelectedVectorId] = useState<CascadeTransitionMechanism>('coordinated_bot_burst');
  const [vectorFilter, setVectorFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'appearance' | 'vectors' | 'stages'>('appearance');

  const selectedVector = CASCADE_TRANSITION_TYPES.find((v) => v.id === selectedVectorId) || CASCADE_TRANSITION_TYPES[0];

  const filteredVectors = CASCADE_TRANSITION_TYPES.filter((v) => {
    if (vectorFilter === 'all') return true;
    return v.category === vectorFilter;
  });

  const transitionModes: Array<{
    id: UITransitionMode;
    name: string;
    description: string;
    physics: string;
    icon: string;
    badge: string;
  }> = [
    {
      id: 'kinetic',
      name: 'Kinetic Slide (Spring)',
      description: 'Dynamic horizontal slide with physics-based spring damping for an agile, fluid feel.',
      physics: 'Spring: stiffness 280, damping 26',
      icon: '⚡',
      badge: 'Default Agility',
    },
    {
      id: 'smooth',
      name: 'Smooth Zoom & Fade',
      description: 'Soft scale-up elevation with gentle cubic-bezier easing and subtle opacity fade.',
      physics: 'Cubic-Bezier: [0.16, 1, 0.3, 1]',
      icon: '✨',
      badge: 'Elegant Easing',
    },
    {
      id: 'cyber',
      name: 'Cyber Scanline Pulse',
      description: 'High-tech telemetry snap with vertical translation and brightness flash.',
      physics: 'Scan pulse + 20px snap',
      icon: '🛰️',
      badge: 'Cyber Command',
    },
    {
      id: 'discrete',
      name: 'Discrete Minimal (Fast)',
      description: 'Ultra-fast clean opacity fade with zero parallax displacement, ideal for reduced motion.',
      physics: 'Instant 150ms crossfade',
      icon: '🎯',
      badge: 'Zero Latency',
    },
  ];

  // Helper to trigger test animation
  const handleTriggerTestAnimation = () => {
    setTestTransitionKey((prev) => prev + 1);
  };

  // Demo animation variants matching the selected mode
  const getDemoVariants = () => {
    switch (uiTransition) {
      case 'smooth':
        return {
          initial: { opacity: 0, scale: 0.94 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.05 },
          transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        };
      case 'cyber':
        return {
          initial: { opacity: 0, y: 15, filter: 'brightness(1.5)' },
          animate: { opacity: 1, y: 0, filter: 'brightness(1)' },
          exit: { opacity: 0, y: -15, filter: 'brightness(0.6)' },
          transition: { duration: 0.28, ease: 'easeOut' },
        };
      case 'discrete':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.15 },
        };
      case 'kinetic':
      default:
        return {
          initial: { opacity: 0, x: 25 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -25 },
          transition: { type: 'spring', stiffness: 280, damping: 26 },
        };
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-slate-300 dark:border-slate-700">
              <Palette className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Theme & Transition Configuration Center
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Control the visual appearance (Light / Dark mode), customize animated page transition physics, 
            and inspect real-world viral propagation vector mechanisms.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onNavigateToHome}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm sm:text-base border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          >
            ← Back to Home
          </button>
          <button
            onClick={onNavigateToFeatures}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm sm:text-base shadow-md transition-colors cursor-pointer"
          >
            <span>Open Features</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
            activeTab === 'appearance'
              ? 'bg-cyan-600 text-white shadow'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>1. Appearance & Page Transitions</span>
        </button>

        <button
          onClick={() => setActiveTab('vectors')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
            activeTab === 'vectors'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <GitMerge className="w-4 h-4" />
          <span>2. Cascade Propagation Vectors (8 Types)</span>
        </button>

        <button
          onClick={() => setActiveTab('stages')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
            activeTab === 'stages'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. 90s SLA Stage Transitions</span>
        </button>
      </div>

      {/* TAB 1: APPEARANCE & PAGE TRANSITIONS */}
      {activeTab === 'appearance' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* SECTION 1: THEME SELECTOR ("Theme waala part") */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md transition-colors space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-500" />
                  <span>Color Theme Mode</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your interface theme. High contrast and accessibility compliant.
                </p>
              </div>

              <div className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                Active: <span className="text-cyan-600 dark:text-cyan-400 uppercase">{theme} Mode</span>
              </div>
            </div>

            {/* Theme Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dark Mode Card */}
              <div
                id="btn-select-dark-theme"
                onClick={() => setTheme('dark')}
                className={`cursor-pointer rounded-xl p-5 border transition-all text-left relative overflow-hidden group ${
                  theme === 'dark'
                    ? 'border-cyan-500 ring-2 ring-cyan-500/40 bg-[#090d16] text-white shadow-xl'
                    : 'border-slate-300 dark:border-slate-800 bg-[#090d16] text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        Cyber Command Dark
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Canvas: #090d16 • Cyan Telemetry
                      </p>
                    </div>
                  </div>

                  {theme === 'dark' && (
                    <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black shadow">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Dark Theme Mock Preview Widget */}
                <div className="mt-4 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>90s SLA Engine</span>
                    <span className="text-emerald-400">83.5s latency</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 w-3/4 rounded-full" />
                  </div>
                  <div className="flex items-center space-x-2 pt-1 text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">Critical</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">Bot Swarm</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-3">
                  Optimal for high-density operation rooms, incident rooms, and prolonged eye safety.
                </p>
              </div>

              {/* Light Mode Card */}
              <div
                id="btn-select-light-theme"
                onClick={() => setTheme('light')}
                className={`cursor-pointer rounded-xl p-5 border transition-all text-left relative overflow-hidden group ${
                  theme === 'light'
                    ? 'border-cyan-600 ring-2 ring-cyan-600/40 bg-white text-slate-900 shadow-xl'
                    : 'border-slate-300 dark:border-slate-800 bg-slate-50 text-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        Daylight High-Contrast
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Canvas: Slate-100 • High Readability
                      </p>
                    </div>
                  </div>

                  {theme === 'light' && (
                    <span className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-black shadow">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Light Theme Mock Preview Widget */}
                <div className="mt-4 p-3 rounded-lg bg-white border border-slate-200 text-xs font-mono space-y-2 text-slate-900">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>90s SLA Engine</span>
                    <span className="text-emerald-600 font-bold">83.5s latency</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-600 w-3/4 rounded-full" />
                  </div>
                  <div className="flex items-center space-x-2 pt-1 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-300 font-bold">Critical</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold">Bot Swarm</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3">
                  Optimal for high-ambient lighting environments, executive presentations, and public briefings.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: PAGE TRANSITIONS CONTROLLER */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md transition-colors space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>Page Switching Transition Types</span>
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Choose the animation physics that execute when switching between Home, Features, and Theme pages.
                </p>
              </div>

              <button
                id="btn-test-transition-now"
                onClick={handleTriggerTestAnimation}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-sm font-mono font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Re-Play Transition Demo</span>
              </button>
            </div>

            {/* Transition Mode Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {transitionModes.map((mode) => {
                const isSelected = uiTransition === mode.id;
                return (
                  <div
                    key={mode.id}
                    id={`btn-select-transition-${mode.id}`}
                    onClick={() => setUITransition(mode.id)}
                    className={`cursor-pointer p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-500 ring-2 ring-cyan-500/30 bg-cyan-50/40 dark:bg-slate-950 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg">{mode.icon}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isSelected
                            ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {mode.badge}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {mode.name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {mode.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {mode.physics}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Interactive Transition Sandbox Box */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Live Sandbox: Current Transition Effect</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  Type: <strong className="text-cyan-600 dark:text-cyan-400 uppercase">{uiTransition}</strong>
                </span>
              </div>

              <div className="overflow-hidden min-h-[120px] flex items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={testTransitionKey}
                    {...getDemoVariants()}
                    className="w-full max-w-md p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-emerald-500/10 border border-cyan-500/30 text-center space-y-1.5 shadow"
                  >
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-600 text-white">
                      <span>{uiTransition.toUpperCase()} TRANSITION DEMO</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      This fluid transition plays every time you switch pages.
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Test navigation: click "Open Features" or "Back to Start" above!
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CASCADE PROPAGATION VECTORS */}
      {activeTab === 'vectors' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Vectors Banner & Filter */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <GitMerge className="w-4 h-4 text-indigo-500" />
              <span className="font-bold text-slate-900 dark:text-white">
                Taxonomy of Misinformation Propagation Transitions:
              </span>
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto">
              {['all', 'automated', 'cross_platform', 'algorithmic', 'human_social', 'counter_measure'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setVectorFilter(cat)}
                  className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-colors ${
                    vectorFilter === cat
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Vectors List and Selected Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List */}
            <div className="lg:col-span-5 space-y-3">
              {filteredVectors.map((v) => {
                const isSelected = selectedVectorId === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVectorId(v.id)}
                    className={`cursor-pointer p-4 rounded-xl border text-left transition-all shadow-sm ${
                      isSelected
                        ? 'border-indigo-500 ring-1 ring-indigo-500/40 bg-indigo-50/40 dark:bg-slate-900'
                        : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${v.badgeColor}`}>
                        {v.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                        {v.velocityMultiplier}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">
                      {v.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                      {v.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Selected Vector Deep Dive */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${selectedVector.badgeColor}`}>
                    {selectedVector.category.toUpperCase()}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {selectedVector.name}
                  </h3>
                </div>

                <div className="text-right font-mono">
                  <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                    {selectedVector.velocityMultiplier}
                  </div>
                  <div className="text-[10px] text-slate-400">Velocity Multiplier</div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedVector.technicalMechanics}
              </p>

              {/* Signatures */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h5 className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  AI Detection Signatures:
                </h5>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {selectedVector.detectionSignatures.map((sig, idx) => (
                    <li key={idx}>{sig}</li>
                  ))}
                </ul>
              </div>

              {/* Countermeasure */}
              <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-1">
                <h5 className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                  Autonomous Containment Countermeasure:
                </h5>
                <p className="text-xs text-emerald-900 dark:text-emerald-200">
                  {selectedVector.containmentCountermeasure}
                </p>
              </div>

              {/* Case Study */}
              <div className="text-xs font-sans text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                <strong>Real-World Scenario:</strong> {selectedVector.realWorldCaseStudy}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 90s SLA STAGE TRANSITIONS */}
      {activeTab === 'stages' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                90-Second SLA State Handoff Pipeline
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Exact micro-transitions and data payload schema transferred between autonomous layers.
              </p>
            </div>
            <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
              6 Transitions • 90s Budget
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PIPELINE_STAGE_TRANSITIONS.map((stage, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-mono">
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                    {stage.fromStage.toUpperCase()} → {stage.toStage.toUpperCase()}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    SLA: {stage.slaTargetSeconds}s
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {stage.name}
                </h4>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-mono">
                  <div><strong>Trigger:</strong> {stage.triggerEvent}</div>
                  <div><strong>Verification:</strong> {stage.verificationCriteria}</div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {stage.dataPayloadPassed.map((payload, pIdx) => (
                    <span
                      key={pIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {payload}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
