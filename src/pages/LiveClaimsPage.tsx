import React, { useMemo, useState } from 'react';
import { ClaimDomain, DOMAIN_LABELS, DOMAIN_ORDER, IncidentClaim, MainAppPage } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { formatReach, reviewLabel, severityOf, severityTone, STAGE_LABEL } from '../lib/ui';

export const LiveClaimsPage = ({
  incidents,
  setCurrentIncidentId,
  setPage,
}: {
  incidents: IncidentClaim[];
  currentIncident: IncidentClaim;
  setCurrentIncidentId: (id: string) => void;
  setPage: (p: MainAppPage) => void;
}) => {
  const { t, td } = useLanguage();
  const [filter, setFilter] = useState('ALL');
  const [domain, setDomain] = useState<ClaimDomain | 'all'>('all');
  const chips = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NEW', 'UNDER REVIEW', 'RESOLVED'];

  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      if (domain !== 'all' && (inc.category || 'other') !== domain) return false;
      const sev = severityOf(inc);
      const review = reviewLabel(inc);
      if (filter === 'ALL') return true;
      if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(filter)) return sev === filter.toLowerCase();
      if (filter === 'NEW') return review === 'New';
      if (filter === 'UNDER REVIEW') return review === 'Under Review';
      if (filter === 'RESOLVED') return review === 'Resolved';
      return true;
    });
  }, [incidents, filter, domain]);

  // How many claims sit in each domain, so the filter row shows real counts.
  const domainCounts = useMemo(() => {
    const m = new Map<ClaimDomain, number>();
    for (const inc of incidents) {
      const k = (inc.category || 'other') as ClaimDomain;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, [incidents]);

  return (
    <div className="space-y-6">
      <PageHeader kicker={t('claims.kicker')} title={t('claims.title')} live subtitle={t('claims.subtitle')} />
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 mr-1">Domain</span>
          <button
            onClick={() => setDomain('all')}
            className={`filter-chip ${domain === 'all' ? 'active' : ''}`}
          >
            All ({incidents.length})
          </button>
          {DOMAIN_ORDER.filter((d) => domainCounts.has(d)).map((d) => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              className={`filter-chip ${domain === d ? 'active' : ''}`}
            >
              {td(d)} ({domainCounts.get(d)})
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 mr-1">Status</span>
          {chips.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`filter-chip ${filter === c ? 'active' : ''}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4">
        {filtered.length === 0 && (
          <div className="premium-card p-10 text-center text-slate-500">No claims match this filter.</div>
        )}
        {filtered.map((inc) => {
          const sev = severityOf(inc);
          const tone = severityTone(sev);
          return (
            <div key={inc.id} className="premium-card p-5 flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 text-xs mb-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-mono text-slate-500">{inc.id}</span>
                  <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800/60 text-slate-300 uppercase tracking-widest">
                    {DOMAIN_LABELS[(inc.category || 'other') as ClaimDomain]}
                  </span>
                  <span className={`px-2 py-0.5 rounded border uppercase tracking-widest font-bold ${tone.text} ${tone.border} ${tone.bg}`}>
                    {sev}
                  </span>
                  <span className="text-slate-500">{inc.ingestion.timestamp}</span>
                </div>
                <p className="text-slate-100">“{inc.claimText}”</p>
                <div className="flex flex-wrap gap-4 mt-3 text-[11px] uppercase tracking-wider text-slate-400">
                  <span>Confidence {inc.detector?.confidence ?? '—'}%</span>
                  <span>Origin {inc.origin?.patientZero.username ?? 'Tracing…'}</span>
                  <span>Spread {formatReach(inc.spread?.currentReach)}</span>
                  <span>Evidence {inc.ragDrafter ? 'Indexed' : 'Pending'}</span>
                  <span>Stage {STAGE_LABEL[inc.currentStage]}</span>
                  <span>Status {reviewLabel(inc)}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentIncidentId(inc.id);
                  setPage('investigation');
                }}
                className="px-4 py-2 rounded-md bg-slate-800 border border-slate-600 text-sm font-semibold"
              >
                Investigate
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
