import React from 'react';
import { KnowledgeBaseView } from '../components/KnowledgeBaseView';
import { PageHeader } from '../components/ui/PageHeader';
import { IncidentClaim, MainAppPage, RetrievedSource } from '../types';
import { formatReach, severityOf, severityTone } from '../lib/ui';

export const EvidenceReviewPage = ({
  knowledgeSources,
  handleAddSource,
  incidents,
  setCurrentIncidentId,
  setPage,
  handleDismiss,
  handleRequestRedraft,
}: {
  knowledgeSources: RetrievedSource[];
  handleAddSource: (s: RetrievedSource) => void;
  incidents: IncidentClaim[];
  setCurrentIncidentId: (id: string) => void;
  setPage: (p: MainAppPage) => void;
  handleDismiss: (incidentId?: string) => void;
  handleRequestRedraft: () => void;
}) => {
  const queue = incidents.filter((i) => i.humanReview.status === 'pending' && i.currentStage === 'hitl_gate');

  return (
    <div className="space-y-10">
      <PageHeader kicker="Verification" title="Evidence & Human Review" subtitle="Trusted sources and the gated review queue for high-severity claims." />

      <section>
        <h2 className="text-sm tracking-widest uppercase text-slate-400 font-bold mb-4">Trusted evidence</h2>
        <div className="premium-card p-6">
          <KnowledgeBaseView sources={knowledgeSources} onAddSource={handleAddSource} />
        </div>
      </section>

      <section>
        <h2 className="text-sm tracking-widest uppercase text-amber-300 font-bold mb-4">Human review center</h2>
        {queue.length === 0 ? (
          <div className="premium-card p-10 text-center text-slate-500">No claims currently require human review.</div>
        ) : (
          <div className="space-y-4">
            {queue.map((inc) => {
              const sev = severityOf(inc);
              const tone = severityTone(sev);
              return (
                <div key={inc.id} className="premium-card p-5">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold tracking-widest uppercase mb-3">
                    ⚠ Human review required
                  </div>
                  <p className="text-slate-100">“{inc.claimText}”</p>
                  <div className={`flex flex-wrap gap-4 mt-3 text-[11px] uppercase tracking-wider ${tone.text}`}>
                    <span>Severity {sev}</span>
                    <span>Confidence {inc.detector?.confidence ?? '—'}%</span>
                    <span>Origin {inc.origin?.patientZero.username ?? '—'}</span>
                    <span>Spread {formatReach(inc.spread?.projected6hReachUncontained)}</span>
                    <span>Evidence {inc.ragDrafter ? 'Indexed' : 'Pending'}</span>
                  </div>
                  {inc.ragDrafter?.counterNarrative.headline && (
                    <p className="text-sm text-slate-400 mt-3">{inc.ragDrafter.counterNarrative.headline}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => {
                        setCurrentIncidentId(inc.id);
                        setPage('counter_narrative');
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-md bg-emerald-600 text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setCurrentIncidentId(inc.id);
                        handleDismiss(inc.id);
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-md bg-rose-950 border border-rose-700 text-rose-200"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        setCurrentIncidentId(inc.id);
                        handleRequestRedraft();
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-md bg-slate-800 border border-slate-600"
                    >
                      Request more evidence
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
