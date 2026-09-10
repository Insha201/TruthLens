import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Share2, 
  Zap, 
  FileText, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  Bot, 
  Cpu, 
  Sparkles, 
  CornerDownRight,
  BookmarkCheck,
  Layers
} from 'lucide-react';
import { IncidentClaim, PipelineStage } from '../types';

interface AgentCardsGridProps {
  incident: IncidentClaim;
  activeStageScrub: PipelineStage;
  onNavigateToGraph: () => void;
  onNavigateToHITL: () => void;
  onNavigateToKnowledge: () => void;
  onNavigateToTransitions?: () => void;
}

export const AgentCardsGrid: React.FC<AgentCardsGridProps> = ({
  incident,
  activeStageScrub,
  onNavigateToGraph,
  onNavigateToHITL,
  onNavigateToKnowledge,
  onNavigateToTransitions,
}) => {
  const [activeVariantTab, setActiveVariantTab] = useState<'truthSandwich' | 'socialReply' | 'communityNote' | 'payload'>('truthSandwich');

  const { detector, origin, spread, ragDrafter, ingestion } = incident;

  return (
    <div className="space-y-6">
      {/* Live Ingestion Header Summary */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-colors">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 shrink-0">
            <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                Layer 1: Ingested Viral Signal
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase">
                Platform: {ingestion.platform.toUpperCase()}
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-mono text-amber-600 dark:text-amber-400">
                Velocity: {ingestion.velocityPerMin} shares/min
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1 leading-snug">
              &ldquo;{incident.claimText}&rdquo;
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono text-slate-600 dark:text-slate-400 shrink-0 self-end md:self-auto">
          <div>Author: <strong className="text-slate-900 dark:text-white">{ingestion.authorHandle}</strong></div>
          <div>Reach: <strong className="text-slate-900 dark:text-white">{ingestion.engagement.views.toLocaleString()}</strong></div>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
            detector?.severity === 'critical' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800' :
            detector?.severity === 'high' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800' :
            'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800'
          }`}>
            {detector?.severity || 'HIGH'} SEVERITY
          </span>
        </div>
      </div>

      {/* 4 Agent Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. DETECTOR AGENT */}
        <div className={`bg-white dark:bg-slate-900/90 border rounded-xl p-5 shadow-lg transition-all ${
          activeStageScrub === 'detector' ? 'border-cyan-500 ring-1 ring-cyan-500/50' : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Agent 1: Detector Agent</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400">
                    T+15s
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Veracity Scoring & Manipulation Pattern Analysis</p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {detector?.processingTimeMs || 1420}ms
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {/* Score & Confidence */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Veracity Anomaly Score</div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {detector?.veracityScore || 96}%
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1.5">Fabricated</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full" 
                    style={{ width: `${detector?.veracityScore || 96}%` }} 
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Detection Confidence</div>
                <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
                  {detector?.confidence || 94}%
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1.5">High Certainty</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="bg-cyan-500 h-full rounded-full" 
                    style={{ width: `${detector?.confidence || 94}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Identified Manipulation Techniques */}
            <div>
              <div className="text-xs font-mono text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                <span>Identified Manipulation Patterns:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {detector?.manipulationTechniques.map((tech, idx) => (
                  <span 
                    key={idx} 
                    className="text-[11px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-300 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Flagged Keywords */}
            <div>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5">Trigger Keywords:</div>
              <div className="flex flex-wrap gap-1">
                {detector?.flaggedKeywords.map((kw, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Agent Reasoning */}
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-lg p-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <strong className="text-cyan-700 dark:text-cyan-300 font-mono text-[11px] block mb-1">Reasoning Trace:</strong>
              {detector?.reasoning}
            </div>
          </div>
        </div>

        {/* 2. ORIGIN TRACER AGENT */}
        <div className={`bg-white dark:bg-slate-900/90 border rounded-xl p-5 shadow-lg transition-all ${
          activeStageScrub === 'origin_tracer' ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Agent 2: Origin Tracer</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400">
                    T+35s
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Patient Zero & Bot Network Attribution</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onNavigateToTransitions && (
                <button
                  onClick={onNavigateToTransitions}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-mono"
                >
                  8 Transition Vectors →
                </button>
              )}
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {origin?.processingTimeMs || 1980}ms
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {/* Patient Zero Profile Box */}
            <div className="bg-amber-50/50 dark:bg-slate-950/90 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3.5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  PATIENT ZERO (SEED NODE)
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                  {origin?.patientZero.botProbability}% Bot Prob
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Handle / Channel:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">{origin?.patientZero.username}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Account Age:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{origin?.patientZero.accountAgeDays} days (New Account)</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Attributed Cluster / Relay:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{origin?.patientZero.geographicCluster}</span>
                </div>
              </div>
            </div>

            {/* Platform Hop Trail */}
            <div>
              <div className="text-xs font-mono text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                <span>Multi-Platform Cascade Hops:</span>
                <span className="text-slate-500 text-[10px]">Coordinated Score: {origin?.coordinatedNetworkScore}/100</span>
              </div>
              <div className="space-y-2">
                {origin?.hops.map((hop, idx) => (
                  <div key={hop.id} className="flex items-start space-x-2.5 text-xs bg-slate-50 dark:bg-slate-950/50 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-bold text-[11px] shrink-0">
                      #{idx + 1} (+{hop.delaySeconds}s)
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5 text-slate-800 dark:text-slate-200">
                        <span className="font-medium text-slate-600 dark:text-slate-400 uppercase text-[10px] bg-slate-200 dark:bg-slate-800 px-1 rounded">
                          {hop.platform}
                        </span>
                        <span className="truncate">{hop.sourceNode}</span>
                        <CornerDownRight className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="text-amber-700 dark:text-amber-300 font-medium truncate">{hop.targetNode}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Mechanism: {hop.mechanism.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. GRAPH-BASED SPREAD PREDICTOR */}
        <div className={`bg-white dark:bg-slate-900/90 border rounded-xl p-5 shadow-lg transition-all ${
          activeStageScrub === 'spread_predictor' ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Agent 3: Spread Predictor</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400">
                    T+60s
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Graph Cascade & Vulnerable Community Forecast</p>
              </div>
            </div>
            <button
              id="btn-view-full-graph"
              onClick={onNavigateToGraph}
              className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>View Graph</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {/* Impact Metric Comparison */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg">
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Viral R0 Factor</div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {spread?.r0ViralFactor}
                </div>
                <div className="text-[10px] text-slate-500">Exponential</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg">
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Uncontained 6h</div>
                <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  {spread ? (spread.projected6hReachUncontained / 1000000).toFixed(2) + 'M' : '2.85M'}
                </div>
                <div className="text-[10px] text-slate-500">Worst Case</div>
              </div>

              <div className="bg-emerald-50 dark:bg-slate-950/80 border border-emerald-200 dark:border-emerald-900/50 p-2.5 rounded-lg">
                <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">Contained 6h</div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-300 mt-0.5">
                  {spread ? (spread.projected6hReachContained / 1000).toFixed(0) + 'K' : '490K'}
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  -{spread?.reductionPercentage}% Impact
                </div>
              </div>
            </div>

            {/* Vulnerable Communities */}
            <div>
              <div className="text-xs font-mono text-slate-700 dark:text-slate-300 mb-2">Vulnerable Target Clusters:</div>
              <div className="space-y-2">
                {spread?.vulnerableCommunities.map((comm, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{comm.name}</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400">{comm.susceptibility}% Susceptible</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Platform: {comm.primaryPlatform.toUpperCase()}</span>
                      <span>Target Pool: {comm.populationSize.toLocaleString()} users</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. RAG-ONLY COUNTER-NARRATIVE DRAFTER */}
        <div className={`bg-white dark:bg-slate-900/90 border rounded-xl p-5 shadow-lg transition-all ${
          activeStageScrub === 'rag_drafter' ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Agent 4: RAG-Only Drafter</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400">
                    T+85s
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Source-Grounded Truth Sandwich & Multi-Channel Variants</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
                RAG CONSTRAINT VERIFIED
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {/* Retrieved Trusted Sources Citation Box */}
            <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px] flex items-center gap-1">
                  <BookmarkCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  Indexed Ground-Truth Sources ({ragDrafter?.sources.length || 1}):
                </span>
                <button
                  id="btn-inspect-rag-db"
                  onClick={onNavigateToKnowledge}
                  className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5"
                >
                  Inspect Database <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>

              {ragDrafter?.sources.map((src) => (
                <div key={src.id} className="text-xs bg-white dark:bg-slate-900/60 p-2 rounded border border-slate-200 dark:border-slate-800 mb-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                      [1] {src.organization}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Rating: <strong className="text-rose-600 dark:text-rose-400">{src.verificationRating}</strong>
                    </span>
                  </div>
                  <div className="text-slate-800 dark:text-slate-300 text-[11px] font-medium mt-0.5 truncate">
                    {src.title}
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 italic mt-1 line-clamp-2">
                    &ldquo;{src.keyEvidenceQuote}&rdquo;
                  </p>
                </div>
              ))}
            </div>

            {/* Truth Sandwich & Variants Selector */}
            <div>
              <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 text-xs font-mono mb-2">
                <button
                  id="tab-truth-sandwich"
                  onClick={() => setActiveVariantTab('truthSandwich')}
                  className={`px-2.5 py-1 font-semibold border-b-2 transition-colors ${
                    activeVariantTab === 'truthSandwich'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Truth Sandwich
                </button>
                <button
                  id="tab-social-reply"
                  onClick={() => setActiveVariantTab('socialReply')}
                  className={`px-2.5 py-1 font-semibold border-b-2 transition-colors ${
                    activeVariantTab === 'socialReply'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Social Reply (X)
                </button>
                <button
                  id="tab-community-note"
                  onClick={() => setActiveVariantTab('communityNote')}
                  className={`px-2.5 py-1 font-semibold border-b-2 transition-colors ${
                    activeVariantTab === 'communityNote'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Community Note
                </button>
                <button
                  id="tab-api-payload"
                  onClick={() => setActiveVariantTab('payload')}
                  className={`px-2.5 py-1 font-semibold border-b-2 transition-colors ${
                    activeVariantTab === 'payload'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Downrank Payload
                </button>
              </div>

              {/* Variant Content */}
              {activeVariantTab === 'truthSandwich' && (
                <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs space-y-2">
                  <div className="border-l-2 border-emerald-500 pl-2.5">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase block">
                      1. Verified Fact First:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 text-[11px] mt-0.5">
                      {ragDrafter?.counterNarrative.truthSandwich.verifiedFact}
                    </p>
                  </div>
                  <div className="border-l-2 border-amber-500 pl-2.5">
                    <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 uppercase block">
                      2. Myth Correction:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-0.5">
                      {ragDrafter?.counterNarrative.truthSandwich.mythCorrection}
                    </p>
                  </div>
                  <div className="border-l-2 border-cyan-500 pl-2.5">
                    <span className="text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-400 uppercase block">
                      3. Reinforcing Fact Takeaway:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 text-[11px] mt-0.5">
                      {ragDrafter?.counterNarrative.truthSandwich.reinforcingFact}
                    </p>
                  </div>
                </div>
              )}

              {activeVariantTab === 'socialReply' && (
                <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs">
                  <div className="text-[10px] font-mono text-slate-500 mb-1">Optimized for Rapid In-Feed Rebuttal:</div>
                  <p className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 font-sans">
                    {ragDrafter?.counterNarrative.variants.socialReply}
                  </p>
                </div>
              )}

              {activeVariantTab === 'communityNote' && (
                <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs">
                  <div className="text-[10px] font-mono text-slate-500 mb-1">Community Context Proposal:</div>
                  <p className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 font-sans">
                    {ragDrafter?.counterNarrative.variants.communityNote}
                  </p>
                </div>
              )}

              {activeVariantTab === 'payload' && (
                <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs font-mono">
                  <div className="text-[10px] text-slate-500 mb-1">Platform Moderation Webhook Dispatch:</div>
                  <pre className="text-[11px] text-slate-800 dark:text-cyan-300 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 overflow-x-auto">
                    {JSON.stringify(ragDrafter?.counterNarrative.variants.platformModerationPayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Human Gate Alert Callout */}
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/80 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-rose-800 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>High severity flagged: Rebuttal is gated behind Human Editor review.</span>
              </div>
              <button
                id="btn-open-hitl-gate"
                onClick={onNavigateToHITL}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors shrink-0 shadow"
              >
                Review & Dispatch
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

