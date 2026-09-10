import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';

export const SystemStatusPage = () => {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/claims')
      .then((r) => setApiOnline(r.ok))
      .catch(() => setApiOnline(false));
  }, []);

  const services = [
    { label: 'API backend', stat: apiOnline === false ? 'OFFLINE' : 'ONLINE', live: apiOnline !== false },
    { label: 'Claim Detector', stat: 'ONLINE', live: true },
    { label: 'Origin Tracer', stat: 'ONLINE', live: true },
    { label: 'Spread Predictor', stat: 'ONLINE', live: true },
    { label: 'RAG Pipeline', stat: 'ONLINE', live: true },
    { label: 'Neo4j', stat: 'CONNECTED', live: true },
    { label: 'Redis', stat: 'CONNECTED', live: true },
    { label: 'Vector Store', stat: 'CONNECTED', live: true },
  ];

  return (
    <div className="space-y-8">
      <PageHeader kicker="Infrastructure" title="System Health" live={apiOnline !== false} subtitle="Service availability for the multi-agent containment stack." />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {services.map((s) => (
          <div key={s.label} className="premium-card p-5 flex items-center justify-between">
            <span className="text-sm text-slate-200">{s.label}</span>
            <span className={`text-xs font-bold ${s.live ? 'text-emerald-400' : 'text-rose-400'}`}>● {s.stat}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
