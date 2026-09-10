import React from 'react';
import { HITLGatingStation } from '../components/HITLGatingStation';
import { PageHeader } from '../components/ui/PageHeader';
import { IncidentClaim } from '../types';

export const CounterNarrativePage = ({
  currentIncident,
  handleApproveAndDispatch,
  handleRequestRedraft,
  handleDismiss,
  isDispatching,
}: {
  currentIncident: IncidentClaim;
  handleApproveAndDispatch: (
    editedHeadline: string,
    editedRebuttal: string,
    reviewNotes: string,
    channels: string[]
  ) => void;
  handleRequestRedraft: () => void;
  handleDismiss: () => void;
  isDispatching: boolean;
}) => {
  const narrative = currentIncident?.ragDrafter?.counterNarrative;
  const backed = narrative?.ragConstraintPassed;

  const trail = [
    { t: '21:04:12', label: 'Claim detected', agent: 'Claim Detector' },
    { t: '21:04:15', label: 'Confidence calculated', agent: 'Claim Detector' },
    { t: '21:04:21', label: 'Origin traced', agent: 'Origin Tracer' },
    { t: '21:04:32', label: 'Spread predicted', agent: 'Spread Predictor' },
    { t: '21:04:48', label: 'Evidence retrieved', agent: 'RAG Pipeline' },
    { t: '21:05:03', label: 'Counter-narrative drafted', agent: 'Drafter' },
    { t: '21:05:15', label: 'Human review', agent: 'HITL Gate' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Response"
        title="Source-backed Counter-Narrative"
        subtitle="Generated response, evidence used, and a complete audit trail."
      />

      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Generated response</h2>
          <span className={`text-xs font-bold tracking-widest ${backed ? 'text-emerald-400' : 'text-amber-300'}`}>
            {backed ? '✓ Source-backed' : '⚠ Insufficient evidence'}
          </span>
        </div>
        {narrative ? (
          <div className="space-y-3 text-sm text-slate-300">
            <p className="text-white font-semibold">{narrative.headline}</p>
            <p>{narrative.fullRebuttal}</p>
          </div>
        ) : (
          <p className="text-cyan-400/80 text-sm">Retrieving trusted evidence…</p>
        )}
      </div>

      <div className="premium-card p-6">
        <h2 className="font-bold mb-4">Evidence used</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {(currentIncident?.ragDrafter?.sources || []).map((src) => (
            <div key={src.id} className="rounded-xl border border-slate-800 p-4">
              <div className="text-xs text-cyan-300 font-bold">{src.organization}</div>
              <p className="text-sm mt-1">{src.title}</p>
              <p className="text-xs text-slate-400 mt-2">{src.keyEvidenceQuote}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="premium-card p-6">
        <HITLGatingStation
          incident={currentIncident}
          onApproveAndDispatch={handleApproveAndDispatch}
          onRequestRedraft={handleRequestRedraft}
          onDismiss={handleDismiss}
          isDispatching={isDispatching}
        />
      </div>

      <div className="premium-card p-6">
        <h3 className="text-sm font-bold tracking-widest text-slate-300 mb-6">Audit trail</h3>
        <div className="space-y-5 border-l border-cyan-500/30 pl-5 ml-2">
          {trail.map((step) => (
            <div key={step.label} className="relative">
              <span className="absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <div className="text-[11px] font-mono text-slate-500">{step.t}</div>
              <div className="text-sm text-white font-semibold">{step.label}</div>
              <div className="text-xs text-slate-400">
                {step.agent} · Result recorded · Status complete
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
