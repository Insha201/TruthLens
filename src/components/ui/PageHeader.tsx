import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const PageHeader: React.FC<{
  kicker?: string;
  title: string;
  subtitle?: string;
  live?: boolean;
  actions?: React.ReactNode;
}> = ({ kicker, title, subtitle, live, actions }) => {
  const { t } = useLanguage();
  return (
  <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
    <div>
      {kicker && (
        <div className="text-[11px] tracking-[0.22em] uppercase text-cyan-400/80 font-semibold mb-2">
          {kicker}
        </div>
      )}
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">{title}</h1>
      {subtitle && <p className="text-slate-400 mt-2 max-w-2xl">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-3">
      {live && (
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          {t('dash.liveMonitoring')}
        </span>
      )}
      {actions}
    </div>
  </header>
  );
};
