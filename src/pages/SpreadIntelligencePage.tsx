import React from 'react';
import { NetworkGraphVisualizer } from '../components/NetworkGraphVisualizer';
import { PageHeader } from '../components/ui/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { IncidentClaim } from '../types';
import { formatReach } from '../lib/ui';

const riskBand = (r0?: number) => {
  if (r0 == null) return '—';
  const norm = Math.min(1, Math.max(0, (r0 - 0.8) / 4)); // r0 0.8..4.8 -> 0..1
  return norm >= 0.6 ? 'High' : norm >= 0.33 ? 'Medium' : 'Low';
};

export const SpreadIntelligencePage = ({ currentIncident }: { currentIncident: IncidentClaim }) => {
  const { t } = useLanguage();
  const spread = currentIncident?.spread;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker={t('spread.kicker')}
        title={t('spread.title')}
        subtitle={t('spread.subtitle')}
      />
      <div className="grid xl:grid-cols-[1fr_260px] gap-6">
        <div className="premium-card p-4 min-h-[540px]">
          {spread ? (
            <NetworkGraphVisualizer incident={currentIncident} />
          ) : (
            <div className="h-[420px] flex items-center justify-center text-sm text-cyan-400/80">
              Spread not yet modelled for this claim.
            </div>
          )}
        </div>

        <aside className="premium-card p-5 h-fit space-y-5">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500">Spread risk</div>
            <div className="text-2xl font-extrabold text-rose-400 mt-1">
              {riskBand(spread?.r0ViralFactor)}
              {spread?.r0ViralFactor != null ? (
                <span className="text-sm text-slate-500 font-normal"> · R0 {spread.r0ViralFactor}</span>
              ) : null}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500">Est. reach now</div>
            <div className="text-2xl font-extrabold text-white mt-1">{formatReach(spread?.currentReach)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500">Spread velocity</div>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">
              {spread?.velocityPerDay ?? 0}
              <span className="text-sm text-slate-500 font-normal">/day</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500">Outlets · clusters</div>
            <div className="text-2xl font-extrabold text-cyan-300 mt-1">
              {/* observed outlets come from the Origin Tracer timeline, not from
                  node types (an empty graph still draws a placeholder anchor);
                  clusters are counted off the same nodes the graph draws. */}
              {currentIncident?.origin?.timeline?.length ?? 0}
              <span className="text-slate-500"> · </span>
              {spread
                ? spread.networkNodes.filter(
                    (n) => n.type === 'community' || n.type === 'susceptible_hub',
                  ).length
                : 0}
            </div>
          </div>
          <div className="text-xs text-slate-500 leading-relaxed">
            Reach figures are order-of-magnitude estimates from per-platform audience proxies, not
            measured views. Projected clusters are model output, not observed nodes.
          </div>
        </aside>
      </div>
    </div>
  );
};
