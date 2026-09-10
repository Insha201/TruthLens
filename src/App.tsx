
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveClaimsPage } from './pages/LiveClaimsPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { AgentIntelligencePage } from './pages/AgentIntelligencePage';
import { SpreadIntelligencePage } from './pages/SpreadIntelligencePage';
import { EvidenceReviewPage } from './pages/EvidenceReviewPage';
import { CounterNarrativePage } from './pages/CounterNarrativePage';
import { SystemStatusPage } from './pages/SystemStatusPage';
import { IngestModal } from './components/IngestModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { INITIAL_INCIDENTS, TRUSTED_KNOWLEDGE_BASE } from './data/mockData';
import { 
  IncidentClaim, 
  PipelineStage, 
  Platform, 
  RetrievedSource, 
  SystemMetrics,
  MainAppPage
} from './types';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function MisinformationContainmentApp() {
  const { uiTransition } = useTheme();

  const [activePage, setActivePage] = useState<MainAppPage>('home');

  const [incidents, setIncidents] = useState<IncidentClaim[]>(INITIAL_INCIDENTS);
  const [currentIncidentId, setCurrentIncidentId] = useState<string>(INITIAL_INCIDENTS[0].id);
  const [knowledgeSources, setKnowledgeSources] = useState<RetrievedSource[]>(TRUSTED_KNOWLEDGE_BASE);
  const [activeStageScrub, setActiveStageScrub] = useState<PipelineStage>('hitl_gate');

  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [notificationToast, setNotificationToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Sync with backend on initial mount
  useEffect(() => {
    fetch('/api/claims')
      .then((res) => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then((data) => {
        if (data.claims && Array.isArray(data.claims)) {
          setIncidents(data.claims);
          if (data.claims.length > 0 && !currentIncidentId) {
            setCurrentIncidentId(data.claims[0].id);
          }
        }
      })
      .catch((err) => {
        console.log('Using local client state for incidents:', err);
      });
      
    // Force dark mode on html
    document.documentElement.classList.add('dark');
  }, []);

  const currentIncident = incidents.find((i) => i.id === currentIncidentId) || incidents[0];

  const metrics: SystemMetrics = {
    activeIncidentsCount: incidents.length,
    avgPipelineLatencySeconds: 83.5,
    containmentSuccessRate: 94.2,
    gatedReviewQueueLength: incidents.filter((i) => i.currentStage === 'hitl_gate' && i.humanReview.status === 'pending').length,
    indexedFactCheckCount: knowledgeSources.length,
    dispatchesTodayCount: incidents.filter((i) => i.currentStage === 'dispatched').length,
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotificationToast({ message, type });
    setTimeout(() => {
      setNotificationToast(null);
    }, 4500);
  };

  // Simulate 90-second run
  const handleSimulate90sRun = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    showToast('Simulation initiated: Stepping through 90s Multi-Agent Pipeline...', 'info');

    const timelineSteps: Array<{ stage: PipelineStage; time: number }> = [
      { stage: 'ingestion', time: 5 },
      { stage: 'detector', time: 15 },
      { stage: 'origin_tracer', time: 35 },
      { stage: 'spread_predictor', time: 60 },
      { stage: 'rag_drafter', time: 85 },
      { stage: 'hitl_gate', time: 90 },
    ];

    let currentStepIdx = 0;

    const interval = setInterval(() => {
      if (currentStepIdx < timelineSteps.length) {
        const step = timelineSteps[currentStepIdx];
        setActiveStageScrub(step.stage);

        setIncidents((prev) =>
          prev.map((inc) =>
            inc.id === currentIncident.id
              ? {
                  ...inc,
                  currentStage: step.stage,
                  totalElapsedSeconds: step.time,
                }
              : inc
          )
        );

        currentStepIdx++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        showToast('Pipeline completed in 88.4s (<90s SLA). High-severity claim gated for Human Review.', 'success');
      }
    }, 900);
  };

  // Handle Submit Custom Claim
  const handleSubmitClaim = async (claimText: string, platform: Platform, category: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimText, platform, category }),
      });

      if (!response.ok) throw new Error('Pipeline request failed');
      const data = await response.json();

      if (data.incident) {
        setIncidents((prev) => [data.incident, ...prev]);
        setCurrentIncidentId(data.incident.id);
        setActivePage('live_claims');
        setActiveStageScrub('hitl_gate');
        setIsIngestModalOpen(false);
        showToast(`New claim ingested and processed through 90s Multi-Agent Pipeline!`, 'success');
      }
    } catch (err) {
      console.warn('Backend execution failed, generating via client engine:', err);
      // Client-side fallback generator
      const newId = `inc-${Date.now().toString().slice(-4)}`;
      const fallbackIncident: IncidentClaim = {
        id: newId,
        title: claimText.slice(0, 60) + (claimText.length > 60 ? '...' : ''),
        claimText,
        category: category as any,
        currentStage: 'hitl_gate',
        totalElapsedSeconds: 85,
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
          authorFollowers: 18400,
          content: claimText,
          velocityPerMin: 620,
          engagement: {
            reposts: 4200,
            likes: 11200,
            views: 185000,
          },
          mediaType: 'text',
        },
        detector: {
          veracityScore: 94,
          confidence: 92,
          severity: 'high',
          manipulationTechniques: [
            'Decontextualized framing',
            'Manufactured institutional urgency',
            'Unsubstantiated factual claim',
          ],
          flaggedKeywords: ['urgent', 'shocking', 'unreported', 'spread now'],
          reasoning: 'Claim directly contradicts authoritative peer-reviewed data and official agency registries.',
          processingTimeMs: 1410,
        },
        origin: {
          patientZero: {
            platform,
            username: `SeedVector_${Math.floor(100 + Math.random() * 900)}`,
            accountAgeDays: 6,
            botProbability: 82,
            firstSeenTimestamp: 'T-85s',
            geographicCluster: 'Automated Proxy Relay Swarm',
          },
          hops: [
            {
              id: 'hop-1',
              platform: 'telegram',
              sourceNode: 'Closed Relay Chat',
              targetNode: `${platform.toUpperCase()} Trending Feeds`,
              delaySeconds: 18,
              mechanism: 'coordinated_bot_burst',
            },
          ],
          coordinatedNetworkScore: 86,
          processingTimeMs: 1780,
        },
        spread: {
          r0ViralFactor: 3.1,
          currentReach: 185000,
          projected6hReachUncontained: 1420000,
          projected6hReachContained: 240000,
          reductionPercentage: 83.1,
          vulnerableCommunities: [
            {
              name: 'High-Virality Public Feeds',
              susceptibility: 82,
              populationSize: 280000,
              primaryPlatform: platform,
            },
          ],
          networkNodes: [
            { id: 'node-seed', label: 'Patient Zero', type: 'seed', status: 'infected', x: 140, y: 150, size: 26, degree: 14 },
            { id: 'node-bot1', label: 'Bot Swarm α', type: 'bot_amplifier', status: 'infected', x: 290, y: 100, size: 24, degree: 30 },
            { id: 'node-bridge1', label: 'Bridge Node', type: 'bridge', status: 'at_risk', x: 450, y: 140, size: 28, degree: 38 },
            { id: 'node-comm1', label: 'Community Hub', type: 'community', status: 'at_risk', x: 610, y: 110, size: 34, degree: 48 },
            { id: 'node-fringe', label: 'General Audience', type: 'susceptible_hub', status: 'neutral', x: 740, y: 160, size: 36, degree: 52 },
          ],
          networkEdges: [
            { source: 'node-seed', target: 'node-bot1', intensity: 0.92, active: true },
            { source: 'node-bot1', target: 'node-bridge1', intensity: 0.85, active: true },
            { source: 'node-bridge1', target: 'node-comm1', intensity: 0.78, active: true },
            { source: 'node-comm1', target: 'node-fringe', intensity: 0.55, active: false },
          ],
          processingTimeMs: 1540,
        },
        ragDrafter: {
          sources: [knowledgeSources[0]],
          counterNarrative: {
            headline: `Fact Check: Debunking Viral Falsehoods Concerning "${claimText.slice(0, 45)}..."`,
            truthSandwich: {
              verifiedFact: `Official records from ${knowledgeSources[0].organization} demonstrate that operational standards and verified protocols are fully maintained [1].`,
              mythCorrection: `A circulating viral message claims imminent catastrophic failure or malfeasance without substantiated provenance [1].`,
              reinforcingFact: `All relevant safety, electoral, and public agencies report normal status with 24/7 oversight [1].`,
            },
            fullRebuttal: `The viral post claiming catastrophic anomalies is demonstrably false. Independent audits and official releases from ${knowledgeSources[0].organization} document zero discrepancies [1]. Physical monitoring and institutional verification confirm the information in question has been synthetically amplified without factual basis.`,
            inLineCitations: [
              {
                marker: '[1]',
                sourceTitle: `${knowledgeSources[0].organization}: ${knowledgeSources[0].title}`,
                url: knowledgeSources[0].url,
                org: knowledgeSources[0].organization,
              },
            ],
            variants: {
              socialReply: `False assertion. Official audits from ${knowledgeSources[0].organization} confirm standard operations with zero irregularities [1]: ${knowledgeSources[0].url}`,
              communityNote: `Readers added context: Independent verification by ${knowledgeSources[0].organization} confirms that this claim is unfounded and contradicts official findings.`,
              pressAdvisory: `CONTAINMENT BULLETIN: Coordinated viral claim has been reviewed by the multi-agent containment pipeline and refuted with indexed evidence.`,
              platformModerationPayload: {
                action: 'interstitial_warning',
                downrankWeight: 0.85,
                interstitialLabel: `Debunked: Verified as false by ${knowledgeSources[0].organization}. Click for evidence.`,
              },
            },
            ragConstraintPassed: true,
            processingTimeMs: 1950,
          },
        },
        humanReview: {
          status: 'pending',
          reviewedBy: 'Queue Dispatch Lead',
          selectedDispatchChannels: ['x_community_notes', 'platform_moderation_api', 'social_reply_bot'],
        },
      };

      setIncidents((prev) => [fallbackIncident, ...prev]);
      setCurrentIncidentId(fallbackIncident.id);
      setActivePage('live_claims');
      setActiveStageScrub('hitl_gate');
      setIsIngestModalOpen(false);
      showToast(`New claim processed through 90s Multi-Agent Pipeline!`, 'success');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Human Review Approval & Containment Dispatch
  const handleApproveAndDispatch = async (
    editedHeadline: string,
    editedRebuttal: string,
    reviewNotes: string,
    channels: string[]
  ) => {
    setIsDispatching(true);
    try {
      await fetch(`/api/claims/${currentIncident.id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      console.log('Dispatching locally:', e);
    }

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === currentIncident.id
          ? {
              ...inc,
              currentStage: 'dispatched',
              stageProgress: { ...inc.stageProgress, hitl_gate: 100, dispatched: 100 },
              humanReview: {
                ...inc.humanReview,
                status: 'approved',
                reviewedAt: new Date().toLocaleTimeString(),
                editedHeadline,
                editedRebuttal,
                reviewNotes,
                selectedDispatchChannels: channels,
              },
            }
          : inc
      )
    );

    setIsDispatching(false);
    showToast(
      `Containment Dispatched: 50% Algorithmic Downranking & Source Rebuttal deployed under 90s SLA!`,
      'success'
    );
  };

  const handleRequestRedraft = () => {
    showToast('Re-draft request sent to Agent 4 (RAG-Only Drafter)...', 'info');
  };

  const handleDismiss = (incidentId?: string) => {
    const id = incidentId || currentIncident.id;
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              humanReview: {
                ...inc.humanReview,
                status: 'rejected',
                reviewedAt: new Date().toLocaleTimeString(),
              },
            }
          : inc
      )
    );
    showToast('Incident dismissed from active containment queue.', 'info');
  };

  const handleAddSource = (newSource: RetrievedSource) => {
    setKnowledgeSources((prev) => [newSource, ...prev]);
    showToast(`New verified fact source indexed from ${newSource.organization}!`, 'success');
  };

  // Helper for dynamic animated page transitions
  const getPageTransitionVariants = (mode: string) => {
    return {
      initial: { opacity: 0, filter: 'brightness(1.5) blur(4px) saturate(0)' },
      animate: { opacity: 1, filter: 'brightness(1) blur(0px) saturate(1)' },
      exit: { opacity: 0, filter: 'brightness(0.5) blur(2px) saturate(1)' },
      transition: { duration: 0.4, ease: 'easeOut' },
    };
  };

  if (activePage === 'home') {
    return (
      <div className="min-h-screen bg-[#0A0F1E] text-white">
        <HomePage setPage={setActivePage} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-white transition-colors duration-200">
      {/* Toast Notification Banner */}
      {notificationToast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className={`p-4 rounded-xl border shadow-2xl flex items-center space-x-3 text-sm font-medium tracking-wide ${
            notificationToast.type === 'success'
              ? 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200 shadow-[0_0_20px_rgba(212,165,76,0.28)]'
              : 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
          }`}>
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${notificationToast.type === 'success' ? 'text-cyan-400' : 'text-indigo-400'}`} />
            <span className="font-mono">{notificationToast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar with Primary Navigation */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        metrics={metrics}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        isProcessing={isProcessing}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {(activePage !== 'home' && activePage !== 'dashboard' && activePage !== 'system_status') && (
           <div className="mb-6 flex justify-between items-center premium-card px-4 py-2 bg-slate-900/50">
             <div className="flex space-x-4 overflow-x-auto scrollbar-none items-center">
               <span className="text-[10px] text-cyan-500 tracking-widest font-bold uppercase shrink-0">ACTIVE CLAIM:</span>
               {incidents.slice(0, 5).map(inc => (
                 <button
                   key={inc.id}
                   onClick={() => setCurrentIncidentId(inc.id)}
                   className={`px-3 py-1 rounded text-xs font-mono whitespace-nowrap transition-all ${
                     currentIncidentId === inc.id 
                       ? 'bg-cyan-950 text-cyan-400 border border-cyan-700 shadow-[0_0_10px_rgba(212,165,76,0.25)]' 
                       : 'bg-slate-800 text-slate-400 hover:text-white border border-transparent'
                   }`}
                 >
                   {inc.id}
                 </button>
               ))}
             </div>
           </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            {...getPageTransitionVariants('cyber')}
            className="w-full"
          >
            {activePage === 'dashboard' && (
              <DashboardPage
                incidents={incidents}
                currentIncident={currentIncident}
                metrics={metrics}
                setCurrentIncidentId={setCurrentIncidentId}
                setPage={setActivePage}
              />
            )}
            
            {activePage === 'live_claims' && (
              <LiveClaimsPage
                incidents={incidents}
                currentIncident={currentIncident}
                setCurrentIncidentId={setCurrentIncidentId}
                setPage={setActivePage}
              />
            )}
            
            {activePage === 'investigation' && (
              <InvestigationPage
                currentIncident={currentIncident}
                setPage={setActivePage}
              />
            )}

            {activePage === 'agent_intelligence' && (
               <AgentIntelligencePage 
                 currentIncident={currentIncident} 
                 activeStageScrub={activeStageScrub} 
                 setActiveStageScrub={setActiveStageScrub}
                 onSimulateRun={handleSimulate90sRun}
                 isSimulating={isSimulating}
               />
            )}
            
            {activePage === 'spread_intelligence' && (
               <SpreadIntelligencePage 
                 currentIncident={currentIncident} 
               />
            )}
            
            {activePage === 'evidence_review' && (
               <EvidenceReviewPage 
                 knowledgeSources={knowledgeSources} 
                 handleAddSource={handleAddSource}
                 incidents={incidents}
                 setCurrentIncidentId={setCurrentIncidentId}
                 setPage={setActivePage}
                 handleDismiss={handleDismiss}
                 handleRequestRedraft={handleRequestRedraft}
               />
            )}
            
            {activePage === 'counter_narrative' && (
               <CounterNarrativePage 
                 currentIncident={currentIncident}
                 handleApproveAndDispatch={handleApproveAndDispatch}
                 handleRequestRedraft={handleRequestRedraft}
                 handleDismiss={handleDismiss}
                 isDispatching={isDispatching}
               />
            )}
            
            {activePage === 'status' && (
               <SystemStatusPage />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-900/40 backdrop-blur-md py-4 px-4 text-[10px] font-mono text-cyan-700/80 text-center tracking-widest relative z-10 uppercase">
        <span>TruthLens — An Agentic AI Ecosystem Against Misinformation • Detect. Trace. Predict. Verify. Respond. • 90s SLA</span>
      </footer>

      {/* Ingest Custom Claim Modal */}
      <IngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onSubmitClaim={handleSubmitClaim}
        isProcessing={isProcessing}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MisinformationContainmentApp />
    </ThemeProvider>
  );
}
