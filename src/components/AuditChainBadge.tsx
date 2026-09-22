import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldQuestion, Loader2 } from 'lucide-react';

type ChainStatus = 'intact' | 'broken' | 'not_chained';

interface ChainResult {
  status: ChainStatus;
  verified: boolean;
  events_total: number;
  events_chained: number;
  events_unchained_legacy: number;
  broken_at_seq: number | null;
  reason: string | null;
  tip_hash: string | null;
}

/**
 * Integrity badge for a claim's audit trail.
 *
 * Every audit event carries the SHA-256 of its own contents plus the hash of
 * the previous event on the same claim, so editing any stored event breaks
 * every event after it. This asks the backend to recompute that chain and
 * reports the result verbatim — including the "nothing is chained yet" case,
 * which is deliberately NOT shown as a pass.
 */
export const AuditChainBadge: React.FC<{ claimId: string }> = ({ claimId }) => {
  const [data, setData] = useState<ChainResult | null>(null);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    setPhase('loading');
    fetch(`/api/claims/${encodeURIComponent(claimId)}/verify-chain`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: ChainResult) => {
        if (!cancelled) {
          setData(d);
          setPhase('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setPhase('error');
      });
    return () => {
      cancelled = true;
    };
  }, [claimId]);

  if (phase === 'loading') {
    return (
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Verifying audit chain…
      </div>
    );
  }

  if (phase === 'error' || !data) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
        <ShieldQuestion className="w-3.5 h-3.5" />
        Chain integrity unavailable — backend unreachable.
      </div>
    );
  }

  const tone = {
    intact: {
      Icon: ShieldCheck,
      ring: 'border-emerald-500/40 bg-emerald-500/10',
      text: 'text-emerald-300',
      label: 'Audit chain verified',
    },
    broken: {
      Icon: ShieldAlert,
      ring: 'border-red-500/50 bg-red-500/10',
      text: 'text-red-300',
      label: 'Audit chain BROKEN',
    },
    not_chained: {
      Icon: ShieldQuestion,
      ring: 'border-slate-500/40 bg-slate-500/10',
      text: 'text-slate-300',
      label: 'Not chained',
    },
  }[data.status];

  const { Icon } = tone;

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border px-4 py-3 ${tone.ring}`}>
      <span className={`flex items-center gap-2 text-sm font-bold ${tone.text}`}>
        <Icon className="w-4 h-4" />
        {tone.label}
      </span>

      {data.status === 'intact' && (
        <span className="text-[11px] font-mono text-slate-400">
          {data.events_chained} events · SHA-256 · tip{' '}
          <b className="text-slate-200">{data.tip_hash?.slice(0, 16)}…</b>
        </span>
      )}

      {data.status === 'broken' && (
        <span className="text-[11px] font-mono text-red-300/90">
          Event #{data.broken_at_seq}: {data.reason}
        </span>
      )}

      {data.status === 'not_chained' && (
        <span className="text-[11px] font-mono text-slate-400">
          {data.events_unchained_legacy} event(s) predate integrity checking — nothing to verify.
        </span>
      )}
    </div>
  );
};
