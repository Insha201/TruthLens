import React from 'react';
import { 
  Radio, 
  GitBranch, 
  UserCheck, 
  Layers, 
  Database, 
  PlusCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PipelineTimeline90s } from './PipelineTimeline90s';
import { AgentCardsGrid } from './AgentCardsGrid';
import { NetworkGraphVisualizer } from './NetworkGraphVisualizer';
import { HITLGatingStation } from './HITLGatingStation';
import { DataIngestionLayer } from './DataIngestionLayer';
import { KnowledgeBaseView } from './KnowledgeBaseView';
import { IncidentClaim, PipelineStage, RetrievedSource, FeatureSubTab } from '../types';

interface FeaturesPageProps {
  incidents: IncidentClaim[];
  currentIncident: IncidentClaim;
  currentIncidentId: string;
  setCurrentIncidentId: (id: string) => void;
  knowledgeSources: RetrievedSource[];
  activeSubTab: FeatureSubTab;
  setActiveSubTab: (tab: FeatureSubTab) => void;
  activeStageScrub: PipelineStage;
  setActiveStageScrub: (stage: PipelineStage) => void;
  handleSimulate90sRun: () => void;
  isSimulating: boolean;
  handleApproveAndDispatch: (incidentId: string, notes: string, targets: string[]) => void;
  handleRequestRedraft: (incidentId: string, instructions: string) => void;
  handleDismiss: (incidentId: string) => void;
  handleAddSource: (source: RetrievedSource) => void;
  isDispatching: boolean;
  onOpenIngestModal: () => void;
  onNavigateToTheme: () => void;
  onNavigateToHome?: () => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({
  incidents,
  currentIncident,
  currentIncidentId,
  setCurrentIncidentId,
  knowledgeSources,
  activeSubTab,
  setActiveSubTab,
  activeStageScrub,
  setActiveStageScrub,
  handleSimulate90sRun,
  isSimulating,
  handleApproveAndDispatch,
  handleRequestRedraft,
  handleDismiss,
  handleAddSource,
  isDispatching,
  onOpenIngestModal,
  onNavigateToTheme,
  onNavigateToHome,
}) => {
  const pendingReviewCount = incidents.filter(
    (i) => i.currentStage === 'hitl_gate' && i.humanReview.status === 'pending'
  ).length;

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Features Bar */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-md flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none text-sm sm:text-base">
          <button
            id="subtab-pipeline"
            onClick={() => setActiveSubTab('pipeline')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'pipeline'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>1. 90s Agent Pipeline</span>
          </button>

          <button
            id="subtab-graph"
            onClick={() => setActiveSubTab('graph')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'graph'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>2. Network Spread Graph</span>
          </button>

          <button
            id="subtab-hitl"
            onClick={() => setActiveSubTab('hitl')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap relative cursor-pointer ${
              activeSubTab === 'hitl'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>3. Human Editor Gate</span>
            {pendingReviewCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                activeSubTab === 'hitl'
                  ? 'bg-white text-rose-700'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
              }`}>
                {pendingReviewCount}
              </span>
            )}
          </button>

          <button
            id="subtab-ingestion"
            onClick={() => setActiveSubTab('ingestion')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'ingestion'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Layer 1: Ingestion Feed</span>
          </button>

          <button
            id="subtab-knowledge"
            onClick={() => setActiveSubTab('knowledge')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'knowledge'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Layer 3: RAG Knowledge</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onNavigateToHome && (
            <button
              onClick={onNavigateToHome}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>← Home</span>
            </button>
          )}
          <button
            onClick={onNavigateToTheme}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-mono font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span>Theme & Transitions →</span>
          </button>
        </div>
      </div>

      {/* FEATURE SUB-VIEW 1: 90s PIPELINE CONTROL */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-6">
          <PipelineTimeline90s
            incident={currentIncident}
            onSimulateRun={handleSimulate90sRun}
            isSimulating={isSimulating}
            activeStageScrub={activeStageScrub}
            setActiveStageScrub={setActiveStageScrub}
          />

          <AgentCardsGrid
            incident={currentIncident}
            activeStageScrub={activeStageScrub}
            onNavigateToGraph={() => setActiveSubTab('graph')}
            onNavigateToHITL={() => setActiveSubTab('hitl')}
            onNavigateToKnowledge={() => setActiveSubTab('knowledge')}
            onNavigateToTransitions={onNavigateToTheme}
          />
        </div>
      )}

      {/* FEATURE SUB-VIEW 2: SPREAD NETWORK GRAPH */}
      {activeSubTab === 'graph' && (
        <NetworkGraphVisualizer
          incident={currentIncident}
          onNavigateBackToPipeline={() => setActiveSubTab('pipeline')}
        />
      )}

      {/* FEATURE SUB-VIEW 3: LAYER 4 HUMAN-IN-THE-LOOP EDITOR GATE */}
      {activeSubTab === 'hitl' && (
        <HITLGatingStation
          incident={currentIncident}
          onApproveAndDispatch={handleApproveAndDispatch}
          onRequestRedraft={handleRequestRedraft}
          onDismiss={handleDismiss}
          isDispatching={isDispatching}
        />
      )}

      {/* FEATURE SUB-VIEW 4: LAYER 1 DATA INGESTION */}
      {activeSubTab === 'ingestion' && (
        <DataIngestionLayer
          incidents={incidents}
          currentIncidentId={currentIncident.id}
          onSelectIncident={(id) => {
            setCurrentIncidentId(id);
            setActiveSubTab('pipeline');
          }}
          onOpenIngestModal={onOpenIngestModal}
        />
      )}

      {/* FEATURE SUB-VIEW 5: LAYER 3 KNOWLEDGE BASE & STORAGE */}
      {activeSubTab === 'knowledge' && (
        <KnowledgeBaseView
          sources={knowledgeSources}
          onAddSource={handleAddSource}
        />
      )}
    </div>
  );
};
