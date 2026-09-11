import React from 'react';
import { IncidentClaim, MainAppPage } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { AgentIcon } from '../components/ui/AgentIcon';
import { NetworkGraphVisualizer } from '../components/NetworkGraphVisualizer';
import { formatReach, severityOf, severityTone, STAGE_LABEL } from '../lib/ui';

export const InvestigationPage = ({
  currentIncident,
  setPage,
}: {
  currentIncident: IncidentClaim;
  setPage: (p: MainAppPage) => void;
}) => {
  if (!currentIncident) return <div className="premium-card p-10 text-center text-slate-500">No incident selected.</div>;
  const sev = severityOf(currentIncident);
  const tone = severityTone(sev);

  return (
    <div className="space-y-8">
      <PageHeader kicker="Case file" title="Claim Investigation" subtitle={STAGE_LABEL[currentIncident.currentStage]} />
      <div className={`premium-card p-6 border-l-4 ${tone.border.replace('border-', 'border-l-')}`}>
        <p className="text-lg text-slate-100">“{currentIncident.claimText}”</p>
        <div className="flex flex-wrap gap-6 mt-4 text-xs font-mono text-slate-400">
          <span>Confidence <b className="text-white">{currentIncident.detector?.confidence ?? 'N/A'}%</b></span>
          <span>Severity <b className={`${tone.text} uppercase`}>{sev}</b></span>
          <span>Status <b className="text-cyan-300">{STAGE_LABEL[currentIncident.currentStage]}</b></span>
          <span>Timestamp <b className="text-white">{currentIncident.ingestion.timestamp}</b></span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="premium-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <AgentIcon kind="detector" />
            <div>
              <h3 className="font-bold">Detection</h3>
              <p className="text-xs text-slate-500">Claim Detector</p>
            </div>
          </div>
          {currentIncident.detector ? (
            <div className="space-y-2 text-sm text-slate-300">
              <p>{currentIncident.detector.reasoning}</p>
              <p>Confidence {currentIncident.detector.confidence}% · Veracity risk {currentIncident.detector.veracityScore}</p>
              <p className="text-xs text-slate-500">{currentIncident.detector.manipulationTechniques.join(' · ')}</p>
            </div>
          ) : (
            <p className="text-sm text-cyan-400/80">Analyzing claim…</p>
          )}
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <AgentIcon kind="origin" />
            <div>
              <h3 className="font-bold">Origin</h3>
              <p className="text-xs text-slate-500">Origin Tracer</p>
            </div>
          </div>
          {currentIncident.origin ? (
            <div className="space-y-2 text-sm text-slate-300">
              <p>Earliest source: <span className="text-white">{currentIncident.origin.patientZero.username}</span></p>
              <p>Platform: {currentIncident.origin.patientZero.platform}</p>
              <p>First seen: {currentIncident.origin.patientZero.firstSeenTimestamp}</p>
              <p>Origin confidence: {Math.max(0, 100 - currentIncident.origin.patientZero.botProbability)}%</p>
              <p className="text-amber-300">{currentIncident.origin.patientZero.geographicCluster}</p>
              {currentIncident.origin.summary && (
                <p className="text-slate-400 border-l-2 border-slate-700 pl-3 mt-3">{currentIncident.origin.summary}</p>
              )}
              {currentIncident.origin.aliases?.length ? (
                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                    Also reported as ({currentIncident.origin.aliases.length} merged wording
                    {currentIncident.origin.aliases.length === 1 ? '' : 's'})
                  </div>
                  <ul className="text-xs text-slate-400 space-y-0.5">
                    {currentIncident.origin.aliases.map((a, i) => (
                      <li key={i}>• “{a}”</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {currentIncident.origin.timeline && currentIncident.origin.timeline.length > 1 && (
                <ol className="mt-3 space-y-1 text-xs font-mono text-slate-400">
                  {currentIncident.origin.timeline.map((t, i) => (
                    <li key={i}>
                      <span className="text-cyan-300">{i === 0 ? 'origin' : `+${i}`}</span>{' '}
                      {t.outlet} <span className="text-slate-600">[{t.platform}]</span>{' '}
                      {t.timestamp || 'no timestamp'}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ) : (
            <p className="text-sm text-cyan-400/80">Tracing origin…</p>
          )}
        </div>
      </div>

      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AgentIcon kind="spread" />
            <div>
              <h3 className="font-bold">Spread prediction</h3>
              <p className="text-xs text-slate-500">
                {currentIncident.spread
                  ? `R0 ${currentIncident.spread.r0ViralFactor} · ~${formatReach(currentIncident.spread.currentReach)} reached · 6h projection ${formatReach(currentIncident.spread.projected6hReachUncontained)}${currentIncident.spread.reductionPercentage ? ` (−${currentIncident.spread.reductionPercentage}% if contained)` : ''}`
                  : 'Risk — · Predicted reach —'}
              </p>
            </div>
          </div>
          <button onClick={() => setPage('spread_intelligence')} className="text-xs text-cyan-300">
            Open full graph
          </button>
        </div>
        {currentIncident.spread ? (
          <div className="min-h-[360px]">
            <NetworkGraphVisualizer incident={currentIncident} />
          </div>
        ) : (
          <p className="text-sm text-cyan-400/80">Analyzing spread…</p>
        )}
      </div>

      <div className="premium-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <AgentIcon kind="evidence" />
          <h3 className="font-bold">Evidence</h3>
        </div>
        {currentIncident.ragDrafter?.sources?.length ? (
          <div className="grid md:grid-cols-2 gap-4">
            {currentIncident.ragDrafter.sources.map((src) => (
              <div key={src.id} className="rounded-xl border border-slate-800 p-4 bg-slate-950/40">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-cyan-300">{src.organization}</span>
                  <span className="text-emerald-400">Verified</span>
                </div>
                <p className="text-sm mt-2 text-slate-200">{src.title}</p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3">{src.keyEvidenceQuote}</p>
                <div className="text-[10px] text-slate-500 mt-3">Retrieved {src.publishDate} · {src.url}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-cyan-400/80">Retrieving trusted evidence…</p>
        )}
      </div>
    </div>
  );
};
