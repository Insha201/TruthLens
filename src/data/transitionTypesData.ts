import { CascadeTransitionTypeInfo, PipelineStageTransitionInfo, UITransitionMode } from '../types';

export const CASCADE_TRANSITION_TYPES: CascadeTransitionTypeInfo[] = [
  {
    id: 'coordinated_bot_burst',
    name: 'Coordinated Bot Swarm Burst',
    category: 'automated',
    badgeColor: 'amber',
    velocityMultiplier: '8.4x',
    typicalDelaySeconds: 15,
    sourcePlatforms: ['telegram', 'x'],
    targetPlatforms: ['x', 'reddit'],
    description: 'Synchronized deployment of dormant or automated accounts posting semantically coordinated keywords and hashtags within a narrow time window.',
    technicalMechanics: 'Automated script clusters trigger simultaneously upon designated seed alerts. Each bot creates variations of the root claim with minor character permutations to circumvent duplicate string filters, driving artificial trending velocity.',
    detectionSignatures: [
      'Account creation cluster dates (<14 days old)',
      'High posting velocity (>45 posts/minute)',
      'Sub-second inter-arrival timestamps across distinct IP subnets',
      'Near-identical syntactic bigram frequencies'
    ],
    containmentCountermeasure: 'Dynamic rate-limiting token bucket, rapid hash cluster de-amplification, and Sybil graph partitioning.',
    realWorldCaseStudy: '2024 Election ballot warehouse hoax where 340 automated accounts amplified a 9-second spliced video within 18 minutes of publication.',
    contagionRisk: 'critical'
  },
  {
    id: 'cross_platform_screenshot',
    name: 'Cross-Platform Screenshot Spillover',
    category: 'cross_platform',
    badgeColor: 'indigo',
    velocityMultiplier: '4.2x',
    typicalDelaySeconds: 45,
    sourcePlatforms: ['tiktok', 'telegram'],
    targetPlatforms: ['x', 'reddit', 'whatsapp'],
    description: 'Static screen capture of an unverified video or private channel message re-uploaded to open microblogs to strip context and origin metadata.',
    technicalMechanics: 'By converting an ephemeral or restricted post into a static image file, the claim strips out live community notes, author reply blocks, and platform-specific warning interstitials while masquerading as genuine proof.',
    detectionSignatures: [
      'Multimodal OCR text matching known debunked claim clusters',
      'Lossy compression artifact patterns around timestamps/usernames',
      'Discrepancy between embedded system UI fonts and native operating system scales'
    ],
    containmentCountermeasure: 'Multimodal perceptual hashing (pHash) against pre-indexed debunk cache with auto-injected reverse image provenance badge.',
    realWorldCaseStudy: 'Fabricated "emergency hospital memo" screenshot originally circulated in private Telegram channels, then forwarded onto X gaining 2.1M views.',
    contagionRisk: 'high'
  },
  {
    id: 'dark_social_forwarding',
    name: 'Dark Social P2P Relay (Encrypted Mesh)',
    category: 'human_social',
    badgeColor: 'rose',
    velocityMultiplier: '6.1x',
    typicalDelaySeconds: 60,
    sourcePlatforms: ['whatsapp', 'telegram'],
    targetPlatforms: ['whatsapp'],
    description: 'Closed, peer-to-peer forwarded propagation through encrypted group chats where trust is borrowed directly from personal contacts.',
    technicalMechanics: 'Claims leverage emotional urgency ("Share before they delete this!") and familial trust. Because content is end-to-end encrypted, centralized platform algorithmic safety filters cannot scan the text body directly.',
    detectionSignatures: [
      '"Forwarded Many Times" metadata tag saturation',
      'Simultaneous edge queries to external verification links',
      'Spike in user reporting signals via citizen watchdog bot endpoints'
    ],
    containmentCountermeasure: 'In-app forwarding limits (max 1 chat per forward for viral tags) and automated Fact-Check tipline auto-responder bots.',
    realWorldCaseStudy: 'Contaminated tap water / concentrated vinegar cure circulated through 4,200 regional family group chats in under 2 hours.',
    contagionRisk: 'critical'
  },
  {
    id: 'super_spreader_amplification',
    name: 'Super-Spreader Quote-Endorsement',
    category: 'human_social',
    badgeColor: 'purple',
    velocityMultiplier: '18.5x',
    typicalDelaySeconds: 120,
    sourcePlatforms: ['x', 'tiktok'],
    targetPlatforms: ['x', 'reddit', 'tiktok'],
    description: 'A verified account or high-follower influencer retweets or quotes an obscure fringe seed, lending false legitimacy and vast reach.',
    technicalMechanics: 'A fringe claim with fewer than 50 engagements is quoted with sensationalist commentary ("Is anybody else seeing this?!"). The influencer network absorbs the claim, bypassing traditional verification gates.',
    detectionSignatures: [
      'In-degree graph spike (>10,000 follower delta to original seed)',
      'Quote-to-retweet ratio inversion (>65% quotes)',
      'High sentiment polarization in downstream commentary'
    ],
    containmentCountermeasure: 'Priority notification to platform trust & safety operations; pre-emptive Community Note routing to active raters.',
    realWorldCaseStudy: 'Prominent civic commentator with 1.4M followers quoting an unverified dam wall collapse rumor, accelerating reach from 800 to 950,000 in 14 minutes.',
    contagionRisk: 'critical'
  },
  {
    id: 'algorithmic_feedback_spike',
    name: 'Algorithmic Engagement-Loop Spike',
    category: 'algorithmic',
    badgeColor: 'cyan',
    velocityMultiplier: '9.2x',
    typicalDelaySeconds: 90,
    sourcePlatforms: ['x', 'tiktok', 'reddit'],
    targetPlatforms: ['x', 'tiktok'],
    description: 'Controversy and heated debunks inadvertently trigger recommendation algorithms to elevate the post onto "For You" and trending discovery feeds.',
    technicalMechanics: 'Recommendation algorithms reward user dwell time, rapid comment velocity, and quote-debate. Outraged debunks from well-meaning users paradoxically trigger platform virality scoring.',
    detectionSignatures: [
      'Abnormal comment-to-repost ratio ("The Ratio" > 3:1)',
      'High sentiment divergence in immediate comment replies',
      'Rapid influx of non-follower impressions (>80% discovery feed)'
    ],
    containmentCountermeasure: 'Layer 4 API payload: 50% algorithmic downranking weight applied within the 90s SLA window.',
    realWorldCaseStudy: 'Central Bank emergency cash freeze panic where 85% of comments were debunking it, but the high comment count boosted it to #1 trending.',
    contagionRisk: 'high'
  },
  {
    id: 'synthetic_meme_remix',
    name: 'Synthetic Meme & Audio Remixing',
    category: 'cross_platform',
    badgeColor: 'pink',
    velocityMultiplier: '5.5x',
    typicalDelaySeconds: 180,
    sourcePlatforms: ['tiktok', 'reddit'],
    targetPlatforms: ['tiktok', 'x', 'whatsapp'],
    description: 'Core misinformation premise is repackaged into short-form audio, humor memes, or AI voiceover video clips to evade text-based detection.',
    technicalMechanics: 'Audio tracks are spliced over unrelated gameplay or lifestyle clips. The humor or meme format lowers cognitive defense mechanisms, causing users to absorb the underlying false premise uncritically.',
    detectionSignatures: [
      'Audio waveform alignment with known synthetic voice models',
      'Text overlay mismatch with background video semantic context',
      'High reuse rate of identical sound template across disparate accounts'
    ],
    containmentCountermeasure: 'Audio fingerprint extraction and perceptual hashing matched against indexed authoritative rebuttals.',
    realWorldCaseStudy: 'Deepfake audio snippet mimicking mayor declaring city-wide lockdown layered over video of emergency vehicles from 2021.',
    contagionRisk: 'medium'
  },
  {
    id: 'fringe_mainstream_bridge',
    name: 'Fringe-to-Mainstream Bridge Infiltration',
    category: 'automated',
    badgeColor: 'orange',
    velocityMultiplier: '7.8x',
    typicalDelaySeconds: 300,
    sourcePlatforms: ['reddit', 'telegram'],
    targetPlatforms: ['x', 'whatsapp'],
    description: 'Narrative originating on anonymous message boards crosses into hyper-local civic Facebook groups, subreddits, or community forums.',
    technicalMechanics: 'Coordinated bridge actors re-frame conspiratorial theories into relatable everyday concerns (local property values, drinking water safety, school board warnings), activating civic echo chambers.',
    detectionSignatures: [
      'Cross-cluster centrality score > 0.85',
      'Linguistic shift from esoteric jargon to localized civic terminology',
      'Simultaneous submission to multiple geographic subreddits'
    ],
    containmentCountermeasure: 'Targeted injection of localized "Truth Sandwich" rebuttals into community bridge nodes before civic spillover.',
    realWorldCaseStudy: 'Municipal water fluoridation panic migrating from fringe imageboards to three regional suburban parent discussion portals.',
    contagionRisk: 'high'
  },
  {
    id: 'containment_counter_injection',
    name: 'Authoritative Containment Counter-Injection',
    category: 'counter_measure',
    badgeColor: 'emerald',
    velocityMultiplier: '-82.8%',
    typicalDelaySeconds: 85,
    sourcePlatforms: ['x', 'telegram', 'reddit', 'tiktok', 'whatsapp'],
    targetPlatforms: ['x', 'telegram', 'reddit', 'tiktok', 'whatsapp'],
    description: 'Rapid multi-agent deployment of source-backed Community Notes, reply bot citations, and 50% algorithmic downranking payload.',
    technicalMechanics: 'The 90s SLA pipeline retrieves indexed ground truth from certified fact-checkers, constructs a cognitive Truth-Sandwich rebuttal with bracketed citations, and deploys it directly at bridge and amplifier nodes.',
    detectionSignatures: [
      'Sharp drop in R0 reproduction rate from >3.2 to <0.6',
      'Inoculation of susceptible community nodes',
      'Citations verified against Snopes, WHO, Reuters, and AP registries'
    ],
    containmentCountermeasure: 'Primary goal achieved: Viral transmission perimeter sealed before uncontained 6-hour exponential cascade.',
    realWorldCaseStudy: 'Clark County election ballot shredding hoax contained in 88.4s, preventing projected 1.8M uncontained exposures.',
    contagionRisk: 'contained'
  }
];

export const PIPELINE_STAGE_TRANSITIONS: PipelineStageTransitionInfo[] = [
  {
    fromStage: 'ingestion',
    toStage: 'detector',
    name: 'T00 → T15s: Ingestion to Anomaly Detector Transition',
    slaTargetSeconds: 15,
    triggerEvent: 'Velocity anomaly threshold exceeded (>500 shares/min across multi-platform crawlers)',
    dataPayloadPassed: ['Raw text signal', 'Platform metadata', 'Engagement telemetry', 'Multimodal OCR parse'],
    verificationCriteria: 'Payload validated; claim text extracted; language normalized; bot signature pre-screened.'
  },
  {
    fromStage: 'detector',
    toStage: 'origin_tracer',
    name: 'T15 → T35s: Detector to Origin Attribution Transition',
    slaTargetSeconds: 20,
    triggerEvent: 'Veracity anomaly score > 80% with Critical/High severity classification',
    dataPayloadPassed: ['Veracity score', 'Manipulation technique fingerprints', 'Flagged semantic keywords', 'Reasoning trace'],
    verificationCriteria: 'Claim classified as potential viral threat; dispatched to graph crawler for cascade back-tracing.'
  },
  {
    fromStage: 'origin_tracer',
    toStage: 'spread_predictor',
    name: 'T35 → T60s: Origin to Spread & R0 Forecast Transition',
    slaTargetSeconds: 25,
    triggerEvent: 'Patient Zero identified; cross-platform cascade hops and bot cluster mapped',
    dataPayloadPassed: ['Patient Zero profile', 'Account age & bot prob', 'Platform hops trail', 'Coordinated network score'],
    verificationCriteria: 'Transmission vector determined; seed node locked; network topology handed to diffusion simulator.'
  },
  {
    fromStage: 'spread_predictor',
    toStage: 'rag_drafter',
    name: 'T60 → T85s: Spread Forecast to Grounded RAG Transition',
    slaTargetSeconds: 25,
    triggerEvent: 'R0 reproduction number > 1.5; vulnerable demographic clusters and bridge nodes identified',
    dataPayloadPassed: ['R0 viral factor', 'Uncontained reach curve', 'High-risk audience clusters', 'Network bridge nodes'],
    verificationCriteria: 'Transmission forecast complete; targeted domain selected for certified ground-truth retrieval.'
  },
  {
    fromStage: 'rag_drafter',
    toStage: 'hitl_gate',
    name: 'T85 → T90s: Grounded Drafter to Human-In-The-Loop Gate Transition',
    slaTargetSeconds: 5,
    triggerEvent: 'Counter-narrative generated passing strict RAG constraint (100% cited against indexed sources)',
    dataPayloadPassed: ['Truth Sandwich headline', 'Inline bracketed citations', 'Multi-channel format variants', 'Algorithmic downrank payload'],
    verificationCriteria: 'Zero unverified assertions; strict grounding check passed; queued in Human Review gate.'
  },
  {
    fromStage: 'hitl_gate',
    toStage: 'dispatched',
    name: 'T90s+: Human Review to Multi-Channel Dispatch Transition',
    slaTargetSeconds: 10,
    triggerEvent: 'Human editor reviews citations, applies edits, and approves containment package',
    dataPayloadPassed: ['Approved Truth-Sandwich rebuttal', 'Community Notes payload', 'API downranking weight: 0.50', 'Dispatch channels'],
    verificationCriteria: 'Payload signed; broadcast across platform safety APIs; second-order transmission severed.'
  }
];

export const UI_TRANSITION_MODES: Array<{
  id: UITransitionMode;
  label: string;
  subtitle: string;
  description: string;
  className: string;
  badge: string;
}> = [
  {
    id: 'kinetic',
    label: 'Kinetic Slide',
    subtitle: 'Dynamic Directional Velocity',
    description: 'Snappy spring physics with cubic-bezier directional transitions, tailored for high-speed streaming threat monitoring.',
    className: 'transition-kinetic',
    badge: 'Recommended for Ops'
  },
  {
    id: 'smooth',
    label: 'Smooth Dissolve',
    subtitle: 'Balanced Low-Motion Cross-Fade',
    description: 'Gentle opacity and scale dissolves ensuring clean, distraction-free visual readability and accessibility.',
    className: 'transition-smooth',
    badge: 'Accessibility First'
  },
  {
    id: 'cyber',
    label: 'Cybernetic Pulse',
    subtitle: 'High-Tech Scanline Glow',
    description: 'Tactical security dashboard theme with animated neon perimeter accentuation and active signal indicators.',
    className: 'transition-cyber',
    badge: 'Tactical Mode'
  },
  {
    id: 'discrete',
    label: 'Discrete Instant',
    subtitle: 'Zero-Latency Frame Switch',
    description: 'Instant frame swapping with 0ms visual delay, maximizing responsiveness during high-pressure breaking incidents.',
    className: 'transition-discrete',
    badge: 'Zero-Latency'
  }
];
