import React, { useMemo, useState } from 'react';
import { IncidentClaim, MainAppPage, SystemMetrics } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { CountUp } from '../components/ui/CountUp';
import { formatReach, severityOf, severityTone, STAGE_LABEL } from '../lib/ui';

export const DashboardPage = ({
  incidents,
  currentIncident,
  metrics,
  setCurrentIncidentId,
  setPage,
}: {
  incidents: IncidentClaim[];
  currentIncident: IncidentClaim;
  metrics: SystemMetrics;
  setCurrentIncidentId: (id: string) => void;
  setPage: (p: MainAppPage) => void;
}) => {
  const { t } = useLanguage();
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h');
  const highSeverity = incidents.filter((i) => ['high', 'critical'].includes(severityOf(i))).length;
  const reviewed = incidents.filter((i) => i.humanReview.status !== 'pending').length;
  const active = incidents.filter((i) => i.currentStage !== 'dispatched').length;

  const dist = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    incidents.forEach((i) => {
      counts[severityOf(i)] += 1;
    });
    return counts;
  }, [incidents]);

  /**
   * Real activity histogram: claims bucketed by when their pipeline ran,
   * taken from the first audit-event timestamp (falling back to the ingestion
   * timestamp). Replaces a hardcoded array that ignored the data entirely.
   */
  const activity = useMemo(() => {
    const buckets = range === '24h' ? 12 : range === '7d' ? 7 : 30;
    const msPer = range === '24h' ? 2 * 3600_000 : 24 * 3600_000;
    const now = Date.now();
    const counts = new Array(buckets).fill(0);

    for (const inc of incidents) {
      const stamp = inc.auditTrail?.[0]?.timestamp || inc.ingestion.timestamp;
      const at = Date.parse(stamp);
      if (!Number.isFinite(at)) continue;
      const idx = buckets - 1 - Math.floor((now - at) / msPer);
      if (idx >= 0 && idx < buckets) counts[idx] += 1;
    }
    return { counts, max: Math.max(1, ...counts) };
  }, [incidents, range]);

  const inWindow = activity.counts.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        kicker={t('dash.kicker')}
        title={t('dash.title')}
        subtitle={t('dash.subtitle')}
        live
      />

      <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
        {[
          { label: t('dash.flaggedClaims'), val: metrics.activeIncidentsCount },
          { label: t('dash.activeInvestigations'), val: active },
          { label: t('dash.highSeverity'), val: highSeverity },
          { label: t('dash.claimsReviewed'), val: reviewed },
          { label: t('dash.verifiedSources'), val: metrics.indexedFactCheckCount },
          { label: t('dash.avgResponse'), val: metrics.avgPipelineLatencySeconds, decimals: 1 },
        ].map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="text-3xl font-extrabold text-cyan-300">
              <CountUp value={k.val} decimals={k.decimals || 0} />
            </div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500 mt-2">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="premium-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm tracking-widest text-slate-300 font-bold">Misinformation activity</h2>
            <div className="flex gap-1">
              {(['24h', '7d', '30d'] as const).map((r) => (
                <button key={r} onClick={() => setRange(r)} className={`filter-chip ${range === r ? 'active' : ''}`}>
                  {r === '24h' ? '24 hours' : r === '7d' ? '7 days' : '30 days'}
                </button>
              ))}
            </div>
          </div>
          {inWindow === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-slate-500">
              No claims processed in the last {range === '24h' ? '24 hours' : range === '7d' ? '7 days' : '30 days'}.
            </div>
          ) : (
            <div className="h-56 flex items-end gap-2">
              {activity.counts.map((n, i) => (
                <div
                  key={i}
                  className="flex-1 bg-slate-800/80 rounded-t-md h-full flex items-end"
                  title={`${n} claim${n === 1 ? '' : 's'}`}
                >
                  <div
                    className="w-full bg-gradient-to-t from-cyan-700 to-cyan-300 rounded-t-md transition-all"
                    style={{ height: `${(n / activity.max) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
            <span>{range === '24h' ? '24h ago' : range === '7d' ? '7d ago' : '30d ago'}</span>
            <span>
              {inWindow} claim{inWindow === 1 ? '' : 's'} processed · peak {activity.max}
            </span>
            <span>now</span>
          </div>
        </div>

        <div className="premium-card p-6">
          <h2 className="text-sm tracking-widest text-slate-300 font-bold mb-4">Claim severity</h2>
          {(['critical', 'high', 'medium', 'low'] as const).map((s) => {
            const tone = severityTone(s);
            const total = Math.max(1, incidents.length);
            return (
              <div key={s} className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className={`${tone.text} uppercase tracking-widest font-bold`}>{s}</span>
                  <span className="text-slate-400">{dist[s]}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className={`h-2 rounded-full ${tone.bar}`} style={{ width: `${(dist[s] / total) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="premium-card p-6">
        <h2 className="text-sm tracking-widest text-slate-300 font-bold mb-4">Live claim monitor</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {incidents.slice(0, 4).map((inc) => {
            const sev = severityOf(inc);
            const tone = severityTone(sev);
            return (
              <div key={inc.id} className={`rounded-xl border p-4 ${tone.border} ${tone.bg}`}>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className={tone.text}>{sev} • veracity {inc.detector?.veracityScore ?? 0}/100</span>
                  <span className="text-slate-400">{STAGE_LABEL[inc.currentStage]}</span>
                </div>
                <p className="text-sm text-slate-100 mt-2 line-clamp-2">“{inc.title}”</p>
                <div className="grid grid-cols-4 gap-2 mt-3 text-[10px] uppercase tracking-wider text-slate-400">
                  <span>Conf {inc.detector?.confidence ?? '—'}%</span>
                  <span>
                    Origin{' '}
                    {inc.origin?.timeline?.length
                      ? `${inc.origin.timeline.length} outlet${inc.origin.timeline.length === 1 ? '' : 's'}`
                      : 'none'}
                  </span>
                  <span>Spread {formatReach(inc.spread?.projected6hReachUncontained)}</span>
                  <span>
                    Evidence{' '}
                    {inc.ragDrafter?.sources?.length
                      ? `${inc.ragDrafter.sources.length} src`
                      : 'none'}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setCurrentIncidentId(inc.id);
                      setPage('investigation');
                    }}
                    className="px-3 py-1.5 text-xs rounded-md bg-slate-900 border border-slate-700"
                  >
                    View analysis
                  </button>
                  <button
                    onClick={() => {
                      setCurrentIncidentId(inc.id);
                      setPage('investigation');
                    }}
                    className="px-3 py-1.5 text-xs rounded-md bg-cyan-950 border border-cyan-700 text-cyan-300"
                  >
                    Investigate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
