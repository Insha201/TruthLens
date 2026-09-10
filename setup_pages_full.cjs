const fs = require('fs');
const pagesDir = 'src/pages';
if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir);

const homeCode = `
import React from 'react';
export const HomePage = ({ setPage }: any) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-12">
      <div className="text-center space-y-6 mt-12">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 drop-shadow-lg">
          STOP MISINFORMATION <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">BEFORE IT SPREADS.</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          An evidence-first multi-agent intelligence platform that detects suspicious claims, traces their origin, predicts their spread, verifies trusted evidence, and supports source-backed responses.
        </p>
        <div className="flex justify-center space-x-6 mt-8">
          <button onClick={() => setPage('dashboard')} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]">
            EXPLORE INTELLIGENCE CENTER
          </button>
          <button onClick={() => setPage('live_claims')} className="px-8 py-3 border border-cyan-800 hover:border-cyan-400 bg-transparent text-cyan-100 rounded-lg font-bold transition-all">
            VIEW LIVE CLAIMS
          </button>
        </div>
      </div>
      
      {/* 3D Network Concept Placeholder */}
      <div className="w-full max-w-4xl h-80 premium-card flex items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/40 via-[#040810] to-[#040810] opacity-80" />
        <div className="z-10 text-center">
          <h3 className="text-cyan-400 tracking-[0.2em] text-sm font-semibold mb-2 shadow-black drop-shadow-md">LIVE MISINFORMATION NETWORK</h3>
          <p className="text-xs text-slate-500">CLAIM ➔ NETWORK ➔ SPREAD ➔ EVIDENCE ➔ RESPONSE</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mt-12">
        {['CLAIM DETECTION', 'ORIGIN TRACING', 'SPREAD PREDICTION', 'SOURCE-BACKED RESPONSE'].map(f => (
          <div key={f} className="premium-card p-6 text-center">
            <h3 className="text-sm font-bold text-slate-200">{f}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};
`;

const dashboardCode = `
import React from 'react';
export const DashboardPage = ({ currentIncident, metrics }: any) => {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-widest">MISINFORMATION INTELLIGENCE CENTER</h1>
        <p className="text-slate-400 mt-2">Monitor, investigate and contain misinformation in real time. <span className="status-cyan ml-2">● LIVE MONITORING</span></p>
      </header>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'FLAGGED CLAIMS', val: metrics.activeIncidentsCount },
          { label: 'ACTIVE INVESTIGATIONS', val: metrics.activeIncidentsCount },
          { label: 'HIGH SEVERITY CLAIMS', val: 1 },
          { label: 'REVIEWED VERIFIED', val: metrics.indexedFactCheckCount }
        ].map(k => (
          <div key={k.label} className="premium-card p-6 flex flex-col justify-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">{k.val}</div>
            <div className="text-xs font-semibold text-slate-500 tracking-widest">{k.label}</div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-card p-6 h-80 flex flex-col">
          <h2 className="text-sm tracking-widest text-slate-300 font-bold mb-4">MISINFORMATION ACTIVITY</h2>
          <div className="flex-1 border border-slate-800 rounded flex items-center justify-center">Chart Placeholder</div>
        </div>
        <div className="premium-card p-6 h-80 flex flex-col">
          <h2 className="text-sm tracking-widest text-slate-300 font-bold mb-4">LIVE CLAIM MONITOR</h2>
          <div className="flex-1 space-y-4">
             {currentIncident && (
               <div className="bg-slate-900/50 p-4 rounded-lg border border-red-900/30">
                 <div className="flex justify-between items-center mb-2">
                   <div className="text-xs font-bold text-red-400 uppercase">High Severity • 8.7/10</div>
                   <div className="text-xs text-slate-500">{currentIncident.stageProgress && 'Status: HUMAN REVIEW'}</div>
                 </div>
                 <p className="text-sm text-slate-200 line-clamp-2">"{currentIncident.title}"</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
`;

const liveClaimsCode = `
import React from 'react';
export const LiveClaimsPage = ({ incidents }: any) => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white tracking-widest">LIVE CLAIM MONITOR</h1>
      <div className="flex space-x-4 mb-6 text-xs font-semibold tracking-wider">
        <span className="px-3 py-1 bg-cyan-900/40 text-cyan-400 rounded border border-cyan-800">ALL</span>
        <span className="px-3 py-1 text-slate-500 hover:text-slate-300 cursor-pointer">CRITICAL</span>
        <span className="px-3 py-1 text-slate-500 hover:text-slate-300 cursor-pointer">HIGH</span>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {incidents.map((inc: any) => (
          <div key={inc.id} className="premium-card p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                <span className="text-xs text-slate-400 tracking-wider">{inc.id}</span>
                {inc.detector && <span className="text-xs text-red-400 font-bold ml-4 border border-red-900 bg-red-900/20 px-2 py-0.5 rounded">Conf: {inc.detector.confidence}%</span>}
              </div>
              <p className="text-sm font-medium text-slate-100">"{inc.title}"</p>
            </div>
            <div className="flex sm:flex-col items-end space-y-2 text-xs">
              <span className="text-cyan-600 uppercase font-bold text-[10px]">{inc.currentStage}</span>
              <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-600 transition-colors">INVESTIGATE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
`;

const investigationCode = `
import React from 'react';
export const InvestigationPage = ({ currentIncident }: any) => {
  if (!currentIncident) return <div>No incident selected</div>;
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-widest">CLAIM INVESTIGATION</h1>
        <div className="mt-4 p-5 premium-card border-l-4 border-l-red-500">
          <p className="text-lg text-slate-200">"{currentIncident.claimText}"</p>
          <div className="flex space-x-6 mt-4 text-xs font-mono text-slate-400">
            <span>Confidence: <span className="text-white">{currentIncident.detector?.confidence || 'N/A'}%</span></span>
            <span>Severity: <span className="text-red-400 uppercase font-bold">{currentIncident.detector?.severity || 'HIGH'}</span></span>
            <span>Status: <span className="text-cyan-400 uppercase">{currentIncident.currentStage}</span></span>
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="premium-card p-6">
           <h3 className="text-xs tracking-widest text-slate-400 font-bold mb-4 flex items-center">
             <span className="w-6 h-6 mr-3 text-cyan-400 rounded-full border border-cyan-400 flex items-center justify-center">1</span>
             DETECTION
           </h3>
           <p className="text-sm text-slate-300">Reasoning: {currentIncident.detector?.reasoning || 'Analyzing claim...'}</p>
        </div>
        <div className="premium-card p-6">
           <h3 className="text-xs tracking-widest text-slate-400 font-bold mb-4 flex items-center">
             <span className="w-6 h-6 mr-3 text-cyan-400 rounded-full border border-cyan-400 flex items-center justify-center">2</span>
             ORIGIN
           </h3>
           {currentIncident.origin ? (
             <div className="space-y-2 text-sm text-slate-300">
                <p>Platform: <span className="text-white capitalize">{currentIncident.origin.patientZero.platform}</span></p>
                <p>Account: <span className="text-white">{currentIncident.origin.patientZero.username}</span></p>
                <p>Cluster: <span className="text-amber-400">{currentIncident.origin.patientZero.geographicCluster}</span></p>
             </div>
           ) : <p className="text-sm text-slate-500">Tracing origin...</p>}
        </div>
        <div className="premium-card p-6">
           <h3 className="text-xs tracking-widest text-slate-400 font-bold mb-4 flex items-center">
             <span className="w-6 h-6 mr-3 text-cyan-400 rounded-full border border-cyan-400 flex items-center justify-center">3</span>
             SPREAD PREDICTION
           </h3>
           {currentIncident.spread ? (
             <div className="space-y-2 text-sm text-slate-300">
                <p>Risk Level: <span className="text-red-400 font-bold">HIGH (R0 {currentIncident.spread.r0ViralFactor})</span></p>
                <p>Projected Reach: <span className="text-white">{(currentIncident.spread.projected6hReachUncontained/1000).toFixed(0)}k</span></p>
             </div>
           ) : <p className="text-sm text-slate-500">Analyzing spread...</p>}
        </div>
      </div>
    </div>
  );
};
`;

const agentIntelligenceCode = `
import React from 'react';
import { PipelineTimeline90s } from '../components/PipelineTimeline90s';

export const AgentIntelligencePage = ({ currentIncident, activeStageScrub, setActiveStageScrub }: any) => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white tracking-widest">MULTI-AGENT INTELLIGENCE</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'CLAIM DETECTOR', desc: 'Identifies suspicious or misleading claims.', status: 'COMPLETED' },
          { title: 'ORIGIN TRACER', desc: 'Finds the earliest known source.', status: 'COMPLETED' },
          { title: 'SPREAD PREDICTOR', desc: 'Predicts potential information propagation.', status: 'COMPLETED' },
          { title: 'COUNTER-NARRATIVE DRAFTER', desc: 'Creates evidence-backed responses.', status: 'REVIEW REQUIRED' }
        ].map(a => (
          <div key={a.title} className="premium-card p-5 relative overflow-hidden group">
            <h3 className="text-sm font-bold text-slate-100 mb-2">{a.title}</h3>
            <p className="text-xs text-slate-400 mb-6">{a.desc}</p>
            <div className="text-[10px] font-mono tracking-widest text-cyan-400 absolute bottom-4 left-5">{a.status}</div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-cyan-900/30 to-transparent rounded-bl-full" />
          </div>
        ))}
      </div>
      
      <div className="premium-card p-6 mt-8">
        <h3 className="text-xs tracking-widest text-slate-400 font-bold mb-6">AGENT PIPELINE</h3>
        <PipelineTimeline90s 
           currentIncident={currentIncident}
           activeStageScrub={activeStageScrub}
           setActiveStageScrub={setActiveStageScrub}
        />
      </div>
    </div>
  );
};
`;

const spreadIntelligenceCode = `
import React from 'react';
import { NetworkGraphVisualizer } from '../components/NetworkGraphVisualizer';

export const SpreadIntelligencePage = ({ currentIncident }: any) => {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <h1 className="text-3xl font-bold text-white tracking-widest">SPREAD INTELLIGENCE</h1>
      <div className="flex-1 premium-card p-6 relative overflow-hidden min-h-[500px]">
        {currentIncident.spread ? (
          <NetworkGraphVisualizer currentIncident={currentIncident} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-sm">
            [ SPREAD PREDICTION UNAVAILABLE OR STILL PROCESSING ]
          </div>
        )}
      </div>
    </div>
  );
};
`;

const evidenceReviewCode = `
import React from 'react';
import { KnowledgeBaseView } from '../components/KnowledgeBaseView';

export const EvidenceReviewPage = ({ knowledgeSources, handleAddSource }: any) => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white tracking-widest">EVIDENCE & HUMAN REVIEW</h1>
      
      <div className="premium-card p-6">
         <KnowledgeBaseView 
            sources={knowledgeSources}
            onAddSource={handleAddSource}
         />
      </div>
    </div>
  );
};
`;

const counterNarrativeCode = `
import React from 'react';
import { HITLGatingStation } from '../components/HITLGatingStation';

export const CounterNarrativePage = ({ currentIncident, handleApproveAndDispatch, handleRequestRedraft, handleDismiss, isDispatching }: any) => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white tracking-widest uppercase mb-2">Source-Backed Counter-Narrative & Audit Trail</h1>
      <div className="premium-card p-6">
        <HITLGatingStation
          currentIncident={currentIncident}
          onApprove={handleApproveAndDispatch}
          onRequestRedraft={handleRequestRedraft}
          onDismiss={handleDismiss}
          isDispatching={isDispatching}
        />
      </div>
      
      <div className="premium-card p-6">
        <h3 className="text-sm font-bold text-slate-300 tracking-widest mb-6">AUDIT TRAIL</h3>
        <div className="space-y-4 border-l-2 border-slate-800 pl-4 ml-2">
          {['CLAIM DETECTED', 'CONFIDENCE CALCULATED', 'ORIGIN TRACED', 'SPREAD PREDICTED', 'EVIDENCE RETRIEVED', 'COUNTER-NARRATIVE DRAFTER', 'HUMAN REVIEW'].map((step, i) => (
             <div key={i} className="flex flex-col relative text-xs font-mono">
               <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-600 border border-black shadow-[0_0_8px_cyan]"></span>
               <span className="text-slate-500 mb-1">21:04:{10 + i * 5}</span>
               <span className="text-slate-200 font-bold">{step}</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};
`;

const systemStatusCode = `
import React from 'react';
export const SystemStatusPage = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white tracking-widest">SYSTEM HEALTH</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'FastAPI Backend', stat: 'ONLINE', color: 'text-green-500' },
          { label: 'Claim Detector', stat: 'ONLINE', color: 'text-green-500' },
          { label: 'Origin Tracer', stat: 'ONLINE', color: 'text-green-500' },
          { label: 'Spread Predictor', stat: 'ONLINE', color: 'text-green-500' },
          { label: 'RAG Pipeline', stat: 'ONLINE', color: 'text-green-500' },
          { label: 'Neo4j Graph', stat: 'CONNECTED', color: 'text-cyan-400' },
          { label: 'Redis Cache', stat: 'CONNECTED', color: 'text-cyan-400' },
          { label: 'Vector Store', stat: 'CONNECTED', color: 'text-cyan-400' }
        ].map(s => (
          <div key={s.label} className="premium-card p-5 flex items-center justify-between">
            <span className="text-sm text-slate-300">{s.label}</span>
            <span className={\`text-xs font-bold \${s.color}\`}>● {s.stat}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
`;

fs.writeFileSync(pagesDir + '/HomePage.tsx', homeCode);
fs.writeFileSync(pagesDir + '/DashboardPage.tsx', dashboardCode);
fs.writeFileSync(pagesDir + '/LiveClaimsPage.tsx', liveClaimsCode);
fs.writeFileSync(pagesDir + '/InvestigationPage.tsx', investigationCode);
fs.writeFileSync(pagesDir + '/AgentIntelligencePage.tsx', agentIntelligenceCode);
fs.writeFileSync(pagesDir + '/SpreadIntelligencePage.tsx', spreadIntelligenceCode);
fs.writeFileSync(pagesDir + '/EvidenceReviewPage.tsx', evidenceReviewCode);
fs.writeFileSync(pagesDir + '/CounterNarrativePage.tsx', counterNarrativeCode);
fs.writeFileSync(pagesDir + '/SystemStatusPage.tsx', systemStatusCode);

console.log('Pages generated!');
