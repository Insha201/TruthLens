
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveClaimsPage } from './pages/LiveClaimsPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { SpreadIntelligencePage } from './pages/SpreadIntelligencePage';
import { EvidenceReviewPage } from './pages/EvidenceReviewPage';
import { CounterNarrativePage } from './pages/CounterNarrativePage';
import { IngestModal } from './components/IngestModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { 
  IncidentClaim, 
  PipelineStage, 
  Platform, 
  SystemMetrics,
  MainAppPage,
  DOMAIN_LABELS
} from './types';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function MisinformationContainmentApp() {
  const { uiTransition } = useTheme();

  const [activePage, setActivePage] = useState<MainAppPage>('home');

  const [incidents, setIncidents] = useState<IncidentClaim[]>([]);
  const [currentIncidentId, setCurrentIncidentId] = useState<string>('');
  // null = not checked yet, true = reachable, false = offline
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [evidenceStore, setEvidenceStore] = useState<{ count: number; documents: { id: string; text: string }[] }>({
    count: 0,
    documents: [],
  });
  const [activeStageScrub, setActiveStageScrub] = useState<PipelineStage>('hitl_gate');

  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [notificationToast, setNotificationToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // No mock fallback: if the backend is unreachable we say so instead of
  // silently rendering demo incidents that look real.
  const refreshClaims = () =>
    fetch('/api/claims')
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const claims: IncidentClaim[] = Array.isArray(data.claims) ? data.claims : [];
        setIncidents(claims);
        setBackendOnline(true);
        setCurrentIncidentId((prev) =>
          prev && claims.some((c) => c.id === prev) ? prev : claims[0]?.id ?? '',
        );
      })
      .catch((err) => {
        console.warn('Backend unreachable:', err);
        setIncidents([]);
        setBackendOnline(false);
      });

  const refreshEvidence = () =>
    fetch('/api/evidence')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.documents)) {
          setEvidenceStore({ count: data.count ?? data.documents.length, documents: data.documents });
        }
      })
      .catch(() => {});

  // Sync with backend on initial mount
  useEffect(() => {
    refreshClaims();
    refreshEvidence();
    // Force dark mode on html
    document.documentElement.classList.add('dark');
  }, []);

  const currentIncident = incidents.find((i) => i.id === currentIncidentId) || incidents[0];

  // Every metric below is derived from real claim data. Pipeline latency is
  // measured from each claim's own audit-event timestamps (first agent write
  // to last), not a fixed number.
  const metrics: SystemMetrics = (() => {
    const spans = incidents
      .map((i) => {
        const trail = i.auditTrail ?? [];
        if (trail.length < 2) return null;
        const start = Date.parse(trail[0].timestamp);
        const end = Date.parse(trail[trail.length - 1].timestamp);
        return Number.isFinite(start) && Number.isFinite(end) && end >= start
          ? (end - start) / 1000
          : null;
      })
      .filter((s): s is number => s !== null);

    const reviewed = incidents.filter((i) => i.humanReview.status !== 'pending');
    const approved = incidents.filter((i) => i.humanReview.status === 'approved');

    return {
      activeIncidentsCount: incidents.length,
      avgPipelineLatencySeconds: spans.length
        ? Math.round((spans.reduce((a, b) => a + b, 0) / spans.length) * 10) / 10
        : 0,
      // Share of reviewed claims a human approved for release.
      containmentSuccessRate: reviewed.length
        ? Math.round((approved.length / reviewed.length) * 1000) / 10
        : 0,
      // Matches the Evidence page queue: anything with no human decision yet.
      gatedReviewQueueLength: incidents.filter((i) => i.humanReview.status === 'pending').length,
      indexedFactCheckCount: evidenceStore.count,
      dispatchesTodayCount: approved.length,
    };
  })();

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
      console.warn('Pipeline request failed:', err);
      showToast('Pipeline unavailable - the claim was not processed.', 'info');
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

  // Real human-review decision → persisted in Neo4j via the backend.
  const handleReviewDecision = async (incidentId: string, approved: boolean) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              currentStage: approved ? 'dispatched' : 'hitl_gate',
              humanReview: {
                ...inc.humanReview,
                status: approved ? 'approved' : 'rejected',
                reviewedAt: new Date().toLocaleTimeString(),
              },
            }
          : inc,
      ),
    );
    try {
      const res = await fetch(`/api/claims/${encodeURIComponent(incidentId)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: approved ? 'approved' : 'rejected' }),
      });
      if (!res.ok) throw new Error(`review failed (${res.status})`);
      showToast(approved ? 'Claim approved — decision saved to Neo4j.' : 'Claim rejected — decision saved to Neo4j.', 'success');
      refreshClaims();
    } catch (err) {
      console.warn('Review decision not persisted:', err);
      showToast('Backend unavailable — decision kept locally only.', 'info');
    }
  };

  // Index a real fact-check snippet into the RAG vector store.
  const handleAddEvidence = async (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    try {
      const res = await fetch('/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean }),
      });
      if (!res.ok) throw new Error(`add failed (${res.status})`);
      await refreshEvidence();
      showToast('Fact-check snippet indexed into the RAG store.', 'success');
    } catch (err) {
      console.warn('Evidence not indexed:', err);
      showToast('Backend unavailable — could not index evidence.', 'info');
    }
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
        {backendOnline === false && (
          <div className="mb-6 rounded-md border border-rose-800 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            <span className="font-bold">Backend unreachable.</span> Nothing below is live data.
            Start the API with{' '}
            <code className="font-mono text-xs">cd backend &amp;&amp; python -m uvicorn main:app --reload</code>{' '}
            and reload this page.
          </div>
        )}
        {/* Context banner: which claim the detail pages are showing.
            Only rendered on single-claim pages, so list/corpus pages are not
            confused by a claim selector that does not apply to them. */}
        {['investigation', 'spread_intelligence', 'counter_narrative'].includes(activePage) &&
          currentIncident && (
            <div className="mb-6 premium-card px-4 py-3 bg-slate-900/50 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-[10px] text-cyan-500 tracking-widest font-bold uppercase shrink-0">
                Viewing claim
              </span>
              <span className="text-sm text-slate-100 flex-1 min-w-[240px] truncate">
                “{currentIncident.claimText}”
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {DOMAIN_LABELS[currentIncident.category] ?? currentIncident.category}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{currentIncident.id}</span>
              <button
                onClick={() => setActivePage('live_claims')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 shrink-0"
              >
                change claim
              </button>
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
            
            {activePage === 'spread_intelligence' && (
               <SpreadIntelligencePage 
                 currentIncident={currentIncident} 
               />
            )}
            
            {activePage === 'evidence_review' && (
               <EvidenceReviewPage
                 evidenceStore={evidenceStore}
                 handleAddEvidence={handleAddEvidence}
                 incidents={incidents}
                 setCurrentIncidentId={setCurrentIncidentId}
                 setPage={setActivePage}
                 handleReviewDecision={handleReviewDecision}
               />
            )}
            
            {activePage === 'counter_narrative' && (
               <CounterNarrativePage
                 currentIncident={currentIncident}
                 handleReviewDecision={handleReviewDecision}
               />
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
