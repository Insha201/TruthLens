import React, { useState } from 'react';
import { 
  GitMerge, 
  Zap, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Bot, 
  Radio, 
  Eye, 
  Share2, 
  Sparkles, 
  AlertTriangle, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Info,
  Sliders,
  Play,
  RotateCcw
} from 'lucide-react';
import { 
  CASCADE_TRANSITION_TYPES, 
  PIPELINE_STAGE_TRANSITIONS, 
  UI_TRANSITION_MODES 
} from '../data/transitionTypesData';
import { CascadeTransitionMechanism, CascadeTransitionTypeInfo, UITransitionMode } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TransitionTypesViewProps {
  onSelectMechanism?: (mechanism: CascadeTransitionMechanism) => void;
}

export const TransitionTypesView: React.FC<TransitionTypesViewProps> = ({
  onSelectMechanism,
}) => {
  const { theme, uiTransition, setUITransition } = useTheme();

  const [activeSection, setActiveSection] = useState<'cascade' | 'stages' | 'ui_modes'>('cascade');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeMechanismId, setActiveMechanismId] = useState<CascadeTransitionMechanism>('coordinated_bot_burst');

  // Interactive UI transition preview tester state
  const [demoToggle, setDemoToggle] = useState(false);
  const [demoCounter, setDemoCounter] = useState(1);

  const selectedMechanism = CASCADE_TRANSITION_TYPES.find((m) => m.id === activeMechanismId) || CASCADE_TRANSITION_TYPES[0];

  const filteredMechanisms = CASCADE_TRANSITION_TYPES.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const getRiskBadge = (risk: CascadeTransitionTypeInfo['contagionRisk']) => {
    switch (risk) {
      case 'critical':
        return 'bg-rose-950/80 dark:bg-rose-950/80 text-rose-300 border border-rose-800';
      case 'high':
        return 'bg-amber-950/80 dark:bg-amber-950/80 text-amber-300 border border-amber-800';
      case 'medium':
        return 'bg-cyan-950/80 dark:bg-cyan-950/80 text-cyan-300 border border-cyan-800';
      case 'contained':
        return 'bg-emerald-950/80 dark:bg-emerald-950/80 text-emerald-300 border border-emerald-800';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
              <GitMerge className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Transition Types & Transmission Vectors
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Comprehensive taxonomy of misinformation propagation transitions, 90s stage handoffs, and UI motion modes.
              </p>
            </div>
          </div>
        </div>

        {/* Section Pill Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start md:self-auto text-xs font-mono">
          <button
            onClick={() => setActiveSection('cascade')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'cascade'
                ? 'bg-white dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-slate-300 dark:border-cyan-700 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            1. Cascade Transmission Types
          </button>
          <button
            onClick={() => setActiveSection('stages')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'stages'
                ? 'bg-white dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-slate-300 dark:border-cyan-700 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            2. Pipeline Stage Transitions
          </button>
          <button
            onClick={() => setActiveSection('ui_modes')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'ui_modes'
                ? 'bg-white dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-slate-300 dark:border-cyan-700 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            3. UI Animation Modes
          </button>
        </div>
      </div>

      {/* SECTION 1: CASCADE PROPAGATION TRANSITION TYPES */}
      {activeSection === 'cascade' && (
        <div className="space-y-6">
          {/* Filter Categories */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400 font-mono">Transition Vector Class:</span>
              {[
                { id: 'all', label: 'All Vectors (8)' },
                { id: 'automated', label: 'Automated Bot Clusters' },
                { id: 'cross_platform', label: 'Cross-Platform Bridges' },
                { id: 'human_social', label: 'Human & Dark Social' },
                { id: 'algorithmic', label: 'Algorithmic Amplification' },
                { id: 'counter_measure', label: 'Authoritative Inoculation' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-400 dark:border-cyan-700 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="text-slate-500 font-mono text-[11px]">
              Showing {filteredMechanisms.length} Transition Types
            </div>
          </div>

          {/* Master-Detail Explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left list (5 cols) */}
            <div className="lg:col-span-5 space-y-2.5">
              {filteredMechanisms.map((mech) => {
                const isSelected = mech.id === selectedMechanism.id;
                return (
                  <button
                    key={mech.id}
                    onClick={() => {
                      setActiveMechanismId(mech.id);
                      if (onSelectMechanism) onSelectMechanism(mech.id);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-cyan-50/80 dark:bg-slate-900 border-cyan-500 ring-1 ring-cyan-500/50 shadow-md'
                        : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {mech.category.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${getRiskBadge(mech.contagionRisk)}`}>
                        {mech.contagionRisk}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {mech.name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {mech.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-slate-800/80 text-[11px] font-mono text-slate-500">
                      <span>Velocity: <strong className="text-cyan-600 dark:text-cyan-400">{mech.velocityMultiplier}</strong></span>
                      <span>Transit: <strong className="text-slate-700 dark:text-slate-300">~{mech.typicalDelaySeconds}s</strong></span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right deep inspection card (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
              {/* Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase font-bold tracking-wider">
                    TRANSITION VECTOR DEEP-DIVE
                  </span>
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded font-bold uppercase ${getRiskBadge(selectedMechanism.contagionRisk)}`}>
                    Contagion Risk: {selectedMechanism.contagionRisk}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {selectedMechanism.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {selectedMechanism.description}
                </p>
              </div>

              {/* Transit Route & Speed Telemetry */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-mono text-slate-500">VELOCITY MULTIPLIER</div>
                  <div className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-0.5">
                    {selectedMechanism.velocityMultiplier}
                  </div>
                  <p className="text-[10px] text-slate-500">Spread acceleration</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-mono text-slate-500">TYPICAL HOP DELAY</div>
                  <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                    {selectedMechanism.typicalDelaySeconds}s
                  </div>
                  <p className="text-[10px] text-slate-500">Inter-platform interval</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-mono text-slate-500">CROSS-PLATFORM TRANSIT</div>
                  <div className="flex items-center space-x-1 mt-1.5 text-xs font-mono font-bold">
                    <span className="uppercase text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {selectedMechanism.sourcePlatforms.join('/')}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="uppercase text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950 px-1.5 py-0.5 rounded">
                      {selectedMechanism.targetPlatforms.join('/')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Mechanics & Simulation Schematic */}
              <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Propagation Vector Physics</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">Simulation Model</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {selectedMechanism.technicalMechanics}
                </p>

                {/* Vector Flow Mini SVG Diagram */}
                <div className="h-16 w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800/80 flex items-center justify-around px-4 relative overflow-hidden">
                  <div className="flex items-center space-x-2 text-xs font-mono z-10">
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Seed Origin Node</span>
                  </div>

                  <div className="flex-1 flex items-center justify-center px-4 relative">
                    <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 border-dashed border-t" />
                    <span className="absolute px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-mono">
                      {selectedMechanism.velocityMultiplier} Transit
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-mono z-10">
                    <div className="w-3 h-3 rounded-full bg-cyan-500" />
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Bridge Hub Node</span>
                  </div>
                </div>
              </div>

              {/* Detection Signatures */}
              <div>
                <h4 className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold uppercase mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Agent 1 & 2 Forensic Detection Signatures:</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedMechanism.detectionSignatures.map((sig, idx) => (
                    <li
                      key={idx}
                      className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-start space-x-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Automated Countermeasure & Real-World Case */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-xl">
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase text-[10px] block mb-1">
                    CONTAINMENT COUNTERMEASURE:
                  </span>
                  <p className="text-slate-700 dark:text-emerald-200 leading-relaxed">
                    {selectedMechanism.containmentCountermeasure}
                  </p>
                </div>

                <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 p-3 rounded-xl">
                  <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 uppercase text-[10px] block mb-1">
                    REAL-WORLD CASE INCIDENT:
                  </span>
                  <p className="text-slate-700 dark:text-indigo-200 leading-relaxed">
                    {selectedMechanism.realWorldCaseStudy}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PIPELINE STAGE TRANSITIONS */}
      {activeSection === 'stages' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Multi-Agent 90-Second SLA Stage Handshake Protocol</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Each stage transition enforces strict latency budgets and immutable validation criteria before dispatching downstream.
            </p>
          </div>

          <div className="space-y-3">
            {PIPELINE_STAGE_TRANSITIONS.map((stage, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 font-mono font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {stage.name}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-mono">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      Budget: &le; {stage.slaTargetSeconds}s
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {stage.fromStage} → {stage.toStage}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Transition Trigger Event:</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed font-sans">
                      {stage.triggerEvent}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Immutable Payload Passed:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {stage.dataPayloadPassed.map((p, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-950 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-800"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Verification & Quality Gate:</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed font-sans">
                      {stage.verificationCriteria}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: UI ANIMATION & TRANSITION MODES */}
      {activeSection === 'ui_modes' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-500" />
              <span>UI Transition & Motion Engine Modes</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Select the motion profile used across navigation tabs, pipeline steps, and network telemetry cards.
            </p>
          </div>

          {/* 4 Mode Selectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {UI_TRANSITION_MODES.map((mode) => {
              const isSelected = uiTransition === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => setUITransition(mode.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-cyan-50/80 dark:bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/50 shadow-lg'
                      : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        {mode.badge}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                      {mode.label}
                    </h4>
                    <p className="text-[11px] font-mono text-cyan-700 dark:text-cyan-400">
                      {mode.subtitle}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {mode.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">Class: .{mode.className}</span>
                    <button
                      type="button"
                      className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono transition-colors ${
                        isSelected
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isSelected ? 'Active Mode' : 'Apply Mode'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Transition Test Playground */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-500" />
                  <span>Live Transition Mode Physics Tester</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Trigger state toggles to observe how your chosen mode ({uiTransition.toUpperCase()}) animates elements in real time.
                </p>
              </div>

              <button
                onClick={() => {
                  setDemoToggle(!demoToggle);
                  setDemoCounter((c) => c + 1);
                }}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs font-mono shadow-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Trigger Test Handoff (#{demoCounter})</span>
              </button>
            </div>

            {/* Test Stage Visuals with current mode class */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-5 rounded-xl border ${
                  demoToggle
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                } ${
                  uiTransition === 'kinetic' ? 'transition-kinetic transform ' + (demoToggle ? 'translate-x-2' : 'translate-x-0') :
                  uiTransition === 'smooth' ? 'transition-smooth ' + (demoToggle ? 'opacity-90' : 'opacity-100') :
                  uiTransition === 'cyber' ? 'transition-cyber ' + (demoToggle ? 'ring-2 ring-cyan-400' : '') :
                  'transition-discrete'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400">
                    STAGE A TELEMETRY
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Frame: {demoCounter}</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {demoToggle ? 'Packet Dispatched: 14,200/sec' : 'Queue Idle: Awaiting Ingest'}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Testing active easing curve under mode: <strong className="text-cyan-600 dark:text-cyan-400">{uiTransition}</strong>
                </p>
              </div>

              <div
                className={`p-5 rounded-xl border ${
                  !demoToggle
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                } ${
                  uiTransition === 'kinetic' ? 'transition-kinetic transform ' + (!demoToggle ? '-translate-x-2' : 'translate-x-0') :
                  uiTransition === 'smooth' ? 'transition-smooth ' + (!demoToggle ? 'scale-100' : 'scale-[0.99]') :
                  uiTransition === 'cyber' ? 'transition-cyber ' + (!demoToggle ? 'ring-2 ring-emerald-400' : '') :
                  'transition-discrete'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    STAGE B GATEKEEPER
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Latency: 1.2ms</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {!demoToggle ? 'Contained: Perimeter Sealed' : 'Analyzing Propagation Wave'}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  High-contrast visual feedback configured for {theme.toUpperCase()} mode.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
