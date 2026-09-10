import React from 'react';
import { 
  Radar, 
  Search, 
  Share2, 
  FileText, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Zap,
  Play,
  RotateCcw
} from 'lucide-react';
import { IncidentClaim, PipelineStage } from '../types';

interface PipelineTimeline90sProps {
  incident: IncidentClaim;
  onSimulateRun: () => void;
  isSimulating: boolean;
  activeStageScrub: PipelineStage;
  setActiveStageScrub: (stage: PipelineStage) => void;
}

export const PipelineTimeline90s: React.FC<PipelineTimeline90sProps> = ({
  incident,
  onSimulateRun,
  isSimulating,
  activeStageScrub,
  setActiveStageScrub,
}) => {
  const stages = [
    {
      id: 'ingestion' as PipelineStage,
      label: 'Ingestion & Trigger',
      timeTarget: 'T+00s',
      duration: '0-5s',
      icon: Radar,
      color: 'indigo',
      desc: 'Live social stream capture, velocity spike & hash clustering',
    },
    {
      id: 'detector' as PipelineStage,
      label: 'Detector Agent',
      timeTarget: 'T+15s',
      duration: '5-15s',
      icon: Search,
      color: 'cyan',
      desc: 'Veracity scoring, severity evaluation & manipulation pattern extraction',
    },
    {
      id: 'origin_tracer' as PipelineStage,
      label: 'Origin Tracer',
      timeTarget: 'T+35s',
      duration: '15-35s',
      icon: Share2,
      color: 'amber',
      desc: 'Patient Zero identification, bot farm fingerprinting & hop trail',
    },
    {
      id: 'spread_predictor' as PipelineStage,
      label: 'Spread Predictor',
      timeTarget: 'T+60s',
      duration: '35-60s',
      icon: Zap,
      color: 'purple',
      desc: 'Graph cascade modeling, community susceptibility & R0 factor',
    },
    {
      id: 'rag_drafter' as PipelineStage,
      label: 'RAG Drafter',
      timeTarget: 'T+85s',
      duration: '60-85s',
      icon: FileText,
      color: 'emerald',
      desc: 'Strict indexed source retrieval (Snopes/WHO/PolitiFact) & truth sandwich',
    },
    {
      id: 'hitl_gate' as PipelineStage,
      label: 'HITL Gate / Output',
      timeTarget: 'T+90s',
      duration: '85-90s',
      icon: UserCheck,
      color: 'rose',
      desc: 'High-severity human editor gating & algorithmic containment dispatch',
    },
  ];

  const getStageStatus = (stageId: PipelineStage) => {
    if (incident.currentStage === 'dispatched') return 'completed';
    if (stageId === incident.currentStage) return 'active';
    const stageOrder: PipelineStage[] = ['ingestion', 'detector', 'origin_tracer', 'spread_predictor', 'rag_drafter', 'hitl_gate', 'dispatched'];
    const currentIndex = stageOrder.indexOf(incident.currentStage);
    const thisIndex = stageOrder.indexOf(stageId);
    if (thisIndex < currentIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl mb-6 transition-colors">
      {/* Header & 90s SLA Counter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>90-Second Containment Pipeline</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                SLA: &le; 90.0s
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time multi-agent progression from initial social post detection to source-backed rebuttal output.
          </p>
        </div>

        {/* Stopwatch & Action Controls */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 px-4 py-2 rounded-lg flex items-center space-x-3 font-mono">
            <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Elapsed Time</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white tracking-wider">
                00:{incident.totalElapsedSeconds.toString().padStart(2, '0')}s
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">/ 90s</span>
              </div>
            </div>
          </div>

          <button
            id="btn-replay-pipeline"
            onClick={onSimulateRun}
            disabled={isSimulating}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors disabled:opacity-50"
            title="Re-run pipeline execution simulation"
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-cyan-500 dark:text-cyan-400" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Simulate 90s Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="mt-6 mb-8">
        <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-200 dark:border-slate-800 relative">
          <div
            className="bg-gradient-to-r from-indigo-500 via-cyan-500 via-amber-500 via-purple-500 to-rose-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (incident.totalElapsedSeconds / 90) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono text-slate-500 mt-2 px-0.5">
          <span>T+00s (Detection)</span>
          <span>T+30s (Traced)</span>
          <span>T+60s (Predicted)</span>
          <span>T+85s (RAG Rebuttal)</span>
          <span className="text-rose-600 dark:text-rose-400 font-bold">T+90s (Gated / SLA)</span>
        </div>
      </div>

      {/* 6 Stages Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {stages.map((stage) => {
          const status = getStageStatus(stage.id);
          const isSelected = activeStageScrub === stage.id;
          const Icon = stage.icon;

          return (
            <button
              key={stage.id}
              id={`stage-card-${stage.id}`}
              onClick={() => setActiveStageScrub(stage.id)}
              className={`text-left p-3.5 rounded-xl border transition-all duration-200 relative group cursor-pointer ${
                isSelected
                  ? 'bg-cyan-50 dark:bg-slate-800/90 border-cyan-500 ring-2 ring-cyan-500/40 shadow-lg'
                  : status === 'active'
                  ? 'bg-amber-50/70 dark:bg-slate-800/60 border-amber-400 dark:border-amber-500/80 shadow-md'
                  : status === 'completed'
                  ? 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-900 opacity-60'
              }`}
            >
              {/* Top Tag */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  {stage.timeTarget}
                </span>
                {status === 'completed' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                )}
                {status === 'active' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping" />
                )}
                {status === 'pending' && (
                  <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-700" />
                )}
              </div>

              {/* Icon & Title */}
              <div className="flex items-center space-x-2 mb-2">
                <div className={`p-1.5 rounded-lg ${
                  isSelected 
                    ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                  {stage.label}
                </div>
              </div>

              {/* Short details */}
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {stage.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );

};
