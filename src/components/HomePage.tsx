import React from 'react';
import { 
  ShieldAlert, 
  ArrowRight, 
  Zap, 
  Clock, 
  Activity, 
  Sparkles, 
  Layers, 
  GitBranch, 
  UserCheck, 
  Database, 
  CheckCircle2, 
  Palette, 
  Flame,
  PlusCircle,
  Cpu
} from 'lucide-react';
import { IncidentClaim, SystemMetrics, FeatureSubTab } from '../types';

interface HomePageProps {
  onNavigateToFeatures: (subTab?: FeatureSubTab) => void;
  onNavigateToTheme: () => void;
  onOpenIngestModal: () => void;
  currentIncident: IncidentClaim;
  metrics: SystemMetrics;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToFeatures,
  onNavigateToTheme,
  onOpenIngestModal,
  currentIncident,
  metrics,
}) => {
  return (
    <div className="space-y-10 pb-16">
      {/* Hero Operational Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 dark:from-slate-900 dark:via-[#090d16] dark:to-[#070a12] border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-2xl transition-colors">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-mono font-bold bg-cyan-500/15 border border-cyan-500/35 text-cyan-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span>SYSTEM ARMED • 90-SECOND SLA ENGINE</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-mono font-semibold bg-emerald-500/15 border border-emerald-500/35 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>4-Layer Autonomous Architecture</span>
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Real-Time Misinformation <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Containment & Verification
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-200 max-w-3xl leading-relaxed">
              An autonomous multi-agent pipeline engineered to intercept and contain viral falsehoods across social networks. 
              Within <strong>90 seconds</strong>, the system ingests multi-platform signals, assesses veracity, 
              fingerprints patient-zero origins, models cascade network topologies, and synthesizes source-grounded 
              counter-narratives ready for human authorization and dispatch.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              id="btn-home-explore-features"
              onClick={() => onNavigateToFeatures('pipeline')}
              className="flex items-center space-x-2.5 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base transition-all transform hover:-translate-y-0.5 shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              <span>Launch 90s Pipeline Features</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              id="btn-home-configure-theme"
              onClick={onNavigateToTheme}
              className="flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-base border border-slate-700 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Palette className="w-5 h-5 text-cyan-400" />
              <span>Customize Theme & Transitions</span>
            </button>

            <button
              id="btn-home-ingest-claim"
              onClick={onOpenIngestModal}
              className="flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-800 transition-all hover:border-slate-700 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <span>Ingest Breaking Claim</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Dashboard Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-slate-500 dark:text-slate-400">
            <span>CONTAINMENT SLA</span>
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mt-2">
            {metrics.avgPipelineLatencySeconds}s
          </div>
          <p className="text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">
            Strict &le; 90.0s containment threshold
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-slate-500 dark:text-slate-400">
            <span>PRE-VIRAL INTERCEPT</span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mt-2">
            {metrics.containmentSuccessRate}%
          </div>
          <p className="text-xs sm:text-sm font-mono text-cyan-600 dark:text-cyan-400 mt-1.5 font-medium">
            Neutralized before Tier-1 echo saturation
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-slate-500 dark:text-slate-400">
            <span>ACTIVE INCIDENTS</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mt-2">
            {metrics.activeIncidentsCount}
          </div>
          <p className="text-xs sm:text-sm font-mono text-rose-600 dark:text-rose-400 mt-1.5 font-medium">
            Multi-platform tracked claim clusters
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-slate-500 dark:text-slate-400">
            <span>HUMAN EDITOR QUEUE</span>
            <UserCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mt-2">
            {metrics.gatedReviewQueueLength} Pending
          </div>
          <p className="text-xs sm:text-sm font-mono text-indigo-600 dark:text-indigo-400 mt-1.5 font-medium">
            Mandatory Layer 4 safety authorization
          </p>
        </div>
      </div>

      {/* Active Incident Spotlight */}
      {currentIncident && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-lg transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-md text-xs font-mono uppercase font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>ACTIVE BREAKING INCIDENT</span>
              </span>
              <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                Origin: <strong className="uppercase text-slate-900 dark:text-white">{currentIncident.ingestion.platform}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-4 text-xs sm:text-sm font-mono">
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                Velocity: {currentIncident.ingestion.velocityPerMin} signals/min
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                SLA: <strong className="text-slate-900 dark:text-white">{currentIncident.totalElapsedSeconds}s</strong> / 90s
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-3xl">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {currentIncident.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &ldquo;{currentIncident.claimText}&rdquo;
              </p>
            </div>

            <button
              id="btn-spotlight-open-pipeline"
              onClick={() => onNavigateToFeatures('pipeline')}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm sm:text-base transition-all self-start md:self-auto shrink-0 shadow-md cursor-pointer"
            >
              <span>Inspect in 90s Pipeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4-Layer Architecture Interactive Showcase */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              The 4-Layer Containment Architecture
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
              Click any layer below to jump directly into its operational dashboard in Features.
            </p>
          </div>
          <button
            onClick={() => onNavigateToFeatures('pipeline')}
            className="text-sm font-mono font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center space-x-1.5 cursor-pointer"
          >
            <span>View Complete Pipeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Layer 1 */}
          <div 
            onClick={() => onNavigateToFeatures('ingestion')}
            className="group cursor-pointer bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <Layers className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">LAYER 1</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Social Ingestion & Signal Extraction
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Continuous high-velocity crawlers monitoring X, Telegram, Reddit, TikTok, and WhatsApp network relays.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
              <span>Explore Ingestion Feed</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Layer 2 */}
          <div 
            onClick={() => onNavigateToFeatures('pipeline')}
            className="group cursor-pointer bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                  <Cpu className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">LAYER 2</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                4-Agent Pipeline
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Detector &rarr; Origin Tracer &rarr; Spread Predictor &rarr; RAG Drafter coordinating in under 90s.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-mono font-bold text-cyan-600 dark:text-cyan-400">
              <span>Open Agent Grid</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Layer 3 */}
          <div 
            onClick={() => onNavigateToFeatures('knowledge')}
            className="group cursor-pointer bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <Database className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">LAYER 3</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Ground-Truth Knowledge Base
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Indexed fact checks from Snopes, WHO, PolitiFact, Reuters, and CDC with quote-level RAG citations.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-mono font-bold text-amber-600 dark:text-amber-400">
              <span>Inspect Knowledge Base</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Layer 4 */}
          <div 
            onClick={() => onNavigateToFeatures('hitl')}
            className="group cursor-pointer bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  <UserCheck className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">LAYER 4</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                Human-in-the-Loop Review Gate
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Mandatory human safety gate preventing hallucinations before broadcast to API dispatch networks.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-mono font-bold text-rose-600 dark:text-rose-400">
              <span>Open Review Station</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Direct Feature Launchcards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
        <button
          onClick={() => onNavigateToFeatures('graph')}
          className="text-left p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all group shadow-sm hover:shadow cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-sm font-mono font-bold">
            <GitBranch className="w-5 h-5" />
            <span>SPREAD NETWORK GRAPH</span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
            Simulate infected nodes, bot amplifiers, and bridge accounts to compute containment radii.
          </p>
        </button>

        <button
          onClick={onNavigateToTheme}
          className="text-left p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all group shadow-sm hover:shadow cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-sm font-mono font-bold">
            <Palette className="w-5 h-5" />
            <span>THEME & TRANSITIONS</span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
            Toggle Light/Dark modes, choose animated page transition physics, and study propagation vectors.
          </p>
        </button>

        <button
          onClick={onOpenIngestModal}
          className="text-left p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 transition-all group shadow-sm hover:shadow cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 text-sm font-mono font-bold">
            <PlusCircle className="w-5 h-5" />
            <span>INGESTION CONSOLE</span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
            Submit custom raw tweets, Telegram broadcasts, or TikTok claims for instant autonomous containment.
          </p>
        </button>
      </div>
    </div>
  );
};
