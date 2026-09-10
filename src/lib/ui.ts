import { ClaimSeverity, IncidentClaim, PipelineStage } from '../types';

export const STAGE_LABEL: Record<PipelineStage, string> = {
  idle: 'Idle',
  ingestion: 'Ingestion',
  detector: 'Claim Detector',
  origin_tracer: 'Origin Tracer',
  spread_predictor: 'Spread Predictor',
  rag_drafter: 'Evidence / RAG',
  hitl_gate: 'Human Review',
  dispatched: 'Dispatched',
};

export function severityOf(incident?: IncidentClaim): ClaimSeverity {
  return incident?.detector?.severity ?? 'medium';
}

export function severityTone(severity: ClaimSeverity) {
  switch (severity) {
    case 'critical':
      return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', bar: 'bg-rose-500' };
    case 'high':
      return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bar: 'bg-amber-500' };
    case 'medium':
      return { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', bar: 'bg-cyan-500' };
    default:
      return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', bar: 'bg-emerald-500' };
  }
}

export function formatReach(n?: number) {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

export function reviewLabel(incident: IncidentClaim) {
  if (incident.currentStage === 'dispatched') return 'Resolved';
  if (incident.humanReview.status === 'rejected') return 'Rejected';
  if (incident.humanReview.status === 'pending') return 'Under Review';
  return 'New';
}
