import React, { useMemo, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import {
  ClaimDomain,
  DOMAIN_LABELS,
  DOMAIN_ORDER,
  IncidentClaim,
  MainAppPage,
} from '../types';
import { formatReach, severityOf, severityTone } from '../lib/ui';

export interface EvidenceDoc {
  id: string;
  text: string;
  publisher?: string;
  domain?: ClaimDomain;
  used_by?: Array<{ id: string; claim: string; category: string }>;
}

export interface EvidenceStore {
  count: number;
  documents: EvidenceDoc[];
}

export const EvidenceReviewPage = ({
  evidenceStore,
  handleAddEvidence,
  incidents,
  setCurrentIncidentId,
  setPage,
  handleReviewDecision,
}: {
  evidenceStore: EvidenceStore;
  handleAddEvidence: (text: string) => void;
  incidents: IncidentClaim[];
  setCurrentIncidentId: (id: string) => void;
  setPage: (p: MainAppPage) => void;
  handleReviewDecision: (id: string, approved: boolean) => void;
}) => {
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState<ClaimDomain | 'all'>('all');
  const [onlyUsed, setOnlyUsed] = useState(false);
  const [draft, setDraft] = useState('');

  const openClaim = (id: string) => {
    setCurrentIncidentId(id);
    setPage('counter_narrative');
  };

  /** Filter + group evidence by subject domain, most-used first. */
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = evidenceStore.documents.filter((d) => {
      if (q && !d.text.toLowerCase().includes(q)) return false;
      if (domain !== 'all' && (d.domain || 'other') !== domain) return false;
      if (onlyUsed && !(d.used_by && d.used_by.length)) return false;
      return true;
    });

    const byDomain = new Map<ClaimDomain, EvidenceDoc[]>();
    for (const d of filtered) {
      const k = (d.domain || 'other') as ClaimDomain;
      if (!byDomain.has(k)) byDomain.set(k, []);
      byDomain.get(k)!.push(d);
    }
    for (const list of byDomain.values()) {
      list.sort((a, b) => (b.used_by?.length ?? 0) - (a.used_by?.length ?? 0));
    }
    return DOMAIN_ORDER.filter((d) => byDomain.has(d)).map((d) => ({
      domain: d,
      docs: byDomain.get(d)!,
    }));
  }, [evidenceStore.documents, search, domain, onlyUsed]);

  const shown = grouped.reduce((n, g) => n + g.docs.length, 0);
  const linked = evidenceStore.documents.filter((d) => d.used_by?.length).length;

  /** Claims awaiting a human decision, grouped by the same domains. */
  const queueByDomain = useMemo(() => {
    // Everything the pipeline has analysed and no human has ruled on yet.
    // Previously this only listed claims escalated to `hitl_gate`, so the
    // queue sat empty while analysed claims had nowhere to be reviewed.
    const queue = incidents
      .filter((i) => i.humanReview.status === 'pending')
      .sort((a, b) => (b.detector?.confidence ?? 0) - (a.detector?.confidence ?? 0));
    const m = new Map<ClaimDomain, IncidentClaim[]>();
    for (const inc of queue) {
      const k = (inc.category || 'other') as ClaimDomain;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(inc);
    }
    return DOMAIN_ORDER.filter((d) => m.has(d)).map((d) => ({ domain: d, claims: m.get(d)! }));
  }, [incidents]);

  const queueCount = queueByDomain.reduce((n, g) => n + g.claims.length, 0);

  return (
    <div className="space-y-10">
      <PageHeader
        kicker="Verification"
        title="Evidence & Human Review"
        subtitle="The fact-check corpus the drafter rebuts from, grouped by subject, and every analysed claim awaiting a human decision."
      />

      {/* ── RAG vector store ───────────────────────────────── */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm tracking-widest uppercase text-slate-400 font-bold">
            RAG evidence store
          </h2>
          <span className="text-xs text-slate-500">
            {evidenceStore.count} indexed · {linked} linked to a claim
          </span>
        </div>

        <div className="premium-card p-6 space-y-5">
          <div className="rounded-md border border-cyan-900/60 bg-cyan-950/20 p-3 text-xs text-slate-300">
            <span className="font-bold text-cyan-300">These are verified fact-checks, not misinformation.</span>{' '}
            Each is a published debunk or authority statement from Snopes, FactCheck.org, Full Fact,
            PolitiFact or WHO. The Narrative Drafter can only assert what it finds here. Where a
            document has actually been used to rebut a claim, that claim is linked underneath it —
            click through to read the counter-narrative it produced.
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setDomain('all')}
              className={`filter-chip ${domain === 'all' ? 'active' : ''}`}
            >
              All domains
            </button>
            {DOMAIN_ORDER.map((d) => (
              <button
                key={d}
                onClick={() => setDomain(d)}
                className={`filter-chip ${domain === d ? 'active' : ''}`}
              >
                {DOMAIN_LABELS[d]}
              </button>
            ))}
            <label className="flex items-center gap-1.5 text-xs text-slate-400 ml-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyUsed}
                onChange={(e) => setOnlyUsed(e.target.checked)}
                className="accent-cyan-500"
              />
              only evidence in use
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search snippets…"
              className="ml-auto bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-200 w-56 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {evidenceStore.count === 0 ? (
            <div className="text-sm text-amber-300/80 border border-amber-800/50 rounded-md p-4">
              The RAG store is empty. Counter-narrative drafting will return “no evidence” until
              fact-checks are indexed below.
            </div>
          ) : shown === 0 ? (
            <div className="text-sm text-slate-500">No snippets match those filters.</div>
          ) : (
            <div className="space-y-7">
              {grouped.map(({ domain: d, docs }) => (
                <div key={d}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                      {DOMAIN_LABELS[d]}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-600">{docs.length}</span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="rounded-xl border border-slate-800 p-4 bg-slate-950/40 flex flex-col"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {doc.publisher || 'source'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600">
                            verified fact-check
                          </span>
                        </div>
                        <p className="text-sm text-slate-200 flex-1">{doc.text}</p>

                        {doc.used_by?.length ? (
                          <div className="mt-3 pt-3 border-t border-slate-800">
                            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">
                              Rebuts {doc.used_by.length} claim{doc.used_by.length === 1 ? '' : 's'}
                            </div>
                            <div className="space-y-1">
                              {doc.used_by.map((u) => (
                                <button
                                  key={u.id}
                                  onClick={() => openClaim(u.id)}
                                  className="block text-left text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                                >
                                  “{u.claim}”
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-600">
                            Not yet matched to any claim.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Index a new snippet — writes to the real store */}
          <div className="border-t border-slate-800 pt-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">
              Index a verified fact-check
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                placeholder="Paste a short, factual statement from a trusted source…"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => {
                  handleAddEvidence(draft);
                  setDraft('');
                }}
                disabled={!draft.trim()}
                className="px-4 py-2 text-xs font-bold rounded-md bg-cyan-600 text-white disabled:opacity-50 self-start"
              >
                Index
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Human review queue, grouped by the same domains ── */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm tracking-widest uppercase text-amber-300 font-bold">
            Human review queue
          </h2>
          <span className="text-xs text-slate-500">{queueCount} awaiting a decision</span>
        </div>

        {queueCount === 0 ? (
          <div className="premium-card p-10 text-center text-slate-500">
            No claims currently require human review.
          </div>
        ) : (
          <div className="space-y-7">
            {queueByDomain.map(({ domain: d, claims }) => (
              <div key={d}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-amber-300/80">
                    {DOMAIN_LABELS[d]}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-600">{claims.length}</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                <div className="space-y-4">
                  {claims.map((inc) => {
                    const sev = severityOf(inc);
                    const tone = severityTone(sev);
                    const srcCount = inc.ragDrafter?.sources?.length ?? 0;
                    return (
                      <div key={inc.id} className="premium-card p-5">
                        {inc.currentStage === 'hitl_gate' && (
                          <div className="flex items-center gap-2 text-amber-300 text-[10px] font-bold tracking-widest uppercase mb-2">
                            ⚠ Auto-escalated - high severity
                          </div>
                        )}
                        <p className="text-slate-100">“{inc.claimText}”</p>
                        <div className={`flex flex-wrap gap-4 mt-3 text-[11px] uppercase tracking-wider ${tone.text}`}>
                          <span>Severity {sev}</span>
                          <span>Confidence {inc.detector?.confidence ?? '—'}%</span>
                          <span>Origin {inc.origin?.patientZero.username ?? '—'}</span>
                          <span>Spread {formatReach(inc.spread?.projected6hReachUncontained)}</span>
                          <span>Evidence {srcCount} src</span>
                        </div>

                        {inc.detector?.reasoning && (
                          <p className="text-sm text-slate-400 mt-3">
                            <span className="text-slate-500">Why flagged: </span>
                            {inc.detector.reasoning}
                          </p>
                        )}

                        {inc.detector?.manipulationTechniques?.length ? (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {inc.detector.manipulationTechniques.map((tech, i) => (
                              <span
                                key={i}
                                className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <p className="text-sm text-slate-400 mt-3">
                          <span className="text-slate-500">Counter-narrative: </span>
                          {srcCount
                            ? inc.ragDrafter?.counterNarrative.fullRebuttal
                            : `not generated — no ${DOMAIN_LABELS[d].toLowerCase()} evidence in the store matched this claim.`}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() => handleReviewDecision(inc.id, true)}
                            className="px-4 py-2 text-xs font-bold rounded-md bg-emerald-600 text-white"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewDecision(inc.id, false)}
                            className="px-4 py-2 text-xs font-bold rounded-md bg-rose-950 border border-rose-700 text-rose-200"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => openClaim(inc.id)}
                            className="px-4 py-2 text-xs font-bold rounded-md bg-slate-800 border border-slate-600"
                          >
                            Open full analysis
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
