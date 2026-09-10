export type MainAppPage = 'home' | 'dashboard' | 'live_claims' | 'investigation' | 'agent_intelligence' | 'spread_intelligence' | 'evidence_review' | 'counter_narrative' | 'status';

export type FeatureSubTab =
  | 'pipeline'
  | 'graph'
  | 'hitl'
  | 'ingestion'
  | 'knowledge';

export type Platform = 'x' | 'telegram' | 'reddit' | 'tiktok' | 'whatsapp';

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
  category: 'public_health' | 'elections_civic' | 'emergency_disaster' | 'financial_panic' | 'geopolitics';
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
