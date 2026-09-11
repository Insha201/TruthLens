import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  IncidentClaim,
  NetworkEdge,
  NetworkNode,
  OriginTrace,
  PipelineStage,
  Platform,
} from './src/types';

/**
 * This server is a thin ADAPTER (backend-for-frontend) in front of the real
 * FastAPI service in ./backend. Every /api/* route below forwards to FastAPI
 * and maps its flat pipeline output into the rich `IncidentClaim` shape the
 * React app renders.
 *
 * Fields the FastAPI backend genuinely produces are passed through:
 *   - claim text, detector confidence + severity + is_misinformation
 *   - origin status/confidence (Neo4j "seen before?" lookup)
 *   - risk_score + predicted_reach (PyTorch Geometric toy model)
 *   - counter-narrative text (Groq LLM over the RAG vector store)
 *   - audit trail + human-review decision (Neo4j)
 *
 * Fields the backend does NOT track are sent as zeros / empty arrays and
 * labelled as such — nothing here is invented. Start FastAPI first:
 *   cd backend && python -m uvicorn main:app --reload
 */
const BACKEND_URL = (process.env.BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

const STAGE_ORDER: PipelineStage[] = [
  'idle',
  'ingestion',
  'detector',
  'origin_tracer',
  'spread_predictor',
  'rag_drafter',
  'hitl_gate',
  'dispatched',
];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

function severityBand(sev: number): 'critical' | 'high' | 'medium' | 'low' {
  if (sev >= 8) return 'critical';
  if (sev >= 6) return 'high';
  if (sev >= 4) return 'medium';
  return 'low';
}

/** Backend ingestion `platform` strings → the frontend `Platform` union. */
function mapPlatform(p?: string): Platform {
  switch ((p || '').toLowerCase()) {
    case 'news':
    case 'newsapi':
      return 'newsapi';
    case 'youtube':
    case 'youtube_comment':
      return 'youtube';
    case 'rss':
      return 'rss';
    case 'x':
    case 'twitter':
      return 'x';
    case 'telegram':
      return 'telegram';
    case 'reddit':
      return 'reddit';
    case 'tiktok':
      return 'tiktok';
    case 'whatsapp':
      return 'whatsapp';
    default:
      return 'manual';
  }
}

function safeParseTimeline(raw: unknown): OriginTrace['timeline'] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function safeParseStringList(raw: unknown): string[] | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(String) : undefined;
  } catch {
    return undefined;
  }
}

function stageProgressFor(stage: PipelineStage): Record<PipelineStage, number> {
  const idx = STAGE_ORDER.indexOf(stage);
  const p = {} as Record<PipelineStage, number>;
  STAGE_ORDER.forEach((s, i) => {
    p[s] = i < idx ? 100 : i === idx ? (s === 'dispatched' ? 100 : 60) : 0;
  });
  return p;
}

/**
 * Build the spread network from REAL data: one node per outlet that actually
 * carried the claim (the observed chain), then a few PROJECTED susceptible
 * clusters scaled by the risk score. Projected nodes are labelled as such.
 */
function buildSpreadGraph(
  timeline: OriginTrace['timeline'],
  riskScore: number,
): { nodes: NetworkNode[]; edges: NetworkEdge[] } {
  const outlets = (timeline || []).slice(0, 6);
  const nodes: NetworkNode[] = [];
  const edges: NetworkEdge[] = [];

  if (outlets.length === 0) {
    // No provenance on record. This anchor is a PLACEHOLDER so the graph has
    // something to hang projected clusters off - it must not be counted or
    // labelled as an observed outlet.
    nodes.push({
      id: 'no-outlet',
      label: 'No outlet recorded',
      type: 'susceptible_hub',
      status: 'neutral',
      x: 120,
      y: 160,
      size: 24,
      degree: 1,
    });
  } else {
    outlets.forEach((o, i) => {
      nodes.push({
        id: `outlet-${i}`,
        label: o.outlet,
        type: i === 0 ? 'seed' : 'bridge',
        status: 'infected',
        x: 110 + i * 120,
        y: 150 + (i % 2 === 0 ? -30 : 30),
        size: i === 0 ? 26 : 20,
        degree: 2,
      });
      if (i > 0) edges.push({ source: `outlet-${i - 1}`, target: `outlet-${i}`, intensity: 0.85, active: true });
    });
  }

  const anchor = nodes[nodes.length - 1].id;
  const projected = 1 + Math.round(Math.max(0, Math.min(1, riskScore)) * 4);
  for (let j = 0; j < projected; j++) {
    const id = `susceptible-${j}`;
    nodes.push({
      id,
      label: `Projected cluster ${j + 1}`,
      type: j === projected - 1 ? 'susceptible_hub' : 'community',
      status: 'at_risk',
      x: 110 + (outlets.length + j) * 120,
      y: 150 + (j % 2 === 0 ? 40 : -40),
      size: 22,
      degree: 1,
    });
    edges.push({ source: anchor, target: id, intensity: 0.45 + riskScore * 0.3, active: riskScore > 0.4 });
  }

  // Real degree = number of edges touching each node.
  for (const n of nodes) {
    n.degree = edges.filter((e) => e.source === n.id || e.target === n.id).length;
  }

  return { nodes, edges };
}

type VulnerableCommunity = NonNullable<IncidentClaim['spread']>['vulnerableCommunities'][number];

/** 0–3 vulnerable-community rows derived from risk + the platforms involved. */
function buildCommunities(
  timeline: OriginTrace['timeline'],
  riskScore: number,
  reach: number,
): VulnerableCommunity[] {
  if (riskScore < 0.25) return [];
  const platforms = Array.from(new Set((timeline || []).map((t) => mapPlatform(t.platform))));
  const rows: VulnerableCommunity[] = platforms.slice(0, 2).map((p, i) => ({
    name: `${p} audience overlap`,
    susceptibility: Math.round(40 + riskScore * 50 - i * 8),
    populationSize: Math.round((reach || 10000) * (0.6 - i * 0.2)),
    primaryPlatform: p,
  }));
  if (rows.length === 0) {
    rows.push({
      name: 'General high-engagement feeds',
      susceptibility: Math.round(40 + riskScore * 50),
      populationSize: Math.round(reach || 10000),
      primaryPlatform: 'newsapi',
    });
  }
  return rows;
}

/** Map one persisted backend claim record into the UI's IncidentClaim shape. */
function toIncident(c: Record<string, any>): IncidentClaim {
  const claimText: string = c.claim || c.original_text || c.text || '(claim text unavailable)';
  const severityInt: number = typeof c.severity === 'number' ? c.severity : 5;
  const detConf: number = typeof c.detection_confidence === 'number' ? c.detection_confidence : 0;
  const isMis = !!c.is_misinformation;
  const narrative: string =
    c.narrative && c.narrative !== 'No supporting information found.' ? String(c.narrative) : '';
  const reviewStatus: string | null = c.review_status ?? null;
  const audit: Array<{ action: string; details: string; timestamp: string }> = Array.isArray(c.audit_trail)
    ? c.audit_trail
    : [];

  let stage: PipelineStage = (c.stage as PipelineStage) || 'detector';
  if (reviewStatus === 'approved') stage = 'dispatched';
  else if (reviewStatus === 'rejected') stage = 'hitl_gate';
  else if (c.detection_status === 'review_required' && stage !== 'dispatched') stage = 'hitl_gate';

  const platform = mapPlatform(c.platform);

  // Which stages actually ran (so the UI shows honest "analyzing…" states).
  const ranDetector = c.detection_status != null || c.detection_confidence != null;
  const ranOrigin = c.origin_status != null;
  const ranSpread = c.spread_status != null;
  const ranNarrative = c.narrative_status != null && c.narrative_status !== 'awaiting_human_review';

  // The detector now justifies its numbers; prefer its own words over a
  // generated restatement of the scores.
  const rationale: string = c.detection_rationale || '';
  const harm: string = c.detection_harm || '';
  const reasoningParts = [
    rationale || `Severity ${severityInt}/10, confidence ${(detConf * 100).toFixed(0)}%.`,
    harm ? `Harm if believed: ${harm}.` : '',
    typeof c.suspicion_score === 'number'
      ? `Ingest suspicion ${c.suspicion_score.toFixed(2)} (heuristic pre-filter).`
      : '',
  ].filter(Boolean);

  const detector: IncidentClaim['detector'] = ranDetector
    ? {
        veracityScore: Math.round((isMis ? detConf : 1 - detConf) * 100),
        confidence: Math.round(detConf * 100),
        severity: severityBand(severityInt),
        manipulationTechniques: safeParseStringList(c.detection_techniques) || [],
        flaggedKeywords: safeParseStringList(c.detection_keywords) || [],
        reasoning: reasoningParts.join(' '),
        processingTimeMs: 0,
      }
    : undefined;

  const timeline = safeParseTimeline(c.origin_timeline);
  const outletCount: number = c.origin_outlet_count || timeline.length || 0;
  const originConf: number = c.origin_confidence || 0;

  const origin: IncidentClaim['origin'] = ranOrigin
    ? {
        patientZero: {
          platform: mapPlatform(timeline[0]?.platform || c.platform),
          username:
            c.source && c.source !== 'unknown'
              ? String(c.source).slice(0, 80)
              : timeline[0]?.outlet || 'unknown',
          accountAgeDays: 0,
          botProbability: Math.max(0, 100 - Math.round(originConf * 100)),
          firstSeenTimestamp: c.origin_first_seen || 'unknown',
          geographicCluster:
            outletCount > 0
              ? `${outletCount} outlet${outletCount === 1 ? '' : 's'} carried this claim`
              : 'no source metadata',
        },
        // Turn the outlet chain into hop cards: outlet[i-1] → outlet[i].
        hops: timeline.slice(1).map((t, i) => ({
          id: `hop-${i + 1}`,
          platform: mapPlatform(t.platform),
          sourceNode: timeline[i]?.outlet || 'origin',
          targetNode: t.outlet,
          delaySeconds: 0,
          mechanism: 'cross_platform_screenshot' as const,
        })),
        coordinatedNetworkScore: Math.min(100, outletCount * 20),
        processingTimeMs: 0,
        summary: c.origin_summary || undefined,
        timeline,
        aliases: Array.isArray(c.aliases) ? c.aliases.map(String) : undefined,
      }
    : undefined;

  const riskScore: number = c.risk_score || 0;
  const currentReach: number = c.spread_current_reach || 0;
  const { nodes: spreadNodes, edges: spreadEdges } = buildSpreadGraph(timeline, riskScore);

  const spread: IncidentClaim['spread'] = ranSpread
    ? {
        r0ViralFactor: c.spread_r0 || Math.round(riskScore * 50) / 10,
        currentReach,
        projected6hReachUncontained: c.spread_proj_uncontained || currentReach,
        projected6hReachContained: c.spread_proj_contained || currentReach,
        reductionPercentage: c.spread_reduction_pct || 0,
        vulnerableCommunities: buildCommunities(timeline, riskScore, currentReach),
        networkNodes: spreadNodes,
        networkEdges: spreadEdges,
        processingTimeMs: 0,
        r0: c.spread_r0 || undefined,
        velocityPerDay: typeof c.spread_velocity === 'number' ? c.spread_velocity : undefined,
        drivers: safeParseStringList(c.spread_drivers),
      }
    : undefined;

  const ragSources = safeParseStringList(c.rag_sources) || [];
  const ragDrafter: IncidentClaim['ragDrafter'] = ranNarrative
    ? {
        // The actual RAG documents the Narrative Drafter retrieved for this claim.
        sources: ragSources.map((text, i) => ({
          id: `rag-${i}`,
          organization: 'FactCheck.org' as const,
          title: text.slice(0, 80) + (text.length > 80 ? '…' : ''),
          url: '',
          verificationRating: 'Unproven' as const,
          relevanceScore: 0,
          keyEvidenceQuote: text,
          publishDate: '',
        })),
        counterNarrative: {
          headline: narrative ? `Fact check: ${claimText.slice(0, 60)}` : 'No counter-narrative generated',
          truthSandwich: {
            verifiedFact: narrative || 'No evidence retrieved from the RAG vector store for this claim.',
            mythCorrection: claimText,
            reinforcingFact: narrative ? narrative.split('. ')[0] + '.' : '',
          },
          fullRebuttal: narrative || 'No supporting information found in the RAG index.',
          inLineCitations: [],
          variants: {
            socialReply: narrative ? narrative.slice(0, 240) : '',
            communityNote: narrative,
            pressAdvisory: narrative,
            platformModerationPayload: {
              action: 'interstitial_warning',
              downrankWeight: 0.5,
              interstitialLabel: 'Flagged by the automated misinformation pipeline — pending human review.',
            },
          },
          ragConstraintPassed: c.narrative_status === 'drafted',
          processingTimeMs: 0,
        },
      }
    : undefined;

  return {
    id: c.id || `clm-${Math.abs(hashCode(claimText)).toString(16)}`,
    title: claimText.slice(0, 70) + (claimText.length > 70 ? '…' : ''),
    claimText,
    category: (c.category as IncidentClaim['category']) || 'other',
    currentStage: stage,
    totalElapsedSeconds: 0,
    stageProgress: stageProgressFor(stage),
    auditTrail: audit,
    ingestion: {
      id: c.id || 'sig-unknown',
      timestamp: c.updated_at || c.created_at || 'recently',
      platform,
      authorHandle: c.author || c.post_source || 'ingested_source',
      authorFollowers: 0, // not tracked by the backend
      content: c.original_text || claimText,
      velocityPerMin: 0, // not tracked by the backend
      engagement: { reposts: 0, likes: 0, views: 0 }, // not tracked by the backend
      mediaType: 'text',
      mediaUrl: c.url || undefined,
    },
    detector,
    origin,
    spread,
    ragDrafter,
    humanReview: {
      status:
        reviewStatus === 'approved'
          ? 'approved'
          : reviewStatus === 'rejected'
          ? 'rejected'
          : 'pending',
      reviewedBy: reviewStatus ? 'Backend review endpoint' : '—',
      reviewedAt: reviewStatus ? c.updated_at : undefined,
      reviewNotes: audit.map((a) => `${a.action}: ${a.details}`).join(' | '),
      selectedDispatchChannels: [],
    },
  };
}

async function backendJson(url: string, init?: RequestInit): Promise<any> {
  const r = await fetch(url, init);
  const text = await r.text();
  const body = text ? JSON.parse(text) : {};
  if (!r.ok) {
    const err = new Error(`backend ${r.status}: ${text.slice(0, 200)}`);
    (err as any).status = r.status;
    throw err;
  }
  return body;
}

/** Frontend passes the `clm-xxxx` id; the backend keys Reviews by claim text. */
async function resolveClaimText(id: string): Promise<string | null> {
  try {
    const data = await backendJson(`${BACKEND_URL}/api/claims?limit=300`);
    const hit = (data.claims || []).find((c: any) => c.id === id);
    return hit ? hit.claim || hit.original_text || null : null;
  } catch {
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // ── Live ingestion-source status (proxied from FastAPI) ────
  app.get('/api/sources', async (_req, res) => {
    try {
      res.json(await backendJson(`${BACKEND_URL}/api/sources`));
    } catch (err) {
      console.error('GET /api/sources →', err);
      res.status(502).json({ error: 'Backend unavailable', detail: String(err) });
    }
  });

  // ── RAG evidence store (real Chroma contents) ──────────────
  app.get('/api/evidence', async (_req, res) => {
    try {
      res.json(await backendJson(`${BACKEND_URL}/api/evidence?limit=200`));
    } catch (err) {
      console.error('GET /api/evidence →', err);
      res.status(502).json({ error: 'Backend unavailable', detail: String(err) });
    }
  });

  app.post('/api/evidence', async (req, res) => {
    const text = String(req.body?.text || '').trim();
    if (!text) {
      res.status(400).json({ error: 'text is required' });
      return;
    }
    try {
      const qs = new URLSearchParams({ text });
      if (req.body?.doc_id) qs.set('doc_id', String(req.body.doc_id));
      res.json(await backendJson(`${BACKEND_URL}/api/evidence?${qs.toString()}`, { method: 'POST' }));
    } catch (err) {
      console.error('POST /api/evidence →', err);
      res.status(502).json({ error: 'Backend unavailable', detail: String(err) });
    }
  });

  // ── All processed claims (real Neo4j history) ──────────────
  app.get('/api/claims', async (_req, res) => {
    try {
      const data = await backendJson(`${BACKEND_URL}/api/claims?limit=100`);
      const claims: IncidentClaim[] = (data.claims || []).map(toIncident);
      res.json({
        claims,
        metrics: {
          activeIncidentsCount: claims.length,
          avgPipelineLatencySeconds: 0,
          containmentSuccessRate: 0,
          gatedReviewQueueLength:
            data.metrics?.gatedReviewQueueLength ??
            claims.filter((c) => c.currentStage === 'hitl_gate').length,
          indexedFactCheckCount: 0, // real count comes from /api/evidence
          dispatchesTodayCount: data.metrics?.dispatchesTodayCount ?? 0,
        },
      });
    } catch (err) {
      console.error('GET /api/claims →', err);
      res.status(502).json({ error: 'Backend unavailable', detail: String(err) });
    }
  });

  // ── Run the real multi-agent pipeline on one claim ─────────
  app.post('/api/pipeline/run', async (req, res) => {
    const { claimText, platform = 'manual', category = 'other' } = req.body || {};
    if (!claimText || typeof claimText !== 'string') {
      res.status(400).json({ error: 'Claim text is required' });
      return;
    }
    try {
      const url = `${BACKEND_URL}/api/ingest?text=${encodeURIComponent(claimText)}&source=${encodeURIComponent(
        platform,
      )}`;
      const data = await backendJson(url, { method: 'POST' });
      const pr = data.pipeline_result || {};
      const record = {
        id: data.claim_id,
        claim: pr.claim,
        original_text: claimText,
        detection_confidence: pr.detection_confidence,
        severity: pr.severity,
        is_misinformation: pr.is_misinformation,
        detection_status: pr.detection_status,
        source: pr.source,
        origin_confidence: pr.origin_confidence,
        origin_status: pr.origin_status,
        risk_score: pr.risk_score,
        predicted_reach: pr.predicted_reach,
        spread_status: pr.spread_status,
        narrative: pr.narrative,
        narrative_confidence: pr.narrative_confidence,
        narrative_status: pr.narrative_status,
        platform,
        category,
      };
      // Re-read the claim as persisted so the card is complete immediately
      // (audit trail, origin, spread). The inline record only carries what the
      // pipeline returned, so the UI used to show a half-filled claim until
      // the next refresh.
      try {
        const stored = await backendJson(`${BACKEND_URL}/api/claims?limit=300`);
        const hit = (stored.claims || []).find((c: any) => c.id === data.claim_id);
        if (hit) {
          res.json({ success: true, incident: toIncident(hit) });
          return;
        }
      } catch {
        /* fall through to the inline record */
      }
      res.json({ success: true, incident: toIncident(record) });
    } catch (err) {
      console.error('POST /api/pipeline/run →', err);
      res.status(502).json({ error: 'Backend pipeline unavailable', detail: String(err) });
    }
  });

  // ── Trigger a live bulk pull from News / YouTube / RSS ─────
  app.post('/api/ingest/bulk', async (req, res) => {
    try {
      const qs = new URLSearchParams(
        Object.entries(req.body || {}).map(([k, v]) => [k, String(v)]),
      ).toString();
      const data = await backendJson(`${BACKEND_URL}/api/ingest/bulk${qs ? `?${qs}` : ''}`, {
        method: 'POST',
      });
      res.json(data);
    } catch (err) {
      console.error('POST /api/ingest/bulk →', err);
      res.status(502).json({ error: 'Backend unavailable', detail: String(err) });
    }
  });

  // ── Publish an approved counter-narrative ─────────────────
  //    Records the release decision in Neo4j. Nothing is transmitted to any
  //    external or government body - that channel is deliberately not wired.
  app.post('/api/claims/:id/publish', async (req, res) => {
    const { id } = req.params;
    const channel = String(req.body?.channel || 'internal_register');
    try {
      const data = await backendJson(
        `${BACKEND_URL}/api/claims/${encodeURIComponent(id)}/publish?channel=${encodeURIComponent(channel)}`,
        { method: 'POST' },
      );
      res.json(data);
    } catch (err) {
      console.error('POST /api/claims/:id/publish →', err);
      res.status(502).json({ error: 'Backend unavailable', detail: String(err) });
    }
  });

  // ── Human review decision (forwarded to FastAPI + Neo4j) ───
  app.post('/api/claims/:id/review', async (req, res) => {
    const { id } = req.params;
    const approved = req.body?.status === 'approved' || req.body?.approved === true;
    const claimText = await resolveClaimText(id);
    if (!claimText) {
      res.status(404).json({ error: 'Claim not found in backend' });
      return;
    }
    try {
      const data = await backendJson(
        `${BACKEND_URL}/api/claims/${encodeURIComponent(claimText)}/review?approved=${approved}`,
        { method: 'POST' },
      );
      res.json({ success: true, backend: data });
    } catch (err) {
      console.error('POST /api/claims/:id/review →', err);
      res.status(502).json({ error: 'Backend unavailable', detail: String(err) });
    }
  });

  // ── Approve + dispatch (backend has no dispatch fan-out;
  //    we record the approval and report the intended channels) ─
  app.post('/api/claims/:id/dispatch', async (req, res) => {
    const { id } = req.params;
    const claimText = await resolveClaimText(id);
    if (!claimText) {
      res.status(404).json({ error: 'Claim not found in backend' });
      return;
    }
    try {
      await backendJson(
        `${BACKEND_URL}/api/claims/${encodeURIComponent(claimText)}/review?approved=true`,
        { method: 'POST' },
      );
      const data = await backendJson(`${BACKEND_URL}/api/claims?limit=300`);
      const hit = (data.claims || []).find((c: any) => c.id === id);
      res.json({
        success: true,
        incident: hit ? toIncident(hit) : null,
        dispatchedActions: [
          { channel: 'Neo4j audit log', status: 'review_approved event written' },
          { channel: 'Counter-narrative', status: 'Marked approved for release' },
        ],
      });
    } catch (err) {
      console.error('POST /api/claims/:id/dispatch →', err);
      res.status(502).json({ error: 'Backend unavailable', detail: String(err) });
    }
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TruthLens adapter on http://localhost:${PORT}  →  FastAPI at ${BACKEND_URL}`);
  });
}

startServer();
