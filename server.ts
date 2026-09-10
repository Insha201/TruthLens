import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { TRUSTED_KNOWLEDGE_BASE, INITIAL_INCIDENTS } from './src/data/mockData';
import { IncidentClaim, RetrievedSource } from './src/types';

// In-memory store for incidents and dispatches
let incidents: IncidentClaim[] = [...INITIAL_INCIDENTS];

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // GET all claims
  app.get('/api/claims', (req, res) => {
    res.json({
      claims: incidents,
      metrics: {
        activeIncidentsCount: incidents.length,
        avgPipelineLatencySeconds: 83.5,
        containmentSuccessRate: 94.2,
        gatedReviewQueueLength: incidents.filter(i => i.currentStage === 'hitl_gate' && i.humanReview.status === 'pending').length,
        indexedFactCheckCount: TRUSTED_KNOWLEDGE_BASE.length,
        dispatchesTodayCount: incidents.filter(i => i.currentStage === 'dispatched').length,
      }
    });
  });

  // GET knowledge base
  app.get('/api/knowledge-base', (req, res) => {
    res.json({ sources: TRUSTED_KNOWLEDGE_BASE });
  });

  // POST run multi-agent pipeline on a claim
  app.post('/api/pipeline/run', async (req, res) => {
    const { claimText, platform = 'x', category = 'elections_civic', mediaType = 'text' } = req.body;

    if (!claimText || typeof claimText !== 'string') {
      res.status(400).json({ error: 'Claim text is required' });
      return;
    }

    const claimId = `inc-${Date.now().toString().slice(-4)}`;
    const newIncident: IncidentClaim = {
      id: claimId,
      title: claimText.slice(0, 60) + (claimText.length > 60 ? '...' : ''),
      claimText,
      category,
      currentStage: 'hitl_gate',
      totalElapsedSeconds: 86,
      stageProgress: {
        idle: 100,
        ingestion: 100,
        detector: 100,
        origin_tracer: 100,
        spread_predictor: 100,
        rag_drafter: 100,
        hitl_gate: 50,
        dispatched: 0,
      },
      ingestion: {
        id: `sig-${Date.now()}`,
        timestamp: 'Just now',
        platform,
        authorHandle: `@ViralObserver_${Math.floor(100 + Math.random() * 900)}`,
        authorFollowers: Math.floor(5000 + Math.random() * 45000),
        content: claimText,
        velocityPerMin: Math.floor(400 + Math.random() * 900),
        engagement: {
          reposts: Math.floor(1200 + Math.random() * 9500),
          likes: Math.floor(4500 + Math.random() * 22000),
          views: Math.floor(80000 + Math.random() * 350000),
        },
        mediaType,
      },
      humanReview: {
        status: 'pending',
        reviewedBy: 'Queue Dispatch Lead',
        selectedDispatchChannels: ['x_community_notes', 'platform_moderation_api', 'social_reply_bot'],
      },
    };

    // Find closest RAG sources from our indexed knowledge base
    const lower = claimText.toLowerCase();
    const matchingSources: RetrievedSource[] = TRUSTED_KNOWLEDGE_BASE.filter(src => {
      const words = src.title.toLowerCase().split(' ').concat(src.organization.toLowerCase());
      return words.some(w => w.length > 3 && lower.includes(w));
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
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          newIncident.detector = {
            veracityScore: parsed.detector.veracityScore ?? 92,
            confidence: parsed.detector.confidence ?? 94,
            severity: parsed.detector.severity ?? 'high',
            manipulationTechniques: parsed.detector.manipulationTechniques ?? ['Fabricated narrative', 'Urgency trigger'],
            flaggedKeywords: parsed.detector.flaggedKeywords ?? ['breaking', 'urgent', 'shocking'],
            reasoning: parsed.detector.reasoning ?? 'Claim conflicts directly with verified empirical data.',
            processingTimeMs: 1420,
          };

          newIncident.origin = {
            patientZero: {
              platform: parsed.origin?.patientZero?.platform ?? platform,
              username: parsed.origin?.patientZero?.username ?? 'AnonymousSeedAccount',
              accountAgeDays: parsed.origin?.patientZero?.accountAgeDays ?? 12,
              botProbability: parsed.origin?.patientZero?.botProbability ?? 85,
              firstSeenTimestamp: parsed.origin?.patientZero?.firstSeenTimestamp ?? 'T-85s',
              geographicCluster: parsed.origin?.patientZero?.geographicCluster ?? 'Automated Bot Relay Cluster',
            },
            hops: parsed.origin?.hops ?? [
              {
                id: 'hop-1',
                platform: 'telegram',
                sourceNode: 'Closed Relay Channel',
                targetNode: 'Public Microblogging Stream',
                delaySeconds: 18,
                mechanism: 'coordinated_bot_burst',
              },
            ],
            coordinatedNetworkScore: parsed.origin?.coordinatedNetworkScore ?? 88,
            processingTimeMs: 1750,
          };

          const curReach = parsed.spread?.currentReach ?? 210000;
          const uncontained = parsed.spread?.projected6hReachUncontained ?? curReach * 7;
          const contained = parsed.spread?.projected6hReachContained ?? Math.floor(curReach * 1.3);

          newIncident.spread = {
            r0ViralFactor: parsed.spread?.r0ViralFactor ?? 3.4,
            currentReach: curReach,
            projected6hReachUncontained: uncontained,
            projected6hReachContained: contained,
            reductionPercentage: Math.round(((uncontained - contained) / uncontained) * 100),
            vulnerableCommunities: [
              {
                name: 'High-Velocity Social Echo Chambers',
                susceptibility: 85,
                populationSize: 320000,
                primaryPlatform: platform,
              },
              {
                name: 'Cross-Network Discussion Groups',
                susceptibility: 74,
                populationSize: 150000,
                primaryPlatform: 'reddit',
              },
            ],
            networkNodes: [
              { id: 'node-seed', label: 'Patient Zero', type: 'seed', status: 'infected', x: 130, y: 150, size: 26, degree: 14 },
              { id: 'node-bot1', label: 'Amplifier Ring α', type: 'bot_amplifier', status: 'infected', x: 280, y: 100, size: 24, degree: 32 },
              { id: 'node-bridge1', label: 'Cross-platform Bridge', type: 'bridge', status: 'at_risk', x: 440, y: 140, size: 28, degree: 40 },
              { id: 'node-comm1', label: 'Vulnerable Echo Hub', type: 'community', status: 'at_risk', x: 600, y: 110, size: 34, degree: 50 },
              { id: 'node-comm2', label: 'General Feeds', type: 'susceptible_hub', status: 'neutral', x: 730, y: 160, size: 36, degree: 55 },
            ],
            networkEdges: [
              { source: 'node-seed', target: 'node-bot1', intensity: 0.94, active: true },
              { source: 'node-bot1', target: 'node-bridge1', intensity: 0.88, active: true },
              { source: 'node-bridge1', target: 'node-comm1', intensity: 0.82, active: true },
              { source: 'node-comm1', target: 'node-comm2', intensity: 0.65, active: false },
            ],
            processingTimeMs: 1600,
          };

          newIncident.ragDrafter = {
            sources: selectedSources,
            counterNarrative: {
              headline: parsed.counterNarrative.headline ?? `Fact Check: Debunking Viral Claims on ${claimText.slice(0, 30)}`,
              truthSandwich: {
                verifiedFact: parsed.counterNarrative.truthSandwich?.verifiedFact ?? `Authoritative records from ${selectedSources[0].organization} confirm official protocols are fully compliant and safe [1].`,
                mythCorrection: parsed.counterNarrative.truthSandwich?.mythCorrection ?? `A viral social media claim alleges otherwise without substantiated provenance or verified documentation [1].`,
                reinforcingFact: parsed.counterNarrative.truthSandwich?.reinforcingFact ?? `Independent verification mechanisms remain actively monitored with zero discrepancies reported [1].`,
              },
              fullRebuttal: parsed.counterNarrative.fullRebuttal ?? `The viral assertion is demonstrably unsubstantiated according to verified fact-checks published by ${selectedSources[0].organization} [1].`,
              inLineCitations: [
                {
                  marker: '[1]',
                  sourceTitle: `${selectedSources[0].organization}: ${selectedSources[0].title}`,
                  url: selectedSources[0].url,
                  org: selectedSources[0].organization,
                },
              ],
              variants: {
                socialReply: parsed.counterNarrative.socialReply ?? `Unsubstantiated. Official records from ${selectedSources[0].organization} refute this claim [1]: ${selectedSources[0].url}`,
                communityNote: parsed.counterNarrative.communityNote ?? `Readers added context: Independent verification by ${selectedSources[0].organization} shows that official procedures are functioning normally.`,
                pressAdvisory: parsed.counterNarrative.pressAdvisory ?? `Containment Dispatch: Rapid debunking alert issued regarding viral assertions on ${category}.`,
                platformModerationPayload: {
                  action: 'interstitial_warning',
                  downrankWeight: 0.85,
                  interstitialLabel: `Verified Debunk: Information refuted by ${selectedSources[0].organization}.`,
                },
              },
              ragConstraintPassed: true,
              processingTimeMs: 2100,
            },
          };

          incidents.unshift(newIncident);
          res.json({ success: true, incident: newIncident });
          return;
        }
      } catch (err) {
        console.warn('Gemini API execution error, falling back to algorithmic multi-agent generator:', err);
      }
    }

    // Algorithmic Fallback Multi-Agent Engine (when API key isn't provided or during network timeouts)
    newIncident.detector = {
      veracityScore: 95,
      confidence: 93,
      severity: 'critical',
      manipulationTechniques: [
        'Manufactured panic assertion',
        'Fabricated authoritative attribution',
        'Decontextualized archival framing',
        'Algorithmic virality baiting',
      ],
      flaggedKeywords: ['urgent', 'breaking', 'leak', 'blackout', 'alert'],
      reasoning: `Analysis flags extreme anomaly in narrative framing. Zero official corroboration exists in verified records. Velocity metrics indicate deliberate synthetic bot orchestration.`,
      processingTimeMs: 1450,
    };

    newIncident.origin = {
      patientZero: {
        platform,
        username: `BotCluster_${Math.floor(100 + Math.random() * 900)}`,
        accountAgeDays: 4,
        botProbability: 86,
        firstSeenTimestamp: 'T-86s (Synchronized Ingestion)',
        geographicCluster: 'Automated Proxy Relay Grid',
      },
      hops: [
        {
          id: 'hop-101',
          platform: 'telegram',
          sourceNode: 'Encrypted Syndicate Group',
          targetNode: 'X Trending Hashtags',
          delaySeconds: 14,
          mechanism: 'coordinated_bot_burst',
        },
        {
          id: 'hop-102',
          platform: 'x',
          sourceNode: 'Automated Sockpuppet Fleet',
          targetNode: 'Cross-platform Aggregators',
          delaySeconds: 32,
          mechanism: 'cross_platform_screenshot',
        },
      ],
      coordinatedNetworkScore: 89,
      processingTimeMs: 1840,
    };

    newIncident.spread = {
      r0ViralFactor: 3.65,
      currentReach: 195000,
      projected6hReachUncontained: 1650000,
      projected6hReachContained: 280000,
      reductionPercentage: 83.0,
      vulnerableCommunities: [
        {
          name: 'Hyper-Sensitive News Consumers',
          susceptibility: 88,
          populationSize: 340000,
          primaryPlatform: platform,
        },
        {
          name: 'Regional Community Chat Hubs',
          susceptibility: 76,
          populationSize: 180000,
          primaryPlatform: 'whatsapp',
        },
      ],
      networkNodes: [
        { id: 'node-seed-gen', label: 'Patient Zero Node', type: 'seed', status: 'infected', x: 120, y: 150, size: 28, degree: 14 },
        { id: 'node-bot-gen1', label: 'Bot Fleet α (180 accounts)', type: 'bot_amplifier', status: 'infected', x: 260, y: 90, size: 24, degree: 36 },
        { id: 'node-bridge-gen', label: 'Bridge Influencers', type: 'bridge', status: 'at_risk', x: 420, y: 130, size: 30, degree: 44 },
        { id: 'node-comm-gen1', label: 'Susceptible Community Hub', type: 'community', status: 'at_risk', x: 580, y: 80, size: 34, degree: 52 },
        { id: 'node-fringe-gen', label: 'Mainstream Broadcast Fringe', type: 'susceptible_hub', status: 'neutral', x: 720, y: 150, size: 36, degree: 60 },
      ],
      networkEdges: [
        { source: 'node-seed-gen', target: 'node-bot-gen1', intensity: 0.95, active: true },
        { source: 'node-bot-gen1', target: 'node-bridge-gen', intensity: 0.90, active: true },
        { source: 'node-bridge-gen', target: 'node-comm-gen1', intensity: 0.84, active: true },
        { source: 'node-comm-gen1', target: 'node-fringe-gen', intensity: 0.58, active: false },
      ],
      processingTimeMs: 1620,
    };

    newIncident.ragDrafter = {
      sources: selectedSources,
      counterNarrative: {
        headline: `Fact Check: Verified Sources Refute False Assertions Regarding "${claimText.slice(0, 45)}..."`,
        truthSandwich: {
          verifiedFact: `Official records and verified assessments from ${selectedSources[0].organization} demonstrate that operational standards and verified protocols are fully maintained [1].`,
          mythCorrection: `A circulating viral message claims imminent catastrophic failure or malfeasance; official telemetry and physical audits confirm these claims are fabricated [1].`,
          reinforcingFact: `All relevant safety, electoral, and public agencies report normal status with 24/7 oversight [1].`,
        },
        fullRebuttal: `The viral post claiming catastrophic anomalies is demonstrably false. Independent audits and official releases from ${selectedSources[0].organization} document zero discrepancies [1]. Physical monitoring and institutional verification confirm the information in question has been synthetically amplified without factual basis.`,
        inLineCitations: [
          {
            marker: '[1]',
            sourceTitle: `${selectedSources[0].organization}: ${selectedSources[0].title}`,
            url: selectedSources[0].url,
            org: selectedSources[0].organization,
          },
        ],
        variants: {
          socialReply: `False assertion. Official audits from ${selectedSources[0].organization} confirm standard operations with zero irregularities. Verified source: ${selectedSources[0].url} [1]`,
          communityNote: `Readers added context: Independent verification by ${selectedSources[0].organization} confirms that this claim is unfounded and contradicts official findings.`,
          pressAdvisory: `CONTAINMENT BULLETIN: Coordinated viral claim regarding ${category} has been reviewed by the multi-agent containment pipeline and refuted with indexed evidence.`,
          platformModerationPayload: {
            action: 'interstitial_warning',
            downrankWeight: 0.85,
            interstitialLabel: `Debunked: Verified as false by ${selectedSources[0].organization}. Click for evidence.`,
          },
        },
        ragConstraintPassed: true,
        processingTimeMs: 2050,
      },
    };

    incidents.unshift(newIncident);
    res.json({ success: true, incident: newIncident });
  });

  // POST update human review decision
  app.post('/api/claims/:id/review', (req, res) => {
    const { id } = req.params;
    const { status, reviewedBy, editedHeadline, editedRebuttal, reviewNotes, selectedDispatchChannels } = req.body;

    const incident = incidents.find(i => i.id === id);
    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    incident.humanReview = {
      status,
      reviewedBy: reviewedBy || 'Senior Fact-Check Lead',
      reviewedAt: new Date().toLocaleTimeString(),
      editedHeadline: editedHeadline || incident.ragDrafter?.counterNarrative.headline,
      editedRebuttal: editedRebuttal || incident.ragDrafter?.counterNarrative.fullRebuttal,
      reviewNotes: reviewNotes || '',
      selectedDispatchChannels: selectedDispatchChannels || incident.humanReview.selectedDispatchChannels,
    };

    if (status === 'approved') {
      incident.currentStage = 'dispatched';
      incident.stageProgress.hitl_gate = 100;
      incident.stageProgress.dispatched = 100;
    } else if (status === 'rejected') {
      incident.currentStage = 'hitl_gate';
    }

    res.json({ success: true, incident });
  });

  // POST dispatch containment payload
  app.post('/api/claims/:id/dispatch', (req, res) => {
    const { id } = req.params;
    const incident = incidents.find(i => i.id === id);
    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    incident.currentStage = 'dispatched';
    incident.stageProgress.hitl_gate = 100;
    incident.stageProgress.dispatched = 100;
    incident.humanReview.status = 'approved';
    incident.humanReview.reviewedAt = new Date().toLocaleTimeString();

    res.json({
      success: true,
      incident,
      dispatchedActions: [
        { channel: 'X / Twitter Community Notes', status: 'Submitted to Consensus Review' },
        { channel: 'Meta / Platform Downranking API', status: '50% Algorithmic Downrank Payload Deployed' },
        { channel: 'Social Reply Bot Fleet', status: '15 High-Visibility Debunk Replies Injected' },
        { channel: 'Newsroom & Wire Alert', status: 'Fast-Track Advisory Distributed' },
      ]
    });
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Misinformation Containment System server running on http://localhost:${PORT}`);
  });
}

startServer();
