import React, { useState } from 'react';
import { NetworkGraphVisualizer } from '../components/NetworkGraphVisualizer';
import { PageHeader } from '../components/ui/PageHeader';
import { IncidentClaim } from '../types';
import { formatReach } from '../lib/ui';

export const SpreadIntelligencePage = ({ currentIncident }: { currentIncident: IncidentClaim }) => {
  const [view, setView] = useState<'ORIGIN' | 'CURRENT SPREAD' | 'PREDICTED SPREAD'>('CURRENT SPREAD');

  return (
    <div className="space-y-6">
      <PageHeader kicker="Cascade" title="Spread Intelligence" subtitle="Interactive network of origin, current reach, and predicted destinations." />
      <div className="grid xl:grid-cols-[1fr_280px] gap-6">
        <div className="premium-card p-4 min-h-[540px]">
          <div className="flex gap-2 mb-4">
            {(['ORIGIN', 'CURRENT SPREAD', 'PREDICTED SPREAD'] as const).map((f) => (
              <button key={f} onClick={() => setView(f)} className={`filter-chip ${view === f ? 'active' : ''}`}>
                {f}
              </button>
            ))}
          </div>
          {currentIncident?.spread ? (
            <NetworkGraphVisualizer incident={currentIncident} />
          ) : (
            <div className="h-[420px] flex items-center justify-center text-sm text-cyan-400/80">
              Analyzing spread…
            </div>
          )}
        </div>
        <aside className="premium-card p-5 h-fit space-y-5">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500">Spread risk</div>
            <div className="text-2xl font-extrabold text-rose-400 mt-1">High</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500">Predicted reach</div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {formatReach(currentIncident?.spread?.projected6hReachUncontained)}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500">Communities</div>
            <div className="text-2xl font-extrabold text-cyan-300 mt-1">
              {currentIncident?.spread?.vulnerableCommunities.length ?? 0}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500">Current velocity</div>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">
              {currentIncident?.ingestion.velocityPerMin ?? 0}/min
            </div>
          </div>
          <div className="text-xs text-slate-500 leading-relaxed">
            View: {view}. Center node is the suspicious claim, connected to origin, amplifiers, and predicted community destinations.
          </div>
        </aside>
      </div>
    </div>
  );
};
