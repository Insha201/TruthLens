export type MainAppPage = 'home' | 'dashboard' | 'live_claims' | 'investigation' | 'spread_intelligence' | 'evidence_review' | 'counter_narrative';

export type FeatureSubTab =
  | 'pipeline'
  | 'graph'
  | 'hitl'
  | 'ingestion'
  | 'knowledge';

/**
 * A `Platform` is any channel a claim can be *ingested from* or that
 * misinformation *spreads across*.
 *
 * - `newsapi` / `youtube` / `rss` are the content sources wired into the
 *   backend today (`backend/ingestion/*`).
 * - `x` / `telegram` / `reddit` / `tiktok` / `whatsapp` are social connectors
 *   used for spread modelling now and staged for ingestion — each needs an
 *   API key added to `backend/.env` (see `INGESTION_SOURCES[].envKey`).
 */
export type Platform =
  | 'newsapi'
  | 'youtube'
  | 'rss'
  | 'x'
  | 'telegram'
  | 'reddit'
  | 'tiktok'
  | 'whatsapp'
  | 'manual';

export interface IngestionSourceInfo {
  id: Platform;
  /** Full display name, e.g. "YouTube Data API". */
  label: string;
  /** Compact label for chips / status strips, e.g. "YT". */
  shortLabel: string;
  /** `content` = open-web / publisher feeds, `social` = social networks. */
  kind: 'content' | 'social';
  /** `live` = connector implemented, `planned` = needs an API key + connector. */
  status: 'live' | 'planned';
  /** Backend `.env` variable that enables this source ("—" when none needed). */
  envKey: string;
  description: string;
}

/**
 * The full ingestion catalogue. `live` sources back the real pipeline today;
 * `planned` sources light up once their `envKey` is set in `backend/.env`
 * and the matching `backend/ingestion/<name>_ingestion.py` connector is filled in.
 */
export const INGESTION_SOURCES: IngestionSourceInfo[] = [
  { id: 'newsapi',  label: 'NewsAPI',              shortLabel: 'News',   kind: 'content', status: 'live',    envKey: 'NEWS_API_KEY',        description: 'Global news headlines & article bodies' },
  { id: 'youtube',  label: 'YouTube Data API',     shortLabel: 'YT',     kind: 'content', status: 'live',    envKey: 'YOUTUBE_API_KEY',     description: 'Video titles, descriptions & captions' },
  { id: 'rss',      label: 'RSS Feeds',            shortLabel: 'RSS',    kind: 'content', status: 'live',    envKey: '—',                   description: 'Curated publisher & fact-check feeds' },
  { id: 'x',        label: 'X (formerly Twitter)', shortLabel: 'X',      kind: 'social',  status: 'planned', envKey: 'TWITTER_BEARER_TOKEN', description: 'Live post & repost firehose' },
  { id: 'reddit',   label: 'Reddit',               shortLabel: 'Reddit', kind: 'social',  status: 'live',    envKey: 'REDDIT_CLIENT_ID',     description: 'Subreddit search via PRAW (read-only)' },
  { id: 'telegram', label: 'Telegram',             shortLabel: 'TG',     kind: 'social',  status: 'live',    envKey: 'TELEGRAM_API_ID',      description: 'Public channel monitoring via Telethon' },
  { id: 'tiktok',   label: 'TikTok',               shortLabel: 'TikTok', kind: 'social',  status: 'live',    envKey: 'TIKTOK_CLIENT_KEY',    description: 'Research API keyword search (approval required)' },
  { id: 'whatsapp', label: 'WhatsApp',             shortLabel: 'WA',     kind: 'social',  status: 'planned', envKey: 'WHATSAPP_API_KEY',    description: 'Tip-line forwarding network' },
];

/** `Platform` id → human label, derived from {@link INGESTION_SOURCES}. */
export const PLATFORM_LABELS: Record<Platform, string> = INGESTION_SOURCES.reduce(
  (acc, s) => {
    acc[s.id] = s.label;
    return acc;
  },
  {} as Record<Platform, string>,
);

/**
 * Subject domain, shared by claims AND by RAG evidence documents so the two
 * can be grouped under the same headings ("this health misinformation, and
 * the health evidence that rebuts it"). Mirrors
 * backend/agents/claim_detector.VALID_CATEGORIES.
 */
export type ClaimDomain =
  | 'public_health'
  | 'elections_civic'
  | 'emergency_disaster'
  | 'financial_panic'
  | 'geopolitics'
  | 'science_tech'
  | 'other';

export const DOMAIN_LABELS: Record<ClaimDomain, string> = {
  public_health: 'Public health',
  elections_civic: 'Elections & civic',
  emergency_disaster: 'Emergency & disaster',
  financial_panic: 'Finance & markets',
  geopolitics: 'Geopolitics',
  science_tech: 'Science & tech',
  other: 'Other',
};

export const DOMAIN_ORDER: ClaimDomain[] = [
  'public_health', 'elections_civic', 'emergency_disaster',
  'financial_panic', 'geopolitics', 'science_tech', 'other',
];

export type ClaimSeverity = 'critical' | 'high' | 'medium' | 'low';

export type PipelineStage =
  | 'idle'
  | 'ingestion'
  | 'detector'
  | 'origin_tracer'
  | 'spread_predictor'
  | 'rag_drafter'
  | 'hitl_gate'
  | 'dispatched';

export interface RetrievedSource {
  id: string;
  organization: 'WHO' | 'Snopes' | 'PolitiFact' | 'Reuters' | 'AP News' | 'CDC' | 'FactCheck.org';
  title: string;
  url: string;
  verificationRating: 'False' | 'Manipulated Media' | 'Pants on Fire' | 'Misleading' | 'Unproven';
  relevanceScore: number; // 0 - 100
  keyEvidenceQuote: string;
  publishDate: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'seed' | 'bot_amplifier' | 'bridge' | 'community' | 'susceptible_hub';
  status: 'infected' | 'at_risk' | 'inoculated' | 'neutral';
  x: number;
  y: number;
  size: number;
  degree: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  intensity: number;
  active: boolean;
}

export interface IngestionSignal {
  id: string;
  timestamp: string;
  platform: Platform;
  authorHandle: string;
  authorFollowers: number;
  content: string;
  velocityPerMin: number;
  engagement: {
    reposts: number;
    likes: number;
    views: number;
  };
  mediaType: 'text' | 'image_meme' | 'screenshot' | 'video_clip';
  mediaUrl?: string;
}

export interface DetectorAnalysis {
  veracityScore: number; // 0 = true, 100 = completely fabricated
  confidence: number; // 0 - 100
  severity: ClaimSeverity;
  manipulationTechniques: string[];
  flaggedKeywords: string[];
  reasoning: string;
  processingTimeMs: number;
}

export interface OriginTrace {
  patientZero: {
    platform: Platform;
    username: string;
    accountAgeDays: number;
    botProbability: number;
    firstSeenTimestamp: string;
    geographicCluster: string;
  };
  hops: Array<{
    id: string;
    platform: Platform;
    sourceNode: string;
    targetNode: string;
    delaySeconds: number;
    mechanism: 'coordinated_bot_burst' | 'cross_platform_screenshot' | 'telegram_broadcast' | 'algorithmic_spike';
  }>;
  coordinatedNetworkScore: number; // 0 - 100
  processingTimeMs: number;
  /** Plain-language origin narrative from the Origin Tracer agent (LLM over the provenance graph). */
  summary?: string;
  /** Ordered list of outlets that carried the claim, earliest first. */
  timeline?: Array<{
    outlet: string;
    platform: string;
    url?: string;
    timestamp: string;
  }>;
  /** Alternate wordings of this claim that were semantically merged into it. */
  aliases?: string[];
}

export interface SpreadPrediction {
  r0ViralFactor: number;
  currentReach: number;
  projected6hReachUncontained: number;
  projected6hReachContained: number;
  reductionPercentage: number;
  vulnerableCommunities: Array<{
    name: string;
    susceptibility: number;
    populationSize: number;
    primaryPlatform: Platform;
  }>;
  networkNodes: NetworkNode[];
  networkEdges: NetworkEdge[];
  processingTimeMs: number;
  /** Reproduction factor from the Spread Predictor (~0.8–5.0). */
  r0?: number;
  /** Outlets carrying the claim per day, from the sighting timeline. */
  velocityPerDay?: number;
  /** Human-readable feature contributions behind the risk score. */
  drivers?: string[];
}

export interface CounterNarrative {
  headline: string;
  truthSandwich: {
    verifiedFact: string; // The undeniable truth first
    mythCorrection: string; // How the false claim distorts reality
    reinforcingFact: string; // The sticky factual takeaway
  };
  fullRebuttal: string;
  inLineCitations: Array<{
    marker: string; // e.g. "[1]"
    sourceTitle: string;
    url: string;
    org: string;
  }>;
  variants: {
    socialReply: string; // Short <280 chars
    communityNote: string; // Community note format
    pressAdvisory: string; // Formal advisory
    platformModerationPayload: {
      action: 'downrank_50pct' | 'interstitial_warning' | 'algorithmic_containment';
      downrankWeight: number;
      interstitialLabel: string;
    };
  };
  ragConstraintPassed: boolean;
  processingTimeMs: number;
}

export interface HumanReviewDecision {
  status: 'pending' | 'approved' | 'modified' | 'rejected';
  reviewedBy: string;
  reviewedAt?: string;
  editedHeadline?: string;
  editedRebuttal?: string;
  reviewNotes?: string;
  selectedDispatchChannels: string[];
}

export interface IncidentClaim {
  id: string;
  title: string;
  claimText: string;
  category: ClaimDomain;
  ingestion: IngestionSignal;
  detector?: DetectorAnalysis;
  origin?: OriginTrace;
  spread?: SpreadPrediction;
  ragDrafter?: {
    sources: RetrievedSource[];
    counterNarrative: CounterNarrative;
  };
  humanReview: HumanReviewDecision;
  currentStage: PipelineStage;
  stageProgress: Record<PipelineStage, number>; // 0 to 100
  pipelineStartedAt?: string;
  pipelineFinishedAt?: string;
  totalElapsedSeconds: number;
  /** Real audit events written to Neo4j by each agent, oldest first. */
  auditTrail?: Array<{ action: string; details: string; timestamp: string }>;
}

export interface SystemMetrics {
  activeIncidentsCount: number;
  avgPipelineLatencySeconds: number;
  containmentSuccessRate: number;
  gatedReviewQueueLength: number;
  indexedFactCheckCount: number;
  dispatchesTodayCount: number;
}

export type AppTheme = 'dark' | 'light';

export type UITransitionMode = 'kinetic' | 'smooth' | 'cyber' | 'discrete';

export type CascadeTransitionMechanism =
  | 'coordinated_bot_burst'
  | 'cross_platform_screenshot'
  | 'dark_social_forwarding'
  | 'super_spreader_amplification'
  | 'algorithmic_feedback_spike'
  | 'synthetic_meme_remix'
  | 'fringe_mainstream_bridge'
  | 'containment_counter_injection';

export interface CascadeTransitionTypeInfo {
  id: CascadeTransitionMechanism;
  name: string;
  category: 'automated' | 'cross_platform' | 'algorithmic' | 'human_social' | 'counter_measure';
  badgeColor: string;
  velocityMultiplier: string;
  typicalDelaySeconds: number;
  sourcePlatforms: Platform[];
  targetPlatforms: Platform[];
  description: string;
  technicalMechanics: string;
  detectionSignatures: string[];
  containmentCountermeasure: string;
  realWorldCaseStudy: string;
  contagionRisk: 'critical' | 'high' | 'medium' | 'contained';
}

export interface PipelineStageTransitionInfo {
  fromStage: PipelineStage;
  toStage: PipelineStage;
  name: string;
  slaTargetSeconds: number;
  triggerEvent: string;
  dataPayloadPassed: string[];
  verificationCriteria: string;
}
