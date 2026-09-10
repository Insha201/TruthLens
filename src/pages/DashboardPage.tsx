import React, { useMemo, useState } from 'react';
import { IncidentClaim, MainAppPage, SystemMetrics } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
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

  const bars = [18, 24, 16, 32, 28, 41, 36, 22, 30, 44, 38, 27];

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Operations"
        title="Misinformation Intelligence Center"
        subtitle="Monitor, investigate and contain misinformation in real time."
        live
      />

      <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
        {[
          { label: 'Flagged claims', val: metrics.activeIncidentsCount },
          { label: 'Active investigations', val: active },
          { label: 'High severity', val: highSeverity },
          { label: 'Claims reviewed', val: reviewed },
          { label: 'Verified sources', val: metrics.indexedFactCheckCount },
          { label: 'Avg response (s)', val: metrics.avgPipelineLatencySeconds, decimals: 1 },
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
          <div className="h-56 flex items-end gap-2">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 bg-slate-800/80 rounded-t-md relative overflow-hidden h-full flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-cyan-700 to-cyan-300 rounded-t-md"
                  style={{ height: `${h + (range === '7d' ? 8 : range === '30d' ? 16 : 0)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
            <span>Detected</span>
            <span>Investigations</span>
            <span>High severity</span>
            <span>Resolved</span>
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
                  <span className={tone.text}>{sev} • {(inc.detector?.veracityScore ?? 0) / 10}/10</span>
                  <span className="text-slate-400">{STAGE_LABEL[inc.currentStage]}</span>
                </div>
                <p className="text-sm text-slate-100 mt-2 line-clamp-2">“{inc.title}”</p>
                <div className="grid grid-cols-4 gap-2 mt-3 text-[10px] uppercase tracking-wider text-slate-400">
                  <span>Conf {inc.detector?.confidence ?? '—'}%</span>
                  <span>Origin {inc.origin ? 'Traced' : '—'}</span>
                  <span>Spread {formatReach(inc.spread?.projected6hReachUncontained)}</span>
                  <span>Evidence {inc.ragDrafter ? 'Verified' : 'Pending'}</span>
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
