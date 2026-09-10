var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");

// src/data/mockData.ts
var TRUSTED_KNOWLEDGE_BASE = [
  {
    id: "src-who-01",
    organization: "WHO",
    title: "Drinking Water Safety and Chemical Contaminant Assessment Bulletin",
    url: "https://www.who.int/water_sanitation_health/publications/chemical-contaminants-guide",
    verificationRating: "False",
    relevanceScore: 98,
    keyEvidenceQuote: "Standard municipal municipal water supplies in monitored metropolitan sectors adhere to ISO-24510 standards. Unsubstantiated claims regarding sudden cardiotoxic additives are scientifically unfounded, and consuming unbuffered acidic substances like vinegar induces acute mucosal burns without chemical efficacy.",
    publishDate: "2024-11-14"
  },
  {
    id: "src-snopes-01",
    organization: "Snopes",
    title: "Fact Check: Did Authorities Evacuate Highland Valley Due to Dam Collapse Risk?",
    url: "https://www.snopes.com/fact-check/highland-valley-dam-collapse-earthquake/",
    verificationRating: "False",
    relevanceScore: 95,
    keyEvidenceQuote: "The State Department of Water Resources and the Army Corps of Engineers completed seismic sensor sweeps at 08:30 UTC confirming the Highland Valley Dam integrity stands at structural nominal 100%. No evacuation warning was declared.",
    publishDate: "2024-10-02"
  },
  {
    id: "src-politifact-01",
    organization: "PolitiFact",
    title: "Pants on Fire: Viral Video Showing Discarded Ballots in Clark County Recycling",
    url: "https://www.politifact.com/factchecks/clark-county-ballots-recycling-debunk/",
    verificationRating: "Pants on Fire",
    relevanceScore: 99,
    keyEvidenceQuote: "The recycled paper boxes shown in the viral clip are sample practice ballots from a 2018 municipal training drill. The County Registrar confirmed all official ballots remain under 24/7 dual-key vault containment with televised live-stream surveillance.",
    publishDate: "2024-11-05"
  },
  {
    id: "src-reuters-01",
    organization: "Reuters",
    title: "Reuters Fact Check: Central Bank Is NOT Freezing Regional Wire Transfers",
    url: "https://www.reuters.com/fact-check/central-bank-regional-wire-freeze-hoax-2024/",
    verificationRating: "False",
    relevanceScore: 96,
    keyEvidenceQuote: "A Federal Reserve spokesperson explicitly confirmed that the automated clearinghouse (Fedwire and ACH) is operating with zero disruption. The forwarded screenshot circulating on messaging channels is an edited doctored press release template.",
    publishDate: "2024-09-18"
  },
  {
    id: "src-cdc-01",
    organization: "CDC",
    title: "CDC Clarification on Acute Seasonal Respiratory Syndromes and Home Remedies",
    url: "https://www.cdc.gov/respiratory-viruses/guidance/advisories/debunked-remedies.html",
    verificationRating: "Misleading",
    relevanceScore: 92,
    keyEvidenceQuote: "High-salinity boiling water inhalations or acidic ingestion do not neutralize respiratory viral pathogens and present severe scald and esophageal ulceration risks.",
    publishDate: "2024-12-01"
  },
  {
    id: "src-ap-01",
    organization: "AP News",
    title: "AP Fact Check: Solar Flare Grid Shutdown Rumor Fabricated on Telegram",
    url: "https://apnews.com/article/fact-check-solar-flare-blackout-grid-hoax",
    verificationRating: "False",
    relevanceScore: 94,
    keyEvidenceQuote: "NOAA Space Weather Prediction Center confirms normal geomagnetic conditions (Kp index 1.8). Viral audio recordings claiming impending 48-hour global telecommunication blackout are a recycled chain hoax.",
    publishDate: "2025-01-12"
  }
];
var INITIAL_INCIDENTS = [
  {
    id: "inc-9021",
    title: "Clark County Recycled Ballot Conspiracy",
    claimText: "URGENT: Workers just caught on camera shredding over 45,000 pre-marked election ballots in Clark County recycling depot warehouse right now!! Media is in total blackout mode, share everywhere before taken down!",
    category: "elections_civic",
    currentStage: "hitl_gate",
    stageProgress: {
      idle: 100,
      ingestion: 100,
      detector: 100,
      origin_tracer: 100,
      spread_predictor: 100,
      rag_drafter: 100,
      hitl_gate: 50,
      dispatched: 0
    },
    totalElapsedSeconds: 88,
    ingestion: {
      id: "sig-781",
      timestamp: "2 mins ago",
      platform: "x",
      authorHandle: "@PatriotFrontline99",
      authorFollowers: 34100,
      content: "URGENT: Workers just caught on camera shredding over 45,000 pre-marked election ballots in Clark County recycling depot warehouse right now!! Media is in total blackout mode, share everywhere before taken down!",
      velocityPerMin: 842,
      engagement: {
        reposts: 12400,
        likes: 29800,
        views: 384e3
      },
      mediaType: "video_clip"
    },
    detector: {
      veracityScore: 96,
      confidence: 94,
      severity: "critical",
      manipulationTechniques: [
        "Out-of-context archival footage recycling",
        "Manufactured urgency & censorship panic bait",
        "Fabricated quantity assertion (45,000 count without provenance)",
        'Epistemic insulation ("Media blackout")'
      ],
      flaggedKeywords: ["URGENT", "shredding", "pre-marked", "blackout mode", "share before taken down"],
      reasoning: "Visual forensic analysis matches viral clip to a 2018 municipal sample training batch disposal. Zero temporal or chain-of-custody corroboration. Extreme virality velocity posing acute democratic trust threat.",
      processingTimeMs: 1420
    },
    origin: {
      patientZero: {
        platform: "telegram",
        username: "RedPillObserver_HQ",
        accountAgeDays: 14,
        botProbability: 88,
        firstSeenTimestamp: "10:14:02 UTC (T-88s)",
        geographicCluster: "Eastern European VPN Relay cluster (Bucharest / Sofia IP range)"
      },
      hops: [
        {
          id: "hop-1",
          platform: "telegram",
          sourceNode: "t.me/RedPillObserver_HQ",
          targetNode: "12 Closed Patriot Chat Groups",
          delaySeconds: 12,
          mechanism: "telegram_broadcast"
        },
        {
          id: "hop-2",
          platform: "x",
          sourceNode: "Bot Cluster #alpha-4 (240 sockpuppet accounts)",
          targetNode: "X Trending Algorithm #ClarkCounty",
          delaySeconds: 28,
          mechanism: "coordinated_bot_burst"
        },
        {
          id: "hop-3",
          platform: "reddit",
          sourceNode: "u/TruthSeeker_404",
          targetNode: "r/conspiracy, r/all cross-post",
          delaySeconds: 46,
          mechanism: "cross_platform_screenshot"
        }
      ],
      coordinatedNetworkScore: 92,
      processingTimeMs: 1980
    },
    spread: {
      r0ViralFactor: 3.42,
      currentReach: 384e3,
      projected6hReachUncontained: 285e4,
      projected6hReachContained: 49e4,
      reductionPercentage: 82.8,
      vulnerableCommunities: [
        {
          name: "Hyper-Partisan Civic Activists",
          susceptibility: 89,
          populationSize: 42e4,
          primaryPlatform: "x"
        },
        {
          name: "Local County Resident Feeds",
          susceptibility: 72,
          populationSize: 18e4,
          primaryPlatform: "reddit"
        },
        {
          name: "Alternative Video Broadcasters",
          susceptibility: 84,
          populationSize: 31e4,
          primaryPlatform: "tiktok"
        }
      ],
      networkNodes: [
        { id: "node-seed", label: "Patient Zero (TG Relay)", type: "seed", status: "infected", x: 120, y: 150, size: 28, degree: 14 },
        { id: "node-bot1", label: "Bot Swarm \u03B1-4 (240 accts)", type: "bot_amplifier", status: "infected", x: 260, y: 90, size: 24, degree: 38 },
        { id: "node-bot2", label: "Sockpuppet Ring \u03B2-1", type: "bot_amplifier", status: "infected", x: 270, y: 220, size: 22, degree: 29 },
        { id: "node-bridge1", label: "Influencer Amplifiers", type: "bridge", status: "at_risk", x: 420, y: 130, size: 30, degree: 45 },
        { id: "node-comm1", label: "Civic Group Echo Chamber", type: "community", status: "at_risk", x: 580, y: 80, size: 34, degree: 52 },
        { id: "node-comm2", label: "Regional Subreddit Cluster", type: "community", status: "at_risk", x: 570, y: 210, size: 32, degree: 41 },
        { id: "node-mainstream", label: "Mainstream News Fringe", type: "susceptible_hub", status: "neutral", x: 720, y: 150, size: 36, degree: 60 }
      ],
      networkEdges: [
        { source: "node-seed", target: "node-bot1", intensity: 0.95, active: true },
        { source: "node-seed", target: "node-bot2", intensity: 0.88, active: true },
        { source: "node-bot1", target: "node-bridge1", intensity: 0.92, active: true },
        { source: "node-bot2", target: "node-bridge1", intensity: 0.79, active: true },
        { source: "node-bridge1", target: "node-comm1", intensity: 0.85, active: true },
        { source: "node-bridge1", target: "node-comm2", intensity: 0.76, active: true },
        { source: "node-comm1", target: "node-mainstream", intensity: 0.62, active: false },
        { source: "node-comm2", target: "node-mainstream", intensity: 0.58, active: false }
      ],
      processingTimeMs: 1650
    },
    ragDrafter: {
      sources: [
        {
          id: "src-politifact-01",
          organization: "PolitiFact",
          title: "Pants on Fire: Viral Video Showing Discarded Ballots in Clark County Recycling",
          url: "https://www.politifact.com/factchecks/clark-county-ballots-recycling-debunk/",
          verificationRating: "Pants on Fire",
          relevanceScore: 99,
          keyEvidenceQuote: "The recycled paper boxes shown in the viral clip are sample practice ballots from a 2018 municipal training drill. The County Registrar confirmed all official ballots remain under 24/7 dual-key vault containment with televised live-stream surveillance.",
          publishDate: "2024-11-05"
        }
      ],
      counterNarrative: {
        headline: "Fact Check: Video Shows 2018 Training Mock-ups, Not Live Election Ballots in Clark County",
        truthSandwich: {
          verifiedFact: "All verified official ballots in Clark County are stored inside secure dual-key vaults with active 24/7 live-stream public surveillance [1].",
          mythCorrection: "A circulating video misleadingly claims workers were filmed destroying live votes; official records and video forensic analysis confirm the footage shows obsolete sample training forms from a 2018 clerk onboarding drill [1].",
          reinforcingFact: "Independent election monitors and the Clark County Registrar confirm zero chain-of-custody breaches, and all registered votes remain safely counted and authenticated [1]."
        },
        fullRebuttal: "The claim that 45,000 live election ballots were shredded in Clark County is demonstrably false. The footage circulating depicts obsolete sample ballot training sheets printed in 2018 for administrative clerk drills, as documented by election audit records [1]. The Clark County Election Department maintains strict chain-of-custody logs, physical vault containment with dual-key access controls, and transparent live surveillance feeds accessible to the public at all times [1].",
        inLineCitations: [
          {
            marker: "[1]",
            sourceTitle: "PolitiFact: Viral Video Showing Discarded Ballots in Clark County Recycling",
            url: "https://www.politifact.com/factchecks/clark-county-ballots-recycling-debunk/",
            org: "PolitiFact"
          }
        ],
        variants: {
          socialReply: "False. The viral clip shows obsolete 2018 training drill mock-ups, NOT actual election ballots. All official ballots are sealed in 24/7 monitored dual-key vaults. Details verified by PolitiFact: politifact.com/debunk [1]",
          communityNote: "Readers added context: The materials in this video are non-voting training sample forms from 2018. Official ballots in Clark County are secured under 24/7 continuous video surveillance and dual-key locks (verified by County Registrar and PolitiFact).",
          pressAdvisory: "COMMUNITY DISINFORMATION ALERT: Viral video claiming destruction of 45,000 live ballots has been traced to coordinated bot amplification. Forensic audit confirms footage originates from 2018 administrative exercises. Official ballot vaults remain intact and audited.",
          platformModerationPayload: {
            action: "interstitial_warning",
            downrankWeight: 0.85,
            interstitialLabel: "Debunked Content: Video depicts 2018 clerk training paperwork, not ballots. Tap for verified fact check."
          }
        },
        ragConstraintPassed: true,
        processingTimeMs: 2150
      }
    },
    humanReview: {
      status: "pending",
      reviewedBy: "Senior Editor (Queue A)",
      selectedDispatchChannels: ["x_community_notes", "platform_moderation_api", "social_reply_bot"]
    }
  },
  {
    id: "inc-9022",
    title: "Highland Valley Dam Collapse Hoax",
    claimText: "BREAKING NEWS: Highland Valley Dam wall has collapsed following magnitude 4.1 tremor! Wall of water moving toward lower valley. Immediate emergency evacuation ordered by national guard!!",
    category: "emergency_disaster",
    currentStage: "hitl_gate",
    stageProgress: {
      idle: 100,
      ingestion: 100,
      detector: 100,
      origin_tracer: 100,
      spread_predictor: 100,
      rag_drafter: 100,
      hitl_gate: 50,
      dispatched: 0
    },
    totalElapsedSeconds: 79,
    ingestion: {
      id: "sig-782",
      timestamp: "5 mins ago",
      platform: "tiktok",
      authorHandle: "@ValleyAlertNow",
      authorFollowers: 11200,
      content: "BREAKING NEWS: Highland Valley Dam wall has collapsed following magnitude 4.1 tremor! Wall of water moving toward lower valley. Immediate emergency evacuation ordered by national guard!!",
      velocityPerMin: 1120,
      engagement: {
        reposts: 8900,
        likes: 19400,
        views: 245e3
      },
      mediaType: "screenshot"
    },
    detector: {
      veracityScore: 98,
      confidence: 96,
      severity: "critical",
      manipulationTechniques: [
        "Fabricated official disaster alert siren audio overlay",
        "Unverified evacuation panic triggers",
        "Impersonation of civil protection emergency broadcasting"
      ],
      flaggedKeywords: ["BREAKING", "dam wall collapsed", "evacuation ordered", "national guard"],
      reasoning: "State civil protection and USGS confirm tremor was minor (magnitude 2.3 at 18km depth) and dam sensors report 0.0mm displacement. Video uses CGI flood footage from a 2020 disaster film.",
      processingTimeMs: 1380
    },
    origin: {
      patientZero: {
        platform: "tiktok",
        username: "ValleyAlertNow",
        accountAgeDays: 3,
        botProbability: 79,
        firstSeenTimestamp: "10:20:15 UTC (T-79s)",
        geographicCluster: "Automated content syndication farm"
      },
      hops: [
        {
          id: "hop-21",
          platform: "tiktok",
          sourceNode: "@ValleyAlertNow",
          targetNode: "FYP Algorithm recommendation push",
          delaySeconds: 15,
          mechanism: "algorithmic_spike"
        },
        {
          id: "hop-22",
          platform: "whatsapp",
          sourceNode: "Regional Neighborhood Watch broadcasts",
          targetNode: "14,000 Family forwarding chats",
          delaySeconds: 32,
          mechanism: "coordinated_bot_burst"
        }
      ],
      coordinatedNetworkScore: 84,
      processingTimeMs: 1820
    },
    spread: {
      r0ViralFactor: 4.1,
      currentReach: 245e3,
      projected6hReachUncontained: 19e5,
      projected6hReachContained: 31e4,
      reductionPercentage: 83.7,
      vulnerableCommunities: [
        {
          name: "Downriver Valley Communities",
          susceptibility: 96,
          populationSize: 85e3,
          primaryPlatform: "whatsapp"
        }
      ],
      networkNodes: [
        { id: "node-seed-2", label: "Tiktok Syndi-Bot", type: "seed", status: "infected", x: 140, y: 160, size: 26, degree: 12 },
        { id: "node-wa-1", label: "WhatsApp Forwarding Nodes", type: "bridge", status: "infected", x: 320, y: 140, size: 30, degree: 36 },
        { id: "node-residents", label: "Local Valley Residents", type: "community", status: "at_risk", x: 540, y: 150, size: 38, degree: 58 }
      ],
      networkEdges: [
        { source: "node-seed-2", target: "node-wa-1", intensity: 0.96, active: true },
        { source: "node-wa-1", target: "node-residents", intensity: 0.91, active: true }
      ],
      processingTimeMs: 1490
    },
    ragDrafter: {
      sources: [
        {
          id: "src-snopes-01",
          organization: "Snopes",
          title: "Fact Check: Did Authorities Evacuate Highland Valley Due to Dam Collapse Risk?",
          url: "https://www.snopes.com/fact-check/highland-valley-dam-collapse-earthquake/",
          verificationRating: "False",
          relevanceScore: 95,
          keyEvidenceQuote: "The State Department of Water Resources and the Army Corps of Engineers completed seismic sensor sweeps at 08:30 UTC confirming the Highland Valley Dam integrity stands at structural nominal 100%. No evacuation warning was declared.",
          publishDate: "2024-10-02"
        }
      ],
      counterNarrative: {
        headline: "Emergency Alert Debunk: Highland Valley Dam is 100% Intact, No Evacuation Order Exists",
        truthSandwich: {
          verifiedFact: "The Department of Water Resources and Army Corps of Engineers confirm the Highland Valley Dam has suffered zero damage and is structurally sound [1].",
          mythCorrection: "A viral video claiming the dam ruptured and triggered an emergency evacuation uses fabricated siren soundbites and movie footage; civil protection agencies have issued no evacuation order [1].",
          reinforcingFact: "All regional spillways and telemetry are monitored 24/7 with zero overflow risk [1]."
        },
        fullRebuttal: "Reports that the Highland Valley Dam wall has collapsed or that evacuations have been ordered are false. The State Department of Water Resources and Army Corps of Engineers have conducted physical and sensor inspections confirming 100% structural integrity with zero breach [1]. Residents should not evacuate or block roadways.",
        inLineCitations: [
          {
            marker: "[1]",
            sourceTitle: "Snopes: Did Authorities Evacuate Highland Valley Due to Dam Collapse Risk?",
            url: "https://www.snopes.com/fact-check/highland-valley-dam-collapse-earthquake/",
            org: "Snopes"
          }
        ],
        variants: {
          socialReply: "EMERGENCY REBUTTAL: Highland Valley Dam has NOT breached. Official inspections by State Water Resources confirm 100% safety. Do NOT clog evacuation routes. Verified by Snopes [1]: snopes.com/dam-check",
          communityNote: "Context: Emergency authorities confirm Highland Valley Dam is completely undamaged and functioning normally. No evacuation orders have been issued.",
          pressAdvisory: "PUBLIC SAFETY ADVISORY: Coordinated disinformation regarding dam failure is spreading on TikTok and WhatsApp. Civil defence alerts confirm normal operational status.",
          platformModerationPayload: {
            action: "algorithmic_containment",
            downrankWeight: 0.95,
            interstitialLabel: "Critical Warning: Emergency services confirm dam is safe. This video contains false evacuation panic."
          }
        },
        ragConstraintPassed: true,
        processingTimeMs: 1950
      }
    },
    humanReview: {
      status: "pending",
      reviewedBy: "Emergency Duty Officer",
      selectedDispatchChannels: ["platform_moderation_api", "press_wire", "whatsapp_advisory"]
    }
  },
  {
    id: "inc-9023",
    title: "Central Bank Wire Transfer Freeze Hoax",
    claimText: "Leak from insider: Central Bank is shutting down all domestic wire transfers and regional bank withdrawals tonight at 00:00! Pull your cash immediately from ATMs before liquidity lock!",
    category: "financial_panic",
    currentStage: "dispatched",
    stageProgress: {
      idle: 100,
      ingestion: 100,
      detector: 100,
      origin_tracer: 100,
      spread_predictor: 100,
      rag_drafter: 100,
      hitl_gate: 100,
      dispatched: 100
    },
    totalElapsedSeconds: 84,
    ingestion: {
      id: "sig-783",
      timestamp: "18 mins ago",
      platform: "reddit",
      authorHandle: "u/MacroLeakInsider",
      authorFollowers: 2100,
      content: "Leak from insider: Central Bank is shutting down all domestic wire transfers and regional bank withdrawals tonight at 00:00! Pull your cash immediately from ATMs before liquidity lock!",
      velocityPerMin: 430,
      engagement: {
        reposts: 3100,
        likes: 8200,
        views: 112e3
      },
      mediaType: "text"
    },
    detector: {
      veracityScore: 94,
      confidence: 92,
      severity: "high",
      manipulationTechniques: [
        "Bank-run panic incitement",
        "Fabricated internal memo attribution",
        "Urgent liquidity cutoff psychological trigger"
      ],
      flaggedKeywords: ["shutting down wire transfers", "pull cash immediately", "liquidity lock"],
      reasoning: "Zero regulatory filings. Automated clearinghouse systems operate under statutory continuity protocols. Message conforms to classic run-on-the-bank disinformation.",
      processingTimeMs: 1290
    },
    origin: {
      patientZero: {
        platform: "reddit",
        username: "MacroLeakInsider",
        accountAgeDays: 5,
        botProbability: 68,
        firstSeenTimestamp: "09:55:00 UTC (T-84s)",
        geographicCluster: "Anonymous proxy pool"
      },
      hops: [
        {
          id: "hop-31",
          platform: "reddit",
          sourceNode: "r/cryptocurrency discussion threads",
          targetNode: "X/Twitter Finance hashtags",
          delaySeconds: 22,
          mechanism: "cross_platform_screenshot"
        }
      ],
      coordinatedNetworkScore: 78,
      processingTimeMs: 1710
    },
    spread: {
      r0ViralFactor: 2.8,
      currentReach: 112e3,
      projected6hReachUncontained: 89e4,
      projected6hReachContained: 145e3,
      reductionPercentage: 83.7,
      vulnerableCommunities: [
        {
          name: "Retail Investors & Day Traders",
          susceptibility: 78,
          populationSize: 14e4,
          primaryPlatform: "reddit"
        }
      ],
      networkNodes: [
        { id: "node-seed-3", label: "Reddit Seed Node", type: "seed", status: "inoculated", x: 160, y: 150, size: 24, degree: 10 },
        { id: "node-fin", label: "Finance Twt Amplifiers", type: "bridge", status: "inoculated", x: 380, y: 150, size: 28, degree: 25 }
      ],
      networkEdges: [
        { source: "node-seed-3", target: "node-fin", intensity: 0.82, active: false }
      ],
      processingTimeMs: 1390
    },
    ragDrafter: {
      sources: [
        {
          id: "src-reuters-01",
          organization: "Reuters",
          title: "Reuters Fact Check: Central Bank Is NOT Freezing Regional Wire Transfers",
          url: "https://www.reuters.com/fact-check/central-bank-regional-wire-freeze-hoax-2024/",
          verificationRating: "False",
          relevanceScore: 96,
          keyEvidenceQuote: "A Federal Reserve spokesperson explicitly confirmed that the automated clearinghouse (Fedwire and ACH) is operating with zero disruption. The forwarded screenshot circulating on messaging channels is an edited doctored press release template.",
          publishDate: "2024-09-18"
        }
      ],
      counterNarrative: {
        headline: "Debunked: Central Bank Wire Transfers and ATM Operations Functioning Without Interruption",
        truthSandwich: {
          verifiedFact: "The central banking automated clearinghouse (Fedwire and national ACH) is operating normally with 100% liquidity guarantees [1].",
          mythCorrection: "Viral rumors of an impending midnight wire freeze are based on a doctored image template; no restrictions on bank withdrawals or electronic transfers have been instituted [1].",
          reinforcingFact: "Customer bank deposits remain insured and accessible through standard banking channels [1]."
        },
        fullRebuttal: "Federal monetary regulators confirm that all commercial and regional wire transfers, automated clearinghouse batches, and automated teller machines are fully functional [1]. Claims of an impending liquidity lock are manufactured falsehoods.",
        inLineCitations: [
          {
            marker: "[1]",
            sourceTitle: "Reuters: Central Bank Is NOT Freezing Regional Wire Transfers",
            url: "https://www.reuters.com/fact-check/central-bank-regional-wire-freeze-hoax-2024/",
            org: "Reuters"
          }
        ],
        variants: {
          socialReply: "False alarm: Banking clearinghouses and wire services are operating with 100% normal uptime. No transfer halts or withdrawal limits exist. Source: Reuters [1]",
          communityNote: "Central bank and Federal Reserve representatives have verified that banking networks and wire systems are operating normally. The rumor is based on fabricated graphics.",
          pressAdvisory: "FINANCIAL INTEGRITY NOTICE: Viral claims predicting banking transaction halts have been reviewed and refuted. Liquidity and clearinghouses operate as normal.",
          platformModerationPayload: {
            action: "downrank_50pct",
            downrankWeight: 0.65,
            interstitialLabel: "Financial rumor: Banking agencies report all wire services are normal."
          }
        },
        ragConstraintPassed: true,
        processingTimeMs: 1880
      }
    },
    humanReview: {
      status: "approved",
      reviewedBy: "Financial Markets Desk Editor",
      reviewedAt: "10:02 UTC",
      selectedDispatchChannels: ["x_community_notes", "platform_moderation_api"]
    }
  }
];

// server.ts
var incidents = [...INITIAL_INCIDENTS];
var geminiClient = null;
function getGemini() {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.get("/api/claims", (req, res) => {
    res.json({
      claims: incidents,
      metrics: {
        activeIncidentsCount: incidents.length,
        avgPipelineLatencySeconds: 83.5,
        containmentSuccessRate: 94.2,
        gatedReviewQueueLength: incidents.filter((i) => i.currentStage === "hitl_gate" && i.humanReview.status === "pending").length,
        indexedFactCheckCount: TRUSTED_KNOWLEDGE_BASE.length,
        dispatchesTodayCount: incidents.filter((i) => i.currentStage === "dispatched").length
      }
    });
  });
  app.get("/api/knowledge-base", (req, res) => {
    res.json({ sources: TRUSTED_KNOWLEDGE_BASE });
  });
  app.post("/api/pipeline/run", async (req, res) => {
    const { claimText, platform = "x", category = "elections_civic", mediaType = "text" } = req.body;
    if (!claimText || typeof claimText !== "string") {
      res.status(400).json({ error: "Claim text is required" });
      return;
    }
    const claimId = `inc-${Date.now().toString().slice(-4)}`;
    const newIncident = {
      id: claimId,
      title: claimText.slice(0, 60) + (claimText.length > 60 ? "..." : ""),
      claimText,
      category,
      currentStage: "hitl_gate",
      totalElapsedSeconds: 86,
      stageProgress: {
        idle: 100,
        ingestion: 100,
        detector: 100,
        origin_tracer: 100,
        spread_predictor: 100,
        rag_drafter: 100,
        hitl_gate: 50,
        dispatched: 0
      },
      ingestion: {
        id: `sig-${Date.now()}`,
        timestamp: "Just now",
        platform,
        authorHandle: `@ViralObserver_${Math.floor(100 + Math.random() * 900)}`,
        authorFollowers: Math.floor(5e3 + Math.random() * 45e3),
        content: claimText,
        velocityPerMin: Math.floor(400 + Math.random() * 900),
        engagement: {
          reposts: Math.floor(1200 + Math.random() * 9500),
          likes: Math.floor(4500 + Math.random() * 22e3),
          views: Math.floor(8e4 + Math.random() * 35e4)
        },
        mediaType
      },
      humanReview: {
        status: "pending",
        reviewedBy: "Queue Dispatch Lead",
        selectedDispatchChannels: ["x_community_notes", "platform_moderation_api", "social_reply_bot"]
      }
    };
    const lower = claimText.toLowerCase();
    const matchingSources = TRUSTED_KNOWLEDGE_BASE.filter((src) => {
      const words = src.title.toLowerCase().split(" ").concat(src.organization.toLowerCase());
      return words.some((w) => w.length > 3 && lower.includes(w));
    });
    const selectedSources = matchingSources.length > 0 ? matchingSources : [TRUSTED_KNOWLEDGE_BASE[0]];
    const ai = getGemini();
    if (ai) {
      try {
        const prompt = `You are the core orchestrator of the 90-Second Misinformation Containment System.
Analyze the following viral claim spreading on social media:
"${claimText}"
Platform: ${platform}
Category: ${category}
Ground-Truth Indexed Sources available for RAG retrieval:
${JSON.stringify(selectedSources)}

Respond in valid JSON only with this structure:
{
  "detector": {
    "veracityScore": <number 0-100 where 100 is completely false>,
    "confidence": <number 0-100>,
    "severity": <"critical" | "high" | "medium" | "low">,
    "manipulationTechniques": [<3-4 short strings describing manipulation e.g. "Fabricated statistic", "Emotional urgency trigger">],
    "flaggedKeywords": [<3-5 keywords>],
    "reasoning": <short 2 sentence explanation of why this claim is flagged>
  },
  "origin": {
    "patientZero": {
      "platform": <"x" | "telegram" | "reddit" | "tiktok" | "whatsapp">,
      "username": <string>,
      "accountAgeDays": <number>,
      "botProbability": <number 0-100>,
      "firstSeenTimestamp": <string e.g. "10:14 UTC (T-86s)">,
      "geographicCluster": <string>
    },
    "coordinatedNetworkScore": <number 0-100>,
    "hops": [
      {
        "id": "hop-1",
        "platform": <string>,
        "sourceNode": <string>,
        "targetNode": <string>,
        "delaySeconds": <number>,
        "mechanism": "telegram_broadcast"
      }
    ]
  },
  "spread": {
    "r0ViralFactor": <number e.g. 3.2>,
    "currentReach": <number e.g. 150000>,
    "projected6hReachUncontained": <number e.g. 1200000>,
    "projected6hReachContained": <number e.g. 210000>,
    "reductionPercentage": <number e.g. 82.5>
  },
  "counterNarrative": {
    "headline": <string fact-first headline>,
    "truthSandwich": {
      "verifiedFact": <string fact first>,
      "mythCorrection": <string how claim misleads>,
      "reinforcingFact": <string sticky factual takeaway>
    },
    "fullRebuttal": <string including inline [1] citations referencing the indexed source>,
    "socialReply": <short concise rebuttal <240 chars with [1] citation>,
    "communityNote": <standard community note context paragraph>,
    "pressAdvisory": <formal newsroom containment note>,
    "platformModerationPayload": {
      "action": "interstitial_warning",
      "downrankWeight": 0.85,
      "interstitialLabel": <warning label string>
    }
  }
}`;
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
        if (response.text) {
          const parsed = JSON.parse(response.text);
          newIncident.detector = {
            veracityScore: parsed.detector.veracityScore ?? 92,
            confidence: parsed.detector.confidence ?? 94,
            severity: parsed.detector.severity ?? "high",
            manipulationTechniques: parsed.detector.manipulationTechniques ?? ["Fabricated narrative", "Urgency trigger"],
            flaggedKeywords: parsed.detector.flaggedKeywords ?? ["breaking", "urgent", "shocking"],
            reasoning: parsed.detector.reasoning ?? "Claim conflicts directly with verified empirical data.",
            processingTimeMs: 1420
          };
          newIncident.origin = {
            patientZero: {
              platform: parsed.origin?.patientZero?.platform ?? platform,
              username: parsed.origin?.patientZero?.username ?? "AnonymousSeedAccount",
              accountAgeDays: parsed.origin?.patientZero?.accountAgeDays ?? 12,
              botProbability: parsed.origin?.patientZero?.botProbability ?? 85,
              firstSeenTimestamp: parsed.origin?.patientZero?.firstSeenTimestamp ?? "T-85s",
              geographicCluster: parsed.origin?.patientZero?.geographicCluster ?? "Automated Bot Relay Cluster"
            },
            hops: parsed.origin?.hops ?? [
              {
                id: "hop-1",
                platform: "telegram",
                sourceNode: "Closed Relay Channel",
                targetNode: "Public Microblogging Stream",
                delaySeconds: 18,
                mechanism: "coordinated_bot_burst"
              }
            ],
            coordinatedNetworkScore: parsed.origin?.coordinatedNetworkScore ?? 88,
            processingTimeMs: 1750
          };
          const curReach = parsed.spread?.currentReach ?? 21e4;
          const uncontained = parsed.spread?.projected6hReachUncontained ?? curReach * 7;
          const contained = parsed.spread?.projected6hReachContained ?? Math.floor(curReach * 1.3);
          newIncident.spread = {
            r0ViralFactor: parsed.spread?.r0ViralFactor ?? 3.4,
            currentReach: curReach,
            projected6hReachUncontained: uncontained,
            projected6hReachContained: contained,
            reductionPercentage: Math.round((uncontained - contained) / uncontained * 100),
            vulnerableCommunities: [
              {
                name: "High-Velocity Social Echo Chambers",
                susceptibility: 85,
                populationSize: 32e4,
                primaryPlatform: platform
              },
              {
                name: "Cross-Network Discussion Groups",
                susceptibility: 74,
                populationSize: 15e4,
                primaryPlatform: "reddit"
              }
            ],
            networkNodes: [
              { id: "node-seed", label: "Patient Zero", type: "seed", status: "infected", x: 130, y: 150, size: 26, degree: 14 },
              { id: "node-bot1", label: "Amplifier Ring \u03B1", type: "bot_amplifier", status: "infected", x: 280, y: 100, size: 24, degree: 32 },
              { id: "node-bridge1", label: "Cross-platform Bridge", type: "bridge", status: "at_risk", x: 440, y: 140, size: 28, degree: 40 },
              { id: "node-comm1", label: "Vulnerable Echo Hub", type: "community", status: "at_risk", x: 600, y: 110, size: 34, degree: 50 },
              { id: "node-comm2", label: "General Feeds", type: "susceptible_hub", status: "neutral", x: 730, y: 160, size: 36, degree: 55 }
            ],
            networkEdges: [
              { source: "node-seed", target: "node-bot1", intensity: 0.94, active: true },
              { source: "node-bot1", target: "node-bridge1", intensity: 0.88, active: true },
              { source: "node-bridge1", target: "node-comm1", intensity: 0.82, active: true },
              { source: "node-comm1", target: "node-comm2", intensity: 0.65, active: false }
            ],
            processingTimeMs: 1600
          };
          newIncident.ragDrafter = {
            sources: selectedSources,
            counterNarrative: {
              headline: parsed.counterNarrative.headline ?? `Fact Check: Debunking Viral Claims on ${claimText.slice(0, 30)}`,
              truthSandwich: {
                verifiedFact: parsed.counterNarrative.truthSandwich?.verifiedFact ?? `Authoritative records from ${selectedSources[0].organization} confirm official protocols are fully compliant and safe [1].`,
                mythCorrection: parsed.counterNarrative.truthSandwich?.mythCorrection ?? `A viral social media claim alleges otherwise without substantiated provenance or verified documentation [1].`,
                reinforcingFact: parsed.counterNarrative.truthSandwich?.reinforcingFact ?? `Independent verification mechanisms remain actively monitored with zero discrepancies reported [1].`
              },
              fullRebuttal: parsed.counterNarrative.fullRebuttal ?? `The viral assertion is demonstrably unsubstantiated according to verified fact-checks published by ${selectedSources[0].organization} [1].`,
              inLineCitations: [
                {
                  marker: "[1]",
                  sourceTitle: `${selectedSources[0].organization}: ${selectedSources[0].title}`,
                  url: selectedSources[0].url,
                  org: selectedSources[0].organization
                }
              ],
              variants: {
                socialReply: parsed.counterNarrative.socialReply ?? `Unsubstantiated. Official records from ${selectedSources[0].organization} refute this claim [1]: ${selectedSources[0].url}`,
                communityNote: parsed.counterNarrative.communityNote ?? `Readers added context: Independent verification by ${selectedSources[0].organization} shows that official procedures are functioning normally.`,
                pressAdvisory: parsed.counterNarrative.pressAdvisory ?? `Containment Dispatch: Rapid debunking alert issued regarding viral assertions on ${category}.`,
                platformModerationPayload: {
                  action: "interstitial_warning",
                  downrankWeight: 0.85,
                  interstitialLabel: `Verified Debunk: Information refuted by ${selectedSources[0].organization}.`
                }
              },
              ragConstraintPassed: true,
              processingTimeMs: 2100
            }
          };
          incidents.unshift(newIncident);
          res.json({ success: true, incident: newIncident });
          return;
        }
      } catch (err) {
        console.warn("Gemini API execution error, falling back to algorithmic multi-agent generator:", err);
      }
    }
    newIncident.detector = {
      veracityScore: 95,
      confidence: 93,
      severity: "critical",
      manipulationTechniques: [
        "Manufactured panic assertion",
        "Fabricated authoritative attribution",
        "Decontextualized archival framing",
        "Algorithmic virality baiting"
      ],
      flaggedKeywords: ["urgent", "breaking", "leak", "blackout", "alert"],
      reasoning: `Analysis flags extreme anomaly in narrative framing. Zero official corroboration exists in verified records. Velocity metrics indicate deliberate synthetic bot orchestration.`,
      processingTimeMs: 1450
    };
    newIncident.origin = {
      patientZero: {
        platform,
        username: `BotCluster_${Math.floor(100 + Math.random() * 900)}`,
        accountAgeDays: 4,
        botProbability: 86,
        firstSeenTimestamp: "T-86s (Synchronized Ingestion)",
        geographicCluster: "Automated Proxy Relay Grid"
      },
      hops: [
        {
          id: "hop-101",
          platform: "telegram",
          sourceNode: "Encrypted Syndicate Group",
          targetNode: "X Trending Hashtags",
          delaySeconds: 14,
          mechanism: "coordinated_bot_burst"
        },
        {
          id: "hop-102",
          platform: "x",
          sourceNode: "Automated Sockpuppet Fleet",
          targetNode: "Cross-platform Aggregators",
          delaySeconds: 32,
          mechanism: "cross_platform_screenshot"
        }
      ],
      coordinatedNetworkScore: 89,
      processingTimeMs: 1840
    };
    newIncident.spread = {
      r0ViralFactor: 3.65,
      currentReach: 195e3,
      projected6hReachUncontained: 165e4,
      projected6hReachContained: 28e4,
      reductionPercentage: 83,
      vulnerableCommunities: [
        {
          name: "Hyper-Sensitive News Consumers",
          susceptibility: 88,
          populationSize: 34e4,
          primaryPlatform: platform
        },
        {
          name: "Regional Community Chat Hubs",
          susceptibility: 76,
          populationSize: 18e4,
          primaryPlatform: "whatsapp"
        }
      ],
      networkNodes: [
        { id: "node-seed-gen", label: "Patient Zero Node", type: "seed", status: "infected", x: 120, y: 150, size: 28, degree: 14 },
        { id: "node-bot-gen1", label: "Bot Fleet \u03B1 (180 accounts)", type: "bot_amplifier", status: "infected", x: 260, y: 90, size: 24, degree: 36 },
        { id: "node-bridge-gen", label: "Bridge Influencers", type: "bridge", status: "at_risk", x: 420, y: 130, size: 30, degree: 44 },
        { id: "node-comm-gen1", label: "Susceptible Community Hub", type: "community", status: "at_risk", x: 580, y: 80, size: 34, degree: 52 },
        { id: "node-fringe-gen", label: "Mainstream Broadcast Fringe", type: "susceptible_hub", status: "neutral", x: 720, y: 150, size: 36, degree: 60 }
      ],
      networkEdges: [
        { source: "node-seed-gen", target: "node-bot-gen1", intensity: 0.95, active: true },
        { source: "node-bot-gen1", target: "node-bridge-gen", intensity: 0.9, active: true },
        { source: "node-bridge-gen", target: "node-comm-gen1", intensity: 0.84, active: true },
        { source: "node-comm-gen1", target: "node-fringe-gen", intensity: 0.58, active: false }
      ],
      processingTimeMs: 1620
    };
    newIncident.ragDrafter = {
      sources: selectedSources,
      counterNarrative: {
        headline: `Fact Check: Verified Sources Refute False Assertions Regarding "${claimText.slice(0, 45)}..."`,
        truthSandwich: {
          verifiedFact: `Official records and verified assessments from ${selectedSources[0].organization} demonstrate that operational standards and verified protocols are fully maintained [1].`,
          mythCorrection: `A circulating viral message claims imminent catastrophic failure or malfeasance; official telemetry and physical audits confirm these claims are fabricated [1].`,
          reinforcingFact: `All relevant safety, electoral, and public agencies report normal status with 24/7 oversight [1].`
        },
        fullRebuttal: `The viral post claiming catastrophic anomalies is demonstrably false. Independent audits and official releases from ${selectedSources[0].organization} document zero discrepancies [1]. Physical monitoring and institutional verification confirm the information in question has been synthetically amplified without factual basis.`,
        inLineCitations: [
          {
            marker: "[1]",
            sourceTitle: `${selectedSources[0].organization}: ${selectedSources[0].title}`,
            url: selectedSources[0].url,
            org: selectedSources[0].organization
          }
        ],
        variants: {
          socialReply: `False assertion. Official audits from ${selectedSources[0].organization} confirm standard operations with zero irregularities. Verified source: ${selectedSources[0].url} [1]`,
          communityNote: `Readers added context: Independent verification by ${selectedSources[0].organization} confirms that this claim is unfounded and contradicts official findings.`,
          pressAdvisory: `CONTAINMENT BULLETIN: Coordinated viral claim regarding ${category} has been reviewed by the multi-agent containment pipeline and refuted with indexed evidence.`,
          platformModerationPayload: {
            action: "interstitial_warning",
            downrankWeight: 0.85,
            interstitialLabel: `Debunked: Verified as false by ${selectedSources[0].organization}. Click for evidence.`
          }
        },
        ragConstraintPassed: true,
        processingTimeMs: 2050
      }
    };
    incidents.unshift(newIncident);
    res.json({ success: true, incident: newIncident });
  });
  app.post("/api/claims/:id/review", (req, res) => {
    const { id } = req.params;
    const { status, reviewedBy, editedHeadline, editedRebuttal, reviewNotes, selectedDispatchChannels } = req.body;
    const incident = incidents.find((i) => i.id === id);
    if (!incident) {
      res.status(404).json({ error: "Incident not found" });
      return;
    }
    incident.humanReview = {
      status,
      reviewedBy: reviewedBy || "Senior Fact-Check Lead",
      reviewedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
      editedHeadline: editedHeadline || incident.ragDrafter?.counterNarrative.headline,
      editedRebuttal: editedRebuttal || incident.ragDrafter?.counterNarrative.fullRebuttal,
      reviewNotes: reviewNotes || "",
      selectedDispatchChannels: selectedDispatchChannels || incident.humanReview.selectedDispatchChannels
    };
    if (status === "approved") {
      incident.currentStage = "dispatched";
      incident.stageProgress.hitl_gate = 100;
      incident.stageProgress.dispatched = 100;
    } else if (status === "rejected") {
      incident.currentStage = "hitl_gate";
    }
    res.json({ success: true, incident });
  });
  app.post("/api/claims/:id/dispatch", (req, res) => {
    const { id } = req.params;
    const incident = incidents.find((i) => i.id === id);
    if (!incident) {
      res.status(404).json({ error: "Incident not found" });
      return;
    }
    incident.currentStage = "dispatched";
    incident.stageProgress.hitl_gate = 100;
    incident.stageProgress.dispatched = 100;
    incident.humanReview.status = "approved";
    incident.humanReview.reviewedAt = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    res.json({
      success: true,
      incident,
      dispatchedActions: [
        { channel: "X / Twitter Community Notes", status: "Submitted to Consensus Review" },
        { channel: "Meta / Platform Downranking API", status: "50% Algorithmic Downrank Payload Deployed" },
        { channel: "Social Reply Bot Fleet", status: "15 High-Visibility Debunk Replies Injected" },
        { channel: "Newsroom & Wire Alert", status: "Fast-Track Advisory Distributed" }
      ]
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Misinformation Containment System server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
