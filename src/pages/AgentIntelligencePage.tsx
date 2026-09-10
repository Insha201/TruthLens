import React from 'react';
import { PipelineTimeline90s } from '../components/PipelineTimeline90s';
import { AgentIcon } from '../components/ui/AgentIcon';
import { PageHeader } from '../components/ui/PageHeader';
import { IncidentClaim, PipelineStage } from '../types';

const AGENTS = [
  {
    title: 'Claim Detector',
    desc: 'Identifies suspicious or misleading claims.',
    kind: 'detector' as const,
    stage: 'detector' as PipelineStage,
  },
  {
    title: 'Origin Tracer',
    desc: 'Finds the earliest known source.',
    kind: 'origin' as const,
    stage: 'origin_tracer' as PipelineStage,
  },
  {
    title: 'Spread Predictor',
    desc: 'Predicts potential information propagation.',
    kind: 'spread' as const,
    stage: 'spread_predictor' as PipelineStage,
  },
  {
    title: 'Counter-Narrative Drafter',
    desc: 'Creates evidence-backed responses.',
    kind: 'narrative' as const,
    stage: 'rag_drafter' as PipelineStage,
  },
];

function agentStatus(incident: IncidentClaim, stage: PipelineStage) {
  const order: PipelineStage[] = ['ingestion', 'detector', 'origin_tracer', 'spread_predictor', 'rag_drafter', 'hitl_gate', 'dispatched'];
  const current = order.indexOf(incident.currentStage);
  const thisIndex = order.indexOf(stage);
  if (incident.currentStage === 'dispatched' || thisIndex < current) return 'COMPLETED';
  if (incident.currentStage === 'hitl_gate' && stage === 'rag_drafter') return 'REVIEW REQUIRED';
  if (thisIndex === current) return 'PROCESSING';
  return 'WAITING';
}

export const AgentIntelligencePage = ({
  currentIncident,
  activeStageScrub,
  setActiveStageScrub,
  onSimulateRun,
  isSimulating,
}: {
  currentIncident: IncidentClaim;
  activeStageScrub: PipelineStage;
  setActiveStageScrub: (s: PipelineStage) => void;
  onSimulateRun: () => void;
  isSimulating: boolean;
}) => {
  const pipeline = [
    'Data ingestion',
    'Claim detector',
    'Origin tracer',
    'Spread predictor',
    'RAG evidence',
    'Human review',
    'Counter-narrative',
  ];

  return (
    <div className="space-y-8">
      <PageHeader kicker="Agents" title="Multi-Agent Intelligence" subtitle="Four specialized agents with a gated 90-second pipeline." />
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {AGENTS.map((a) => {
          const status = agentStatus(currentIncident, a.stage);
          return (
            <div key={a.title} className="premium-card p-6">
              <AgentIcon kind={a.kind} />
              <h3 className="mt-4 font-bold text-white">{a.title}</h3>
              <p className="text-sm text-slate-400 mt-2">{a.desc}</p>
              <div className="mt-5 text-[11px] font-mono tracking-widest text-cyan-300">
                {status === 'COMPLETED' && '✓ Completed'}
                {status === 'PROCESSING' && '● Processing'}
                {status === 'WAITING' && '○ Waiting'}
                {status === 'REVIEW REQUIRED' && '⚠ Review required'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="premium-card p-6 overflow-x-auto">
        <h3 className="text-xs tracking-widest text-slate-400 font-bold mb-6">Agent pipeline</h3>
        <div className="flex min-w-[800px] items-center gap-2">
          {pipeline.map((step, i) => (
            <React.Fragment key={step}>
              <div className="text-center">
                <div className="px-3 py-2 rounded-lg border border-cyan-500/30 bg-slate-950 text-[11px] font-bold uppercase tracking-widest text-cyan-200">
                  {step}
                </div>
              </div>
              {i < pipeline.length - 1 && <div className="flex-1 h-px bg-cyan-500/30" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <PipelineTimeline90s
        incident={currentIncident}
        onSimulateRun={onSimulateRun}
        isSimulating={isSimulating}
        activeStageScrub={activeStageScrub}
        setActiveStageScrub={setActiveStageScrub}
      />
    </div>
  );
};
